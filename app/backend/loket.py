from flask import Blueprint, request, jsonify
from .db import query, execute
from .auth import login_required

loket_bp = Blueprint('loket_bp', __name__, url_prefix="/loket")

@loket_bp.route("/", methods=["GET"])
@login_required
def get_loket():
    rows = query("SELECT * FROM loket")
    return jsonify(rows)

@loket_bp.route("/", methods=["POST"])
@login_required
def add_loket():
    data = request.get_json()
    nama = data.get("loket")

    existing = query("SELECT * FROM loket WHERE nama=%s", (nama,))
    if existing:
        return jsonify({"message": "Nama loket sudah ada"}), 409

    new_id = execute("INSERT INTO loket(nama) VALUES (%s)", (nama,))
    return jsonify({"id": new_id, "nama": nama})
    
@loket_bp.route("/", methods=["PUT"])
@login_required
def update_loket():
    data = request.get_json()
    loket_id = data.get("id")
    nama = data.get("loket")

    execute("UPDATE loket SET nama=%s WHERE id=%s", (nama, loket_id))
    return jsonify({"updated": loket_id})

@loket_bp.route("/", methods=["DELETE"])
@login_required
def delete_loket():
    data = request.get_json()
    loket_id = data.get("id")

    execute("DELETE FROM loket WHERE id=%s", (loket_id,))
    return jsonify({"deleted": loket_id})
