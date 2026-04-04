
"""
server.py — FastAPI entrypoint
=============================
Automatically discovers and mounts all routers from the routes/ folder.
Each file in routes/ must expose a `router` object (APIRouter).

Usage:
    uvicorn server:app --reload --port 8000

How to add a new route:
----------------------
1. Create a new file in the routes/ folder (e.g., routes/myfeature.py).
2. In that file, define an APIRouter named `router` and add endpoints to it:

    from fastapi import APIRouter
    router = APIRouter()

    @router.get("/myfeature")
    def myfeature():
        return {"message": "Hello from myfeature!"}

3. The server will automatically discover and mount all routers in routes/.
"""

import importlib
import pkgutil
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import create_db_and_tables

app = FastAPI(
    title="ChainLoyalty API",
    description="Web3-Native Loyalty Infrastructure Platform",
    version="1.0.0",
)

# Initialize database
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("[app] Database initialized.")

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Static Files ──────────────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ── Auto-discover and mount all routers from routes/ ──────────────────────────
ROUTES_DIR = Path(__file__).parent / "routes"

def _load_routes():
    """
    Walk every .py file in routes/, import it, and mount its `router` on the app.
    Router prefix is taken from `router.prefix` if set, otherwise defaults to
    /api/<module_name>.
    """
    if not ROUTES_DIR.exists():
        print("[app] Warning: routes/ directory not found — no routes loaded.")
        return

    for module_info in pkgutil.iter_modules([str(ROUTES_DIR)]):
        module_name = module_info.name
        if module_name.startswith("_"):
            continue  # skip __init__.py etc.

        full_module = f"routes.{module_name}"
        try:
            module = importlib.import_module(full_module)
        except Exception as e:
            print(f"[app] Failed to import {full_module}: {e}")
            continue

        router = getattr(module, "router", None)
        if router is None:
            print(f"[app] Skipping {full_module}: no `router` found.")
            continue

        app.include_router(router)
        prefix = getattr(router, "prefix", f"/api/{module_name}")
        print(f"[app] ✅ Mounted router: {full_module} → {prefix}")


_load_routes()


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "message": "Server is running."}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)