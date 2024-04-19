from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import json
import os
from dotenv import load_dotenv
import requests
import html

import json
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.dialects.mysql import VARCHAR, TINYINT, TEXT, DATETIME

class DB_Service():
    Base = declarative_base()

    class Comment(Base):
        __tablename__ = 'comments'
        id = Column(Integer, nullable=False, autoincrement=True, primary_key=True)
        text = Column(TEXT, nullable=False)
        date = Column(DATETIME, nullable=False)
        user = Column(VARCHAR(64), nullable=True)
        contact = Column(VARCHAR(255), nullable=True)

        def __init__(self, text, date, user, contact) -> None:
            self.text = text
            self.date = date
            self.user = user
            self.contact = contact


    def __init__(self):
        self.protocol = "mysql+pymysql"
        self.host = "localhost"
        self.port = 3306
        self.user = f"{os.getenv('DATABASE_USER')}"
        self.password = f"{os.getenv('DATABASE_PASSWORD')}"
        self.name = f"{os.getenv('DATABASE_NAME')}"

        if not database_exists(f"{self.protocol}://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"):
            create_database(
                f"{self.protocol}://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}")

            self.engine = create_engine(
                f"{self.protocol}://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}", echo=False, pool_size=10, max_overflow=20)

            self.Base.metadata.create_all(self.engine)

            return

        self.engine = create_engine(
            f"{self.protocol}://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}", echo=False, pool_size=10, max_overflow=20)

        self.Base.metadata.create_all(self.engine)

    def session(self) -> Session:
        return sessionmaker(bind=self.engine)()

load_dotenv()

db = DB_Service()

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


@app.get("/comments/get")
async def comments_get(offset: int = 0):
    session = db.session()
    obj = session.query(db.Comment).order_by(db.Comment.id.desc()).offset(offset).limit(10).all()
    comments = []
    for c in obj:
        comments.append({"user": c.user, "text": c.text, "date": c.date})
    count = session.query(db.Comment).count()
    result = {"comments": comments, "count": count}  
    return result

@app.get("/comments/add")
async def comments_add(user: str, text: str, date: str, contact: str):
    if(len(text) > 0):
        print(text, html.escape(text))
        comment = db.Comment(html.escape(text), date, user, contact)
        session = db.session()
        session.add(comment)
        session.commit()
        return {"status": "success"}


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
    