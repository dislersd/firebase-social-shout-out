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

const FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log(decodedToken);
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token ", err);
      return res.status(403).json(err);
    });
};


const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
  // email.match(regEx) ? true : false; - ternary not working.
};

const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
  // string.trim() === "" ? true : false;  - ternary not working.
};



exports.api = functions.https.onRequest(app);
