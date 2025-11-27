from flask import Blueprint, request, jsonify
from app.backend.db import get_db
from app.backend.auth import login_required
from app.backend.response import Respon
from app.backend.settings import serialize

bp = Blueprint('loket_bp', __name__)

@bp.route("/loket", methods=["GET"])
@login_required
def get_loket():
    conn, cur = get_db()
    cur.execute("SELECT * FROM loket")
    rows = cur.fetchall()
    if not rows:
        return Respon.fail('Tidak ada loket terdaftar', 202)
    return Respon.oke(serialize(rows))

@bp.route("/loket", methods=["POST"])
@login_required
def add_loket():
    conn, cur = get_db()
    data = request.get_json()
    nama = data.get("loket")

    cur.execute("SELECT * FROM loket WHERE nama=%s", (nama,))
    existing = cur.fetchone()
    if existing:
        return Respon.fail("Nama loket sudah ada", 409)

    cur.execute("INSERT INTO loket(nama) VALUES (%s) RETURNING id", (nama,))
    new_id = cur.fetchone()['id']
    conn.commit()
    return Respon.oke({"id": new_id, "nama": nama})

@bp.route("/loket", methods=["PUT"])
@login_required
def update_loket():
    conn, cur = get_db()
    data = request.get_json()
    loket_id = data.get("id")
    nama = data.get("loket")

    cur.execute("UPDATE loket SET nama=%s WHERE id=%s", (nama, loket_id))
    if cur.rowcount == 0:
        return Respon.fail("Gagal Update Loket", 201)
    conn.commit()
    return Respon.oke({"updated": loket_id})

@bp.route("/loket", methods=["DELETE"])
@login_required
def delete_loket():
    conn, cur = get_db()
    data = request.get_json()
    loket_id = data.get("id")

    cur.execute("DELETE FROM loket WHERE id=%s", (loket_id,))
    if cur.rowcount == 0:
        return Respon.fail("Gagal Hapus loket", 409)
    conn.commit()
    return Respon.oke({"deleted": loket_id})

@bp.route("/loket/test")
def test():
    return Respon.ok( "Loket API connected!")
