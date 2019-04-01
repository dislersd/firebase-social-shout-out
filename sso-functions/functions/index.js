const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

const config = require("./config.js");

const firebase = require("firebase");
firebase.initializeApp(config);

const db = admin.firestore();

app.get("/shouts", async (req, res) => {
  try {
    const data = await db
      .collection("shouts")
      .orderBy("createdAt", "desc")
      .get();
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
    res.status(500).json({ error: err.code });
  }
});

app.post("/shout", async (req, res) => {
  try {
    const newShout = {
      body: req.body.body,
      userHandle: req.body.userHandle,
      createdAt: new Date().toISOString()
    };
    const doc = await db.collection("shouts").add(newShout);
    res
      .status(201)
      .json({ message: `document ${doc.id} created successfully` });
  } catch (error) {
    res.status(500).json({ message: "error posting" });
    console.error(err);
  }
});

const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // if(email.match(regEx)) return true;
  // else return false;
  email.match(regEx) ? true : false;
};

const isEmpty = string => {
  // if (string.trim() === "") return true;
  // else return false;
  string.trim() === "" ? true : false;
};

// sign up route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
    handle: req.body.handle
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "Must not be empty";
  if (newUser.password !== newUser.confirmedPassword)
    errors.confirmedPassword = "Passwords must match";
  if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  //TODO: Validate Data
  let token, userId;
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
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.https.onRequest(app);
