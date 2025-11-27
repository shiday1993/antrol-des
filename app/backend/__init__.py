from flask import Flask
import os

def create_app():
    base_path = os.path.dirname(os.path.dirname(__file__))
    template_path = os.path.join(base_path, "frontend", "templates")
    static_path = os.path.join(base_path, "frontend", "static")
    app = Flask(
        __name__, 
        template_folder=template_path,
        static_folder=static_path,
        static_url_path="/static" 
    )

    
    app.secret_key = os.getenv("API_KEY", "dev-secret")

    from app.backend.auth import bp as auth_bp
    from app.backend.antrean import bp as antrean_bp
    from app.backend.loket import bp as loket_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(antrean_bp)
    app.register_blueprint(loket_bp)

    return app
