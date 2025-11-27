from flask import Flask
from flask_session import Session
from datetime import timedelta, date, timezone, datetime
from dotenv import load_dotenv

import os

load_dotenv() 

def init_app(app: Flask):
    app.config['SESSION_TYPE'] = 'filesystem'
    Session(app)
    app.permanent_session_lifetime = timedelta(minutes=30)
    return app


DB_CONFIG = {
    'host': os.getenv("DB_HOST"),
    'port': os.getenv("DB_PORT"),
    'dbname': os.getenv("DB_NAME"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASS"),
}


def serialize_row(row):
    if row is None:
        return None
    row_dict = dict(row)
    for k, v in row_dict.items():
        if isinstance(v, (date, datetime)):
            row_dict[k] = v.isoformat()
    return row_dict

def serialize(rows):
    if rows is None:
        return None
    if hasattr(rows, "keys"):   
        return serialize_row(rows)
    return [serialize_row(r) for r in rows]
