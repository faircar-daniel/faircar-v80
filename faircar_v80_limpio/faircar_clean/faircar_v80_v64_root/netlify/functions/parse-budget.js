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
  const validTypes = [
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
    "application/pdf"
  ];
  if (!validTypes.includes(mediaType)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Tipo de archivo no soportado: " + mediaType }) };
  }

  // Límite básico (evita abusos/costes accidentales). base64 es ~1.33x.
  const MAX_B64_CHARS = 10_000_000; // ~7.5MB binario aprox
  if (String(base64).length > MAX_B64_CHARS) {
    return { statusCode: 413, body: JSON.stringify({ error: "Archivo demasiado grande. Prueba a hacer la foto más cerca o usa un PDF más ligero." }) };
  }

  const prompt = `Eres un asistente especializado en leer presupuestos de financiación de coches en España.

Devuelve SOLO texto plano extraído del documento (sin comentarios, sin markdown, sin explicación).

Incluye TODO lo que veas relevante para rellenar un formulario de financiación:
- Marca / modelo / versión (si aparece)
- PVP contado, precio financiando, entrada, cuota mensual, nº cuotas, plazo total (meses)
- TIN, TAE
- comisión de apertura (importe y/o %)
- seguros/servicios incluidos (importe total o mensual)
- total adeudado, precio total a plazos
- VFG/GMV/valor final (si lo hay)
- kilometraje (km/año y/o km totales)

Mantén el formato español de números si aparece (p.ej. 37.322,07 EUR; 8,91%).`;

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
        max_tokens: 1800,
        messages: [{
          role: "user",
          content: [
            (mediaType === "application/pdf")
              ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
              : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
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
