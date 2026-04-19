import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cs_history.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def create_tables():
    from . import models  # noqa: F401 — registers models with Base
    Base.metadata.create_all(bind=engine)
    _migrate()


def _migrate():
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    if "chat_messages" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("chat_messages")}
    with engine.begin() as conn:
        if "staff_name" not in cols:
            conn.execute(text("ALTER TABLE chat_messages ADD COLUMN staff_name VARCHAR(64) DEFAULT ''"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
