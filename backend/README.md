# How to Add New Routes

1. Create a new file in the `routes/` folder (e.g., `routes/myfeature.py`).
2. In that file, define an APIRouter named `router` and add endpoints to it:

	from fastapi import APIRouter
	router = APIRouter()

	@router.get("/myfeature")
	def myfeature():
		return {"message": "Hello from myfeature!"}

3. The server will automatically discover and mount all routers in `routes/` when started.

4. Start the server with:

	uvicorn server:app --reload --port 8000

