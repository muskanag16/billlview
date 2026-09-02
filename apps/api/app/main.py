from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.business_settings import router as settings_router
from app.api.v1.clients import router as clients_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.public import router as public_router
from app.api.v1.dashboard import router as dashboard_router

app = FastAPI(title="BillFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(settings_router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(clients_router, prefix="/api/v1/clients", tags=["clients"])
app.include_router(invoices_router, prefix="/api/v1/invoices", tags=["invoices"])
app.include_router(public_router, prefix="/api/v1/public", tags=["public"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])

@app.get("/api/ping")
def ping():
    return {"message": "pong"}
