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

@app.get("/clientPortfolio/<client_id>")
def client_portfolio(client_id):
    return render_template("clientPortfolio.html", client_id=client_id)


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

# @app.get("/api/shares")
# def get_shares():
#     ref = db.reference('shares')
#     shares = ref.get()
#     return app.response_class(
#         response=json.dumps(shares),
#         status=200,
#         mimetype="application/json"
#     )

@app.get("/api/clients/user/<user_id>")
def get_clients_by_user(user_id):
    ref = db.reference('clients')
    clients = ref.order_by_child('userID').equal_to(user_id).get()

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

@app.post("/api/clients/<client_id>/shares")
def add_share_to_client(client_id):
    data = request.json
    share_id = data.get("share_id")

    client_ref = db.reference(f'clients/{client_id}')

    client_snapshot = client_ref.get()
    if not client_snapshot:
        return app.response_class(
            response=json.dumps({"error": "Client not found"}),
            status=404,
            mimetype="application/json"
        )

    shares_ref = client_ref.child("shares")
    new_share_ref = shares_ref.push({
        'share_id': share_id,
    })

    return app.response_class(
        response=json.dumps({
            "status": "success",
            "share_id": share_id,
            "client_id": client_id,
            "share_ref": new_share_ref.key
        }),
        status=200,
        mimetype="application/json"
    )


@app.route("/api/clients/<client_id>/shares", methods=["DELETE"])
def delete_share_from_client(client_id):
    data = request.json
    index = data.get("index")

    if index is None:
        return app.response_class(
            response=json.dumps({"error": "Index is required!"}),
            status=400,
            mimetype="application/json"
        )
    index = int(index)
    
    client_ref = db.reference(f'clients/{client_id}')

    client_snapshot = client_ref.get()
    if not client_snapshot:
        return app.response_class(
            response=json.dumps({"error": "Client not found!"}),
            status=404,
            mimetype="application/json"
        )

    shares_ref = client_ref.child("shares")

    shares_snapshot = shares_ref.get()
    if not shares_snapshot:
        return app.response_class(
            response=json.dumps({"error": "No shares found for this client!"}),
            status=404,
            mimetype="application/json"
        )

    shares_list = list(shares_snapshot.items())

    if index < 0 or index >= len(shares_list):
        return app.response_class(
            response=json.dumps({"error": "Invalid index!"}),
            status=400,
            mimetype="application/json"
        )

    share_key_to_delete = shares_list[index][0]
    share_ref_to_delete = shares_ref.child(share_key_to_delete)
    share_ref_to_delete.delete()

    return app.response_class(
        response=json.dumps({
            "status": "success",
            "message": f"Share at index {index} removed from client {client_id}!",
            "client_id": client_id,
            "index": index,
            "share_key": share_key_to_delete
        }),
        status=200,
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