from firebase_admin import auth, db
import status as Status

def verify(request):
	""" Verifies the user with Firebase and returns their uid """

	if "__session" not in request.cookies:
		raise Status.Unauthorized("No session cookie set")

	token = request.cookies["__session"]

	try:
		decoded_token = auth.verify_id_token(token, clock_skew_seconds=60)
	except Exception as e:
		raise Status.Unauthorized(e)
	
	return decoded_token["uid"]
