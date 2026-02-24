// Netlify Function: parse-budget
// Receives JSON:
//   - Images: { images: [{ media_type:"image/jpeg", data:"<base64>", hint?: "full|header|footer" }], filename?: "..." }
//   - Legacy: { media_type:"image/jpeg", data:"<base64>", filename?: "..." }
// Returns: { ok:true, parsed:<object> } with structured output from Claude
// Env: ANTHROPIC_API_KEY

function _parseEsNumberLike(x){
  if(x===null || x===undefined) return null;
  const s0 = String(x).trim();
  if(!s0) return null;
  // keep digits, dot, comma, minus
  const cleaned = s0.replace(/[^0-9,.-]/g, "");
  if(!cleaned) return null;

  let norm = cleaned;
  if(norm.includes(",")){
    // Spanish: dots = thousands, comma = decimal
    norm = norm.replace(/\./g, "").replace(",", ".");
  }else{
    // No comma: assume dots are thousands separators in budgets (safer)
    norm = norm.replace(/\./g, "");
  }
  const v = Number(norm);
  return Number.isFinite(v) ? v : null;
}

function _parseEsIntLike(x){
  const v = _parseEsNumberLike(x);
  return (v===null) ? null : Math.round(v);
}

function _postFixFromRawText(parsed){
  try{
    const ex = parsed && parsed.extracted ? parsed.extracted : null;
    const txt = String(parsed && parsed.raw_text ? parsed.raw_text : "");

    if(!ex) return;

    // 1) km/año: si llega 25 en vez de 25000, intentar rescatar del raw_text.
    if(ex.km_per_year && ex.km_per_year > 0 && ex.km_per_year < 1000){
      // intenta encontrar "25.000 km/año" o similar
      let m = txt.match(/(\d{1,3}(?:[\.\s]\d{3})+)\s*km\/?a(?:ñ|n)o/i);
      if(!m) m = txt.match(/KILOMETRAJE[^0-9]{0,25}(\d{1,3}(?:[\.\s]\d{3})+)/i);
      const v = m ? _parseEsIntLike(m[1]) : null;
      if(v && v >= 1000) ex.km_per_year = v;
      else if(ex.km_per_year <= 80) ex.km_per_year = ex.km_per_year * 1000; // heurística típica (15/20/25)
    }

    // 2) TIN (%): variantes TIN, T.I.N., Tipo de interés nominal
    if((ex.tin===null || ex.tin===undefined) && /\bTIN\b|T\.\s*I\.\s*N\./i.test(txt)){
      const m = txt.match(/T\.?\s*I\.?\s*N\.?[^0-9]{0,15}([0-9.,]{2,6})\s*%/i)
             || txt.match(/TIPO\s+DE\s+INTER[ÉE]S\s+NOMINAL[^0-9]{0,20}([0-9.,]{2,6})\s*%/i);
      const v = m ? _parseEsNumberLike(m[1]) : null;
      if(v!==null) ex.tin = v;
    }

    // 3) Comisión / gastos apertura (importe y %)
    if((ex.open_fee_amount===null || ex.open_fee_amount===undefined) && /(apertura|formaliz)/i.test(txt)){
      const m = txt.match(/(?:COMISI[ÓO]N|GASTOS)\s+DE\s+(?:APERTURA|FORMALIZACI[ÓO]N)[^0-9]{0,40}([0-9.\s]+,[0-9]{2})/i);
      const v = m ? _parseEsNumberLike(m[1]) : null;
      if(v!==null) ex.open_fee_amount = v;
    }
    if((ex.open_fee_pct===null || ex.open_fee_pct===undefined) && /%/.test(txt) && /(apertura|formaliz)/i.test(txt)){
      const m = txt.match(/(?:COMISI[ÓO]N|GASTOS)\s+DE\s+(?:APERTURA|FORMALIZACI[ÓO]N)[^%]{0,60}\(\s*([0-9.,]{1,5})\s*%\s*\)/i);
      const v = m ? _parseEsNumberLike(m[1]) : null;
      if(v!==null) ex.open_fee_pct = v;
    }
  }catch(e){
    // ignore
  }
}

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

    const filename = String(payload.filename || "budget.jpg");

    // Accept multi-image payload or legacy single-image payload
    let images = [];
    if (Array.isArray(payload.images)) {
      images = payload.images
        .map(x => ({
          media_type: String(x && x.media_type || ""),
          data: String(x && x.data || ""),
          hint: String(x && x.hint || "")
        }))
        .filter(x => x.media_type && x.data);
    } else {
      const media_type = String(payload.media_type || "");
      const data = String(payload.data || "");
      if (media_type && data) images = [{ media_type, data, hint: "full" }];
    }

    if (images.length < 1) {
      return { statusCode: 400, headers: { "content-type": "text/plain" }, body: "Missing images (or media_type/data)" };
    }

    // Basic safety: limit total payload size
    const totalLen = images.reduce((a, x) => a + (x.data ? x.data.length : 0), 0);
    if (totalLen > 7_500_000) {
      return { statusCode: 413, headers: { "content-type": "text/plain" }, body: "Image(s) too large. Please take a closer photo or use PDF." };
    }

    // JSON schema (nullable fields)
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
Eres un extractor de datos de presupuestos de coche (España). Devuelve SOLO JSON válido según el esquema.

Reglas críticas de precisión:
- Formato español: 37.322,07 € => 37322.07. 25.000 km => 25000.
- km_per_year y km_total SIEMPRE enteros en km (no miles). Si el papel pone 25.000 km/año, NO pongas 25: pon 25000.
- Detecta TIN aunque aparezca como "T.I.N." o "Tipo de interés nominal".
- La comisión puede salir como: "Comisión de apertura", "Comisión de apertura financiada", "Gastos de formalización", "Gastos de apertura". Extrae importe y % si existen.
- deal_type:
  - "cash" si es contado (sin cuotas).
  - "pcp" si hay cuotas + última cuota/GMV/VFG/valor mínimo garantizado/multiopción.
  - "loan" si hay préstamo sin última cuota.
- template: "vwfs" | "toyota_tfs" | "renault_cash" | "web_pcp" | "generic" según lo que parezca.
- Si el documento muestra plazo total y además número de cuotas, rellena ambos. Si no hay número de cuotas pero es PCP, normalmente installments = term_months_total - 1 (ponlo sólo si es coherente con el documento).
- finance_discount: bonificaciones (VWFS/TFS) como "descuento por financiar" (positivo).
- bundles: si detectas seguros/paquetes/mantenimientos, inclúyelos y marca already_in_principal=true si están incluidos en principal/total del crédito; si dudas, null.
- Ignora datos personales (nombre, DNI, teléfono, email, direcciones).
- raw_text: pega 10-25 líneas con etiquetas y números CLAVE que has usado (incluye, si existen, las líneas de TIN/TAE, comisión/gastos y kilometraje).
`;

    const content = [];
    for (const im of images) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: im.media_type, data: im.data }
      });
    }
    content.push({ type: "text", text: instruction });

    const anthropicReq = {
      model: "claude-sonnet-4-6",
      max_tokens: 2200,
      messages: [{ role: "user", content }],
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
      return { statusCode: 502, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok: false, error: "Anthropic API error", status: resp.status, raw: raw.slice(0, 1200) }) };
    }

    let j;
    try { j = JSON.parse(raw); } catch(e) { j = null; }
    const txt = j && j.content && j.content[0] && j.content[0].text ? j.content[0].text : "";
    let parsed;
    try { parsed = JSON.parse(txt); } catch(e) {
      return { statusCode: 502, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok:false, error:"Bad JSON from model", model_text: txt.slice(0, 2000) }) };
    }

    // Post-fix: rescatar TIN/comisión/km si el modelo los dejó a null pero estaban en el texto.
    _postFixFromRawText(parsed);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
      body: JSON.stringify({ ok: true, parsed, filename })
    };
  } catch (err) {
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok:false, error: String(err && err.message ? err.message : err) }) };
  }
};
