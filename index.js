const express = require("express");
const app = express();
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = "1135956022925582";
const VERSION = "v18.0";

// Verificación del webhook
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

// Recibir mensajes
app.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("📩 Mensaje recibido:", JSON.stringify(body, null, 2));
  res.sendStatus(200);
});

// Enviar mensaje con plantilla
app.get("/enviar", async (req, res) => {
  const numero = req.query.numero;
  const plantilla = req.query.plantilla;
  const nombre = req.query.nombre || "Cliente";

  const response = await fetch(
    `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: numero,
        type: "template",
        template: {
          name: plantilla,
          language: { code: "es_ES" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: nombre
                }
              ]
            }
          ]
        }
      })
    }
  );

  const data = await response.json();
  console.log("📤 Respuesta:", JSON.stringify(data, null, 2));
  res.json(data);
});

app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en puerto 3000");
});
