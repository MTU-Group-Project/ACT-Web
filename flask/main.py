from flask import Flask, render_template, redirect
from firebase_admin import initialize_app, db
from firebase_functions import https_fn
from hashlib import sha256
import json
import shares
import stripe

app = Flask(__name__)

stripe.api_key = "sk_test_51QKcauDGbrVfwZ9wnSzI0I9l4aOnySfGsU95QJgK1TsrbTyBtx6H5MCpckVZnMPo9K4Vvggt156UGT894Lh2XHZY00sUxL2YuN"

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

@app.get("/editClient/<client_id>")
def edit_client(client_id):
    return render_template("editClient.html", client_id=client_id)


@app.get("/reports/<stockName>")
def reports_detail(stockName):
	sh = shares.get_share_information()
	for short_name in sh:
		if short_name == stockName:
			return render_template("financial_reports_detail.html", stockname=stockName, stockhistory=sh[short_name].history)
		
	return redirect("/reports")


@app.get("/api/shares")
def api_shares():
	res = app.response_class(
		response=json.dumps(list(shares.get_share_information().values()), default=lambda s: vars(s)),
		status=200,
		mimetype="application/json"
	)

	return res


@app.get("/api/clients")
def get_clients():
    ref = db.reference('clients')
    clients = ref.get()
    return app.response_class(
        response=json.dumps(clients),
        status=200,
        mimetype="application/json"
    )


@app.post("/api/clients")
def create_client():
    data = request.json
    client_name = data.get("name")
    client_email = data.get("email")
    user_id = data.get("userID")

    ref = db.reference('clients')
    new_client_ref = ref.push()

    new_client_ref.set({
		'id': new_client_ref.key,
        'name': client_name,
        'email': client_email,
        'userID': user_id
    })

    return app.response_class(
        response=json.dumps({"status": "success", "client_id": new_client_ref.key}),
        status=201,
        mimetype="application/json"
    )

@app.delete("/api/clients/<client_id>")
def delete_client(client_id):
    ref = db.reference('clients').child(client_id)
    ref.delete()

    return app.response_class(
        response=json.dumps({"status": "success", "client_id": client_id}),
        status=200,
        mimetype="application/json"
    )

@app.get("/api/clients/<client_id>")
def get_client(client_id):
    ref = db.reference('clients').child(client_id)
    client = ref.get()
    
    if client:
        return app.response_class(
            response=json.dumps(client),
            status=200,
            mimetype="application/json"
        )
    
    return app.response_class(
        response=json.dumps({"error": "Client not found"}),
        status=404,
        mimetype="application/json"
    )

@app.put("/api/clients/<client_id>")
def update_client(client_id):
    data = request.json
    client_name = data.get("name")
    client_email = data.get("email")

    ref = db.reference('clients').child(client_id)
    
    if ref.get() is not None:
        ref.update({
            'name': client_name,
            'email': client_email
        })
        return app.response_class(
            response=json.dumps({"status": "success", "client_id": client_id}),
            status=200,
            mimetype="application/json"
        )
    
    return app.response_class(
        response=json.dumps({"error": "Client not found"}),
        status=404,
        mimetype="application/json"
    )


@app.post("/act_premium")
def buy_act_premium():
    payment = stripe.PaymentIntent.create(amount=1099, currency="eur")

    return json.dumps({
        "secret": payment.client_secret,
        "id": payment.id
    })


@app.post("/act_premium_purchased")
def act_premium_purchased():
    pay_id = request.json.get("payment_id")

    pay_intent = stripe.PaymentIntent.retrieve(pay_id)

    if pay_intent.status != "succeeded":
        pay_intent.confirm()

    if pay_intent.statement_descriptor == "succeeded":
          return json.dumps({"status": 1})
    else:
          return json.dumps({"status": 0})


shares.begin_share_subroutine(120)

# Firebase stuff: #
initialize_app()

@https_fn.on_request(timeout_sec=5)
def server(req: https_fn.Request) -> https_fn.Response:
	global request
	with app.request_context(req.environ):
		request = req
		return app.full_dispatch_request()