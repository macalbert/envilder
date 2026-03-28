// CloudFront Function for URL rewriting
// Compatible with CloudFront Functions runtime (ES5.1)
// Query strings are automatically preserved by CloudFront

function handler(event) {
  var req = event.request;
  var uri = req.uri;

  // ES5.1 Helpers (without startsWith/endsWith or arrow functions)
  function endsWith(str, suffix) {
    if (str == null || suffix == null) return false;
    var sl = str.length, su = suffix.length;
    return sl >= su && str.substring(sl - su) === suffix;
  }
  function hasPrefix(str, prefix) {
    if (str == null || prefix == null) return false;
    return str.indexOf(prefix) === 0;
  }

  var staticExt = [
    '.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.ico', '.woff', '.woff2', '.ttf', '.otf', '.eot', '.json', '.xml',
    '.txt', '.map'
  ];

  function hasKnownExt(uLower) {
    for (var i = 0; i < staticExt.length; i++) {
      if (endsWith(uLower, staticExt[i])) return true;
    }
    return false;
  }

  // Exclude API routes
  var lower = uri.toLowerCase();
  if (hasPrefix(lower, '/api/')) {
    return req; // no changes
  }

  // Remove trailing slash (except homepage)
  if (uri !== '/' && endsWith(uri, '/')) {
    uri = uri.substring(0, uri.length - 1);
    lower = uri.toLowerCase(); // recompute after modifying uri
  }

  // Append .html if not homepage and no known extension
  if (uri !== '/' && !hasKnownExt(lower)) {
    // For /folder/index.html instead of /folder.html, use:
    // uri += '/index.html';
    uri += '.html';
  }

  req.uri = uri;
  return req;
}
