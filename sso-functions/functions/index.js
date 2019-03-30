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

const db = admin.firestore();

app.get("/shouts", async (req, res) => {
  try {
    const data = await db.collection("shouts")
    .orderBy("createdAt", "desc")
    .get()
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
  } catch (err) {
    res.status(500).json({ error: err.code })
  }

});

app.post("/shout", (req, res) => {
  const newShout = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection("shouts")
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
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code })
    })
});

exports.api = functions.https.onRequest(app);
