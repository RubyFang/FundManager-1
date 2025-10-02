BACKEND_DIR = backend
FRONTEND_DIR = frontend

.PHONY: backend frontend start

backend:
	cd $(BACKEND_DIR) && uv run uvicorn main:app --reload --port=8000

frontend:
	cd $(FRONTEND_DIR) && npm run dev

start:
	$(MAKE) -j2 backend frontend
