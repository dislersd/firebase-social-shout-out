const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const { getAllShouts, postShout } = require("./handlers/shouts");
const { signUp, login } = require("./handlers/users");

// Shout Routes
app.get("/shouts", getAllShouts);
app.post("/shout", FBAuth, postShout);

// User Routes
app.post("/signup", signUp);
app.post("/login", login);

exports.api = functions.https.onRequest(app);
