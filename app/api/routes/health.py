from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "service": "sla-guard",
        "status": "healthy"
    }
