const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

function verifyMetaSignature(req, res, next) {
  const appSecret = process.env.APP_SECRET;
  if (!appSecret) {
    return res.status(500).send("APP_SECRET is not configured");
  }

  const signature = req.get("x-hub-signature-256");
  if (!signature || !signature.startsWith("sha256=")) {
    return res.status(401).send("Missing signature");
  }

  const expected = "sha256=" + crypto
    .createHmac("sha256", appSecret)
    .update(req.body)
    .digest("hex");

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return res.status(401).send("Invalid signature");
  }

  next();
}

app.get("/health", (req, res) => {
  res.json({ ok: true, name: "Prime Jutt MD Mini", status: "running" });
});

// Meta webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

async function sendWhatsAppText(to, body) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const apiVersion = process.env.GRAPH_API_VERSION;

  if (!token || !phoneNumberId || !apiVersion) {
    console.error("Missing WHATSAPP_TOKEN, PHONE_NUMBER_ID, or GRAPH_API_VERSION");
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body }
      })
    }
  );

  const result = await response.json();
  if (!response.ok) {
    console.error("WhatsApp API error:", result);
  } else {
    console.log("Reply sent:", result.messages?.[0]?.id || "accepted");
  }
}

// Use raw body so Meta's signature can be verified.
app.post("/webhook", express.raw({ type: "application/json" }), verifyMetaSignature, async (req, res) => {
  let payload;
  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.sendStatus(400);
  }

  // Acknowledge quickly; Meta may retry webhook deliveries if responses are slow.
  res.sendStatus(200);

  try {
    for (const entry of (payload.entry || [])) {
      for (const change of (entry.changes || [])) {
        const value = change.value || {};
        for (const message of (value.messages || [])) {
          const from = message.from;
          const incomingText = message.text?.body?.trim().toLowerCase();

          if (!from || !incomingText) continue;

          if (incomingText === "!menu" || incomingText === "menu" || incomingText === "hi") {
            await sendWhatsAppText(
              from,
              "👋 Welcome to Prime Jutt MD Mini!\\n\\nCommands:\\n!menu — show this menu\\n!owner — owner information\\n!ping — check bot status"
            );
          } else if (incomingText === "!owner") {
            await sendWhatsAppText(from, "Owner: Prime Jutt Official");
          } else if (incomingText === "!ping") {
            await sendWhatsAppText(from, "✅ Prime Jutt MD Mini is online.");
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Prime Jutt MD Mini running on port ${PORT}`);
});
