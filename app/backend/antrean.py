from flask import Blueprint, request, jsonify
from datetime import datetime, date
from .db import query, execute
from .auth import login_required

antrean_bp = Blueprint('antrean_bp', __name__, url_prefix="/antrean")

def serialize(rows):
    return [
        {k: (v.isoformat() if isinstance(v, (datetime, date)) else v)
         for k, v in row.items()}
        for row in rows
    ]

@antrean_bp.route("/", methods=["GET"])
@login_required
def get_antrean():
    today = date.today()
    antrean = query("SELECT * FROM antrean_cs WHERE tanggal=%s", (today,))
    for row in antrean:
        row['nomor'] = f"{row['prefix']}{row['nomor']:03}"

    loket = query("SELECT * FROM loket")

    return jsonify({'antrean': serialize(antrean), 'loket': loket})


@antrean_bp.route("/", methods=["POST"])
@login_required
def ambil_nomor():
    data = request.get_json()
    prefix = data.get("prefix", "")
    today = date.today()

    last = query("""
        SELECT nomor FROM antrean_cs
        WHERE tanggal=%s ORDER BY nomor DESC LIMIT 1
    """, (today,))

    nomor = last[0]['nomor'] + 1 if last else 1
    execute("""
        INSERT INTO antrean_cs (tanggal, status, nomor, prefix)
        VALUES (%s, 'menunggu', %s, %s)
    """, (today, nomor, prefix))

    return jsonify({"nomor": f"{prefix}{nomor:03}"})


@antrean_bp.route("/panggil", methods=["POST"])
@login_required
def panggil():
    data = request.get_json()
    id = data.get("id")
    loket = data.get("loket")

    execute("""
        UPDATE antrean_cs SET status='sedang dilayani', 
        loket=%s, waktu_panggil=%s WHERE id=%s
    """, (loket, datetime.now(), id))
    
    return jsonify({"id": id, "status": "sedang dilayani"})


@antrean_bp.route("/selesai", methods=["POST"])
@login_required
def selesai():
    data = request.get_json()
    id = data.get("id")

    execute("""
        UPDATE antrean_cs SET status='selesai', waktu_selesai=%s
        WHERE id=%s
    """, (datetime.now(), id))

    return jsonify({"id": id, "status": "selesai"})
