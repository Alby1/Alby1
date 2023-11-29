from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import json
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/")
async def root():
    return RedirectResponse("/it")

def get_file(lan: str) -> dict:
    with open(f"{lan.lower()}.json", "r", encoding="utf8") as file:
        return json.load(file)
    

@app.get("/lastfm/user")
async def lastfm_user():
    return requests.get(f"http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=malbyx&api_key={os.getenv('LAST_FM_KEY')}&format=json").json()

@app.get("/lastfm/recent_tracks")
async def lastfm_recent_tracks():
    return requests.get(f"http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=malbyx&api_key={os.getenv('LAST_FM_KEY')}&format=json&limit=5&extended=1").json()

@app.get("/lastfm/top_artists")
async def lastfm_top_artists():
    return requests.get(f"http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=malbyx&api_key={os.getenv('LAST_FM_KEY')}&format=json&limit=5").json()

@app.get("/lastfm/top_tracks")
async def lastfm_top_tracks():
    return requests.get(f"http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=malbyx&api_key={os.getenv('LAST_FM_KEY')}&format=json&limit=5&period=overall").json()

@app.get("/lastfm/weekly_top_tracks")
async def lastfm_weekly_top_tracks():
    return requests.get(f"http://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=malbyx&api_key={os.getenv('LAST_FM_KEY')}&format=json&limit=5").json()


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
    