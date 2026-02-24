// Netlify Function: parse-budget.js
// Proxy seguro entre FairCar y la API de Anthropic
// La API key vive en las variables de entorno de Netlify, nunca en el frontend

exports.handler = async function(event) {
  // Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key no configurada en Netlify" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  const { base64, mediaType } = body;
  if (!base64 || !mediaType) {
    return { statusCode: 400, body: JSON.stringify({ error: "Faltan campos base64 o mediaType" }) };
  }

  // Validar que sea una imagen o PDF válido
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/png"];
  if (!validTypes.includes(mediaType)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Tipo de archivo no soportado: " + mediaType }) };
  }

  const prompt = `Eres un asistente especializado en leer presupuestos de financiación de coches en España.
Extrae TODOS los datos numéricos y textuales de este presupuesto. Devuelve solo el texto extraído tal cual aparece, sin comentarios adicionales.
Incluye: PVP, cuotas mensuales, entrada, TIN, TAE, número de cuotas, plazos en meses, comisiones de apertura, seguros vinculados, totales adeudados, descuentos, bonificaciones, valor final garantizado (VFG/GMV), kilometraje y cualquier dato numérico relevante.
Mantén el formato original de los números (por ejemplo: 37.322,07 EUR).`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 }
            },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Error Anthropic API: " + errText.slice(0, 300) })
      };
    }

    const data = await response.json();
    const text = (data.content || [])
      .map(b => b.type === "text" ? b.text : "")
      .join("\n");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    };

  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno: " + String(e && e.message ? e.message : e) })
    };
  }
};
