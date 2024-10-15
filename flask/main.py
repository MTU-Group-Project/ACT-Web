from flask import Flask, render_template
from firebase_admin import initialize_app, db
from firebase_functions import https_fn
from hashlib import sha256

app = Flask(__name__)


@app.get("/")
def index():
	return render_template("login.html")


@app.post("/api/login")
def login_api():
	# Get username and password
	username = request.json["username"]
	password = request.json["password"]

	# Get user from database
	target_user = None
	users = db.reference("users")
	for userID, user in users.get().items():
		if user["username"] == username:
			user["id"] = userID
			target_user = user
			break

	if not target_user:
		return "Incorrect username or password", 400
	
	# Check password
	if sha256(user["id"] + password) != target_user.password:
		return "Incorrect username or password", 400
	
	return True




# Firebase stuff: #
initialize_app()
@https_fn.on_request(timeout_sec=5)
def server(req: https_fn.Request) -> https_fn.Response:
	global request
	with app.request_context(req.environ):
		request = req
		return app.full_dispatch_request()