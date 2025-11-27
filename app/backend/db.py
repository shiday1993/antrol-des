from flask import g
from flask import Flask
from flask_session import Session
from psycopg2.extras import RealDictCursor
import psycopg2
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()

DB_CONFIG = {
    'host': os.getenv("DB_HOST"),
    'port': os.getenv("DB_PORT"),
    'dbname': os.getenv("DB_NAME"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASS"),
}

DB_CENTER = {
    'host': os.getenv("DB_CENTER_HOST"),
    'port': os.getenv("DB_CENTER_PORT"),
    'dbname': os.getenv("DB_CENTER_NAME"),
    'user': os.getenv("DB_CENTER_USER"),
    'password': os.getenv("DB_CENTER_PASS"),
}

def init_app(app: Flask):
    app.config['SESSION_TYPE'] = 'filesystem'
    app.permanent_session_lifetime = timedelta(minutes=30)
    Session(app)

def get_db():
    if 'conn' not in g:
        g.conn = psycopg2.connect(**DB_CONFIG)
        g.cur = g.conn.cursor(cursor_factory=RealDictCursor)
    return g.conn, g.cur

def get_db_center():
    if 'conn_center' not in g:
        g.conn_center = psycopg2.connect(**DB_CENTER)
        g.cur_center = g.conn_center.cursor(cursor_factory=RealDictCursor)
    return g.conn_center, g.cur_center

def close_db(exception=None):
    cur = g.pop('cur', None)
    conn = g.pop('conn', None)
    if cur:
        cur.close()
    if conn:
        conn.close()

    cur_center = g.pop('cur_center', None)
    conn_center = g.pop('conn_center', None)
    if cur_center:
        cur_center.close()
    if conn_center:
        conn_center.close()
