const express = require("express");
const admin = require("firebase-admin");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

app.post("/webhook", async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const customerEmail = event.data.customer.email;
      const paymentRef = event.data.reference;

      const usersRef = db.collection("users");
      const snapshot = await usersRef.where("email", "==", customerEmail).get();

      if (!snapshot.empty) {
        snapshot.forEach(async (doc) => {
          const newExpiryDate = new Date();
          newExpiryDate.setDate(newExpiryDate.getDate() + 30);

          await doc.ref.update({
            subscriptionStatus: "active",
            subscriptionEnd: newExpiryDate.toISOString(),
            lastPaymentRef: paymentRef,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });
      }
    }

    res.status(200).send("Event processed");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));