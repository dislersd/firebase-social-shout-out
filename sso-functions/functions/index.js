const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const express = require("express");
const app = express();

app.get("/shouts", (req, res) => {
  admin
    .firestore()
    .collection("shouts")
    .orderBy('createdAt', 'desc')
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

app.post('/shout', (req, res) => {
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

// https://baseurl.com/api/shouts

exports.api = functions.https.onRequest(app);