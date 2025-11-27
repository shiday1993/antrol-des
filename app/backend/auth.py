from flask import Blueprint, render_template, request, session, redirect, url_for
from functools import wraps
from datetime import datetime, timezone
from app.backend.response import Respon
from app.backend.db import get_db

import hashlib
import jwt
import bcrypt
import os

bp = Blueprint("auth", __name__)

SECRET_KEY = os.getenv("API_KEY")

def create_token(data: dict):
    token = jwt.encode(data, SECRET_KEY, algorithm="HS256")
    return token

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            session.clear()
            return redirect(url_for("auth.login"))
        return f(*args, **kwargs)
    return decorated_function


@bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        if "user" in session:
            return redirect('/')
        return render_template('login.html')
 
    try:        
        data = request.json if request.is_json else request.form
        username = (data.get('username') or '').strip()
        password = (data.get('password') or '').strip()
        if not username or not password:
            return Respon.fail("Username atau password tidak boleh kosong", 400)
        conn, cur = get_db()
        cur.execute("""
            SELECT id, username, password , realname 
            FROM users 
            WHERE username = %s
        """, (username,))
        row = cur.fetchone()
        if not row:
            return Respon.fail("Username atau password tidak sesuai", 401)
        stored = row["password"]
        if stored.startswith("$2b$") or stored.startswith("$2a$") or stored.startswith("$2y$"):
            if not bcrypt.checkpw(password.encode(), stored.encode()):
                return Respon.fail("Username atau password tidak sesuai", 401)
        else:
            hashed_input = hashlib.md5(password.encode()).hexdigest()
            if hashed_input != stored:
                return Respon.fail("Username atau password tidak sesuai", 401)
            new_hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            cur.execute("UPDATE users SET password = %s WHERE id = %s", (new_hashed, row['id']))
            conn.commit()
            stored = new_hashed
        
        token = create_token({
            "user_id": row['id'],
            "name": row['username'],
        })
        session['token']= token
        session['user'] = row['username']
        session["last_active"] = datetime.now(timezone.utc)
        return Respon.oke( {"token": token, "nama": row['username']})
    
    except Exception as e:
        return Respon.error(exc=str(e))

@bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))

@bp.route("/")
@login_required
def dashboard():
    return render_template("dashboard.html", user=session.get("user"), title="Antrean Online")
