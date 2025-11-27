from flask import jsonify
import traceback

# === Helper functions ===
class Respon:
    @staticmethod
    def error(message="Internal Server Error", code=500, exc: Exception = None, debug: bool = False):
        if exc:
            print("Server Error:", exc)
            traceback.print_exc()
        payload = {
            "metaData": {
                "message": message,
                "code": code
            }
        }
        if exc and debug:
            payload["metaData"]["debug"] = str(exc)
        return jsonify(payload), code

    @staticmethod
    def fail(message, code=400):
        return jsonify({
            "metaData": {
                "message": message,
                "code": code
            },
        }), code

    @staticmethod
    def oke(data=None, message="OK", code=200):
        if data is None:
            data = {}
        return jsonify({
            "metaData": {
                "message": message,
                "code": code
            },
            "response": data
        }), code