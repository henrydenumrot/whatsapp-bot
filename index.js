const express = require("express");
const app = express();
app.use(express.json());

// Este endpoint verifica el webhook con Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === "mi_token_secreto") {
    console.log("✅ Webhook verificado!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Este endpoint recibe los mensajes de WhatsApp
app.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("📩 Mensaje recibido:", JSON.stringify(body, null, 2));
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en puerto 3000");
});