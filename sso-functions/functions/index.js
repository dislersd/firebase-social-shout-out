const functions = require("firebase-functions");
const app = require("express")();

const {getAllShouts, postShout} = require('./handlers/shouts')
const {signUp, login} = require('./handlers/users');


const config = require("./config.js");

const firebase = require("firebase");
firebase.initializeApp(config);

// Shout Routes
app.get("/shouts", getAllShouts);
app.post("/shout", FBAuth, postShout);

// User Routes
app.post("/signup", signUp);
app.post("/login", login);






exports.api = functions.https.onRequest(app);
