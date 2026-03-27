# CloudFront URL Rewrite Handler for Static Next.js

## Overview

This handler enables **clean URLs** for static Next.js sites deployed to **S3 + CloudFront** while
preserving query parameters. It performs internal URL rewrites (not redirects) so browser URLs remain unchanged.

## What It Does

1. **Removes trailing slashes** from URIs (except homepage): `/foo/` → `/foo`
2. **Appends `.html`** to paths without known extensions: `/dashboard` → `/dashboard.html`
3. **Preserves query strings**: `?userId=xxx` stays intact
4. **Case-insensitive extensions**: Handles `/Photo.JPG` correctly
5. **Excludes API routes**: `/api/*` paths remain untouched

This solves the problem where accessing `https://xxtemplatexx.envilder.io/dashboard?userId=xxx` would
fail because CloudFront/S3 looks for a literal `/dashboard` file instead of `/dashboard.html`.

## Handler Code

### Location

- **Handler file**: `shared/src/iac/src/aws/website/cloudfront-url-rewrite.js`
- **Stack file**: `shared/src/iac/src/aws/website/staticWebsiteStack.ts`

The CloudFront Function is stored in a separate JavaScript file and imported using `FunctionCode.fromFile()`.

### Implementation

```javascript
function handler(event) {
  var req = event.request;
  var uri = req.uri;

  // Helpers ES5.1 (compatible with CloudFront Functions)
  function endsWith(str, suffix) {
    if (str == null || suffix == null) return false;
    var sl = str.length,
      su = suffix.length;
    return sl >= su && str.substring(sl - su) === suffix;
  }
  function hasPrefix(str, prefix) {
    if (str == null || prefix == null) return false;
    return str.indexOf(prefix) === 0;
  }

  var staticExt = [
    ".html",
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".eot",
    ".json",
    ".xml",
    ".txt",
    ".map",
  ];

  function hasKnownExt(uLower) {
    for (var i = 0; i < staticExt.length; i++) {
      if (endsWith(uLower, staticExt[i])) return true;
    }
    return false;
  }

  // Exclude API routes
  var lower = uri.toLowerCase();
  if (hasPrefix(lower, "/api/")) {
    return req; // no changes
  }

  // Remove trailing slash (except homepage)
  if (uri !== "/" && endsWith(uri, "/")) {
    uri = uri.substring(0, uri.length - 1);
    lower = uri.toLowerCase(); // recompute after modifying uri
  }

  // Append .html if no known extension
  if (uri !== "/" && !hasKnownExt(lower)) {
    // For /folder/index.html instead of /folder.html, use: uri += '/index.html';
    uri += ".html";
  }

  req.uri = uri;
  return req; // Query string preserved automatically in req.querystring
}
```

**Key improvements:**

- **ES5.1 compatible** - no `.endsWith()`, `.startsWith()`, or arrow functions
- **Null-safe helpers** for string operations
- **Case-insensitive** extension detection
- **API route exclusion** with `/api/*`
- **Recomputes `lower`** after URI modifications for correctness

## URL Rewrite Examples

| Input URL              | Rewritten URI      | Query Preserved       |
| ---------------------- | ------------------ | --------------------- |
| `/`                    | `/`                | N/A                   |
| `/dashboard`           | `/dashboard.html`  | ✅                    |
| `/dashboard/`          | `/dashboard.html`  | ✅                    |
| `/groups?userId=xxx`   | `/groups.html`     | ✅ `?userId=xxx`      |
| `/app.js`              | `/app.js`          | ✅                    |
| `/IMG/Photo.JPG`       | `/IMG/Photo.JPG`   | ✅ (case-insensitive) |
| `/api/users`           | `/api/users`       | ✅ (excluded)         |
| `/styles/main.css?v=1` | `/styles/main.css` | ✅ `?v=1`             |

## Deployment

### Update CDK Stack

The handler is now in a separate file for better maintainability:

1. **Handler**: `shared/src/iac/src/aws/website/cloudfront-url-rewrite.js`
2. **Stack**: `shared/src/iac/src/aws/website/staticWebsiteStack.ts` (imports with `fromFile`)

To deploy changes:

```bash
cd xxtemplatexx/src/iac
pnpm install && pnpm build
pnpm cdk deploy githubrepo-FrontendDashboard
```

### Propagation & Testing

- **Wait**: 15-30 minutes for edge location propagation
- **Invalidate**: Create CloudFront invalidation `/*` for immediate visibility
- **Test**: Access URLs with query parameters

```bash
# Production
curl -I "https://xxtemplatexx.envilder.io/dashboard?userId=xxx"

# Local Docker (nginx)
docker compose up -d dashboard-web
curl -I "http://localhost:81/dashboard?userId=xxx"
```

### Local Testing (Node.js)

Test the function locally before deploying to AWS:

```bash
# From project root
node test-cloudfront-function.js
```

**Expected output:**

```txt
🧪 Testing CloudFront Function (ES5.1)
══════════════════════════════════════════════════════════════════════
✅ /                         → /
✅ /dashboard                → /dashboard.html
✅ /dashboard/               → /dashboard.html
✅ /groups                   → /groups.html
✅ /app.js                   → /app.js
✅ /IMG/Photo.JPG            → /IMG/Photo.JPG
✅ /api/users                → /api/users
══════════════════════════════════════════════════════════════════════
📊 Results: 15/15 passed
✅ All tests passed!
```

The test script (`test-cloudfront-function.js`) validates:

- Homepage handling (`/` → `/`)
- HTML rewriting (`/dashboard` → `/dashboard.html`)
- Trailing slash removal (`/dashboard/` → `/dashboard.html`)
- Case-insensitive extensions (`/Photo.JPG` → `/Photo.JPG`)
- API route exclusion (`/api/users` → `/api/users`)
- Known extensions preserved (`/app.js` → `/app.js`)

## Architecture Flow

```txt
Browser: /dashboard?userId=xxx
    ↓
CloudFront Edge → CloudFront Function (viewer-request)
    | Rewrites: /dashboard → /dashboard.html
    | Preserves: ?userId=xxx automatically
    ↓
S3 Origin: dashboard.html
    ↓
React App: useSearchParams() reads userId
```

## Verification Checklist

- [ ] Function deployed to CloudFront (15-30 min wait)
- [ ] URLs with parameters return 200: `/dashboard?userId=xxx`
- [ ] API routes excluded: `/api/*` not rewritten
- [ ] Case-insensitive extensions work: `/Photo.JPG`
- [ ] React app reads params: `useSearchParams()` works

## Local vs Production

| Aspect      | Local (nginx)  | Production (CloudFront)        |
| ----------- | -------------- | ------------------------------ |
| **Handler** | `try_files`    | CloudFront Function            |
| **URL**     | `localhost:81` | `template.envilder.io` |
| **Deploy**  | Instant        | 15-30 min propagation          |
| **Cache**   | nginx          | Global edge cache              |

## Troubleshooting

| Issue             | Cause             | Solution                          |
| ----------------- | ----------------- | --------------------------------- |
| **403 Forbidden** | OAI permissions   | Check S3 bucket policy and IAM    |
| **404 Not Found** | Wrong rewrite     | Verify function code, check logs  |
| **Params lost**   | Cache policy      | Ensure query strings forwarded    |
| **No changes**    | Propagation delay | Wait 15-30 min + invalidate cache |

## Optional Variants

### Use `index.html` for directories

If you prefer `/blog/` → `/blog/index.html` instead of `/blog.html`:

```javascript
if (uri !== "/" && uri.endsWith("/")) {
  uri += "index.html";
}
```

### Additional cache policy (if needed)

Explicit cache policy for query string forwarding:

```typescript
import {
  CachePolicy,
  CacheQueryStringBehavior,
} from "aws-cdk-lib/aws-cloudfront";

const cachePolicy = new CachePolicy(this, "cache-policy", {
  queryStringBehavior: CacheQueryStringBehavior.all(),
  // ... other settings
});
```

## Resources

- [CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [AWS CDK CloudFront](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront-readme.html)
