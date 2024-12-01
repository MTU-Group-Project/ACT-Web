import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"

const firebaseConfig = {
	apiKey: "AIzaSyCWQkEmFkxDqsWi_ilIbEdOLpPcGu9kWrg",
	authDomain: "mtu-group-project-act.firebaseapp.com",
	projectId: "mtu-group-project-act",
	storageBucket: "mtu-group-project-act.appspot.com"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth();

async function googleLogin() {
	const provider = new GoogleAuthProvider();
	try {
		let loginResult = await signInWithPopup(auth, provider);
	} catch(error) {
		return alert(error);
	}
	window.location.href = '/clients';
}


async function login() {
	let email = document.getElementById("email").value;
	let password = document.getElementById("password").value;
	let credential;
	
	try {
		credential = await signInWithEmailAndPassword(auth, email, password);

		const user = credential.user;
		console.log(user);  // Log the user object to verify UID

		// Save access token to be accessed by server
		const accessToken = await user.getIdToken(true);
		// Expiry date one month from now
		let expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + 1);
		document.cookie = `__session=${accessToken}; expires=${expiryDate.toUTCString()}`;
	} catch(error) {
		return alert(error);
	}

	const user = credential.user;
	console.log(user);
	window.location.href = '/clients';
}

async function register() {
	let email = document.getElementById("email").value;
	let password = document.getElementById("password").value;
	let credential;
	
	try {
		credential = await createUserWithEmailAndPassword(auth, email, password);
	} catch(error) {
		return alert(error);
	}

	const user = credential.user;
	window.location.href = '/clients';
}

export function getCurrentUID() {
	const auth = getAuth();
	return new Promise((resolve) => {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				resolve(user.uid);
			} else {
				resolve(null);
			}
		});
	});
}

document.login = login
document.register = register
document.googleLogin = googleLogin