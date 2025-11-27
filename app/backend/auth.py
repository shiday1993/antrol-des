from flask import Blueprint, request, session, render_template, redirect
from .response import Respon
from .config import get_db, is_api, is_api_request

from datetime import datetime, timezone

import bcrypt
import hashlib

bp = Blueprint("login_bp", __name__)

@bp.route('/login', methods=['POST', "GET"])
def login():
    api = is_api_request()
    session.permanent = True 
    if request.method == "GET":
        if "user" in session:
            if api:
                return Respon.oke("Sudah Login")
            return redirect('/')
        return render_template('auth/login.html')
 
    try:        
        data = request.json if request.is_json else request.form
        username = (data.get('username') or '').strip()
        password = (data.get('password') or '').strip()
        if not username or not password:
            return Respon.fail("Username atau password tidak boleh kosong", 400)
        conn, cur = get_db()
        cur.execute("""
            SELECT id, name, password , development, real_name 
            FROM users 
            WHERE name = %s
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
            "name": row['name'],
        })
        session['token']= token
        session['user'] = row['name']
        session["last_active"] = datetime.now(timezone.utc)
        if is_api:
            return Respon.oke({
                "user": row['name'],
                "nama": row['real_name'], 
                "token": token
            })
        next_url = session.pop("next_url", None)
        return redirect(next_url or "/")
       
    except Exception as e:
        return Respon.error(exc=str(e))

@bp.route('/logout')
def logout():
    session.clear()
    return Respon.oke(message="Sudah Logout")
