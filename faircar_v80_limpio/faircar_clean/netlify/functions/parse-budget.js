// Netlify Function: parse-budget
// Receives: { media_type: "image/jpeg", data: "<base64>", filename?: "..." }
// Returns: { ok:true, parsed:<object> } with structured output from Claude
// Env: ANTHROPIC_API_KEY

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers: { "content-type": "text/plain" }, body: "Method Not Allowed" };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: { "content-type": "text/plain" }, body: "Missing ANTHROPIC_API_KEY" };
    }

    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, headers: { "content-type": "text/plain" }, body: "Invalid JSON body" };
    }

    const media_type = String(payload.media_type || "");
    const data = String(payload.data || "");
    const filename = String(payload.filename || "budget.jpg");

    if (!media_type || !data) {
      return { statusCode: 400, headers: { "content-type": "text/plain" }, body: "Missing media_type or data" };
    }

    // Basic safety: limit payload size (~4.5MB base64 ≈ 3.4MB binary)
    if (data.length > 4_500_000) {
      return { statusCode: 413, headers: { "content-type": "text/plain" }, body: "Image too large. Please take a closer photo or use PDF." };
    }

    // JSON schema with required fields but nullable values (avoids optional-parameter limit)
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        template: { type: "string" },
        deal_type: { type: "string", enum: ["cash", "loan", "pcp", "unknown"] },
        vehicle: {
          type: "object",
          additionalProperties: false,
          properties: {
            brand: { type: ["string", "null"] },
            model: { type: ["string", "null"] },
            version_text: { type: ["string", "null"] },
            fuel: { type: ["string", "null"] }
          },
          required: ["brand", "model", "version_text", "fuel"]
        },
        extracted: {
          type: "object",
          additionalProperties: false,
          properties: {
            pvp_cash: { type: ["number", "null"] },
            price_if_finance: { type: ["number", "null"] },
            finance_discount: { type: ["number", "null"] },

            term_months_total: { type: ["integer", "null"] },
            installments: { type: ["integer", "null"] },
            monthly_payment: { type: ["number", "null"] },
            down_payment_cash: { type: ["number", "null"] },
            balloon: { type: ["number", "null"] },

            principal: { type: ["number", "null"] },
            open_fee_amount: { type: ["number", "null"] },
            open_fee_pct: { type: ["number", "null"] },
            tin: { type: ["number", "null"] },
            tae: { type: ["number", "null"] },
            total_due: { type: ["number", "null"] },
            total_payable: { type: ["number", "null"] },
            price_to_finance: { type: ["number", "null"] },

            km_per_year: { type: ["integer", "null"] },
            km_total: { type: ["integer", "null"] }
          },
          required: [
            "pvp_cash","price_if_finance","finance_discount",
            "term_months_total","installments","monthly_payment","down_payment_cash","balloon",
            "principal","open_fee_amount","open_fee_pct","tin","tae","total_due","total_payable","price_to_finance",
            "km_per_year","km_total"
          ]
        },
        bundles: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              amount: { type: ["number", "null"] },
              already_in_principal: { type: ["boolean", "null"] }
            },
            required: ["label", "amount", "already_in_principal"]
          }
        },
        notes: { type: "array", items: { type: "string" } },
        raw_text: { type: "string" }
      },
      required: ["template", "deal_type", "vehicle", "extracted", "bundles", "notes", "raw_text"]
    };

    const instruction = `
Eres un extractor de datos de presupuestos de coche (España).
Devuelve SOLO JSON válido según el esquema, con números en formato numérico (no strings) y usa null si falta un dato.

Reglas:
- Ignora datos personales (nombre, DNI, teléfono, email, direcciones).
- Interpreta el formato español: 37.322,07 € => 37322.07.
- deal_type:
  - "cash" si es presupuesto contado (sin cuotas).
  - "pcp" si hay cuotas + última cuota/GMV/VFG/valor mínimo garantizado/multiopción.
  - "loan" si hay préstamo con cuotas sin última cuota.
- template (string): "vwfs" | "toyota_tfs" | "renault_cash" | "web_pcp" | "generic" según lo que parezca.
- Si el documento muestra 'plazo total' y además 'N cuotas', rellena ambos. Si sólo muestra plazo total y hay última cuota (PCP), normalmente installments = term_months_total - 1 (pero ponlo sólo si lo ves o es coherente).
- finance_discount: trata bonificaciones (VWFS/TFS) como "descuento por financiar" (positivo).
- bundles: si detectas seguros/paquetes/mantenimientos, inclúyelos y marca already_in_principal=true si parecen estar incluidos en el principal o en el total del crédito (si no estás seguro, pon null).
- raw_text: incluye un resumen de 10-25 líneas con los textos/etiquetas clave y números que hayas visto (para depurar).
`;

    const anthropicReq = {
      model: "claude-sonnet-4-6",
      max_tokens: 1600,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type, data }
            },
            { type: "text", text: instruction }
          ]
        }
      ],
      output_config: { format: { type: "json_schema", schema } }
    };

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(anthropicReq)
    });

    const raw = await resp.text();
    if (!resp.ok) {
      return { statusCode: 502, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok: false, error: "Anthropic API error", status: resp.status, raw: raw.slice(0, 1000) }) };
    }

    let j;
    try { j = JSON.parse(raw); } catch(e) { j = null; }
    const txt = j && j.content && j.content[0] && j.content[0].text ? j.content[0].text : "";
    let parsed;
    try { parsed = JSON.parse(txt); } catch(e) {
      return { statusCode: 502, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok:false, error:"Bad JSON from model", model_text: txt.slice(0, 2000) }) };
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
      body: JSON.stringify({ ok: true, parsed, filename })
    };
  } catch (err) {
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok:false, error: String(err && err.message ? err.message : err) }) };
  }
};
