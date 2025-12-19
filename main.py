from fastapi import FastAPI

app = FastAPI(title="SLA-Guard AI")

@app.get("/")
def root():
    return {
        "message": "SLA-Guard AI backend is running successfully"
    }
