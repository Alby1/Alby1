from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import json

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/")
async def root():
    return RedirectResponse("/it")

def get_file(lan: str) -> dict:
    with open(f"{lan.lower()}.json", "r", encoding="utf8") as file:
        return json.load(file)


@app.get("/{lan}", response_class=HTMLResponse)
async def read_item(request: Request, lan: str):
    if len(lan) > 2:
        return RedirectResponse(f"/{lan[:2]}")

    try:
        obj = {**get_file("en"), **get_file(lan)}
    except Exception:
        return RedirectResponse("/it")
    obj["request"] = request
    obj["lan"] = lan
    return templates.TemplateResponse("index.html", obj)

if __name__ == "__main__":
    uvicorn.run("server:app", reload=True, port=5002, host="0.0.0.0")
    