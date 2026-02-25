// Netlify Function: parse-budget.js
// Proxy seguro entre FairCar y la API de Anthropic

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key no configurada en Netlify" }) };
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

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(mediaType)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Tipo no soportado: " + mediaType }) };
  }

  const prompt = `Eres un experto en presupuestos de financiación de coches en España (Toyota TFS, VWFS, Renault, Stellantis, BMW FS, etc.).

Analiza este documento y devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones.

El JSON debe tener exactamente esta estructura (usa null para campos no encontrados):

{
  "vehiculo": {
    "marca": null,
    "modelo": null,
    "version": null,
    "combustible": null,
    "cv": null,
    "km_anio": null
  },
  "financiacion": {
    "cuota_mensual": null,
    "entrada": null,
    "vfg": null,
    "plazo_meses": null,
    "num_cuotas": null,
    "tin": null,
    "tae": null,
    "pvp_contado": null,
    "importe_financiar": null,
    "apertura_eur": null,
    "apertura_pct": null,
    "total_plazos": null,
    "total_credito": null
  },
  "extras": []
}

INSTRUCCIONES CRÍTICAS:
- "extras" es una lista de seguros/servicios incluidos. Cada elemento: {"nombre": "...", "tipo": "mensual_cuota" o "prima_unica", "importe": 0, "entra_tae": false}
- "pvp_contado" es el PRECIO POR FINANCIAR o precio real del vehículo (ej: 37905.64 en Toyota), NO la Bonificación TFS
- "entrada" es la entrada real que aparece en la letra pequeña (ej: 5350.00), NO la entrada inicial del cuadro resumen
- "apertura_eur" son los gastos de formalización/comisión apertura en euros
- "combustible" debe ser uno de: "gasolina", "diesel", "hibrido", "phev", "electrico"
- Lee SIEMPRE la letra pequeña al pie — contiene TIN, TAE, entrada real e importe a financiar
- Números en formato decimal con punto (ej: 535.15, no 535,15)
- Si un campo no aparece en el documento, usa null`;

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
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return { statusCode: response.status, body: JSON.stringify({ error: "Error Anthropic: " + errText.slice(0, 300) }) };
    }

    const data = await response.json();
    const rawText = (data.content || []).map(b => b.type === "text" ? b.text : "").join("\n").trim();

    // Parsear JSON directamente
    let parsed = null;
    try {
      // Limpiar posibles backticks de markdown
      const clean = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(clean);
    } catch(e) {
      // Si falla el JSON, devolver el texto para fallback
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, vehicle: null, parsed: null, jsonError: true })
      };
    }

    // Extraer vehicle para compatibilidad con código existente
    const veh = parsed.vehiculo || {};
    const vehicle = (veh.marca || veh.modelo) ? {
      brand: veh.marca || null,
      model: veh.modelo || null,
      version: veh.version || null,
      combustible: veh.combustible || null,
      cv: veh.cv || null,
      km_anio: veh.km_anio || null
    } : null;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: rawText, vehicle, parsed })
    };

  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno: " + String(e && e.message ? e.message : e) })
    };
  }
};
