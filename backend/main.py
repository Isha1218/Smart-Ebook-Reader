from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fast_lookup import FastLookup
import models
from database import engine, SessionLocal
from typing import Annotated, List
from sqlalchemy.orm import Session

app = FastAPI()
fs = FastLookup()
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HighlightBase(BaseModel):
    id: str
    highlight_text: str
    cfi_range: str
    chapter: str

class LookupRequest(BaseModel):
    query: str
    search_text: str

class RecapRequest(BaseModel):
    search_text: str

class QARequest(BaseModel):
    query: str
    search_text: str
    selected_text: str
    current_page_text: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/add_highlight")
async def add_highlight(data: HighlightBase, db: Session = Depends(get_db)):
    print(data)
    new_highlight = models.Highlight(**data.dict())
    db.add(new_highlight)
    db.commit()
    db.refresh(new_highlight)
    return new_highlight

@app.get("/highlights", response_model=List[HighlightBase])
async def get_highlights(db: Session = Depends(get_db)):
    highlights = db.query(models.Highlight).all()
    return highlights


@app.post("/api/fast_lookup")
async def do_fast_lookup(req: LookupRequest):
    result = fs.get_lookup_res(req.query, req.search_text)
    return {"result": result}

@app.post("/api/recap")
async def find_recap_text(req: RecapRequest):
    recap = fs.get_recap(req.search_text)
    return {"result": recap}

@app.post("/api/qa")
async def do_qa(req: QARequest):
    result = fs.get_open_ended_res(req.query, req.search_text, req.current_page_text)
    return {"result": result}
