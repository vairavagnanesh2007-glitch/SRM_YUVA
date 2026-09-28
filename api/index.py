import sys
import os

# Ensure the root directory is on sys.path for Vercel serverless execution
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.main import app

# Export for ASGI serverless runtime
__all__ = ["app"]
