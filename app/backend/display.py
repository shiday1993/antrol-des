from flask import Blueprint, render_template, session
from app.backend.response import Respon
from app.backend.auth import login_required

bp = Blueprint("display_bp", __name__, url_prefix='/display')

@bp.route("/test")
@login_required
def test():
    return Respon.oke({"message": "Antrean API connected!"})

@bp.route("/")
@login_required
def display():
    return render_template("display.html", user=session['user'])
