import sys
import os

# Ensure the root directory is on sys.path for Vercel serverless execution
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.main import app
from starlette.requests import Request

# Handle Vercel path rewrites dynamically so all subpaths route to the proper FastAPI endpoints
@app.middleware("http")
async def vercel_rewrite_middleware(request: Request, call_next):
    matched_path = request.headers.get("x-matched-path") or request.headers.get("x-forwarded-uri")
    if matched_path:
        # Strip query string if present
        clean_path = matched_path.split("?")[0]
        request.scope["path"] = clean_path
    return await call_next(request)

# Export for ASGI serverless runtime
__all__ = ["app"]

