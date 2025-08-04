# models.py
from sqlalchemy import Column, Integer, Text, Date, String
from database import Base
from datetime import date

class Highlight(Base):
    __tablename__ = 'highlights'

    id = Column(String, primary_key=True, nullable=False)
    highlight_text = Column(Text, nullable=False)
    chapter = Column(Text, nullable=True)
    cfi_range = Column(String, nullable=False)
    date = Column(Date, default=date.today)