from firebase_admin import initialize_app, db
from firebase_functions import https_fn
from flask import render_template, Flask

app = Flask(__name__)

@app.route("/")
def index():
	return render_template("login.html")



# Firebase stuff: #
initialize_app()
@https_fn.on_request()
def server(req: https_fn.Request) -> https_fn.Response:
	with app.request_context(req.environ):
		return app.full_dispatch_request()