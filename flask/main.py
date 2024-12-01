from flask import Flask, render_template, redirect
from firebase_admin import initialize_app, db
from firebase_functions import https_fn
import json
import stripe
import stock
import user

app = Flask(__name__)

stripe.api_key = "sk_test_51QKcauDGbrVfwZ9wnSzI0I9l4aOnySfGsU95QJgK1TsrbTyBtx6H5MCpckVZnMPo9K4Vvggt156UGT894Lh2XHZY00sUxL2YuN"

@app.get("/")
def index():
    """ Default page """

    return redirect("/login", code=302)


@app.get("/api/stocks")
def get_stocks():
    """ Gets a list of all available stocks """

    return stock.get_stocks()

@app.get("/api/stock/<s>")
def get_stock(s):
    """ Get information for a single stock """

    return stock.get_stock(s)


@app.get("/api/stockinfo/<s>")
def get_stock_report(s):
    """ Get AI generated reports for a stock """

    return stock.get_report(s)


@app.get("/login")
def login():
    """ Login page """

    return render_template("login.html")


@app.get("/register")
def register():
    """ Register page """

    return render_template("register.html")


@app.get("/clients")
def clients():
    """ Clients page for the manager """

    return render_template("clients.html")


@app.get("/reports")
def reports():
    """ Reports page for all stocks """

    return render_template("financial_reports.html")


@app.get("/editClient/<client_id>")
def edit_client(client_id):
    return render_template("editClient.html", client_id=client_id)


@app.get("/clientPortfolio/<client_id>")
def client_portfolio(client_id):
    return render_template("clientPortfolio.html", client_id=client_id)


@app.get("/reports/<s>")
def reports_detail(s):
    info = get_stock(s)
    
    print("--------------------------------")
    print(info)

    if info != {}:
        return render_template("financial_reports_detail.html", stockname=s, stockhistory=info["history"])
	
    return redirect("/reports")


@app.get("/api/clients")
def get_clients():
    uid = user.verify(request)

    ref = db.reference(f"/fundmanager/{uid}/clients")
    clients = ref.get()
    return app.response_class(
        response=json.dumps(clients),
        status=200,
        mimetype="application/json"
    )

# @app.get("/api/clients/user/<user_id>")
# def get_clients_by_user(user_id):
#     # TODO: FIXME !!!!
#     ref = db.reference('clients')
#     clients = ref.order_by_child('userID').equal_to(user_id).get()

#     return app.response_class(
#         response=json.dumps(clients),
#         status=200,
#         mimetype="application/json"
#     )

@app.post("/api/clients")
def create_client():
    uid = user.verify(request)
    print(uid)
    # New client information
    data = request.json
    client_name = data.get("name")
    client_email = data.get("email")

    ref = db.reference(f"/fundmanager/{uid}/clients")
    new_client_ref = ref.push()

    new_client_ref.set({
        "name": client_name,
        "email": client_email
    })

    return app.response_class(
        response=json.dumps({"status": "success", "client_id": new_client_ref.key}),
        status=201,
        mimetype="application/json"
    )

@app.delete("/api/clients/<client_id>")
def delete_client(client_id):
    uid = user.verify(request)

    ref = db.reference(f"fundmanager/{uid}/clients/{client_id}")
    ref.delete()

    return app.response_class(
        response=json.dumps({"status": "success", "client_id": client_id}),
        status=200,
        mimetype="application/json"
    )

@app.get("/api/clients/<client_id>")
def get_client(client_id):
    uid = user.verify(request)

    ref = db.reference(f"/fundmanager/{uid}/clients/{client_id}")
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
    uid = user.verify(request)

    data = request.json
    client_name = data.get("name")
    client_email = data.get("email")

    ref = db.reference(f"/fundmanager/{uid}/clients/{client_id}")
    
    if ref.get() is not None:
        ref.update({
            "name": client_name,
            "email": client_email
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
    uid = user.verify(request)

    data = request.json
    share_name = data.get("share_name")
    quantity = data.get("quantity")
    price_alert = data.get("price_alert")

    client_ref = db.reference(f"/fundmanager/{uid}/clients/{client_id}/")

    client_snapshot = client_ref.get()
    if not client_snapshot:
        return app.response_class(
            response=json.dumps({"error": "Client not found"}),
            status=404,
            mimetype="application/json"
        )
    
    shares_ref = client_ref.child("shares")
    share_snapshot = shares_ref.child(share_name).get()

    if share_snapshot:
        new_quantity = share_snapshot['quantity'] + quantity
        new_price_alert = price_alert
        shares_ref.child(share_name).update({
            "quantity": new_quantity,
            "price_alert": new_price_alert
        })
    else:
        shares_ref.child(share_name).set({
            "quantity": quantity,
            "price_alert": price_alert
        })

    return {"status": "success"}


@app.delete("/api/clients/<client_id>/shares")
def sell_share_from_client(client_id):
    uid = user.verify(request)

    data = request.json
    share_name = data.get("share_name")
    quantity_to_sell = data.get("quantity")

    if not share_name or quantity_to_sell is None:
        return app.response_class(
            response=json.dumps({"error": "Share name and quantity are required!"}),
            status=400,
            mimetype="application/json"
        )
    
    if quantity_to_sell <= 0:
        return app.response_class(
            response=json.dumps({"error": "Quantity must be a positive integer!"}),
            status=400,
            mimetype="application/json"
        )
    
    client_ref = db.reference(f"/fundmanager/{uid}/clients/{client_id}/")

    client_snapshot = client_ref.get()
    if not client_snapshot:
        return app.response_class(
            response=json.dumps({"error": "Client not found!"}),
            status=404,
            mimetype="application/json"
        )

    shares_ref = client_ref.child(f"shares/{share_name}")
    share_snapshot = shares_ref.get()

    if not share_snapshot:
        return app.response_class(
            response=json.dumps({"error": f"Share '{share_name}' not found!"}),
            status=404,
            mimetype="application/json"
        )
    
    current_quantity = share_snapshot['quantity']

    if current_quantity < quantity_to_sell:
        return app.response_class(
            response=json.dumps({"error": "Not enough shares to sell!"}),
            status=400,
            mimetype="application/json"
        )
    
    new_quantity = current_quantity - quantity_to_sell

    if new_quantity > 0:
        shares_ref.update({"quantity": new_quantity})
    else:
        shares_ref.delete()

    return {"status": "success"}


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


# Firebase stuff: #
initialize_app()

@https_fn.on_request(timeout_sec=5)
def server(req: https_fn.Request) -> https_fn.Response:
	global request
	with app.request_context(req.environ):
		request = req
		return app.full_dispatch_request()