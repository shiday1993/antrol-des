from app.backend import create_app
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = create_app()

debug = any(arg.lower() in ("--debug=true", "--debug") for arg in sys.argv)

if __name__ == "__main__":
    app.run(port=5000, debug=debug)
