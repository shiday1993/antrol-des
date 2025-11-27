import psycopg2
from psycopg2.extras import RealDictCursor
from flask import g
from .settings import DB_CONFIG, DB_CENTER

def get_db():
    if 'conn' not in g:
        g.conn = psycopg2.connect(**DB_CONFIG)
        g.cur = g.conn.cursor(cursor_factory=RealDictCursor)
    return g.conn, g.cur

def get_db_center():
    if 'conn' not in g:
        g.conn = psycopg2.connect(**DB_CENTER)
        g.cur = g.conn.cursor(cursor_factory=RealDictCursor)
    return g.conn, g.cur

def close_db(exception):
    cur = g.pop('cur', None)
    conn = g.pop('conn', None)
    if cur:
        cur.close()
    if conn:
        conn.close()
