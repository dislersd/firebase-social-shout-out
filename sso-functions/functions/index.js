const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

var config = {
  apiKey: "AIzaSyD3RCWIpkLGwT8IIWwUluk4WmalJOE_waw",
  authDomain: "social-shout-out.firebaseapp.com",
  databaseURL: "https://social-shout-out.firebaseio.com",
  projectId: "social-shout-out",
  storageBucket: "social-shout-out.appspot.com",
  messagingSenderId: "510630727787"
};

const firebase = require("firebase");
firebase.initializeApp(config);

app.get("/shouts", (req, res) => {
  admin
    .firestore()
    .collection("shouts")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let shouts = [];
      data.forEach(doc => {
        shouts.push({
          shoutId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(shouts);
    })
    .catch(err => console.error(err));
});

app.post("/shout", (req, res) => {
  const newShout = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  admin
    .firestore()
    .collection("shouts")
    .add(newShout)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "error posting" });
      console.error(err);
    });
});

// sign up route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
    handle: req.body.handle
  };

  //TODO: Validate Data

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res
        .status(201)
        .json({ message: `user ${data.user.uid} signed up successfully` });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: "err.code" });
    });
});

exports.api = functions.https.onRequest(app);
