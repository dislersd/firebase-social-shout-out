const { db } = require("../util/admin");

exports.getAllShouts = async (req, res) => {
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
};

exports.postShout = async (req, res) => {
  try {
    if (req.body.body.trim() === "") {
      return res.status(400).json({ body: "Body must not be empty" });
    }

    const newShout = {
      body: req.body.body,
      userHandle: req.user.handle,
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
};
