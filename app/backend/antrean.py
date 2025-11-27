from flask import Blueprint, request
from app.backend.response import Respon
from app.backend.settings import serialize
from app.backend.db import get_db
from app.backend.auth import login_required

from datetime import date, datetime

bp = Blueprint("antrean", __name__, url_prefix='/antrean')

@bp.route("/test")
def test():
    return Respon.oke({"message": "Antrean API connected!"})

@bp.route("/ambil", methods=["GET"])
@login_required
def get_antrean():
    try:
        conn, cur = get_db()
        today = date.today().strftime("%Y-%m-%d")

        cur.execute(
            "SELECT * FROM antrean_cs WHERE tanggal=%s ORDER BY nomor ASC", (today,)
        )
        antrean = cur.fetchall()

        for row in antrean:
            row["nomor"] = f"{row['prefix']}{row['nomor']:03}"

        cur.execute("SELECT * FROM loket")
        loket = cur.fetchall()
        result = {
            "antrean": serialize(antrean),
            "loket": serialize(loket)
        }
        return Respon.oke(result)
    except Exception as e:
        return Respon.error(str(e))


@bp.route("/ambil", methods=["POST"])
@login_required
def tambah_antrean():
    try:
        data = request.get_json() or {}
        prefix = data.get("prefix", "")
        today = date.today().strftime("%Y-%m-%d")

        conn, cur = get_db()
        cur.execute(
            "SELECT * FROM antrean_cs WHERE tanggal=%s ORDER BY nomor DESC LIMIT 1", (today,)
        )
        last = cur.fetchone()
        nomor = last["nomor"] + 1 if last else 1
        no_formatted = f"{prefix}{nomor:03}"
        cur.execute(
            "INSERT INTO antrean_cs (tanggal, status, nomor, prefix) VALUES (%s,%s,%s,%s) RETURNING id",
            (today, "menunggu", nomor, prefix)
        )
        new_id = cur.fetchone()["id"]
        if not new_id:
            return Respon.fail('Gagal Tambah Antrean', 201)
        conn.commit()
        return Respon.oke({"nomor": no_formatted, "id": new_id})
    except Exception as e:
        return Respon.error(str(e))
    
    
# --- Update Antrean CS ---
@bp.route("/update", methods=["POST"])
@login_required
def panggil_antrean():
    data = request.get_json()
    antrean_id = data.get("id")
    loket = data.get("loket")

    if not loket:
        return Respon.fail("Silahkan pilih loket", 202)

    conn, cur = get_db()
    cur.execute("SELECT * FROM antrean_cs WHERE id=%s", (antrean_id,))
    antrean = cur.fetchone()
    if not antrean:
        return Respon.fail("Nomor antrean tidak ditemukan", 201)

    today = date.today()
    # cek apakah loket sedang sibuk
    cur.execute(
        "SELECT * FROM antrean_cs WHERE status='sedang dilayani' AND loket=%s AND tanggal=%s",
        (loket, today)
    )
    busy = cur.fetchone()
    if busy:
        return Respon.fail("Loket sedang sibuk", 202)

    now = datetime.now()
    cur.execute(
        "UPDATE antrean_cs SET status='sedang dilayani', loket=%s, waktu_panggil=%s WHERE id=%s",
        (loket, now, antrean_id)
    )
    conn.commit()

    # ambil ulang data terbaru
    cur.execute("SELECT * FROM antrean_cs WHERE id=%s", (antrean_id,))
    new = cur.fetchone()
    if new:
        new['nomor'] = f"{new['prefix']}{new['nomor']:03}"
    return Respon.oke(serialize(new))


@bp.route("/update", methods=["PUT"])
@login_required
def update_status_antrean():
    data = request.get_json()
    antrean_id = data.get("id")
    loket = data.get("loket")
    status = data.get("status")

    conn, cur = get_db()
    cur.execute("SELECT * FROM antrean_cs WHERE id=%s", (antrean_id,))
    antrean = cur.fetchone()
    if not antrean:
        return Respon.fail("Nomor antrean tidak ditemukan", 201)

    cur.execute(
        "UPDATE antrean_cs SET status=%s, loket=%s WHERE id=%s",
        (status, loket, antrean_id)
    )
    conn.commit()

    cur.execute("SELECT * FROM antrean_cs WHERE id=%s", (antrean_id,))
    antrean = cur.fetchone()
    return Respon.oke(serialize(antrean))


# --- Selesai / Batal CS ---
@bp.route("/selesai", methods=["POST"])
@login_required
def selesai_antrean():
    data = request.get_json()
    antrean_id = data.get("id")
    status = data.get("status", "")

    conn, cur = get_db()
    cur.execute(
        "SELECT * FROM antrean_cs WHERE id=%s AND status=%s",
        (antrean_id, status)
    )
    existing = cur.fetchone()
    if existing:
        return Respon.fail("Nomor antrean sudah selesai atau dibatalkan", 201)

    cur.execute(
        "UPDATE antrean_cs SET status='selesai', waktu_selesai=%s WHERE id=%s",
        (datetime.now(), antrean_id)
    )
    conn.commit()
    return Respon.oke({"id": antrean_id, "status": "selesai"})


@bp.route("/selesai", methods=["PUT"])
@login_required
def batal_antrean():
    data = request.get_json()
    antrean_id = data.get("id")
    status = data.get("status", "")

    conn, cur = get_db()
    cur.execute(
        "SELECT * FROM antrean_cs WHERE id=%s AND status=%s",
        (antrean_id, status)
    )
    existing = cur.fetchone()
    if existing:
        return Respon.fail("Nomor antrean sudah selesai atau dibatalkan", 201)

    cur.execute(
        "UPDATE antrean_cs SET status='batal', waktu_selesai=%s WHERE id=%s",
        (datetime.now(), antrean_id)
    )
    conn.commit()
    return Respon.oke({"id": antrean_id, "status": "batal"})