from flask import Flask, render_template, redirect
from firebase_admin import initialize_app, db
from firebase_functions import https_fn
from hashlib import sha256
import json
import shares

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

@app.get("/clients")
def clients():
	return render_template("clients.html")


@app.get("/reports")
def reports():
	return render_template("financial_reports.html")


@app.get("/api/shares")
def api_shares():
	res = app.response_class(
		response=json.dumps(list(shares.get_share_information().values()), default=lambda s: vars(s)),
		status=200,
		mimetype="application/json"
	)

	return res


shares.begin_share_subroutine(120)

@app.get("/api/clients")
def get_clients():
    ref = db.reference('clients')
    clients = ref.get()
    return app.response_class(
        response=json.dumps(clients),
        status=200,
        mimetype="application/json"
    )

# @app.post("/api/clients")
# def create_client():
#     data = request.json  # Get JSON data from the request
#     client_id = data.get("id")
#     client_name = data.get("client_name")
    
#     ref = db.reference('clients')
#     ref.child(client_id).set({
#         'client_name': client_name
#     })
    
#     return app.response_class(
#         response=json.dumps({"status": "success"}),
#         status=201,
#         mimetype="application/json"
#     )


# Firebase stuff: #
initialize_app()

@https_fn.on_request(timeout_sec=5)
def server(req: https_fn.Request) -> https_fn.Response:
	global request
	with app.request_context(req.environ):
		request = req
		return app.full_dispatch_request()
