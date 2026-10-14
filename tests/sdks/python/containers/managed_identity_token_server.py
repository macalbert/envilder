from __future__ import annotations

import json
import secrets
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from azure.core.credentials import TokenCredential

_TOKEN_PATH = "/msi/token"


# Local token endpoint speaking the App Service managed identity protocol
# (IDENTITY_ENDPOINT / IDENTITY_HEADER). Lets DefaultAzureCredential, as used
# by the SDK factory, obtain emulator tokens through its
# ManagedIdentityCredential. EnvironmentCredential cannot be used because MSAL
# validates the emulator authority against login.microsoftonline.com (instance
# discovery), which rejects it.
class ManagedIdentityTokenServer:
    def __init__(self, credential: TokenCredential) -> None:
        self._credential = credential
        self._identity_header = secrets.token_hex(16)
        self._server: ThreadingHTTPServer | None = None
        self._thread: threading.Thread | None = None

    def start(self) -> "ManagedIdentityTokenServer":
        handler = _build_handler(self._credential, self._identity_header)
        self._server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        self._thread = threading.Thread(
            target=self._server.serve_forever, daemon=True
        )
        self._thread.start()
        return self

    def stop(self) -> None:
        if self._server:
            self._server.shutdown()
            self._server.server_close()
            self._server = None
        if self._thread:
            self._thread.join()
            self._thread = None

    @property
    def endpoint(self) -> str:
        if self._server is None:
            raise RuntimeError("Token server has not been started")
        port = self._server.server_address[1]
        return f"http://127.0.0.1:{port}{_TOKEN_PATH}"

    @property
    def identity_header(self) -> str:
        return self._identity_header


def _build_handler(
    credential: TokenCredential, identity_header: str
) -> type[BaseHTTPRequestHandler]:
    class _Handler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:  # noqa: N802 (http.server API)
            url = urlparse(self.path)
            if url.path != _TOKEN_PATH:
                self._respond(404, {"error": "not_found"})
                return
            if self.headers.get("X-IDENTITY-HEADER") != identity_header:
                self._respond(401, {"error": "invalid_identity_header"})
                return

            query = parse_qs(url.query)
            resource = next(
                (
                    query[name][0]
                    for name in ("resource", "scope", "scopes")
                    if query.get(name)
                ),
                "",
            )
            if not resource:
                self._respond(400, {"error": "missing_resource"})
                return

            scope = (
                resource
                if resource.endswith("/.default")
                else resource.rstrip("/") + "/.default"
            )
            access_token = credential.get_token(scope)
            self._respond(
                200,
                {
                    "access_token": access_token.token,
                    "expires_on": str(access_token.expires_on),
                    "resource": resource,
                    "token_type": "Bearer",
                },
            )

        def _respond(self, status: int, body: dict[str, str]) -> None:
            payload = json.dumps(body).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, format: str, *args: object) -> None:
            # Keep request lines (which carry no secrets, but are noisy)
            # out of the test output.
            pass

    return _Handler
