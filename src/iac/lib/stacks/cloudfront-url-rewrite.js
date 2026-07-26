function handler(event) {
	var req = event.request;
	var uri = req.uri;

	// ES5.1 Helpers (without startsWith/endsWith or arrow functions)
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
		".mp4",
		".webm",
	];

	function hasKnownExt(uLower) {
		for (var i = 0; i < staticExt.length; i++) {
			if (endsWith(uLower, staticExt[i])) return true;
		}
		return false;
	}

	function getQueryString(querystring) {
		if (typeof querystring === "string") {
			return querystring ? "?" + querystring : "";
		}

		var parts = [];
		for (var key in querystring) {
			if (Object.prototype.hasOwnProperty.call(querystring, key)) {
				var parameter = querystring[key];
				var values = parameter.multiValue || [parameter];

				for (var i = 0; i < values.length; i++) {
					var hasValue = Object.prototype.hasOwnProperty.call(
						values[i],
						"value",
					);
					parts.push(
						encodeURIComponent(key) +
							(hasValue
								? "=" + encodeURIComponent(values[i].value)
								: ""),
					);
				}
			}
		}

		return parts.length ? "?" + parts.join("&") : "";
	}

	function redirect(path) {
		return {
			statusCode: 301,
			statusDescription: "Moved Permanently",
			headers: {
				location: {
					value: path + getQueryString(req.querystring),
				},
			},
		};
	}

	if (uri === "/sitemap.xml") {
		return redirect("/sitemap-index.xml");
	}

	// Exclude API routes
	var lower = uri.toLowerCase();
	if (hasPrefix(lower, "/api/")) {
		return req; // no changes
	}

	// Astro generates directory-based URLs with trailing slashes.
	if (uri !== "/" && !hasKnownExt(lower)) {
		if (!endsWith(uri, "/")) {
			return redirect(uri + "/");
		}

		uri += "index.html";
	}

	req.uri = uri;
	return req;
}
