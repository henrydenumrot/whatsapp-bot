const express = require("express");
const https = require("https");
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

// Recibir mensajes y botones
app.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("📩 JSON completo recibido:", JSON.stringify(body, null, 2));

  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const from = message.from;
      const type = message.type;

      console.log(`📱 Mensaje de: ${from}`);
      console.log(`📌 Tipo: ${type}`);

      // Si es respuesta de botón
      if (type === "button") {
        const buttonText = message.button.text;
        console.log(`🔘 Botón presionado: ${buttonText}`);

        if (buttonText === "ACEPTO") {
          console.log("✅ Usuario ACEPTÓ");
          // Aquí enviaremos la segunda plantilla
        } else if (buttonText === "NO ACEPTO") {
          console.log("❌ Usuario NO ACEPTÓ");
        }
      }

      // Si es mensaje de texto normal
      if (type === "text") {
        console.log(`💬 Texto: ${message.text.body}`);
      }
    }
  } catch (err) {
    console.error("Error procesando mensaje:", err.message);
  }

  res.sendStatus(200);
});

// Enviar mensaje con plantilla
app.get("/enviar", async (req, res) => {
  const numero = req.query.numero;
  const plantilla = req.query.plantilla;
  const nombre = req.query.nombre || "Cliente";
  const empresa = req.query.empresa || "Empresa";

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
          language: { code: "es_CO" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: nombre },
                { type: "text", text: empresa }
              ]
            }
          ]
        }
      })
    }
  );

  const data = await response.json();
  console.log("📤 Mensaje enviado:", JSON.stringify(data, null, 2));
  res.json(data);
});

// Keep alive
setInterval(() => {
  https.get("https://whatsapp-bot-nvwq.onrender.com/webhook", (res) => {
    console.log("🔄 Servidor activo:", res.statusCode);
  }).on("error", (err) => {
    console.error("Error keep-alive:", err.message);
  });
}, 600000);

app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en puerto 3000");
});
