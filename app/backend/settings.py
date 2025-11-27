from flask import Flask
from flask_session import Session
from datetime import timedelta
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

DB_CENTER = {
    'host': os.getenv("H_CENTER"),
    'port': os.getenv("PO_CENTER"),
    'dbname': os.getenv("DB_CENTER"),
    'user': os.getenv("U_CENTER"),
    'password': os.getenv("P_CENTER"),
}

URL_SYSTEM = "https://sistemklinik.platy-monitor.ts.net:8068/development.web"
