from flask import Flask, render_template, redirect
from firebase_admin import initialize_app, db
from firebase_functions import https_fn
from hashlib import sha256

app = Flask(__name__)


@app.get("/")
def index():
	return redirect("/login", code=302)


@app.get("/login")
def login():
	return render_template("login.html")


@app.get("/register")
def register():
	return render_template("register.html")


# Firebase stuff: #
initialize_app()
@https_fn.on_request(timeout_sec=5)
def server(req: https_fn.Request) -> https_fn.Response:
	global request
	with app.request_context(req.environ):
		request = req
		return app.full_dispatch_request()