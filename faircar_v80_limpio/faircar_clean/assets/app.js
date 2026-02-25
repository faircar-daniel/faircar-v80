// FairCar v1 — client-side only (Netlify-ready)
(function(){
  console.log("FairCar build v66");
  const $ = (sel) => document.querySelector(sel);
  const mount = $("#stepMount");
  const btnBack = $("#btnBack");
  const btnNext = $("#btnNext");
  const btnNextNoSave = $("#btnNextNoSave");
  const btnChangeProfile = $("#btnChangeProfile");
  const progressBar = $("#progressBar");
  const progressPill = $("#progressPill");
  const resultsSingleCard = $("#resultsSingleCard");
  const resultsCompareCard = $("#resultsCompareCard");
  const btnDownloadPdf = $("#btnDownloadPdf");
  const btnFaircarStudy = $("#btnFaircarStudy");
  const studyMount = $("#faircarStudyMount");
  const testsMount = $("#testsMount");

  // Debug interno: activar con ?debug=1 o guardando localStorage.
  const FC_DEBUG_LS = "faircar:debug:v1";
  const DEBUG = (() => {
    try{
      const qs = new URLSearchParams(location.search||"");
      if(qs.get("debug")==="1") return true;
      if(localStorage.getItem(FC_DEBUG_LS)==="1") return true;
    }catch(e){}
    return false;
  })();


  const defaults = {
    prices: { gasoline: 1.45, diesel: 1.40, kwh_home: 0.20, kwh_street: 0.45 },
    tax: { low: 90, mid: 140, high: 210, ev: 45 }
  };

  // Plazo (meses): por defecto 60. El usuario puede escribir cualquier mes (ej. 49).
  // En los controles numéricos, las flechas/subidas bajan de 12 en 12 (step=12).
  function normalizeTermMonths(val){
    let m = Number(val);
    if (!isFinite(m) || m <= 0) m = 60;
    // Permitir cualquier entero (sin “snap” a múltiplos de 12)
    m = Math.round(m);
    if (!isFinite(m) || m <= 0) m = 60;
    return Math.min(180, Math.max(12, m));
  }

  // ----------------------------
  // Importar presupuesto (PDF/foto) — OCR + parseo por plantilla (client-side)
  // ----------------------------
  function _loadScriptOnce(src, testFn){
    return new Promise((resolve, reject)=>{
      try{
        if(testFn && testFn()) return resolve(true);
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = ()=> resolve(true);
        s.onerror = ()=> reject(new Error("No se pudo cargar: "+src));
        document.head.appendChild(s);
      }catch(e){ reject(e); }
    });
  }

  async function ensureBudgetLibs(){
    // Solo pdf.js para PDFs digitales — Claude Vision sustituye a Tesseract
    const needPdf = ()=> typeof window.pdfjsLib !== "undefined";
    if(!needPdf()){
      await _loadScriptOnce("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.js", needPdf);
      try{ window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js"; }catch(e){}
    }
  }

  // Extrae texto de imagen usando la Netlify Function (proxy seguro hacia Claude Vision)
  // Cache temporal del vehículo detectado por Claude Vision
  let _lastVisionVehicle = null;
  let _lastVisionParsed  = null; // JSON estructurado completo de la última importación

  async function _extractTextWithClaudeVision(base64Data, mediaType, onProgress){
    onProgress && onProgress(0.3, "Leyendo con IA…");
    const response = await fetch("/.netlify/functions/parse-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64: base64Data, mediaType: mediaType })
    });
    if(!response.ok){
      const err = await response.text().catch(()=>"");
      throw new Error("Error al leer la imagen (" + response.status + "): " + err.slice(0,300));
    }
    const data = await response.json();
    if(data.error) throw new Error(data.error);
    onProgress && onProgress(0.85, "Interpretando datos…");
    // Guardar vehículo y JSON completo
    if(data.vehicle) _lastVisionVehicle = data.vehicle;
    else _lastVisionVehicle = null;
    if(data.parsed) _lastVisionParsed = data.parsed;
    else _lastVisionParsed = null;
    return data.text || "";
  }

  function _normBudgetText(s){
    return String(s||"")
      .replace(/\u00a0/g," ")
      .replace(/[€]/g," EUR ")
      .replace(/\s+/g," ")
      .trim();
  }

  function _toUpper(s){ return _normBudgetText(s).toUpperCase(); }

  function _escHtml(s){
    return String(s||"")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function _parseEsNumber(raw){
    let s = String(raw||"").trim();
    s = s.replace(/[^\d.,-]/g,"");
    if(!s) return null;
    // quitar signos repetidos
    s = s.replace(/(?!^)-/g,"");
    const hasDot = s.includes(".");
    const hasComma = s.includes(",");
    // caso típico ES: 37.322,07
    if(hasDot && hasComma){
      s = s.replace(/\./g,"").replace(",",".");
      const v = Number(s);
      return Number.isFinite(v) ? v : null;
    }
    // solo coma -> decimal
    if(hasComma && !hasDot){
      // si hay más de una coma, probablemente miles: 37,322,07 -> raro
      const parts = s.split(",");
      if(parts.length===2){
        s = parts[0].replace(/\./g,"") + "." + parts[1];
      }else{
        s = s.replace(/,/g,"");
      }
      const v = Number(s);
      return Number.isFinite(v) ? v : null;
    }
    // solo punto
    if(hasDot && !hasComma){
      // si termina en .dd -> decimal; si no, miles
      if(/\.\d{1,2}$/.test(s)){
        const v = Number(s);
        return Number.isFinite(v) ? v : null;
      }
      s = s.replace(/\./g,"");
      const v = Number(s);
      return Number.isFinite(v) ? v : null;
    }
    const v = Number(s);
    return Number.isFinite(v) ? v : null;
  }

  function _money(m){
    const v = _parseEsNumber(m);
    return (v===null) ? null : Math.max(0, v);
  }

  function _pct(m){
    const v = _parseEsNumber(m);
    return (v===null) ? null : v;
  }

  function detectBudgetTemplate(textUpper){
    const t = textUpper || "";
    if(t.includes("INFORMACIÓN DE VEHÍCULO NUEVO") && t.includes("TOTAL A PAGAR")) return "renault_cash";
    if(t.includes("TOYOTA FINANCIAL SERVICES") || t.includes("BONIFICACIÓN TFS") || t.includes("TOYOTA EASY")) return "toyota_tfs";
    if(t.includes("VWFS") || t.includes("VOLKSWAGEN BANK") || t.includes("AUTOCREDIT")) return "vwfs";
    if(t.includes("MULTIOPCIÓN") || t.includes("ULTIMA CUOTA") || t.includes("ÚLTIMA CUOTA")) return "web_pcp";
    return "generic";
  }

  function parseBudgetText(rawText){
    const raw = String(rawText||"");
    const T = _toUpper(raw);
    const template = detectBudgetTemplate(T);

    const out = {
      template,
      vehicle: {},
      deal: { deal_type: "loan", pvp_cash: null, price_if_finance: null, finance_discount: null },
      finance: { term_months_total: null, installments: null, monthly_payment: null, down_payment_cash: null, balloon: null, principal: null, open_fee_pct: null, open_fee_amount: null, tin: null, tae: null, total_due: null, total_payable: null, price_to_finance: null },
      usage_constraints: { km_per_year: null, km_total: null },
      bundles: [],
      validations: { checks: [] },
      textPreview: _normBudgetText(raw).slice(0, 1400)
    };

    function m1(re){
      const m = T.match(re);
      return m ? (m[1]||"").trim() : null;
    }
    function grabMoney(re, path, conf=0.9){
      const v = _money(m1(re));
      if(v===null) return;
      // set path
      const keys = path.split(".");
      let obj = out;
      for(let i=0;i<keys.length-1;i++) obj = obj[keys[i]];
      obj[keys[keys.length-1]] = { value: v, confidence: conf };
    }
    function grabInt(re, path, conf=0.9){
      const s = m1(re);
      if(!s) return;
      const v = Math.round(Number(String(s).replace(/[^\d-]/g,"")));
      if(!Number.isFinite(v)) return;
      const keys = path.split(".");
      let obj = out;
      for(let i=0;i<keys.length-1;i++) obj = obj[keys[i]];
      obj[keys[keys.length-1]] = { value: v, confidence: conf };
    }
    function grabPct(re, path, conf=0.9){
      const v = _pct(m1(re));
      if(v===null) return;
      const keys = path.split(".");
      let obj = out;
      for(let i=0;i<keys.length-1;i++) obj = obj[keys[i]];
      obj[keys[keys.length-1]] = { value: v, confidence: conf };
    }

    // Comunes (financiación)
    grabPct(/(?:TIN|T\.I\.N\.)[:\s]*([0-9.,]+)\s*%/, "finance.tin");
    grabPct(/TIPO\s*DE\s*INTER[ÉE]S\s*NOMINAL[:\s]*([0-9.,]+)\s*%/, "finance.tin", 0.85);
    grabPct(/TAE[:\s]*([0-9.,]+)\s*%/, "finance.tae");
    grabMoney(/IMPORTE TOTAL DEL CR[ÉE]DITO[:\s]*([0-9.,]+)\s*EUR/, "finance.principal");
    grabMoney(/IMPORTE TOTAL ADEUDADO[:\s]*([0-9.,]+)\s*EUR/, "finance.total_due");
    grabMoney(/TOTAL ADEUDADO[:\s]*([0-9.,]+)\s*EUR/, "finance.total_due", 0.85);
    grabMoney(/PRECIO TOTAL A PLAZOS[:\s]*([0-9.,]+)\s*EUR/, "finance.total_payable");
    grabMoney(/IMPORTE TOTAL DESPU[ÉE]S DE LA BONIFICACI[ÓO]N[:\s]*([0-9.,]+)\s*EUR/, "deal.price_if_finance");
    grabMoney(/PVP RECOMENDADO[^0-9]*([0-9.,]+)\s*EUR/, "deal.pvp_cash");
    grabMoney(/IMPORTE COMPRA[:\s]*([0-9.,]+)\s*EUR/, "deal.pvp_cash", 0.85);
    grabMoney(/IMPORTE BONIFICACI[ÓO]N[^0-9]*([0-9.,]+)\s*EUR/, "deal.finance_discount", 0.85);

    // VWFS / Skoda (PCP)
    if(template==="vwfs"){
      out.deal.deal_type = "pcp";
      grabInt(/(\d+)\s*CUOTAS\s*MENSUALES/, "finance.installments");
      grabMoney(/CUOTAS\s*MENSUALES\s*DE\s*([0-9.,]+)\s*EUR/, "finance.monthly_payment");
      grabMoney(/ENTRADA[:\s]*([0-9.,]+)\s*EUR/, "finance.down_payment_cash");
      grabMoney(/VALOR M[ÍI]NIMO GARANTIZADO[:\s]*([0-9.,]+)\s*EUR/, "finance.balloon");
      grabInt(/\((\d+)\s*MESES/, "finance.term_months_total", 0.85);
      grabPct(/COMISI[ÓO]N DE APERTURA[^()]*\(\s*([0-9.,]+)\s*%\s*\)/, "finance.open_fee_pct");
      grabMoney(/COMISI[ÓO]N DE APERTURA[^:]*:\s*([0-9.,]+)\s*EUR/, "finance.open_fee_amount");
      grabMoney(/COMISI[ÓO]N\s*DE\s*APERTURA\s*FINANCIADA[^)]*\)\s*:\s*([0-9.,]+)\s*EUR/, "finance.open_fee_amount", 0.95);
    grabMoney(/GASTOS\s*DE\s*FORMALIZACI[ÓO]N[^0-9]*([0-9.,]+)\s*EUR/, "finance.open_fee_amount", 0.85);
    grabMoney(/TOTAL\s*COMISI[ÓO]N\s*([0-9.,]+)\s*EUR/, "finance.open_fee_amount", 0.8);
      grabInt(/([0-9][0-9.]*[0-9])\s*KIL[ÓO]METROS\s*TOTALES/, "usage_constraints.km_total", 0.9);
    }

    // Toyota TFS
    if(template==="toyota_tfs"){
      out.deal.deal_type = "pcp";
      // Cuota y entrada básica
      grabMoney(/ENTRADA INICIAL[:\s]*([0-9.,]+)\s*EUR/, "finance.down_payment_cash");
      grabMoney(/CUOTA[:\s]*([0-9.,]+)\s*EUR/, "finance.monthly_payment");
      // VFG / última cuota
      grabMoney(/VFG\s*O\s*[ÚU]LTIMA\s*CUOTA\s*([0-9.,]+)\s*EUR/, "finance.balloon", 0.95);
      grabMoney(/VFG[^0-9]{0,10}([0-9.,]+)\s*EUR/, "finance.balloon", 0.85);
      grabMoney(/VALOR\s*FUTURO\s*GARANTIZADO[^0-9]{0,20}([0-9.,]+)\s*EUR/, "finance.balloon", 0.9);
      // Plazo y km
      grabInt(/PLAZO[:\s]*([0-9]{2,3})\s*MESES/, "finance.term_months_total");
      grabInt(/KILOMETRAJE\s*\(?A[ÑN]O\)?[:\s]*([0-9][0-9.]*[0-9])\s*KM/, "usage_constraints.km_per_year", 0.9);
      grabInt(/([0-9][0-9.]*[0-9])\s*KM\b/, "usage_constraints.km_per_year", 0.7);
      // PVP real: "Precio por financiar" es el más fiable en TFS
      grabMoney(/PRECIO\s*POR\s*FINANCIAR[:\s]*([0-9.,]+)\s*EUR/, "deal.pvp_cash", 0.95);
      // Bonificación TFS = precio oferta con descuento ya aplicado (NO es el PVP ni el descuento)
      // Solo usarla como pvp_cash si no encontramos precio por financiar
      if(!out.deal.pvp_cash){
        grabMoney(/BONIFICACI[ÓO]N\s*TFS\s*([0-9][0-9.,]+)\s*EUR/, "deal.pvp_cash", 0.75);
      }
      // Servicios/extras que suman o restan — NO mapear como descuento por financiar
      // El descuento real viene de la diferencia PVP - precio oferta, no de la bonificación TFS
      grabMoney(/PRECIO\s*TOTAL\s*A\s*PLAZOS[:\s]*([0-9.,]+)\s*EUR/, "finance.total_payable", 0.95);
      grabMoney(/IMPORTE\s*A\s*FINANCIAR[:\s]*([0-9.,]+)\s*EUR/, "finance.price_to_finance", 0.95);
      grabMoney(/IMPORTE TOTAL DEL CR[ÉE]DITO[:\s]*([0-9.,]+)\s*EUR/, "finance.principal", 0.95);
      // Entrada real (puede diferir de entrada inicial — usar la de letra pequeña si existe)
      grabMoney(/ENTRADA[:\s]*([0-9.,]+)\s*EUR/, "finance.down_payment_cash", 0.7);
      // Comisión apertura: "Gastos de formalización" en Toyota = comisión apertura
      grabMoney(/GASTOS\s*DE\s*FORMALIZACI[ÓO]N[^0-9]*([0-9.,]+)\s*EUR/, "finance.open_fee_amount", 0.9);
      grabMoney(/COMISI[ÓO]N\s*DE\s*APERTURA\s*FINANCIADA[:\s]*([0-9.,]+)\s*EUR/, "finance.open_fee_amount", 0.95);
      // TAE y TIN explícitos en letra pequeña
      grabPct(/TIN[:\s]*([0-9.,]+)\s*%/, "finance.tin", 0.95);
      grabPct(/TAE[:\s]*([0-9.,]+)\s*%/, "finance.tae", 0.95);
      // Cuotas: 49 meses = 48 cuotas + última cuota
      if(!out.finance.installments && out.finance.term_months_total && out.finance.balloon){
        const tm = out.finance.term_months_total.value;
        out.finance.installments = { value: Math.max(1, tm-1), confidence: 0.70 };
      }
    }

    // Renault (contado)
    if(template==="renault_cash"){
      out.deal.deal_type = "cash";
      grabMoney(/TOTAL\s*A\s*PAGAR\s*([0-9.,]+)\s*EUR/, "deal.pvp_cash", 0.95);
      grabMoney(/TOTAL\s*VEH[IÍ]CULO[^0-9]*([0-9.,]+)\s*EUR/, "deal.pvp_cash", 0.85);
      grabMoney(/BASE\s*IMPONIBLE[^0-9]*([0-9.,]+)\s*EUR/, "finance.principal", 0.8);
      grabMoney(/TOTAL\s*IMPUESTOS\s*INCLUIDOS[^0-9]*([0-9.,]+)\s*EUR/, "finance.total_due", 0.85);
      grabMoney(/GASTOS[^0-9]*MATRICULACI[ÓO]N[^0-9]*([0-9.,]+)\s*EUR/, "finance.open_fee_amount", 0.8);
    }

    // Web PCP / Multiopción
    if(template==="web_pcp"){
      out.deal.deal_type = "pcp";
      grabInt(/DURACI[ÓO]N\s*([0-9]{2,3})/, "finance.term_months_total", 0.9);
      grabInt(/([0-9]{1,3})\s*CUOTAS\s*DE/, "finance.installments", 0.9);
      grabMoney(/CUOTAS\s*DE[:\s]*([0-9.,]+)\s*EUR/, "finance.monthly_payment", 0.9);
      grabMoney(/ULTIMA CUOTA[:\s]*([0-9.,]+)\s*EUR/, "finance.balloon", 0.9);
      grabMoney(/IMPORTE COMPRA[:\s]*([0-9.,]+)\s*EUR/, "finance.price_to_finance", 0.85);
      grabMoney(/ENTRADA[:\s]*([0-9.,]+)\s*EUR/, "finance.down_payment_cash", 0.85);
    }

    // Fallback genérico para plazos/cuotas si no se detectó
    if(!out.finance.term_months_total){
      grabInt(/PLAZO[:\s]*([0-9]{2,3})\s*MESES/, "finance.term_months_total", 0.7);
    }
    if(!out.finance.monthly_payment){
      grabMoney(/CUOTA(?:S)?[^0-9]{0,10}([0-9.,]+)\s*EUR/, "finance.monthly_payment", 0.7);
    }
    if(!out.finance.down_payment_cash){
      grabMoney(/ENTRADA[^0-9]{0,10}([0-9.,]+)\s*EUR/, "finance.down_payment_cash", 0.7);
    }
    if(!out.finance.balloon){
      grabMoney(/(?:VALOR FINAL|CUOTA FINAL|VFG|GMV|VALOR M[ÍI]NIMO GARANTIZADO)[^0-9]{0,15}([0-9.,]+)\s*EUR/, "finance.balloon", 0.7);
    }

    // Inferir nº cuotas si hay plazo y última cuota y no viene explícito
    if(out.deal.deal_type==="pcp" && !out.finance.installments && out.finance.term_months_total && out.finance.balloon){
      const tm = out.finance.term_months_total.value;
      out.finance.installments = { value: Math.max(1, tm-1), confidence: 0.55 };
    }

    // Validaciones rápidas (solo para avisar)
    try{
      const inst = out.finance.installments?.value || null;
      const cuota = out.finance.monthly_payment?.value || null;
      const down = out.finance.down_payment_cash?.value || 0;
      const disc = out.deal.finance_discount?.value || 0;
      const balloon = out.finance.balloon?.value || 0;
      const total = out.finance.total_payable?.value || null;
      if(inst && cuota && total){
        // Algunas plantillas suman el descuento en el lado "entrada" (Toyota). Probamos ambas.
        const v1 = inst*cuota + down + balloon;
        const v2 = inst*cuota + down + disc + balloon;
        const diff1 = Math.abs(v1-total);
        const diff2 = Math.abs(v2-total);
        out.validations.checks.push({ name:"pcp_total_payable_matches", passed: (Math.min(diff1,diff2) < 3), details:{diff1, diff2} });
      }
    }catch(e){}

    // --- Extraer marca/modelo/versión ---
    try{
      // Primero usar lo que detectó Claude Vision directamente (más fiable)
      if(typeof _lastVisionVehicle !== "undefined" && _lastVisionVehicle){
        if(_lastVisionVehicle.brand) out.vehicle.brand = _lastVisionVehicle.brand;
        if(_lastVisionVehicle.model) out.vehicle.model = _lastVisionVehicle.model;
        if(_lastVisionVehicle.version) out.vehicle.version_text = _lastVisionVehicle.version;
      }

      // Fallback: regex si Claude no devolvió vehículo
      if(!out.vehicle.brand){
        const toyotaM = T.match(/TOYOTA\s+(C-HR\+?|YARIS(?:\s+CROSS)?|RAV4|COROLLA(?:\s+CROSS)?|AYGO\s*X|BZ4X)/);
        if(toyotaM){ out.vehicle.brand = "Toyota"; out.vehicle.model = toyotaM[1].trim().replace(/\s+/g," "); }

        const skodaM = T.match(/(?:SKODA|ŠKODA)\s+(ELROQ|ENYAQ|FABIA|OCTAVIA|KODIAQ|KAROQ|KAMIQ|SCALA|SUPERB|EPIQ)/);
        if(skodaM){ out.vehicle.brand = "Škoda"; out.vehicle.model = skodaM[1].trim(); }

        const lynkBrand = T.match(/LYNK\s*[&Y]?\s*CO/);
        const lynkMod = lynkBrand ? T.match(/(?:MODELO|MODEL)[:\s]*(0[0-9])/) : null;
        if(lynkBrand){ out.vehicle.brand = "Lynk & Co"; out.vehicle.model = lynkMod ? lynkMod[1].trim() : "01"; }

        const renaultM = T.match(/RENAULT\s+(RAFALE|ARKANA|AUSTRAL|CAPTUR|CLIO|MEGANE|ESPACE|SCENIC|SYMBIOZ|ZOE|5\s*E-TECH)/);
        if(renaultM){ out.vehicle.brand = "Renault"; out.vehicle.model = renaultM[1].trim().replace(/\s+/g," "); }
      }

      // Versión: buscar después del modelo si existe (texto entre modelo y siguiente campo)
      // Versión: buscar después del modelo si existe
      if(out.vehicle.brand && !out.vehicle.version_text){
        const verM = T.match(/(?:VERSI[O\u00d3]N|MODELO)[:\s]+([A-Z0-9][\s\S]{5,60}?)(?:\r?\n|COMBUSTIBLE|COLOR|ENTRADA|CUOTA)/);
        if(verM) out.vehicle.version_text = verM[1].trim().slice(0,80);
      }
    }catch(e){}
    // --- Fin extracción vehículo ---

    return out;
  }

  async function extractBudgetTextFromFile(file, onProgress){
    const name = (file && file.name) ? file.name.toLowerCase() : "";
    const isPdf = name.endsWith(".pdf") || (file && file.type === "application/pdf");
    if(isPdf) await ensureBudgetLibs();
    const report = (p, msg)=>{ try{ onProgress && onProgress(p, msg); }catch(e){} };

    if(isPdf && window.pdfjsLib){
      report(0.05, "Leyendo PDF…");
      const buf = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      const maxPages = Math.min(2, pdf.numPages || 1);
      let textParts = [];
      for(let i=1;i<=maxPages;i++){
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        const items = (tc && tc.items) ? tc.items : [];
        const pageText = items.map(it=>it && it.str ? it.str : "").join(" ");
        if(pageText && pageText.trim().length>60) textParts.push(pageText);
        report(0.10 + (i/maxPages)*0.20, `Extrayendo texto (pág. ${i}/${maxPages})…`);
      }
      const direct = _normBudgetText(textParts.join("\n"));
      if(direct.length>120) return direct;

      // PDF escaneado: renderizar página y enviar a Claude Vision
      report(0.35, "PDF escaneado: procesando con IA…");
      const page1 = await pdf.getPage(1);
      const viewport = page1.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page1.render({ canvasContext: ctx, viewport }).promise;
      const b64 = canvas.toDataURL("image/png").split(",")[1];
      return _normBudgetText(await _extractTextWithClaudeVision(b64, "image/png", report));
    }

    // Imagen o foto -> Claude Vision directamente
    report(0.10, "Analizando imagen con IA…");
    const base64 = await new Promise((resolve, reject)=>{
      const r = new FileReader();
      r.onload = ()=> resolve(r.result.split(",")[1]);
      r.onerror = ()=> reject(new Error("No se pudo leer el archivo"));
      r.readAsDataURL(file);
    });
    const mediaType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
    return _normBudgetText(await _extractTextWithClaudeVision(base64, mediaType, report));
  }

  function openBudgetModal({ title, contentEl, onClose }){
    const overlay = document.createElement("div");
    overlay.className = "fc-modal-overlay";
    overlay.innerHTML = `
      <div class="fc-modal-card" role="dialog" aria-modal="true">
        <div class="fc-modal-head">
          <div class="fc-modal-title"></div>
          <button class="btn ghost fc-modal-close" type="button" aria-label="Cerrar">Cerrar</button>
        </div>
        <div class="fc-modal-body"></div>
      </div>
    `;
    overlay.querySelector(".fc-modal-title").textContent = title || "Importar presupuesto";
    overlay.querySelector(".fc-modal-body").appendChild(contentEl);
    const close = ()=>{
      overlay.remove();
      onClose && onClose();
    };
    overlay.querySelector(".fc-modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (e)=>{ if(e.target===overlay) close(); });
    document.body.appendChild(overlay);
    return { overlay, close };
  }

  async function budgetImportFlow({ file, car, letter, onProgress }){
    const box = document.createElement("div");
    box.innerHTML = `
      <div class="smallmuted">Subiendo/leyendo: <b>${String(file?.name||"archivo")}</b></div>
      <div class="fc-progress" style="margin-top:10px"><div class="fc-progress-bar" style="width:0%"></div></div>
      <div class="small" id="impMsg" style="margin-top:8px">Preparando…</div>
    `;
    const bar = box.querySelector(".fc-progress-bar");
    const msg = box.querySelector("#impMsg");
    const modal = openBudgetModal({ title:"Importar presupuesto", contentEl: box });

    const setProg = (p, m)=>{
      const pct = Math.max(0, Math.min(100, Math.round((p||0)*100)));
      bar.style.width = pct+"%";
      if(m) msg.textContent = m;
      if(m && onProgress) onProgress(m);
    };

    try{
      setProg(0.02, "Preparando librerías…");
      const txt = await extractBudgetTextFromFile(file, setProg);
      setProg(0.96, "Interpretando datos…");
      const parsed = parseBudgetText(txt);

      // Si tenemos JSON estructurado de Vision, aplicar directamente sin pantalla de revisión
      if(_lastVisionParsed){
        const visionData = _lastVisionParsed;
        _lastVisionParsed = null;
        _applyVisionJSON(visionData, car, letter);
        modal.close();
        render();
        return;
      }

      // Construir pantalla de revisión (fallback si no hay JSON)
      const review = document.createElement("div");
      review.innerHTML = `
        <div class="hint" style="border-left:3px solid #f59e0b;padding:10px 12px;border-radius:4px;margin-bottom:8px">⚠️ <strong>Revisa todos los datos antes de confirmar</strong> — especialmente TIN, TAE y cantidades. Las fotos pueden tener errores de lectura. Corrige cualquier valor incorrecto antes de aplicar.</div>
        <div class="fc-review-grid"></div>
        ${(new URLSearchParams(location.search).get("debug")==="1") ? `
        <details class="details" style="margin-top:10px">
          <summary>Texto detectado (debug)</summary>
          <div class="small" style="margin-top:8px;white-space:pre-wrap;word-break:break-word">${_escHtml(parsed.textPreview||"")}</div>
        </details>` : ""}
        <div class="fc-modal-actions" style="margin-top:14px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
          <button class="btn ghost" type="button" id="btnImpCancel">Cancelar</button>
          <button class="btn primary" type="button" id="btnImpApply">Aplicar a coche ${letter}</button>
        </div>
      `;
      const grid = review.querySelector(".fc-review-grid");

      function addField(label, val){
        const wrap = document.createElement("div");
        wrap.className = "field";
        const lab = document.createElement("div");
        lab.className = "label";
        lab.textContent = label;
        const inp = document.createElement("input");
        inp.className = "input";
        inp.type = "text";
        inp.value = (val!==null && val!==undefined) ? String(val) : "";
        wrap.appendChild(lab);
        wrap.appendChild(inp);
        grid.appendChild(wrap);
        return inp;
      }

      // Campos de vehículo detectados
      const veh = parsed.vehicle || {};
      if(veh.brand || veh.model || veh.version_text){
        const vehDiv = document.createElement("div");
        vehDiv.style.cssText = "background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:10px 12px;margin-bottom:10px";
        vehDiv.innerHTML = `<div class="label" style="font-weight:600;margin-bottom:4px">🚗 Vehículo detectado</div>
          <div class="small">${[veh.brand, veh.model, veh.version_text].filter(Boolean).map(s=>_escHtml(s)).join(" · ")}</div>`;
        grid.parentNode.insertBefore(vehDiv, grid);
      }

      const dealType = parsed.deal?.deal_type || "loan";
      const getV = (obj)=> (obj && typeof obj==="object" && obj.value!==undefined) ? obj.value : "";

      const inpType = addField("Tipo (cash / loan / pcp)", dealType);
      const inpPvp  = addField("PVP al contado (€)", getV(parsed.deal?.pvp_cash));
      const inpPf   = addField("Precio si financias (€)", getV(parsed.deal?.price_if_finance));
      const inpDisc = addField("Descuento/bonificación por financiar (€)", getV(parsed.deal?.finance_discount));

      const inpTerm = addField("Plazo total (meses)", getV(parsed.finance?.term_months_total));
      const inpInst = addField("Nº cuotas mensuales", getV(parsed.finance?.installments));
      const inpCuot = addField("Cuota mensual (€)", getV(parsed.finance?.monthly_payment));
      const inpDown = addField("Entrada (cash) (€)", getV(parsed.finance?.down_payment_cash));
      const inpBal  = addField("Última cuota / VFG / GMV (€)", getV(parsed.finance?.balloon));

      const inpTin  = addField("TIN (%)", getV(parsed.finance?.tin));
      const inpTae  = addField("TAE (%)", getV(parsed.finance?.tae));
      const inpOpenPct = addField("Apertura (%)", getV(parsed.finance?.open_fee_pct));
      const inpOpenAmt = addField("Apertura (€)", getV(parsed.finance?.open_fee_amount));
      const inpPrin = addField("Importe total del crédito / principal (€)", getV(parsed.finance?.principal));
      const inpTotPlazos = addField("Precio total a plazos (€)", getV(parsed.finance?.total_payable));

      const inpKmY = addField("Km/año (si aparece)", getV(parsed.usage_constraints?.km_per_year));
      const inpKmT = addField("Km totales (si aparece)", getV(parsed.usage_constraints?.km_total));

      // Aplicar (convertir)
      review.querySelector("#btnImpCancel").addEventListener("click", ()=> modal.close());

      review.querySelector("#btnImpApply").addEventListener("click", ()=>{
        const asNum = (s)=>{ const v=_parseEsNumber(s); return (v===null)?0:v; };
        const asInt = (s)=>{ const v=Math.round(Number(String(s).replace(/[^\d-]/g,""))); return Number.isFinite(v)?v:0; };

        // Si tenemos JSON estructurado de Vision, usarlo directamente
        if(_lastVisionParsed){
          _applyVisionJSON(_lastVisionParsed, car, letter);
          _lastVisionParsed = null;
          modal.close();
          render();
          return;
        }

        // Fallback: aplicar desde los campos del formulario de revisión
        const vehData = parsed.vehicle || {};
        if(vehData.brand && car){
          _loadVersionFromBudget(car, { brand: vehData.brand, model: vehData.model, version: vehData.version_text });
        }

        const dtype = String(inpType.value||"").trim().toLowerCase();
        const pvp  = asNum(inpPvp.value);
        const pf   = asNum(inpPf.value);
        const disc = asNum(inpDisc.value);
        const term = asInt(inpTerm.value);
        const inst = asInt(inpInst.value);
        const cuota = asNum(inpCuot.value);
        const down  = asNum(inpDown.value);
        const bal   = asNum(inpBal.value);
        const tin   = asNum(inpTin.value);
        const tae   = asNum(inpTae.value);
        const openPct = asNum(inpOpenPct.value);
        const openAmt = asNum(inpOpenAmt.value);

        if(dtype==="cash"){
          car.financeEnabled = "no";
          car.pvpCash = pvp || car.pvpCash;
          car.pvpCashManual = car.pvpCash;
          car.pvpKnown = "yes";
        } else {
          car.financeEnabled = "yes";
          if(bal>0){ car.financeMode="flex"; car.flexGmv=bal; car.installments=inst>0?inst:0; }
          else { car.financeMode="linear"; car.flexGmv=0; car.installments=0; }
          if(cuota>0) car.monthlyPayment = cuota;
          car.downPayment = down;
          car.financeDiscount = disc;
          if(pvp>0){ car.pvpCash=pvp; car.pvpCashManual=pvp; car.pvpKnown="yes"; }
          if(pf>0) car.priceFinanced = pf;
          if(tin>0) car.tin = tin;
          if(openPct>0){ car.hasOpenFee="yes"; car.openFeePct=openPct; }
          else if(openAmt>0){
            const base = Math.max(1,(pf>0?pf:(pvp>0?pvp:0))-down);
            car.hasOpenFee="yes"; car.openFeePct=Math.round((openAmt/base)*10000)/100;
          }
          if(letter==="A" && term>0) state.termMonths=normalizeTermMonths(term);
        }
        const kmY = asInt(inpKmY.value);
        if(letter==="A" && kmY>0) state.kmYear = kmY;
        car._importedBudget = { template: parsed.template, totalPayable: asNum(inpTotPlazos.value), principal: asNum(inpPrin.value), tae: tae, notes: parsed.validations?.checks||[] };

        modal.close();
        render();
      });

      modal.overlay.querySelector(".fc-modal-body").innerHTML = "";
      modal.overlay.querySelector(".fc-modal-body").appendChild(review);
      setProg(1.0, "Listo");
    }catch(e){
      console.error(e);
      msg.textContent = "No se pudo importar. Prueba con una foto más nítida o un PDF.";
      const err = document.createElement("div");
      err.className = "hint";
      err.style.marginTop = "10px";
      err.textContent = String(e && e.message ? e.message : e);
      box.appendChild(err);
    }
  }


  const state = {
    kmYear: 10000,
    cityPct: 50,
    chargeMode: "home",
    priceGas: defaults.prices.gasoline,
    priceDiesel: defaults.prices.diesel,
    priceKwhHome: defaults.prices.kwh_home,
    priceKwhStreet: defaults.prices.kwh_street,
    energyPricesOpen: false,
    city: "",
    climate: { icon:"🌤️", label:"Templado", factor: 1.00 },
    ivtmMunicipalityName: "",
    ageGroup: "26+",
    licenseYears: 10,
    postalCode: "",
    novice: "no", // deprecated: se calcula desde licenseYears si procede
    garage: "yes",
    insuranceCover: "full_excess",
    includeTires: "yes",
    includeResidual: "no",
    resaleChannel: "tradein",
    termMonths: 60,
    annualIncome: 0,
    irpfPct: 0.15,
    compareEnabled: false,
    // Tras ver el resultado del coche A, el usuario decide cómo cargar el coche B.
    compareChoice: null, // null | "saved" | "new"
    // Si el usuario arranca desde "coches guardados" sin pasar por el cuestionario.
    skipProfileQuestionnaire: false,

    // Perfil de decisión (cómo desempata FairCar cuando el coste es parecido)
    decisionProfile: "normal", // normal | conservative | budget | traveler
    
    profileInitialized: false,
    disableAutoProfile: false,
    profileWasAutoApplied: false,

    profileChoice: null,
    // Flujo "coche guardado" (solo aparece si existen coches guardados)
    savedCarChoice: null, // null | "yes" | "no"
    carAFromSaved: false,
    carBFromSaved: false,
    compareFairResidual: true,
    carA: makeEmptyCar("A"),
    carB: makeEmptyCar("B"),
  };

  // Si el usuario guardó un IRPF previamente, lo usamos como valor por defecto.
  // (No mostramos nada en UI; solo afecta al cálculo y al control de IRPF.)
  try{
    const savedIrpf = getSavedIrpfPct();
    if(savedIrpf!==null && typeof savedIrpf==="number" && isFinite(savedIrpf)){
      state.irpfPct = clamp(savedIrpf, 0, 0.50);
    }
  }catch(e){}

  function makeEmptyCar(letter){
    return {
      letter,
      brand: "",
      model: "",
      versionKey: "",
      versionMeta: null,
      manualVersion: false,
      fuel: "gasoline",
      segment: "utilitario",
      engine: "1.0",
      batteryKwh: 50,
      powerKw: 100,
      // IVTM (opcionales): si el usuario conoce estos datos de la ficha técnica,
      // el cálculo del impuesto de circulación será mucho más preciso.
      dgtLabel: "",   // etiqueta DGT: "cero","eco","c","b","sin" (autorrelleno)
      dgtLabelManual: false,
      cylinders: 0,   // nº cilindros (solo ICE; opcional)
      peKw: 0,        // potencia efectiva / nominal continua (kW) (EV; opcional)
      isNew: "new",
      year: new Date().getFullYear(),
      kmNow: 0,

      financeEnabled: "yes",

      pvpCash: 0,
      // PVP (para ofertas donde solo te dan la cuota)
      pvpKnown: null,         // "yes" | "no" (se decide en el paso de oferta)
      pvpCashManual: 0,       // último PVP introducido por el usuario (si lo conoce)
      pvpCashOrient: 0,       // PVP orientativo (según versión) usado cuando pvpKnown="no"
      priceFinanced: 0,
      financeDiscount: 0,
      downPayment: 0,
      tin: 0,
      monthlyPayment: 0,
      installments: 0,
      openFeePct: 0,
      lifeInsMonthly: 0,
      insInPayment: "no",

      

      // Auto+ (financiación): aplicar ayuda pública a la financiación (escenario)
      autoPlusApplyGovToFinance: "no",
      // Auto+ (financiación): el descuento de 1.000€ ya venía aplicado en el presupuesto
      autoPlusDealerAlreadyIncluded: "no",
financeMode: "linear",
      flexEnd: "return",
      flexGmv: 0,
      maintIncludedInQuota: "no",
      maintPlanEurMonth: 0,

      // Servicio (futuro) — seguros vinculado
      lifeService: {
        wanted: "no",        // yes|no
        wantCheaper: "no",   // yes|no
        caseId: "",
        nameDni: "",
        policyNo: "",
        insurer: "",
        deliveryDate: "",   // YYYY-MM-DD (si se conoce)
        email: "",
        whatsapp: "",
        notes: ""
      },

      auto: {
        enabled: false,
        // Nuevo flujo Auto+ (automatizado)
        mode: "auto",          // auto | manual
        manualHelp: 0,          // si mode==='manual', ayuda pública introducida por el usuario (sin descuento concesionario)
        entered: false,         // el usuario ha abierto Auto+ y ajustes avanzados (para no saltárselo)
        eligible: true,         // elegible por precio sin IVA
        pvpVat: 0,              // PVP con IVA usado para el cálculo
        baseImponible: 0,       // PVP sin IVA (PVP/1.21)
        band: "",              // A | B | over45 | needPrice
        pricePct: 0,            // 0.25 (Tramo A) | 0.15 (Tramo B)
        priceBonus: 0,          // € extra por tramo (A/B)

        // Ajustes avanzados opcionales (si el usuario los conoce)
        madeEU: "no",
        batteryEU: "no",
        dealerBonus: "yes",     // descuento concesionario (normalmente obligatorio en ayudas)
        irpfPct: 0.15,

        _dealerDefaulted: false,

        helpTotal: 0,
        irpfImpact: 0
      },

      residualEstimate: 0,
      residualUser: 0,
      residualUseUser: "no"
    };
  }

  const brandModels = (typeof window!=="undefined" && window.BRAND_MODELS_ES) ? window.BRAND_MODELS_ES : {
    "Tesla": ["Model 3","Model Y","Model S","Model X"],
    "Volkswagen": ["Golf","Polo","T-Roc","Tiguan","ID.3","ID.4"],
    "SEAT": ["Ibiza","León","Arona","Ateca"],
    "Škoda": ["Scala","Fabia","Octavia","Kamiq","Karoq","Enyaq","Elroq","Enroq"],
    "Toyota": ["Yaris","Corolla","C-HR","RAV4","Aygo X"],
    "Renault": ["Clio","Captur","Mégane","Austral"],
    "Peugeot": ["208","2008","308"],
    "Hyundai": ["i20","i30","Kona","Tucson","IONIQ 5"],
    "Kia": ["Picanto","Ceed","Niro","Sportage","EV6"],
    "BMW": ["Serie 1","Serie 3","X1","i4","iX1"],
    "Mercedes-Benz": ["Clase A","Clase C","GLA","GLC","EQA"],
    "Audi": ["A1","A3","Q2","Q3","Q4 e-tron"],
    "Dacia": ["Sandero","Duster","Jogger"],
    "Ford": ["Fiesta","Focus","Puma","Kuga","Mustang Mach-E"],
    "Citroën": ["C3","C3 Aircross","C4","ë-C3"],
    "Nissan": ["Juke","Qashqai","Leaf","Ariya"]
  };
  const CAR_DB = (typeof window !== "undefined" && window.CAR_DB) ? window.CAR_DB : null;
const HAS_V3 = (typeof window !== "undefined" && typeof window.getAllBrands==="function" && typeof window.getModelsForBrand==="function" && typeof window.buildVersionSelect==="function" && typeof window.getVersionByKey==="function");

  // Plazos: el usuario puede teclear cualquier valor (ej. 49). Las flechas cambian 12 en 12.
  function normalizeTermMonths(v){
    let m = Number(v);
    if (!isFinite(m) || m <= 0) m = 60;
    m = Math.round(m);
    m = Math.max(12, Math.min(180, m));
    return m;
  }

// Marcas/modelos: combinar BD v3 + fallback (para maximizar cobertura)
function uniqSorted(arr){
  const set = new Set();
  (arr||[]).forEach(x=>{ if(x) set.add(String(x)); });
  return Array.from(set).sort((a,b)=>a.localeCompare(b,"es",{sensitivity:"base"}));
}
function getAllBrandsMerged(){
  const fromV3 = (HAS_V3 && typeof window.getAllBrands==="function") ? window.getAllBrands()
              : (CAR_DB ? Object.keys(CAR_DB) : []);
  const fromFallback = Object.keys(brandModels||{});
  return uniqSorted([].concat(fromV3||[], fromFallback||[]));
}
const allBrands = getAllBrandsMerged();

function getModelsForBrand(brand){
  const b = String(brand||"").trim();
  const fromV3 = (HAS_V3 && typeof window.getModelsForBrand==="function") ? window.getModelsForBrand(b)
              : ((CAR_DB && CAR_DB[b] && CAR_DB[b].models) ? Object.keys(CAR_DB[b].models) : []);
  const fromFallback = (brandModels && brandModels[b]) ? brandModels[b] : [];
  return uniqSorted([].concat(fromV3||[], fromFallback||[]));
}
function getModelData(brand, model){
  if(CAR_DB && CAR_DB[brand] && CAR_DB[brand].models && CAR_DB[brand].models[model]){
    return CAR_DB[brand].models[model];
  }
  return null;
}
// Carga silenciosa de versión desde presupuesto importado
// Si existe en la DB: la carga. Si no: crea versión de usuario en localStorage sin avisar.
function _loadVersionFromBudget(car, vehData){
  if(!vehData || !vehData.brand) return;
  try{
    const brand = resolveFromList(vehData.brand, Object.keys(brandModels||{})) || vehData.brand;
    const models = getModelsForBrand(brand);
    const model  = resolveFromList(vehData.model||"", models) || vehData.model || "";

    // Aplicar marca y modelo al coche
    if(brand) car.brand = brand;
    if(model) car.model = model;

    // Combustible
    if(vehData.combustible){
      const fuelMap = { gasolina:"gasoline", diesel:"diesel", hibrido:"hev", phev:"phev", electrico:"ev", eléctrico:"ev", electric:"ev", hybrid:"hev" };
      const fuel = fuelMap[String(vehData.combustible).toLowerCase()] || null;
      if(fuel) car.fuel = fuel;
    }

    // KM/año del presupuesto → actualizar perfil silenciosamente
    if(vehData.km_anio && Number(vehData.km_anio) > 0){
      state.kmYear = Number(vehData.km_anio);
    }

    // Buscar versión en DB
    const versionText = vehData.version || "";
    if(versionText){
      // Intentar match exacto o parcial en la DB
      let matchedVersion = null;
      try{
        if(HAS_V3 && typeof window.getVersionsForModel === "function"){
          const versions = window.getVersionsForModel(brand, model) || [];
          const normV = (s) => String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g," ").replace(/\s+/g," ").trim();
          const nTarget = normV(versionText);
          matchedVersion = versions.find(v => normV(v.label||v) === nTarget)
                        || versions.find(v => nTarget.includes(normV(v.label||v)) || normV(v.label||v).includes(nTarget));
        }
      }catch(e){}

      if(matchedVersion){
        // Versión encontrada en DB — cargar silenciosamente
        car.manualVersion = false;
        car.versionMeta = typeof matchedVersion === "object" ? matchedVersion : { label: matchedVersion };
      } else {
        // Versión nueva — crear y guardar silenciosamente en localStorage
        const userVersion = {
          label: versionText,
          manual: true,
          source: "presupuesto",
          brand: brand,
          model: model,
          fuel: car.fuel || null,
          cv: vehData.cv || null,
          price: null // se rellenará con PVP del presupuesto
        };
        // Guardar en pool de versiones de usuario
        try{
          const key = "fc_user_versions";
          let pool = [];
          try{ pool = JSON.parse(localStorage.getItem(key)||"[]"); }catch(e){}
          // Evitar duplicados
          const exists = pool.find(v => v.brand===brand && v.model===model && v.label===versionText);
          if(!exists){ pool.push(userVersion); localStorage.setItem(key, JSON.stringify(pool)); }
        }catch(e){}
        car.manualVersion = true;
        car.versionMeta = userVersion;
      }
    }
  }catch(e){ /* silencioso */ }
}

// Aplicar JSON estructurado de Vision directamente al coche y al estado
function _applyVisionJSON(parsed, car, letter){
  if(!parsed) return false;
  const fin = parsed.financiacion || {};
  const veh = parsed.vehiculo || {};
  let applied = false;

  // Vehículo (silencioso)
  _loadVersionFromBudget(car, veh.marca || veh.modelo ? {
    brand: veh.marca, model: veh.modelo, version: veh.version,
    combustible: veh.combustible, cv: veh.cv, km_anio: veh.km_anio
  } : null);

  // PVP
  if(fin.pvp_contado > 0){
    car.pvpCash = fin.pvp_contado;
    car.pvpCashManual = fin.pvp_contado;
    car.pvpKnown = "yes";
    applied = true;
  }

  // Financiación
  if(fin.cuota_mensual > 0){ car.monthlyPayment = fin.cuota_mensual; applied = true; }
  if(fin.entrada > 0){ car.downPayment = fin.entrada; applied = true; }
  if(fin.tin > 0){ car.tin = fin.tin; applied = true; }
  if(fin.tae > 0){ car.tae = fin.tae; applied = true; }

  // VFG / PCP
  if(fin.vfg > 0){
    car.financeMode = "flex";
    car.flexGmv = fin.vfg;
    car.financeEnabled = "yes";
    applied = true;
  } else if(fin.cuota_mensual > 0){
    car.financeMode = "linear";
    car.financeEnabled = "yes";
  }

  // Cuotas e installments
  if(fin.num_cuotas > 0) car.installments = fin.num_cuotas;
  if(fin.plazo_meses > 0 && letter === "A") state.termMonths = normalizeTermMonths(fin.plazo_meses);

  // Comisión apertura
  if(fin.apertura_eur > 0 || fin.apertura_pct > 0){
    car.hasOpenFee = "yes";
    if(fin.apertura_pct > 0) car.openFeePct = fin.apertura_pct;
    if(fin.apertura_eur > 0){
      car.openFeeAmount = fin.apertura_eur;
      if(!fin.apertura_pct && fin.importe_financiar > 0){
        car.openFeePct = Math.round((fin.apertura_eur / fin.importe_financiar) * 10000) / 100;
      }
    }
    applied = true;
  }

  // KM/año
  if(veh.km_anio > 0) state.kmYear = veh.km_anio;

  // Extras / seguros
  if(Array.isArray(parsed.extras) && parsed.extras.length > 0){
    car._extras = parsed.extras;
  }

  // Guardar raw para debug y semáforo
  car._importedBudget = {
    template: "vision_json",
    totalPayable: fin.total_plazos || 0,
    principal: fin.total_credito || 0,
    tae: fin.tae || 0,
    notes: []
  };

  return applied;
}

const motorMap = { gasolina:"gasoline", diesel:"diesel", hibrido:"hev", phev:"phev", ev:"ev" };
const segmentMap = { "pequeño":"utilitario", "mediano":"berlina", "suv":"suv", "deportivo":"deportivo" };
function getMotorizationsFor(brand, model){
  if(HAS_V3 && typeof window.getMotorTypes==="function"){
    const types = window.getMotorTypes(brand, model) || [];
    const mapped = types.map(t=>motorMap[t]).filter(Boolean);
    return mapped.length ? mapped : ["gasoline","diesel","hev","phev","ev"];
  }
  const d = getModelData(brand, model);
  if(d && Array.isArray(d.motorizations) && d.motorizations.length){
    return d.motorizations.map(x=>motorMap[x]).filter(Boolean);
  }
  return ["gasoline","diesel","hev","phev","ev"];
}

  function normalize(s){
    return (s||"").trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }
  
    function resolveFromList(raw, options){
    const n = normalize(raw);
    const hit = (options||[]).find(x=>normalize(x)===n);
    return hit || raw;
  }

function computeClimate(province){
    const n = normalize(province);
    if(!n) return { icon:"🌤️", label:"Templado", factor:1.00 };

    // Clasificación simple por provincias (aprox). Ajusta el factor de consumo.
    const sunny = [
      "sevilla","cordoba","malaga","cadiz","huelva","granada","almeria","jaen",
      "murcia","alicante","valencia","castellon","badajoz","caceres","toledo",
      "ciudad real","las palmas","santa cruz de tenerife","ceuta","melilla",
      "illes balears"
    ];
    const north = [
      "a coruna","coruna","lugo","ourense","pontevedra",
      "asturias","cantabria","bizkaia","gipuzkoa","alava",
      "navarra"
    ];
    const cold = [
      "burgos","leon","palencia","soria","avila","segovia","zamora","valladolid",
      "huesca","teruel","cuenca","guadalajara","la rioja","lleida","girona"
    ];

    if (sunny.some(x=>n.includes(x))) return { icon:"☀️", label:"Soleado / cálido", factor:1.06 };
    if (north.some(x=>n.includes(x))) return { icon:"🌧️", label:"Fresco / lluvioso", factor:1.05 };
    if (cold.some(x=>n.includes(x))) return { icon:"❄️", label:"Frío", factor:1.08 };
    if (n.includes("madrid")) return { icon:"🌤️", label:"Templado", factor:1.04 };
    return { icon:"🌤️", label:"Templado", factor:1.00 };
  }


  function estimateTAE(received, months, monthly, balloon){
    received = Number(received||0);
    months = Number(months||0);
    monthly = Number(monthly||0);
    balloon = Number(balloon||0);
    if(received<=0 || months<=0 || monthly<=0) return null;

    let lo=0, hi=1;
    for(let k=0;k<80;k++){
      const mid=(lo+hi)/2;
      let pv=0;
      for(let t=1;t<=months;t++) pv += monthly/Math.pow(1+mid,t);
      if(balloon>0) pv += balloon/Math.pow(1+mid, months);
      if(pv > received) lo=mid; else hi=mid;
    }
    const r=(lo+hi)/2;
    const tae=Math.pow(1+r,12)-1;
    return tae*100;
  }

  
function taeVerdict(tin, tae){
  tin = Number(tin||0);
  tae = Number(tae||0);
  if(!Number.isFinite(tae) || tae<=0) return { cls:"", text:"—" };
  // Heurística simple (no es asesoramiento): la TAE suele ser > TIN por comisiones/seguros.
  const gap = (tin>0) ? (tae - tin) : null;
  if(gap!==null && gap < -0.25) return { cls:"bad", text:"Incoherente (TAE < TIN). Revisa datos." };
  if(gap!==null && gap <= 1) return { cls:"good", text:"Razonable (TAE cercana al TIN)." };
  if(gap!==null && gap <= 3) return { cls:"warn", text:"Algo alta (posibles extras/condiciones)." };
  if(gap!==null) return { cls:"bad", text:"Muy alta (ojo con comisiones/seguros/importe real)." };
  // Si no hay TIN, clasificamos solo por nivel aproximado
  if(tae <= 6) return { cls:"good", text:"Razonable." };
  if(tae <= 9) return { cls:"warn", text:"Algo alta." };
  return { cls:"bad", text:"Alta." };
}

// Semáforo de trato: green/yellow/red + qué negociar
function dealTrafficLight(car){
  const tin  = Number(car.tin||0);
  const tae  = Number(car.tae||0);
  const openFeePct = Number(car.openFeePct||0);
  const hasOpenFee = car.hasOpenFee === "yes" && openFeePct > 0;
  const hasBundles = car._importedBudget && car._importedBudget.totalPayable > 0;

  let score = 0; // 0=verde, 1=amarillo, 2=rojo
  const tips = [];

  // TAE
  const tv = taeVerdict(tin, tae);
  if(tv.cls === "bad")  { score = Math.max(score, 2); }
  if(tv.cls === "warn") { score = Math.max(score, 1); }

  // Comisión de apertura
  if(hasOpenFee){
    if(openFeePct > 2) { score = Math.max(score, 2); tips.push("Negocia la comisión de apertura (" + openFeePct.toFixed(2) + "%) — pide reducirla o eliminarla."); }
    else if(openFeePct > 0.5) { score = Math.max(score, 1); tips.push("Pregunta si pueden reducir la comisión de apertura."); }
  }

  // TAE alta
  if(tae > 9)  tips.push("La TAE (" + tae + "%) es alta. Compara con otras financieras antes de firmar.");
  else if(tae > 6) tips.push("La TAE (" + tae + "%) es moderada. Puede haber margen de negociación.");

  // Descuento por financiar
  if(car.financeDiscount && Number(car.financeDiscount) > 0){
    tips.push("Tienes un descuento por financiar (" + euro(car.financeDiscount) + "). Valora si financiar compensa frente al coste del crédito.");
  }

  // Sin tips => trato razonable
  if(tips.length === 0 && tae > 0){
    tips.push("El trato parece razonable. Revisa siempre las condiciones antes de firmar.");
  }

  const labels = ["🟢 Trato razonable", "🟡 Revisa algunos puntos", "🔴 Atención — negocia"];
  const colors = ["#16a34a", "#d97706", "#dc2626"];
  const bgs    = ["rgba(22,163,74,.12)", "rgba(217,119,6,.12)", "rgba(220,38,38,.12)"];
  const borders = ["rgba(22,163,74,.3)", "rgba(217,119,6,.3)", "rgba(220,38,38,.3)"];

  return {
    score,
    label: labels[score],
    color: colors[score],
    bg: bgs[score],
    border: borders[score],
    tips
  };
}

function renderTrafficLight(car, container){
  const tl = dealTrafficLight(car);
  const div = document.createElement("div");
  div.style.cssText = `background:${tl.bg};border:1px solid ${tl.border};border-radius:10px;padding:14px 16px;margin-top:14px`;
  div.innerHTML = `
    <div style="font-size:17px;font-weight:700;margin-bottom:8px;color:${tl.color}">${tl.label}</div>
    ${tl.tips.map(t => `<div style="display:flex;gap:8px;margin-bottom:6px;font-size:14px"><span style="flex-shrink:0">💡</span><span>${t}</span></div>`).join("")}
  `;
  container.appendChild(div);
}

function euro(n){
    n = Number.isFinite(n) ? n : 0;
    return n.toLocaleString("es-ES",{style:"currency",currency:"EUR"});
  }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function stripAccents(s){
    return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function normKey(brand, model){
    const b = stripAccents(String(brand||"").trim()).toUpperCase().replace(/\s+/g," ");
    const m = stripAccents(String(model||"").trim()).toUpperCase().replace(/\s+/g," ");
    // Normalizamos marcas típicas con acentos (Škoda -> SKODA)
    const b2 = b.replace(/^ŠKODA$/, "SKODA");
    return `${b2}|${m}`;
  }
  function getModelImageURL(brand, model){
    const map = (window.MODEL_IMAGES || {});
    const key = normKey(brand, model);
    return map[key] || null;
  }
  function setCarImage(id, brand, model){
    const el = document.getElementById(id);
    if(!el) return;
    const url = getModelImageURL(brand, model);
    if(url){
      el.src = url;
      el.alt = `${brand||""} ${model||""}`.trim();
      el.style.display = "block";
    }else{
      el.removeAttribute("src");
      el.alt = "";
      el.style.display = "none";
    }
  }
  function esc(s){
    return String(s??"").replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }

  // --- Calidad/seguridad de marca (FairCar Safety DB) ---
  function getBrandSafetyMeta(brand){
    try{
      if(typeof window !== "undefined" && typeof window.getSafetyBrand === "function"){
        return window.getSafetyBrand(brand);
      }
    }catch(e){}
    return null;
  }
  function safetyScore100(brand){
    const b = getBrandSafetyMeta(brand);
    const s = b ? Number(b.scoreFinal||0) : NaN;
    return (Number.isFinite(s) && s>0) ? (s*10) : null; // 0-100
  }
  function safetyBadgeHTML(brand){
    const b = getBrandSafetyMeta(brand);
    if(!b) return "";
    const s = Number(b.scoreFinal||0);
    if(!Number.isFinite(s) || s<=0) return "";
    const cls = (s>=8.2) ? "good" : (s>=7.0) ? "warn" : "bad";
    const stars = b.ncapStars ? `${b.ncapStars}★` : "";
    const extra = stars ? ` · ${stars}` : "";
    const tip = b.resumen ? esc(b.resumen) : "";
    return `<span class="badge ${cls}" title="${tip}">Marca: ${s.toFixed(1)}/10${extra}</span>`;
  }

  // ----------------------------
  // Motor de decisión FairCar v2 — "Coche Justo"
  // Prioridad: Encaje EV/PHEV → Financiación justa (CCR) → Coste mensual real
  // ----------------------------

  // ---- Tabla de depreciación por marca (3 niveles) ----
  // Fuente: Autovista RV Awards 2024 + OCU + Eurotax histórico
  const BRAND_DEPRECIATION = {
    // Baja depreciación (retienen bien su valor)
    low: ["Toyota","Lexus","Dacia","Porsche","Land Rover","Mini","Jeep","Suzuki","Subaru"],
    // Alta depreciación (pierden valor más rápido)
    high: ["Maserati","Alfa Romeo","DS","Lancia","Jaguar","BMW","Infiniti","Genesis","NIO","Leapmotor"]
  };

  function getBrandDepreciation(brand){
    const b = String(brand||"").trim();
    if(BRAND_DEPRECIATION.low.includes(b)) return { level:"low",   label:"Bajo",  text:"suele retener bien su valor" };
    if(BRAND_DEPRECIATION.high.includes(b)) return { level:"high", label:"Alto",  text:"tiende a depreciarse más rápido" };
    return { level:"medium", label:"Medio", text:"depreciación media habitual" };
  }

  // ---- CCR: Coste de Crédito Real ----
  // Intereses reales + apertura + seguros financiados (lo que NO ves en la publicidad)
  function calcCreditRealCost(car, res){
    const fin = res?.meta?.fin || {};
    if(fin.mode !== "finance"){
      return { ccr:0, ccrMonth:0, intereses:0, apertura:0, extrasLoan:0, extrasSeguro:0, extrasMaint:0, items:[] };
    }

    const months = Number(fin.months||1)||1;
    const received = Number(fin.financedBase||0) || 0; // dinero realmente recibido (sin apertura financiada)
    const creditMonthly = Number(fin.creditMonthly||0) || 0; // cuota de préstamo SIN extras (seguro/mant.)
    const balloon = Number(fin.balloon||0) || 0; // valor final del préstamo (si existe)

    // Total pagado al banco por el préstamo (sin extras): cuotas + valor final.
    const totalCreditPaid = creditMonthly*months + (balloon>0 ? balloon : 0);

    // Coste del crédito = (lo que pagas por el préstamo) − (lo que recibes)
    const ccr = Math.max(0, totalCreditPaid - received);

    const apertura = Number(fin.openFee||0) || 0;
    const intereses = Math.max(0, ccr - apertura);
    const ccrMonth = ccr / months;

    // Extras vinculados al préstamo (no son "intereses", pero encarecen la letra)
    const extrasSeguro = (Number(fin.insuranceInQuota||0)||0) * months;
    const extrasMaint  = (Number(fin.maintInQuota||0)||0) * months;
    const extrasLoan   = Math.max(0, extrasSeguro + extrasMaint);

    const items = [];
    if(intereses>0) items.push({ label:"Intereses del crédito", amount:intereses });
    if(apertura>0)  items.push({ label:"Comisión de apertura",  amount:apertura });
    return { ccr, ccrMonth, intereses, apertura, extrasLoan, extrasSeguro, extrasMaint, items };
  }

  // ---- Encaje EV ----
  function calcEvFit(car){
    const fuel = String(car?.fuel||"").toLowerCase();
    if(fuel!=="ev") return null;
    const km = Number(state.kmYear||0)||0;
    const kmDay = km / 365;
    const city = clamp(Number(state.cityPct||50),0,100);
    const hw = 100 - city;
    const charge = String(state.chargeMode||"");
    const hasCharge = (charge==="home" || charge==="work");

    // Viajes largos/mes estimados (>200km)
    const kmCarretera = km * (hw/100);
    const viajesLargosMes = kmCarretera / (12 * 200);

    let verdict = "ok";    // ok | warn | bad
    let reason  = "";
    let badge   = "";

    if(!hasCharge && km >= 20000 && hw >= 50){
      verdict = "bad";
      reason  = `Sin carga propia y ${Math.round(hw)}% carretera: la carga pública es cara y lenta para este uso.`;
      badge   = "⚠ EV: encaje limitado";
    } else if(!hasCharge && viajesLargosMes > 6){
      verdict = "warn";
      reason  = `Sin carga en casa/trabajo y ~${viajesLargosMes.toFixed(0)} viajes largos/mes: la logística de carga puede ser incómoda.`;
      badge   = "⚠ EV: revisar hábitos de carga";
    } else if(hasCharge && hw >= 70 && km >= 25000){
      verdict = "warn";
      reason  = `Con mucha carretera (${Math.round(hw)}% y ${km.toLocaleString("es")} km/año) el tiempo de carga en ruta puede ser relevante.`;
      badge   = "ℹ EV: carga en ruta frecuente";
    } else {
      reason  = hasCharge
        ? `Con carga en ${charge==="home"?"casa":"el trabajo"} y ${Math.round(city)}% ciudad, encaja bien.`
        : `Bajo km o uso mayoritariamente urbano: viable aunque sin carga propia.`;
    }
    return { verdict, reason, badge, viajesLargosMes, hasCharge };
  }

  // ---- Encaje PHEV ----
  function calcPhevFit(car, res){
    const fuel = String(car?.fuel||"").toLowerCase();
    if(fuel!=="phev") return null;
    const km = Number(state.kmYear||0)||0;
    const city = clamp(Number(state.cityPct||50),0,100);
    const hw = 100 - city;
    const charge = String(state.chargeMode||"");
    const hasCharge = (charge==="home" || charge==="work");

    // Autonomía eléctrica: intentar sacar de la versión; si no, estimado por batería
    let batKwh = Number(car.batteryKwh||0)||0;
    const vm = res?.meta?.fin ? null : null; // placeholder
    // Estimación simplificada: ~6 km/kWh para PHEV pequeño, ~5.5 para mediano/SUV
    const rangeWltp = batKwh > 0
      ? Math.round(batKwh * (car.segment==="suv" ? 5.2 : 6.0))
      : 50; // fallback 50 km si no hay dato
    const rangeReal = Math.round(rangeWltp * 0.75); // realista

    const kmDay = km / 365;
    const kmCiudadDay = kmDay * (city/100);

    // EV-share: si tiene carga diaria, cuánto puede hacer en eléctrico
    let evShare = 0;
    if(hasCharge){
      evShare = Math.min(1, rangeReal / Math.max(1, kmCiudadDay));
      // Clamp: en ciudad casi siempre
      evShare = clamp(evShare, 0, 1);
    } else {
      // Sin carga diaria: uso eléctrico muy reducido
      evShare = clamp(rangeReal / Math.max(1, km/365), 0, 0.45) * 0.5;
    }

    // Ajuste por km de carretera (los viajes largos van en gasolina)
    const kmCarretera = km * (hw/100);
    const viajesLargosMes = kmCarretera / (12 * 200);
    const longTripPenalty = Math.min(0.35, viajesLargosMes * 0.035);
    evShare = Math.max(0, evShare - longTripPenalty);

    // Regla determinante
    let verdict = "ok";    // ok | warn | bad
    let reason  = "";
    let badge   = "";

    if(!hasCharge && hw >= 60){
      verdict = "bad";
      reason  = `Sin carga propia y ${Math.round(hw)}% carretera: irías casi siempre en gasolina con el peso de la batería. El PHEV no compensa.`;
      badge   = "✗ PHEV: no recomendado";
    } else if(!hasCharge){
      verdict = "warn";
      reason  = `Sin carga habitual, el modo eléctrico se usará poco. El PHEV funciona principalmente como híbrido convencional con más coste.`;
      badge   = "⚠ PHEV: sin carga propia";
    } else if(viajesLargosMes > 10){
      verdict = "bad";
      reason  = `Con ~${viajesLargosMes.toFixed(0)} viajes largos/mes los km de carretera los harás en gasolina arrastrando el peso de la batería.`;
      badge   = "✗ PHEV: demasiados viajes largos";
    } else if(viajesLargosMes > 6){
      verdict = "warn";
      reason  = `Con ~${viajesLargosMes.toFixed(0)} viajes largos/mes usarás el motor de gasolina frecuentemente.`;
      badge   = "⚠ PHEV: muchos viajes largos";
    } else if(hasCharge && evShare >= 0.65){
      verdict = "ok";
      const evPct = Math.round(evShare * 100);
      reason  = `Con carga en ${charge==="home"?"casa":"el trabajo"} y batería de ${batKwh>0?batKwh+"kWh, ":""}autonomía ~${rangeReal} km reales, estimamos que harías ~${evPct}% en eléctrico. Modo híbrido para carretera.`;
    } else {
      verdict = "ok";
      const evPct = Math.round(evShare * 100);
      reason  = `Encaje razonable: ~${evPct}% en eléctrico estimado con tus hábitos.`;
    }

    return { verdict, reason, badge, evShare, rangeWltp, rangeReal, batKwh, viajesLargosMes, hasCharge };
  }

  // ---- Red flags de financiación sucia (2+ = penalización fuerte) ----
  function calcFinanceDirtyFlags(car, res){
    const fin = res?.meta?.fin || {};
    const flags = [];
    if(fin.mode !== "finance") return { flags, count:0, score:100 };

    const openPct = Number(car.openFeePct||0);
    if(openPct > 2) flags.push({ id:"apertura_alta", text:`Comisión de apertura alta: ${openPct.toFixed(1)}%` });

    const insQ = Number(fin.insuranceInQuota||0);
    if(insQ > 0) flags.push({ id:"seguro_cuota", text:`Seguro incluido en cuota: ${money(insQ)}/mes` });

    const maintQ = Number(fin.maintInQuota||0);
    if(maintQ > 0) flags.push({ id:"mant_cuota", text:`Mantenimiento en cuota: ${money(maintQ)}/mes` });

    const diff = Number(fin.diff||0);
    if(Number.isFinite(diff) && Math.abs(diff) > 20)
      flags.push({ id:"cuota_inflada", text:`Cuota ${diff>0?"por encima":"por debajo"} de lo esperado por TIN: ${money(Math.abs(diff))}/mes` });

    const balloon = Number(fin.balloon||0);
    if(balloon > 0) flags.push({ id:"balloon", text:`Pago final (GMV): ${money(balloon)}` });

    const score = Math.max(0, 100 - flags.length * 18);
    return { flags, count:flags.length, score };
  }

  // ---- €/100 km total ----
  function calcCostPer100km(res){
    const km = Number(state.kmYear||0)||0;
    if(km<=0) return null;
    const kmMonth = km / 12;
    const total = Number(res.monthlyReal||0);
    if(total<=0 || kmMonth<=0) return null;
    return (total / kmMonth) * 100;
  }

  const DECISION_PROFILES = {
    normal: {
      key:"normal", label:"Equilibrado", icon:"⚖️",
      desc:"Ponderación estándar entre coste, fiabilidad y financiación.",
      weights:{ cost:0.55, tranquility:0.25, finance:0.15, fit:0.05 },
      evStreetPenalty:{ base:-15, highKm:-25 }
    },
    conservative: {
      key:"conservative", label:"Quiero el más fiable", icon:"🛡️",
      desc:"Prioriza fiabilidad, seguridad y valor residual sobre el precio.",
      weights:{ cost:0.40, tranquility:0.40, finance:0.15, fit:0.05 },
      evStreetPenalty:{ base:-20, highKm:-30 }
    },
    budget: {
      key:"budget", label:"Quiero pagar menos", icon:"💶",
      desc:"Lo más importante es el coste mensual real, por encima de todo.",
      weights:{ cost:0.70, tranquility:0.15, finance:0.15, fit:0.00 },
      evStreetPenalty:{ base:-12, highKm:-22 }
    },
    traveler: {
      key:"traveler", label:"Conduzco mucho", icon:"🛣️",
      desc:"Muchos km o viajes largos: consumo y encaje de motorización son clave.",
      weights:{ cost:0.50, tranquility:0.20, finance:0.15, fit:0.15 },
      evStreetPenalty:{ base:-18, highKm:-28 }
    }
  };

  function getDecisionProfileMeta(key){
    const k = String(key||"normal").toLowerCase();
    return DECISION_PROFILES[k] || DECISION_PROFILES.normal;
  }

  function weightsText(meta){
    const w = meta.weights;
    const pct = (x)=>Math.round(Number(x||0)*100);
    const fit = (w.fit>0) ? ` · encaje ${pct(w.fit)}%` : "";
    return `coste ${pct(w.cost)}% · tranquilidad ${pct(w.tranquility)}% · financiación ${pct(w.finance)}%${fit}`;
  }

  function buildDecisionProfilePickerHTML(selectedKey, compact){
    const sel = getDecisionProfileMeta(selectedKey).key;
    const btn = (k)=>{
      const m = getDecisionProfileMeta(k);
      const active = (m.key===sel) ? "active" : "";
      return `
        <button type="button" class="seg-btn ${active}" data-prof="${m.key}">
          <div style="display:flex;align-items:center;gap:7px">
            <span style="font-size:18px">${m.icon||""}</span>
            <span class="seg-title">${esc(m.label)}</span>
          </div>
          ${!compact ? `<div class="seg-sub" style="margin-top:3px;font-size:12px;color:var(--muted);font-weight:400">${esc(m.desc||"")}</div>` : ""}
        </button>
      `;
    };
    return `
      <div class="seg-wrap">
        <div class="seg-head">¿Qué es lo más importante para ti?</div>
        <div class="seg-grid ${compact?"compact":""}">
          ${btn("budget")}
          ${btn("traveler")}
          ${btn("conservative")}
          ${btn("normal")}
        </div>
      </div>
    `;
  }

  function residualScore100(car, res){
    const pvp = Number(car?.pvpCash||0) || Number(car?.priceFinanced||0) || 0;
    const r = Number(res?.meta?.residualEst||0) || 0;
    if(pvp<=0 || r<=0) return 50;
    const ratio = r/pvp; // típico 0.15 - 0.65
    const norm = (ratio - 0.15) / (0.65 - 0.15);
    return clamp(norm*100, 0, 100);
  }

  function tranquilityScore100(car, res){
    const s = safetyScore100(car?.brand);
    const safety = (s===null) ? 75 : s;
    const residual = residualScore100(car, res);
    return clamp(0.70*safety + 0.30*residual, 0, 100);
  }

  function usageFitScore100(car){
    let s = 70;
    const city = clamp(Number(state.cityPct||50), 0, 100);
    const hw = 100 - city;
    const plug = (car?.fuel==="ev" || car?.fuel==="phev");
    const diesel = (car?.fuel==="diesel");

    if(city>=70 && car?.segment==="suv") s -= 6;
    if(city>=75 && diesel) s -= 10;

    if(plug){
      if((state.chargeMode==="home" || state.chargeMode==="work") && city>=60) s += 6;
      if(state.chargeMode==="street") s -= 10;
      if(hw>=60 && state.chargeMode==="street") s -= 12;
    }

    if(hw>=65 && car?.segment==="utilitario") s -= 4;

    return clamp(s, 0, 100);
  }

  function evPenalty(car, meta){
    const plug = (car?.fuel==="ev" || car?.fuel==="phev");
    if(!plug) return 0;
    if(state.chargeMode!=="street") return 0;
    const km = Number(state.kmYear||0)||0;
    const p = meta?.evStreetPenalty || { base:-15, highKm:-25 };
    return (km>=20000) ? Number(p.highKm||0) : Number(p.base||0);
  }

  function computeCostScores(aM, bM){
    const avg = (aM + bM)/2;
    const denom = Math.max(1, avg);
    let costScoreA = 50 + clamp(((bM - aM)/denom)*50, -50, 50);
    costScoreA = clamp(costScoreA, 0, 100);
    const costScoreB = 100 - costScoreA;
    return { avg, costScoreA, costScoreB };
  }

  function decideWinnerFaircar(A, B, carA, carB, profileKey){
    const meta = getDecisionProfileMeta(profileKey || state.decisionProfile);
    const w = meta.weights;

    const aM = Number(A?.monthlyReal||0);
    const bM = Number(B?.monthlyReal||0);
    const deltaMonthly = aM - bM;
    const diffAbs = Math.abs(deltaMonthly);
    const months = Number(normalizeTermMonths(state.termMonths));
  const payMonths = (()=>{
    const n = Number(car.installments||0);
    if(Number.isFinite(n) && n>0) return Math.min(months, Math.max(1, Math.round(n)));
    return months;
  })();

    // --- BLOQUE 1: CCR (Coste de Crédito Real) ---
    const ccrA = calcCreditRealCost(carA, A);
    const ccrB = calcCreditRealCost(carB, B);
    const deltaCCR = ccrA.ccr - ccrB.ccr;           // >0 => B más justa
    const deltaCCRmonth = ccrA.ccrMonth - ccrB.ccrMonth;
    const CCR_OVERRIDE_EUR   = 2000;  // diferencia en €-total que activa override
    const CCR_OVERRIDE_MONTH = 30;    // diferencia en €/mes que activa override
    const ccrWinnerLetter = (ccrA.ccr <= ccrB.ccr) ? "A" : "B";
    const ccrGapBig = (Math.abs(deltaCCR) >= CCR_OVERRIDE_EUR) || (Math.abs(deltaCCRmonth) >= CCR_OVERRIDE_MONTH);

    // --- BLOQUE 2: Encaje EV/PHEV ---
    const fitEvA  = calcEvFit(carA);
    const fitEvB  = calcEvFit(carB);
    const fitPhA  = calcPhevFit(carA, A);
    const fitPhB  = calcPhevFit(carB, B);
    const fitA_verdict = fitEvA?.verdict || fitPhA?.verdict || "ok";
    const fitB_verdict = fitEvB?.verdict || fitPhB?.verdict || "ok";
    // "bad" = no puede ganar salvo que el otro también sea bad
    const aBad = (fitA_verdict === "bad");
    const bBad = (fitB_verdict === "bad");

    // --- BLOQUE 3: Flags de financiación sucia ---
    const dirtyA = calcFinanceDirtyFlags(carA, A);
    const dirtyB = calcFinanceDirtyFlags(carB, B);

    // --- BLOQUE 4: Scores de soporte (para empates) ---
    const cs    = computeCostScores(aM, bM);
    const finA  = financeSignals(carA, A);
    const finB  = financeSignals(carB, B);
    const trA   = tranquilityScore100(carA, A);
    const trB   = tranquilityScore100(carB, B);
    const penA  = evPenalty(carA, meta);
    const penB  = evPenalty(carB, meta);
    const compA = w.cost*cs.costScoreA + w.tranquility*trA + w.finance*finA.score + penA;
    const compB = w.cost*cs.costScoreB + w.tranquility*trB + w.finance*finB.score + penB;

    const winCost = (aM <= bM) ? "A" : "B";
    const threshold = Math.max(25, cs.avg*0.03);
    const bigGap = diffAbs >= threshold;

    // ============================================================
    // REGLA DE DECISIÓN — prioridad en cascada
    // ============================================================
    let betterGlobal;
    let rule; // "encaje_bad" | "ccr_override" | "cost" | "balanced"
    let ruleDetail = "";

    // P0: si un coche "encaja mal" y el otro no → pierde
    if(aBad && !bBad){
      betterGlobal = "B";
      rule = "encaje_bad";
      ruleDetail = `Coche A no encaja bien por motorización.`;
    } else if(bBad && !aBad){
      betterGlobal = "A";
      rule = "encaje_bad";
      ruleDetail = `Coche B no encaja bien por motorización.`;
    }
    // P1: override por financiación claramente más justa (CCR)
    else if(ccrGapBig){
      // Guardarraíl: el coche de mejor financiación no puede costar >15% o >120€/mes más
      const bestCCRletter = ccrWinnerLetter;
      const bestM = (bestCCRletter==="A") ? aM : bM;
      const otherM = (bestCCRletter==="A") ? bM : aM;
      const monthlyGap = bestM - otherM;
      const pctGap = (otherM>0) ? (monthlyGap/otherM) : 0;
      const GUARDRAIL_EUR = 120;
      const GUARDRAIL_PCT = 0.15;
      if(monthlyGap > GUARDRAIL_EUR || pctGap > GUARDRAIL_PCT){
        // Override bloqueado: financiación mejor pero demasiado caro
        betterGlobal = winCost;
        rule = "cost";
        ruleDetail = `Financiación de ${bestCCRletter==="A"?"Coche A":"Coche B"} más justa, pero su coste mensual real es significativamente mayor; gana el más económico.`;
      } else {
        betterGlobal = bestCCRletter;
        rule = "ccr_override";
        ruleDetail = `Financiación más justa: ahorra ${money(Math.abs(deltaCCR))} en crédito (${money(Math.abs(deltaCCRmonth))}/mes).`;
      }
    }
    // P2: coste mensual manda si hay diferencia clara
    else if(bigGap){
      betterGlobal = winCost;
      rule = "cost";
      ruleDetail = `Diferencia de coste mensual real: ${euro(diffAbs)}/mes.`;
    }
    // P3: empate técnico → scoring ponderado
    else {
      betterGlobal = (compA >= compB) ? "A" : "B";
      rule = "balanced";
      ruleDetail = `Coste muy parejo (dif. ${euro(diffAbs)}/mes); se pondera financiación, tranquilidad y uso.`;
    }

    // Ganadores por categoría (para mostrar)
    const winFin = (finA.score >= finB.score) ? "A" : "B";
    const winTr  = (trA >= trB) ? "A" : "B";

    // ─── explainHtml: comparativa rápida en wizard — lenguaje humano, Marca+Modelo ──
    const _nameA = carA ? (`${carA.brand||""} ${carA.model||""}`).trim() || "Coche A" : "Coche A";
    const _nameB = carB ? (`${carB.brand||""} ${carB.model||""}`).trim() || "Coche B" : "Coche B";
    const _winName  = (betterGlobal==="A") ? _nameA : _nameB;
    const _loseName = (betterGlobal==="A") ? _nameB : _nameA;
    const _winM  = (betterGlobal==="A") ? aM : bM;
    const _loseM = (betterGlobal==="A") ? bM : aM;
    const _winCCR  = (betterGlobal==="A") ? ccrA : ccrB;
    const _loseCCR = (betterGlobal==="A") ? ccrB : ccrA;

    // Frase principal según la regla
    let _mainLine = "";
    if(rule==="encaje_bad"){
      const _badCar = (fitEvA?.verdict==="bad"||fitPhA?.verdict==="bad") ? _nameA : _nameB;
      _mainLine = `<b>${esc(_badCar)}</b> no encaja bien con tu perfil de uso. ${ruleDetail.replace(/Coche [AB]/g, m => m==="Coche A" ? _nameA : _nameB)}`;
    } else if(rule==="ccr_override"){
      _mainLine = `<b>${esc(_winName)}</b> tiene la financiación más justa: <b>${money(Math.abs(deltaCCR))} menos</b> en intereses y comisiones (${money(Math.abs(deltaCCRmonth))}/mes).`;
    } else if(rule==="cost"){
      _mainLine = `<b>${esc(_winName)}</b> es <b>${euro(diffAbs)}/mes más barato</b> en coste total real.`;
    } else {
      _mainLine = `Coste muy parecido — diferencia de solo <b>${euro(diffAbs)}/mes</b>. ${esc(_winName)} gana por financiación y fiabilidad.`;
    }

    // Línea de coste crédito (solo si hay financiación)
    let _ccrLine = "";
    if(_winCCR.ccr > 0 || _loseCCR.ccr > 0){
      _ccrLine = `Financiación: <b>${esc(_winName)}</b> te cuesta <b>${money(_winCCR.ccr)}</b> en crédito · <b>${esc(_loseName)}</b> ${money(_loseCCR.ccr)}.`;
    }

    // Línea de coste mensual
    const _costLine = `Coste mensual total: <b>${esc(_winName)}</b> ${euro(_winM)}/mes · <b>${esc(_loseName)}</b> ${euro(_loseM)}/mes.`;

    const explainHtml = `
      <div class="decision-mini">
        <div class="decision-row main" style="font-size:14px;margin-bottom:6px">${_mainLine}</div>
        ${_ccrLine ? `<div class="decision-row" style="font-size:13px;color:var(--muted)">${_ccrLine}</div>` : ""}
        <div class="decision-row" style="font-size:13px;color:var(--muted)">${_costLine}</div>
        ${(fitEvA||fitPhA) ? `<div class="decision-row" style="font-size:13px;color:var(--muted)">⚡ ${esc(_nameA)}: ${fitEvA?.reason||fitPhA?.reason||""}</div>` : ""}
        ${(fitEvB||fitPhB) ? `<div class="decision-row" style="font-size:13px;color:var(--muted)">⚡ ${esc(_nameB)}: ${fitEvB?.reason||fitPhB?.reason||""}</div>` : ""}
      </div>
    `;

    return {
      profile: meta.key,
      profileLabel: meta.label,
      weights: w,
      rule, ruleDetail,
      deltaMonthly, diffAbs, threshold,
      ccr: { A: ccrA, B: ccrB, deltaCCR, deltaCCRmonth, ccrWinnerLetter, ccrGapBig },
      evFit: { A: fitEvA, B: fitEvB },
      phevFit: { A: fitPhA, B: fitPhB },
      dirtyFlags: { A: dirtyA, B: dirtyB },
      winners: { cost: winCost, tranquility: winTr, finance: winFin, global: betterGlobal },
      scores: {
        A: { monthly:aM, costScore:cs.costScoreA, tranquility:trA, finance:finA.score, comp:compA },
        B: { monthly:bM, costScore:cs.costScoreB, tranquility:trB, finance:finB.score, comp:compB }
      },
      explainHtml
    };
  }

  // Backward compatible helper
  function decideWinnerEnhanced(A, B, carA, carB){
    return decideWinnerFaircar(A, B, carA, carB, state.decisionProfile);
  }

  function pdfBadge(cls, text){
    return `<span class="pdf-badge ${cls||""}">${esc(text||"")}</span>`;
  }

  function buildPdfCompareHTML(A, B, decisionOrBetter){
    const months = Number(state.termMonths||0)||0;
    const decision = (typeof decisionOrBetter === "object" && decisionOrBetter)
      ? decisionOrBetter
      : decideWinnerFaircar(A, B, state.carA, state.carB, state.decisionProfile);
    const better = (decision && decision.winners && decision.winners.global) ? decision.winners.global : (decisionOrBetter||"A");

    const delta = A.monthlyReal - B.monthlyReal;
    const diffAbs = Math.abs(delta);
    const winner = (better==="A") ? { car: state.carA, res: A, other: state.carB, otherRes: B, letter:"A" }
                                 : { car: state.carB, res: B, other: state.carA, otherRes: A, letter:"B" };
    const loser  = (better==="A") ? { car: state.carB, res: B, letter:"B" } : { car: state.carA, res: A, letter:"A" };

    const dateStr = new Date().toLocaleDateString("es-ES",{ year:"numeric", month:"long", day:"numeric" });
    const profLabel = decision?.profileLabel || getDecisionProfileMeta(state.decisionProfile).label;
    const profWeights = decision ? weightsText(getDecisionProfileMeta(decision.profile)) : weightsText(getDecisionProfileMeta(state.decisionProfile));

    const carBlock = (car, res, letter, imgId) => {
      const fin = res.meta.fin;
      const tae = fin.tae;
      const v = taeVerdict(car.tin, tae||0);
      const warnTin = (fin.expectedMonthlyByTIN && fin.loanMonthly && Math.abs(fin.diff) > 15);
      const img = getModelImageURL(car.brand, car.model);
      const metaLine = `${fuelLabel(car.fuel)} · ${segLabel(car.segment)} · ${months} meses`;
      const saf = getBrandSafetyMeta(car.brand);
      const safBadge = saf ? pdfBadge((saf.scoreFinal>=8.2) ? "good" : (saf.scoreFinal>=7.0) ? "warn" : "bad",
        `Marca: ${Number(saf.scoreFinal||0).toFixed(1)}/10${saf.ncapStars?` · ${saf.ncapStars}★`:''}`) : "";
      const badges = [
        safBadge,
        tae ? pdfBadge(v.cls, `TAE est.: ${tae.toFixed(2)}% · ${v.text}`) : pdfBadge("", "TAE est.: —"),
        pdfBadge("", `Cuota: ${euro(fin.loanMonthly)}`),
        warnTin ? pdfBadge("bad", `Alerta cuota vs TIN (${(fin.diff>0?"+":"")}${euro(fin.diff)}/mes)`) : pdfBadge("good","Cuota coherente con TIN")
      ].filter(Boolean).join("");
      return `
        <div class="pdf-card">
          <div class="pdf-car-top">
            ${img ? `<img class="pdf-car-img" src="${img}" alt="${esc((car.brand||"")+" "+(car.model||""))}">` : `<div class="pdf-car-img" aria-hidden="true"></div>`}
            <div>
              <div class="pdf-car-name">${esc((car.brand||"Coche")+" "+(car.model||"")).trim()} <span class="small">(Coche ${letter})</span></div>
              <div class="pdf-car-meta">${esc(metaLine)}</div>
              <div class="pdf-badges">${badges}</div>
            </div>
          </div>

          <div class="pdf-kpis">
            <div class="pdf-kpi">
              <div class="l">Coste mensual real (estimación)</div>
              <div class="v">${euro(res.monthlyReal)}</div>
            </div>
            <div class="pdf-kpi">
              <div class="l">Coste total en ${months} meses</div>
              <div class="v">${euro(res.monthlyReal*months)}</div>
            </div>
          </div>
        </div>
      `;
    };

    const drivers = [
      { label:"Financiación neta", a:A.pieces.financeMonthly, b:B.pieces.financeMonthly },
      { label:"Energía", a:A.pieces.energyMonthly, b:B.pieces.energyMonthly },
      { label:"Seguro", a:A.pieces.insuranceMonthly, b:B.pieces.insuranceMonthly },
      { label:"Mantenimiento", a:A.pieces.maintenanceMonthly, b:B.pieces.maintenanceMonthly },
      { label:"Impuesto circulación", a:A.pieces.taxMonthly, b:B.pieces.taxMonthly },
    ].map(x=>({ ...x, d: x.a - x.b })).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d));

    const top3 = drivers.slice(0,3).map(x=>{
      const winIsA = (better==="A");
      const d = x.d;
      // Si gana A, buscamos qué le hace más barato: d<0 => A menor que B
      const betterDelta = winIsA ? (-d) : (d); // positivo si el ganador es mejor en esa línea
      const txt = betterDelta >= 0
        ? `${x.label}: ${euro(Math.abs(betterDelta))}/mes a favor del coche recomendado.`
        : `${x.label}: ${euro(Math.abs(betterDelta))}/mes en contra (compensa por otras partidas).`;
      return `<li>${esc(txt)}</li>`;
    }).join("");

    const winnerCheaper = (better==="A") ? (A.monthlyReal <= B.monthlyReal) : (B.monthlyReal <= A.monthlyReal);
    const byCost = (decision?.rule||"cost") === "cost";
    const recP = winnerCheaper
      ? ((better==="A")
          ? `FairCar recomienda el <b>Coche A</b> porque su coste mensual real estimado es <b>${euro(diffAbs)}</b> menor que el Coche B. En <b>${months} meses</b> son ~<b>${euro(diffAbs*months)}</b>.`
          : `FairCar recomienda el <b>Coche B</b> porque su coste mensual real estimado es <b>${euro(diffAbs)}</b> menor que el Coche A. En <b>${months} meses</b> son ~<b>${euro(diffAbs*months)}</b>.`
        )
      : ((better==="A")
          ? `FairCar recomienda el <b>Coche A</b> por mejor equilibrio global (tranquilidad/financiación/encaje), aunque su coste mensual real estimado es <b>${euro(diffAbs)}</b> superior al del Coche B.`
          : `FairCar recomienda el <b>Coche B</b> por mejor equilibrio global (tranquilidad/financiación/encaje), aunque su coste mensual real estimado es <b>${euro(diffAbs)}</b> superior al del Coche A.`
        );

    const cats = decision?.winners ? `
      <div class="pdf-note" style="margin-top:10px">
        <b>Ganadores por criterio</b>: coste → Coche ${decision.winners.cost} · tranquilidad → Coche ${decision.winners.tranquility} · financiación → Coche ${decision.winners.finance}${(decision.weights?.fit>0)?` · encaje → Coche ${decision.winners.fit}`:""} · <b>global</b> → Coche ${decision.winners.global}.
        <div style="margin-top:6px">Perfil: <b>${esc(profLabel)}</b> (${esc(profWeights)}). ${byCost?"Regla aplicada: coste manda (diferencia notable).":"Regla aplicada: empate técnico en coste; se ponderan criterios."}</div>
      </div>
    ` : "";


    const caveat = `Este informe es una estimación basada en los datos que has introducido (precio, entrada, TIN, comisión, seguro, combustible/energía, ayuda Auto+ y valor residual/GMV). Si cambias la oferta o tu uso real, el resultado cambia.`;

    return `
      <div class="pdf-wrap">
        <div class="pdf-header">
          <div>
            <div class="pdf-title">Comparativa FairCar</div>
            <div class="pdf-sub">${esc(dateStr)} · España · FairCar v1</div>
          </div>
          <div class="pdf-sub">faircar</div>
        </div>

        <div class="pdf-grid">
          ${carBlock(state.carA, A, "A")}
          ${carBlock(state.carB, B, "B")}
        </div>

        <div class="pdf-rec">
          <h3>Recomendación FairCar</h3>
          <p>${recP}</p>
          ${cats}
          <ul>
            ${top3 || ""}
          </ul>
          <div class="pdf-note">${esc(caveat)}</div>
        </div>

        <div class="pdf-note">
          Consejo rápido: si la <b>cuota</b> no cuadra con el <b>TIN</b>, normalmente hay algún “extra” (comisión, seguro financiado, precio real distinto, etc.). Pide al concesionario el cuadro de amortización y el detalle de productos vinculados.
        </div>
      </div>
    `;
  }


  function segmentFactor(seg){
    switch(seg){
      case "utilitario": return 0.95;
      case "berlina": return 1.00;
      case "suv": return 1.10;
      case "deportivo": return 1.18;
      default: return 1.00;
    }
  }
  function powerFactor(powerKw){
    const p = Number(powerKw||100);
    const steps = Math.max(0, (p - 75) / 25);
    return 1 + 0.02 * steps;
  }
  function cityFactor(cityPct){
    const c = clamp(Number(cityPct||50),0,100);
    return { ice: 1 + 0.0015*(c-50), ev: 1 - 0.0008*(c-50) };
  }

  function baselineLper100(fuel){
    switch(fuel){
      case "gasoline": return 6.2;
      case "diesel": return 5.3;
      case "hev": return 4.8;
      case "phev": return 5.5;
      default: return 6.2;
    }
  }
  function baselineKwhPer100(seg){
    switch(seg){
      case "utilitario": return 15.5;
      case "berlina": return 16.8;
      case "suv": return 19.5;
      case "deportivo": return 20.5;
      default: return 17.0;
    }
  }
  function monthlyDistance(){ return Number(state.kmYear||0)/12; }

  
  // --- Modelo de consumo "más realista" (WLTP mix + factor realidad + performance) ---
  // Usa datos de CAR_DB cuando existan (wltp_city, wltp_highway, real_world, etc.) y
  // mantiene el fallback anterior cuando falten datos.
  const DB_FUEL_KEY = { gasoline:"gasolina", diesel:"diesel", hev:"hibrido", phev:"phev", ev:"ev" };
  let REALITY_BY_FUEL = null;

  function _median(arr){
    const a = (arr||[]).filter(Number.isFinite).slice().sort((x,y)=>x-y);
    if(!a.length) return null;
    const mid = Math.floor(a.length/2);
    return (a.length%2) ? a[mid] : (a[mid-1]+a[mid])/2;
  }

  function computeRealityFactors(){
    if(REALITY_BY_FUEL) return REALITY_BY_FUEL;
    const buckets = { gasoline:[], diesel:[], hev:[], phev:[], ev:[] };
    if(!CAR_DB){
      REALITY_BY_FUEL = { gasoline:1, diesel:1, hev:1, phev:1, ev:1 };
      return REALITY_BY_FUEL;
    }

    for(const [brand, b] of Object.entries(CAR_DB)){
      const models = b && b.models ? b.models : null;
      if(!models) continue;

      for(const [model, md] of Object.entries(models)){
        // v3: consumos por versión (preferente)
        if(md && Array.isArray(md.versions) && md.versions.length){
          for(const ver of md.versions){
            if(!ver) continue;
            const fuel = motorMap[ver.type] || null;
            if(!fuel) continue;
            const c = ver.consumption || null;
            if(!c) continue;
            const wc = Number(c.city||0);
            const wh = Number(c.highway||0);
            const denom = (wc>0 && wh>0) ? (wc+wh)/2 : (wc>0 ? wc : (wh>0 ? wh : 0));
            const real = Number(c.real||0);
            if(real>0 && denom>0){
              buckets[fuel].push(real/denom);
            }
          }
        }

        // v2/legacy: consumos por modelo/motorización
        const cons = md && md.consumption ? md.consumption : null;
        if(!cons) continue;
        for(const [k, v] of Object.entries(cons)){
          if(!v) continue;
          const fuel = (k==="gasolina") ? "gasoline"
                     : (k==="diesel") ? "diesel"
                     : (k==="hibrido") ? "hev"
                     : (k==="phev") ? "phev"
                     : (k==="ev") ? "ev"
                     : (motorMap[k] || null);
          if(!fuel) continue;

          const wc = Number(v.wltp_city||0);
          const wh = Number(v.wltp_highway||0);
          const denom = (wc>0 && wh>0) ? (wc+wh)/2 : (wc>0 ? wc : (wh>0 ? wh : 0));
          const real = Number(v.real_world||0);
          if(real>0 && denom>0){
            buckets[fuel].push(real/denom);
          }
        }
      }
    }

    REALITY_BY_FUEL = {};
    for(const f of ["gasoline","diesel","hev","phev","ev"]){
      const med = _median(buckets[f]);
      REALITY_BY_FUEL[f] = clamp(med || 1, 0.85, 1.35);
    }
    return REALITY_BY_FUEL;
  }

  function getDBConsumptionEntry(car){
    // v3: consumo por versión
    if(HAS_V3 && car && car.brand && car.model && car.versionKey){
      const v = window.getVersionByKey(car.brand, car.model, car.versionKey);
      const c = v && v.consumption ? v.consumption : null;
      if(c){
        return {
          wltp_city: Number(c.city||0),
          wltp_highway: Number(c.highway||0),
          real_world: Number(c.real||0)
        };
      }
    }

    // legacy: consumo por modelo/motorización
    const d = getModelData(car.brand, car.model);
    if(!d || !d.consumption) return null;
    const key = DB_FUEL_KEY[car.fuel];
    if(!key) return null;
    return d.consumption[key] || null;
  }

  function wltpMixFromEntry(entry, cityPct){
    const sc = clamp(Number(cityPct||0)/100, 0, 1);
    const sr = 1 - sc;
    const c = Number(entry && entry.wltp_city || 0);
    const h = Number(entry && entry.wltp_highway || 0);
    if(c>0 && h>0) return sc*c + sr*h;
    if(c>0) return c;
    if(h>0) return h;
    return null;
  }

  function wltpCombinedEst(entry){
    const c = Number(entry && entry.wltp_city || 0);
    const h = Number(entry && entry.wltp_highway || 0);
    if(c>0 && h>0) return (c+h)/2;
    if(c>0) return c;
    if(h>0) return h;
    return null;
  }

  function performanceTier(brand, model){
    const t = normalize(`${brand||""} ${model||""}`);
    // Evitar falsos positivos de acabados comerciales
    if(t.includes("rs line") || t.includes("s line") || t.includes("r line") || t.includes("r-line") || t.includes("gt line")) return "none";

    // Top tier (muy performance)
    if(/\brs\d\b|\brs\d\d\b|\brs\b/.test(t)) return "top"; // RS2/RS3/RS4/RS5/RS6/RS7/RS e.t.c.
    if(/\bamg\b|\bsvr\b|\bgt3\b|\bgt4\b|\bv8\b|\bv10\b|\bv12\b|\bplaid\b|\bperformance\b/.test(t)) return "top";
    if((/\bm\d\b|\bm3\b|\bm4\b|\bm5\b|\bm6\b/.test(t)) && !t.includes("mhev")) return "top";

    // Mid tier (deportivo pero menos extremo)
    if(/\bcupra\b|\bvz\b|\bnismo\b|\bsti\b|\btype r\b|\bgts\b|\bgt\b|\bsport\b/.test(t)) return "mid";

    return "none";
  }

  function performanceFactorForCar(car){
    const tier = performanceTier(car.brand, car.model);
    let badge = 0;
    if(tier==="top") badge = 0.18;
    else if(tier==="mid") badge = 0.12;

    const txt = normalize(`${car.brand||""} ${car.model||""}`);
    const awd = (/(quattro|xdrive|4matic|4motion|awd|4x4|4wd)/.test(txt)) ? 0.03 : 0;

    const pkw = Number(car.powerKw||0);
    const dp = clamp((pkw-150)/500, 0, 0.12);

    const disp = parseFloat(String(car.engine||"").replace(",","."));
    const dd = (Number.isFinite(disp) && disp>2.0) ? clamp(0.04*(disp-2.0), 0, 0.10) : 0;

    const seg = (car.segment==="deportivo") ? 0.05 : 0;

    // Si el modelo es claramente "top performance" pero el usuario no ha metido potencia/cilindrada,
    // aplicamos un extra conservador para evitar subestimar (caso típico: RS6, AMG, M...)
    let extraUnknown = 0;
    if(tier==="top" && (pkw>0 && pkw<=170) && (!Number.isFinite(disp) || disp<=2.0)) extraUnknown = 0.10;

    let f = 1 + badge + awd + dp + dd + seg + extraUnknown;
    return clamp(f, 1.00, 1.35);
  }


  function energyMonthlyCost(car){
    const kmM = monthlyDistance();
    const cityPct = Number(state.cityPct||0);
    const climF = state.climate.factor;

    // 1) Intentar usar datos reales de la BD (WLTP ciudad/carretera + real_world)
    const entry = getDBConsumptionEntry(car);
    const reality = computeRealityFactors();

    // Helper para aplicar factor realidad
    function realityFactor(entry, fuel){
      const denom = wltpCombinedEst(entry);
      const real = Number(entry && entry.real_world || 0);
      if(real>0 && denom>0){
        return clamp(real/denom, 0.85, 1.35);
      }
      return (reality && reality[fuel]) ? reality[fuel] : 1;
    }

    const perfF = performanceFactorForCar(car);

    // EV: kWh/100
    if(car.fuel === "ev"){
      const price = (state.chargeMode==="home") ? state.priceKwhHome
                  : (state.chargeMode==="work") ? 0
                  : state.priceKwhStreet;

      if(entry){
        const mix = wltpMixFromEntry(entry, cityPct);
        if(mix){
          const fReal = realityFactor(entry, "ev");
          // En EV el clima/temperatura afecta más: aplicamos el factor completo.
          const kwh100 = mix * fReal * perfF * climF;
          const kwhMonth = kmM * (kwh100/100);
          return { type:"electric", src:"db", kwh100, kwhMonth, price, cost:kwhMonth*price };
        }
      }

      // Fallback anterior
      const segF = segmentFactor(car.segment);
      const powF = powerFactor(car.powerKw);
      const cf = cityFactor(state.cityPct);
      const kwh100 = baselineKwhPer100(car.segment) * powF * segF * climF * cf.ev;
      const kwhMonth = kmM * (kwh100/100);
      return { type:"electric", src:"fallback", kwh100, kwhMonth, price, cost:kwhMonth*price };
    }

    // PHEV: mezcla simple (electric_share) + consumo eléctrico de BD si existe
    if(car.fuel === "phev"){
      let elecShare = 0.35;
      if(state.chargeMode==="home") elecShare = 0.55;
      if(state.chargeMode==="work") elecShare = 0.65;
      if(state.chargeMode==="street") elecShare = 0.40;
      elecShare = clamp(elecShare + (state.cityPct-50)*0.002, 0.20, 0.80);

      // Electricidad (kWh/100)
      const kwhPrice = (state.chargeMode==="home") ? state.priceKwhHome
                     : (state.chargeMode==="work") ? 0
                     : state.priceKwhStreet;

      let kwh100 = (baselineKwhPer100(car.segment) * 0.95);
      if(entry && Number(entry.electric_consumption||0)>0){
        kwh100 = Number(entry.electric_consumption||0);
      }
      kwh100 = kwh100 * perfF * climF;

      // Gasolina (L/100) - mantenemos el fallback anterior (no usar WLTP PHEV para no doble contar)
      const segF = segmentFactor(car.segment);
      const powF = powerFactor(car.powerKw);
      const cf = cityFactor(state.cityPct);
      const l100 = baselineLper100("gasoline") * powF * segF * (1 + (climF-1)*0.4) * cf.ice * perfF;

      const kwhMonth = kmM * (kwh100/100) * elecShare;
      const lMonth = kmM * (l100/100) * (1-elecShare);

      const fuelCost = lMonth * state.priceGas;
      const elecCost = kwhMonth * kwhPrice;
      return { type:"phev", src: entry ? "hybrid" : "fallback", cost:fuelCost+elecCost };
    }

    // ICE/HEV: L/100
    if(entry){
      const mix = wltpMixFromEntry(entry, cityPct);
      if(mix){
        const fReal = realityFactor(entry, car.fuel);
        // En ICE el clima afecta, pero menos que en EV (aplicación suave)
        const iceClim = 1 + (climF-1)*0.4;
        const l100 = mix * fReal * perfF * iceClim;
        const lMonth = kmM * (l100/100);
        const price = (car.fuel==="diesel") ? state.priceDiesel : state.priceGas;
        return { type:"fuel", src:"db", l100, lMonth, price, cost:lMonth*price };
      }
    }

    // Fallback anterior
    const segF = segmentFactor(car.segment);
    const powF = powerFactor(car.powerKw);
    const cf = cityFactor(state.cityPct);
    const l100 = baselineLper100(car.fuel) * powF * segF * climF * cf.ice;
    const lMonth = kmM * (l100/100);
    const price = (car.fuel==="diesel") ? state.priceDiesel : state.priceGas;
    return { type:"fuel", src:"fallback", l100, lMonth, price, cost:lMonth*price };
  }

  function insuranceMonthly(car){
    // Estimación orientativa, calibrada para no irse "por arriba" por defecto.
    // No preguntamos siniestros: asumimos 0 con culpa; si el usuario tiene siniestros, el precio real puede subir.
    const base = (state.ageGroup==="18-25") ? 70 : 52;

    const segAdd = (car.segment==="utilitario") ? -5
                 : (car.segment==="berlina") ? 0
                 : (car.segment==="suv") ? 8
                 : 14;

    // Años con carnet: afecta mucho. Si no hay dato válido, usamos 8 años como valor neutro.
    const yrs = (typeof state.licenseYears==="number" && isFinite(state.licenseYears)) ? state.licenseYears : 8;
    let expF = 1.0;
    if(yrs < 2) expF = 1.20;
    else if(yrs < 5) expF = 1.08;
    else if(yrs < 10) expF = 1.00;
    else expF = 0.95;

    // Garaje (efecto suave)
    const garageF = (state.garage==="yes") ? 0.97 : 1.00;

    const premiumBrands = ["BMW","Mercedes-Benz","Audi","Porsche","Lexus","Land Rover","Jaguar","Volvo"];
    const brandF = premiumBrands.includes(car.brand) ? 1.08 : 1.00;

    const fuelF = (car.fuel==="ev") ? 1.03 : (car.fuel==="phev") ? 1.02 : 1.00;

    let coverF = 1.0;
    switch(state.insuranceCover){
      case "third": coverF = 0.78; break;
      case "full": coverF = 1.22; break;
      case "full_excess":
      default: coverF = 1.00; break;
    }

    const price = Number(car.pvpCash||0) || Number(car.priceFinanced||0) || 25000;
    let priceF = 1.0;
    if(price>0){
      // 25k≈1.00 · 50k≈1.12 · 15k≈0.92 (capado)
      priceF = clamp(0.82 + (price/25000)*0.18, 0.88, 1.30);
    }

    // Código postal: ajuste suave (capital vs resto) para no inventar demasiado.
    let zoneF = 1.00;
    const pc = String(state.postalCode||"").replace(/\s/g,"");
    if(/^\d{5}$/.test(pc)){
      const last3 = Number(pc.slice(2));
      zoneF = (last3<=199) ? 1.03 : 0.99;
    }
    zoneF = clamp(zoneF, 0.95, 1.05);

    const rawNormal = (base + segAdd) * expF * garageF * brandF * fuelF * coverF * priceF * zoneF;

    // Default = media entre "barato" y "normal" (sin preguntar): -12% vs normal, promediado.
    const raw = rawNormal * 0.94;

    return Math.max(18, Math.round(raw));
  }

  function maintenanceMonthly(car){
    // Si el usuario ha metido un plan de mantenimiento dentro de la cuota, respetamos ese dato.
    if(car.maintIncludedInQuota==="yes") return Math.max(0, Number(car.maintPlanEurMonth||0));

    // Base mensual por segmento (revisiones + desgaste típico, sin averías graves).
    const segBase = (car.segment==="utilitario") ? 24
                  : (car.segment==="berlina") ? 30
                  : (car.segment==="suv") ? 36
                  : 46;

    const premiumBrands = ["BMW","Mercedes-Benz","Audi","Porsche","Lexus","Land Rover","Jaguar","Volvo"];
    const brandF = premiumBrands.includes(car.brand) ? 1.30 : 1.00;

    // Tecnología: EV suele tener menos mantenimiento programado; PHEV algo más por complejidad.
    const motorF = (car.fuel==="ev") ? 0.70 : (car.fuel==="phev") ? 1.12 : (car.fuel==="hev") ? 1.05 : 1.00;

    // Uso (km/año): desgaste. 10.000 km/año es neutro.
    const kmY = Number(state.kmYear||0) || 0;
    const useF = clamp(1 + ((kmY-10000)/20000)*0.10, 0.90, 1.20);

    // Edad y km actuales (solo si no es "nuevo")
    const nowY = new Date().getFullYear();
    const carYear = Number(car.year||nowY) || nowY;
    const age = clamp(nowY - carYear, 0, 25);
    const kmNow = Number(car.kmNow||0) || 0;

    // Factor por estado
    let ageKmF = 1.00;
    if(car.isNew==="used" || car.isNew==="km0"){
      // A partir de 4 años sube el riesgo de correctivos.
      const ageOver = Math.max(0, age - 4);
      // Escalones por km (60k y 120k suelen marcar saltos de gasto).
      const k1 = Math.max(0, kmNow - 60000);
      const k2 = Math.max(0, kmNow - 120000);
      ageKmF *= (1 + ageOver * 0.035);
      ageKmF *= (1 + (k1/60000) * 0.06);
      ageKmF *= (1 + (k2/60000) * 0.08);
      ageKmF = clamp(ageKmF, 1.00, 1.55);
    }
    let tiresMonthly = 0;
    if(state.includeTires!=="no"){
      // Neumáticos: prorrateo por km (orientativo). Ajusta por segmento/EV/performance.
      const setBase = (car.segment==="utilitario") ? 380
                    : (car.segment==="berlina") ? 460
                    : (car.segment==="suv") ? 560
                    : 650;
      let costF = premiumBrands.includes(car.brand) ? 1.10 : 1.00;
      if(car.fuel==="ev") costF *= 1.08;
      const perf = performanceFactor(car);
      if(perf > 1.15) costF *= 1.10;

      const lifeBase = (car.segment==="suv") ? 32000 : 36000;
      let lifeKm = lifeBase / clamp(perf, 1.0, 1.35);
      if(car.fuel==="ev") lifeKm *= 0.92; // EV suele gastar un poco más
      lifeKm = clamp(lifeKm, 20000, 50000);

      const kmM = kmY / 12;
      tiresMonthly = (setBase * costF) * (kmM / lifeKm);
      tiresMonthly = clamp(tiresMonthly, 0, 32);
    }

    const m = segBase * brandF * motorF * useF * ageKmF + tiresMonthly;
    return Math.max(12, Math.round(m));
  }

  // IVTM (Impuesto de circulación) — estimación realista (sin inventar)
  //
  // Qué hacemos:
  // 1) Si tenemos tarifa municipal exacta (Madrid/Sevilla), usamos esa tabla.
  // 2) Si no, usamos: Tarifa mínima estatal (TRLRHL) × coeficiente de incremento agregado.
  //    - Para régimen común usamos coeficientes agregados por provincia (Hacienda, año 2025).
  //    - Para diputaciones forales (Álava, Bizkaia, Gipuzkoa, Navarra) NO hay dato en ese agregado: devolvemos base estatal.
  // Importante: el resultado fuera de Madrid/Sevilla es una ESTIMACIÓN y por eso devolvemos un rango (min–max).
  // Para prorratear a €/mes en el cálculo total usamos el punto medio del rango.

  const IVTM_BASE_TURISMOS = [
    { max: 8, base: 12.62 },
    { max: 12, base: 34.08 },
    { max: 16, base: 71.94 },
    { max: 20, base: 89.61 },
    { max: Infinity, base: 112.00 }
  ];

  const IVTM_MUNI_EXACT = {
    // Agencia Tributaria Madrid (turismos) + bonificación ambiental desde 01/01/2026
    // Nota: prorrateo por trimestre no se aplica porque no pedimos fecha exacta de matriculación.
    madrid: {
      brackets: [
        { max: 8, annual: 20.00 },
        { max: 12, annual: 59.00 },
        { max: 16, annual: 129.00 },
        { max: 20, annual: 179.00 },
        { max: Infinity, annual: 224.00 }
      ],
      bonus: {
        cero: { pct: 0.75, years: null },
        eco:  { pct: 0.75, years: 6 }
      }
    },
    // Ayuntamiento de Sevilla (turismos) + bonificación 75% durante 5 años para vehículos eléctricos/bimodales/híbridos
    sevilla: {
      brackets: [
        { max: 8, annual: 21.45 },
        { max: 12, annual: 61.00 },
        { max: 16, annual: 130.93 },
        { max: 20, annual: 176.53 },
        { max: Infinity, annual: 220.64 }
      ],
      bonus: {
        ecoLike: { pct: 0.75, years: 5 }
      }
    }
  };

  // Coeficientes agregados (régimen común) — año 2025
  // Fuente: tablas agregadas publicadas por Hacienda (PDFs incluidos en el proyecto).
  const IVTM_PROV_COEF_2025 = {"Albacete":{"tur_min":1.29,"tur_max":1.35},"Alicante":{"tur_min":1.36,"tur_max":1.41},"Almería":{"tur_min":1.22,"tur_max":1.28},"Asturias":{"tur_min":1.43,"tur_max":1.51},"Ávila":{"tur_min":1.03,"tur_max":1.05},"Badajoz":{"tur_min":1.22,"tur_max":1.24},"Barcelona":{"tur_min":1.8,"tur_max":1.83},"Burgos":{"tur_min":1.04,"tur_max":1.05},"Cáceres":{"tur_min":1.1,"tur_max":1.12},"Cádiz":{"tur_min":1.64,"tur_max":1.73},"Cantabria":{"tur_min":1.29,"tur_max":1.32},"Castellón":{"tur_min":1.22,"tur_max":1.25},"Ciudad Real":{"tur_min":1.32,"tur_max":1.4},"Córdoba":{"tur_min":1.46,"tur_max":1.48},"Cuenca":{"tur_min":1.1,"tur_max":1.11},"Girona":{"tur_min":1.59,"tur_max":1.66},"Granada":{"tur_min":1.27,"tur_max":1.32},"Guadalajara":{"tur_min":1.04,"tur_max":1.05},"Huelva":{"tur_min":1.37,"tur_max":1.4},"Huesca":{"tur_min":1.18,"tur_max":1.22},"Illes Balears":{"tur_min":1.51,"tur_max":1.58},"Jaén":{"tur_min":1.49,"tur_max":1.54},"A Coruña":{"tur_min":1.26,"tur_max":1.29},"La Rioja":{"tur_min":1.16,"tur_max":1.21},"Las Palmas":{"tur_min":1.31,"tur_max":1.33},"León":{"tur_min":1.08,"tur_max":1.08},"Lleida":{"tur_min":1.34,"tur_max":1.34},"Lugo":{"tur_min":1.11,"tur_max":1.12},"Madrid":{"tur_min":1.21,"tur_max":1.28},"Málaga":{"tur_min":1.28,"tur_max":1.33},"Murcia":{"tur_min":1.61,"tur_max":1.73},"Ourense":{"tur_min":1.07,"tur_max":1.08},"Palencia":{"tur_min":1.04,"tur_max":1.05},"Pontevedra":{"tur_min":1.24,"tur_max":1.33},"Salamanca":{"tur_min":1.04,"tur_max":1.05},"Santa Cruz de Tenerife":{"tur_min":1.29,"tur_max":1.33},"Segovia":{"tur_min":1.08,"tur_max":1.08},"Sevilla":{"tur_min":1.59,"tur_max":1.68},"Soria":{"tur_min":1.02,"tur_max":1.02},"Tarragona":{"tur_min":1.49,"tur_max":1.53},"Teruel":{"tur_min":1.12,"tur_max":1.17},"Toledo":{"tur_min":1.22,"tur_max":1.25},"Valencia":{"tur_min":1.41,"tur_max":1.48},"Valladolid":{"tur_min":1.13,"tur_max":1.15},"Zamora":{"tur_min":1.03,"tur_max":1.04},"Zaragoza":{"tur_min":1.27,"tur_max":1.35},"Ceuta":{"tur_min":2.0,"tur_max":2.0},"Melilla":{"tur_min":1.0,"tur_max":1.0}};
  const IVTM_CAPITAL_COEF_2025 = {"Albacete":{"tur_min":1.9,"tur_max":1.94},"Alicante":{"tur_min":1.77,"tur_max":1.83},"Almería":{"tur_min":1.83,"tur_max":1.83},"Asturias":{"tur_min":1.82,"tur_max":2.0},"Ávila":{"tur_min":1.64,"tur_max":2.0},"Badajoz":{"tur_min":1.57,"tur_max":1.57},"Barcelona":{"tur_min":2.0,"tur_max":2.0},"Burgos":{"tur_min":1.84,"tur_max":1.84},"Cáceres":{"tur_min":1.51,"tur_max":2.0},"Cádiz":{"tur_min":1.97,"tur_max":1.98},"Cantabria":{"tur_min":1.99,"tur_max":1.99},"Castellón":{"tur_min":1.92,"tur_max":1.92},"Ciudad Real":{"tur_min":2.0,"tur_max":2.0},"Córdoba":{"tur_min":1.67,"tur_max":1.75},"Cuenca":{"tur_min":1.82,"tur_max":2.0},"Girona":{"tur_min":1.97,"tur_max":2.0},"Granada":{"tur_min":2.0,"tur_max":2.0},"Guadalajara":{"tur_min":1.82,"tur_max":1.83},"Huelva":{"tur_min":2.0,"tur_max":2.0},"Huesca":{"tur_min":1.87,"tur_max":1.88},"Illes Balears":{"tur_min":1.87,"tur_max":2.0},"Jaén":{"tur_min":1.4,"tur_max":2.0},"A Coruña":{"tur_min":1.55,"tur_max":2.0},"La Rioja":{"tur_min":1.81,"tur_max":1.81},"Las Palmas":{"tur_min":1.66,"tur_max":1.66},"León":{"tur_min":1.66,"tur_max":1.87},"Lleida":{"tur_min":2.0,"tur_max":2.0},"Lugo":{"tur_min":1.72,"tur_max":2.0},"Madrid":{"tur_min":1.58,"tur_max":2.0},"Málaga":{"tur_min":1.93,"tur_max":1.93},"Murcia":{"tur_min":1.96,"tur_max":2.0},"Ourense":{"tur_min":1.69,"tur_max":1.95},"Palencia":{"tur_min":1.43,"tur_max":1.92},"Pontevedra":{"tur_min":1.61,"tur_max":1.7},"Salamanca":{"tur_min":1.99,"tur_max":2.0},"Santa Cruz de Tenerife":{"tur_min":1.0,"tur_max":1.0},"Segovia":{"tur_min":1.78,"tur_max":1.78},"Sevilla":{"tur_min":1.7,"tur_max":1.97},"Soria":{"tur_min":1.86,"tur_max":1.89},"Tarragona":{"tur_min":2.0,"tur_max":2.0},"Teruel":{"tur_min":1.77,"tur_max":1.77},"Toledo":{"tur_min":1.82,"tur_max":1.99},"Valencia":{"tur_min":1.68,"tur_max":1.96},"Valladolid":{"tur_min":2.0,"tur_max":2.0},"Zamora":{"tur_min":1.08,"tur_max":2.0},"Zaragoza":{"tur_min":1.61,"tur_max":1.8},"Ceuta":{"tur_min":2.0,"tur_max":2.0},"Melilla":{"tur_min":1.0,"tur_max":1.0}};

  // Capitales de provincia (para detectar si el municipio seleccionado es capital)
  const PROVINCE_CAPITALS = {"Álava":"Vitoria-Gasteiz","Albacete":"Albacete","Alicante":"Alicante/Alacant","Almería":"Almería","A Coruña":"A Coruña","Asturias":"Oviedo","Ávila":"Ávila","Badajoz":"Badajoz","Barcelona":"Barcelona","Burgos":"Burgos","Cáceres":"Cáceres","Cádiz":"Cádiz","Cantabria":"Santander","Castellón":"Castellón de la Plana","Ciudad Real":"Ciudad Real","Córdoba":"Córdoba","Cuenca":"Cuenca","Girona":"Girona","Granada":"Granada","Guadalajara":"Guadalajara","Gipuzkoa":"Donostia-San Sebastián","Huelva":"Huelva","Huesca":"Huesca","Illes Balears":"Palma","Jaén":"Jaén","La Rioja":"Logroño","Las Palmas":"Las Palmas de Gran Canaria","León":"León","Lleida":"Lleida","Lugo":"Lugo","Madrid":"Madrid","Málaga":"Málaga","Murcia":"Murcia","Navarra":"Pamplona/Iruña","Ourense":"Ourense","Palencia":"Palencia","Pontevedra":"Pontevedra","Salamanca":"Salamanca","Santa Cruz de Tenerife":"Santa Cruz de Tenerife","Segovia":"Segovia","Sevilla":"Sevilla","Soria":"Soria","Tarragona":"Tarragona","Teruel":"Teruel","Toledo":"Toledo","Valencia":"Valencia/València","Valladolid":"Valladolid","Bizkaia":"Bilbao","Zamora":"Zamora","Zaragoza":"Zaragoza","Ceuta":"Ceuta","Melilla":"Melilla"};

  function normKey(s){
    return String(s||"").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  }

  function isProvincialCapital(province, municipality){
    const cap = PROVINCE_CAPITALS[province];
    if(!cap) return false;
    return normKey(cap) === normKey(municipality);
  }

  function baseQuotaTurismo(cvf){
    const v = Number(cvf||0);
    for(const b of IVTM_BASE_TURISMOS){
      if(v < b.max) return b.base;
    }
    return 112.00;
  }

  function floor2(x){
    const n = Number(x||0);
    if(!Number.isFinite(n)) return 0;
    return Math.floor(n*100)/100;
  }

  function parseEngineLiters(engineStr){
    const s = String(engineStr||"").replace(",",".");
    const m = s.match(/(\d+(?:\.\d+)?)/);
    if(!m) return 0;
    return Number(m[1]||0)||0;
  }

  function inferCylindersFromLiters(liters){
    const L = Number(liters||0);
    if(!Number.isFinite(L) || L<=0) return 0;
    if(L <= 1.2) return 3;
    if(L <= 2.5) return 4;
    if(L <= 3.5) return 6;
    if(L <= 5.5) return 8;
    return 12;
  }

  function estimateCvf(car){
    const fuel = String(car.fuel||"").toLowerCase();

    if(fuel==="ev"){
      const kw = Number(car.peKw||0);
      if(kw>0) return floor2(kw / 5.152);

      const seg = String(car.segment || "").toLowerCase();
      if(seg.includes("peque")) return 8;
      if(seg.includes("suv")) return 16;
      if(seg.includes("deport")) return 20;
      return 12;
    }

    const liters = parseEngineLiters(car.engine || (car.versionMeta && car.versionMeta.displacement) || "");
    const cc = liters>0 ? liters*1000 : 0;
    let cyl = Number(car.cylinders||0);
    if(!cyl) cyl = inferCylindersFromLiters(liters);

    if(cc>0 && cyl>0){
      const cvf = 0.08 * Math.pow(cc / cyl, 0.6) * cyl;
      return floor2(cvf);
    }

    const seg = String(car.segment || "").toLowerCase();
    if(seg.includes("peque")) return 8;
    if(seg.includes("suv")) return 16;
    if(seg.includes("deport")) return 20;
    return 12;
  }

  function yearsSinceRegistration(car){
    const y = Number(car.year||0);
    if(!y || !Number.isFinite(y)) return null;
    const nowY = new Date().getFullYear();
    return Math.max(0, nowY - y);
  }

  
  // Etiqueta DGT (editable): se usa para posibles bonificaciones del IVTM en algunos municipios.
  // Guardamos en minúsculas: "cero", "eco", "c", "b", "sin".
  const DGT_LABEL_OPTIONS = [
    ["cero","CERO"],
    ["eco","ECO"],
    ["c","C"],
    ["b","B"],
    ["sin","Sin distintivo"]
  ];

  function normalizeDgtLabel(v){
    const k = normKey(v);
    if(!k) return "";
    if(k === "cero" || k === "0" || k === "zero") return "cero";
    if(k === "eco") return "eco";
    if(k === "c") return "c";
    if(k === "b") return "b";
    if(k.includes("sin")) return "sin";
    return "";
  }

  function inferDgtLabelAuto(car){
    const fuel = String(car.fuel||"").toLowerCase();

    if(fuel==="ev") return "cero";
    if(fuel==="hev") return "eco";

    // PHEV: sin datos de autonomía eléctrica (≥40 km) no podemos distinguir con fiabilidad entre ECO y CERO.
    // Por defecto usamos ECO (conservador). El usuario puede editarlo si conoce la etiqueta real.
    if(fuel==="phev") return "eco";

    const y = Number(car.year||0);
    const isDiesel = (fuel==="diesel");
    const isGas = (fuel==="gasoline");

    // Si tenemos año, aproximamos.
    if(Number.isFinite(y) && y>1900){
      if(isGas){
        if(y>=2006) return "c";
        if(y>=2001) return "b";
        return "sin";
      }
      if(isDiesel){
        if(y>=2015) return "c";
        if(y>=2006) return "b";
        return "sin";
      }
    }

    return "c";
  }

  function ensureDgtLabel(car, force=false){
    const current = normalizeDgtLabel(car.dgtLabel);
    if(force || !current || !car.dgtLabelManual){
      car.dgtLabel = inferDgtLabelAuto(car);
      car.dgtLabelManual = false;
    } else {
      car.dgtLabel = current;
    }
  }

  function dgtLabelForBonus(car){
    const v = normalizeDgtLabel(car.dgtLabel);
    return v || inferDgtLabelAuto(car);
  }

  function ivtmAnnualExact(muniKey, cvf, car){
    const data = IVTM_MUNI_EXACT[muniKey];
    if(!data) return null;

    let annual = 0;
    for(const b of data.brackets){
      if(Number(cvf||0) < b.max){ annual = b.annual; break; }
    }

    let bonusPct = 0;
    const label = dgtLabelForBonus(car);
    const ys = yearsSinceRegistration(car);

    if(muniKey==="madrid"){
      if(label==="cero") bonusPct = data.bonus.cero.pct;
      if(label==="eco"){
        if(ys===null) bonusPct = data.bonus.eco.pct;
        else if(ys < data.bonus.eco.years) bonusPct = data.bonus.eco.pct;
      }
    }

    if(muniKey==="sevilla"){
      if(label==="cero" || label==="eco"){
        if(ys===null) bonusPct = data.bonus.ecoLike.pct;
        else if(ys < data.bonus.ecoLike.years) bonusPct = data.bonus.ecoLike.pct;
      }
    }

    const annualAfter = annual * (1 - bonusPct);
    return { annual: annualAfter, annualRaw: annual, bonusPct, method: muniKey };
  }

  function ivtmAnnualEstimateRange(province, municipality, cvf){
    const isCap = isProvincialCapital(province, municipality);
    const coefObj = isCap ? IVTM_CAPITAL_COEF_2025[province] : IVTM_PROV_COEF_2025[province];

    if(!coefObj){
      const base = baseQuotaTurismo(cvf);
      return {
        annualMin: base,
        annualMax: base,
        annualMid: base,
        coefMin: 1,
        coefMax: 1,
        method: "base_only"
      };
    }

    const base = baseQuotaTurismo(cvf);
    const annualMin = base * coefObj.tur_min;
    const annualMax = base * coefObj.tur_max;
    const annualMid = (annualMin + annualMax) / 2;

    return {
      annualMin, annualMax, annualMid,
      coefMin: coefObj.tur_min,
      coefMax: coefObj.tur_max,
      method: isCap ? "coef_capital_2025" : "coef_prov_2025"
    };
  }



function circulationTaxMonthly(car){
  // Provincia = state.city (paso "Provincia"), Municipio = state.ivtmMunicipalityName.
  const province = state.city || "";
  const municipality = state.ivtmMunicipalityName || "";
  const cvfEst = estimateCvf(car);

  // 1) Tarifas exactas conocidas
  const muniNorm = normKey(municipality);
  const muniKey = (muniNorm === "madrid") ? "madrid" : (muniNorm === "sevilla" ? "sevilla" : null);
  if(muniKey){
    const ex = ivtmAnnualExact(muniKey, cvfEst, car);
    if(ex){
      car._ivtmMeta = {
        cvf: cvfEst,
        province,
        municipality,
        annual: ex.annual,
        annualRaw: ex.annualRaw,
        annualMin: ex.annual,
        annualMax: ex.annual,
        annualMid: ex.annual,
        bonusPct: ex.bonusPct||0,
        method: ex.method || muniKey
      };
      return ex.annual / 12;
    }
  }

  // 2) Estimación por coeficientes agregados (régimen común 2025)
  const range = ivtmAnnualEstimateRange(province, municipality, cvfEst);
  car._ivtmMeta = {
    cvf: cvfEst,
    province,
    municipality,
    annual: range.annualMid,
    annualMin: range.annualMin,
    annualMax: range.annualMax,
    annualMid: range.annualMid,
    coefMin: range.coefMin,
    coefMax: range.coefMax,
    method: range.method,
    bonusPct: 0
  };
  return range.annualMid / 12;
}


function incomeTierToIrpf(tier){
    switch(tier){
      case "low": return 0.10;
      case "mid": return 0.15;
      case "high": return 0.20;
      default: return 0.15;
    }
  }

  
  function autoPlusPvpConIva(car){
    const pvp = Number(car.pvpCash||0) || 0;
    if(pvp>0) return pvp;
    const pf = Number(car.priceFinanced||0) || 0;
    return pf>0 ? pf : 0;
  }


  function autoPlusPriceBonus(car, band){
    const fuel = String(car.fuel||"").toLowerCase();
    const baseMotor = (fuel==="phev") ? 1125 : 2250;
    const scale = baseMotor / 2250;
    const raw = (band==="A") ? 1125 : (band==="B") ? 675 : 0;
    return Math.round(raw * scale);
  }

  function autoPlusUpdateFromPrice(car){
    const pvpVat = autoPlusPvpConIva(car);
    car.auto.pvpVat = pvpVat;
    if(!pvpVat || pvpVat<=0){
      car.auto.baseImponible = 0;
      car.auto.eligible = true;
      car.auto.band = "needPrice";
      car.auto.pricePct = 0;
      car.auto.priceBonus = 0;
      return;
    }

    const bi = pvpVat / 1.21;
    car.auto.baseImponible = bi;

    if(bi > 45000){
      car.auto.eligible = false;
      car.auto.band = "over45";
      car.auto.pricePct = 0;
      car.auto.priceBonus = 0;
    } else if(bi >= 35000){
      car.auto.eligible = true;
      car.auto.band = "B";
      car.auto.pricePct = 0.15;
      car.auto.priceBonus = autoPlusPriceBonus(car, "B");
    } else {
      car.auto.eligible = true;
      car.auto.band = "A";
      car.auto.pricePct = 0.25;
      car.auto.priceBonus = autoPlusPriceBonus(car, "A");
    }
  }

function computeAutoPlus(car){
  const enabled = (car.fuel==="ev" || car.fuel==="phev");
  car.auto.enabled = enabled;

  // Si no aplica (no EV/PHEV)
  if(!enabled){
    car.auto.helpTotal = 0;
    car.auto.irpfImpact = 0;
    car.auto.base = 0;
    car.auto.baseAuto = 0;
    car.auto.baseUserOn = false;
    return {help:0, irpf:0, net:0};
  }

  // Simplificación: eliminamos "ayuda pública manual" y mantenemos estimación automática
  car.auto.mode = "auto";

  // Sincroniza precio/eligibilidad
  autoPlusUpdateFromPrice(car);

  // Si no hay precio aún o no es elegible, no aplicamos ayuda
  if(!car.auto.eligible || car.auto.band==="needPrice"){
    car.auto.helpTotal = 0;
    car.auto.irpfImpact = 0;

    // Base automática (sin bonus de tramo si no hay PVP); si no es elegible, base=0 y no se puede sobre-editar.
    const baseMotor = (car.fuel==="phev") ? 1125 : 2250;
    const extraMade = (car.auto.madeEU==="yes") ? 675 : 0;
    const extraBat  = (car.auto.batteryEU==="yes") ? 450 : 0;
    const bonusTramo = Math.max(0, Number(car.auto.priceBonus||0) || 0);
    const baseAuto = (!car.auto.eligible) ? 0 : (baseMotor + bonusTramo + extraMade + extraBat);

    car.auto.baseAuto = baseAuto;

    if(!car.auto.eligible){
      car.auto.base = 0;
      car.auto.baseUserOn = false;
      car.auto.baseUser = 0;
    } else {
      const overrideOn = !!car.auto.baseUserOn;
      const overrideVal = Math.max(0, Number(car.auto.baseUser||0) || 0);
      car.auto.base = overrideOn ? overrideVal : baseAuto;
    }

    return {help:0, irpf:0, net:0};
  }

  // Ayuda base (según motorización) + extra por tramo de precio + criterios extra opcionales
  const baseMotor = (car.fuel==="phev") ? 1125 : 2250;
  const bonusTramo = Math.max(0, Number(car.auto.priceBonus||0) || 0);
  const extraMade = (car.auto.madeEU==="yes") ? 675 : 0;
  const extraBat  = (car.auto.batteryEU==="yes") ? 450 : 0;
  const baseAuto = baseMotor + bonusTramo + extraMade + extraBat;

  // Guardamos para UI: "Base Auto+" automática
  car.auto.baseAuto = baseAuto;

  // Base Auto+ sobre-editable por el usuario (si lo desea)
  const overrideOn = !!car.auto.baseUserOn;
  const overrideVal = Math.max(0, Number(car.auto.baseUser||0) || 0);
  const baseHelp = overrideOn ? overrideVal : baseAuto;
  car.auto.base = baseHelp;

  // Ayuda pública estimada (se usa la base Auto+ final)
  const govHelp = baseHelp;

  // Descuento mínimo punto de venta (fijo en este flujo)
  const dealer = (car.auto.dealerBonus==="yes") ? 1000 : 0;

  const help = Math.max(0, govHelp + dealer);

  // IRPF: aproximamos que el descuento del concesionario no tributa como ayuda
  const taxable = Math.max(0, help - dealer);
  const pct = clamp(Number(state.irpfPct ?? car.auto.irpfPct ?? 0.15), 0, 0.50);
  car.auto.irpfPct = pct;
  const irpf = taxable * pct;

  car.auto.helpTotal = help;
  car.auto.irpfImpact = irpf;
  return {help, irpf, net: Math.max(0, help - irpf)};
}


function residualEstimate(car){
    // Estimación orientativa del valor de reventa al final del plazo.
    // Mejoras:
    // - Usa edad y km actuales si es ocasión.
    // - Aplica una curva por tecnología (ICE/HEV/PHEV/EV) y un ajuste suave por segmento.
    // - Si es usado, calcula la caída desde el estado actual al final del plazo (no desde 0).
    const pvp = Number(car.pvpCash||0) || Number(car.priceFinanced||0) || 0;
    if(pvp<=0) return 0;

    const horizonY = Math.max(1, Number(normalizeTermMonths(state.termMonths))/12);
    const nowY = new Date().getFullYear();
    const carYear = Number(car.year||nowY) || nowY;
    const ageNow = clamp(nowY - carYear, 0, 30);

    const kmY = Number(state.kmYear||0) || 0;
    const kmNow = (car.isNew==="used" || car.isNew==="km0") ? (Number(car.kmNow||0)||0) : 0;

    const ageEnd = ageNow + horizonY;
    const kmEnd  = kmNow + kmY * horizonY;

    const tech = String(car.fuel||"").toLowerCase();

    // Ajuste suave por segmento (sin inventar demasiado)
    const segF = (car.segment==="utilitario") ? 1.00 : (car.segment==="berlina") ? 0.99 : (car.segment==="suv") ? 1.01 : 0.97;

    // Ajuste suave por marca (usa la tabla interna de depreciación)
    let brandF = 1.00;
    try{
      const dep = getBrandDepreciation(car.brand);
      if(dep.level==="low") brandF = 1.02;
      else if(dep.level==="high") brandF = 0.97;
    }catch(e){}

    function ageFrac(age){
      age = clamp(Number(age||0), 0, 30);
      const y1 = Math.min(1, age);
      const y2 = Math.min(3, Math.max(0, age-1));
      const y3 = Math.min(6, Math.max(0, age-4));
      const y4 = Math.max(0, age-10);

      // Retención por año (multiplicadores). Ej: 0.82 significa que tras 1 año queda ~82%.
      let r1=0.82, r2=0.90, r3=0.94, r4=0.96;
      if(tech==="ev"){ r1=0.80; r2=0.88; r3=0.93; r4=0.96; }
      else if(tech==="phev"){ r1=0.79; r2=0.89; r3=0.93; r4=0.96; }
      else if(tech==="hev"){ r1=0.83; r2=0.90; r3=0.94; r4=0.96; }

      let f = 1.00;
      f *= Math.pow(r1, y1);
      f *= Math.pow(r2, y2);
      f *= Math.pow(r3, y3);
      f *= Math.pow(r4, y4);
      return clamp(f, 0.08, 0.95);
    }

    function valueFrac(age, km){
      let f = ageFrac(age);
      // Penalización por km vs esperado (15.000 km/año). Suave.
      const expKm = Math.max(0, Number(age||0)) * 15000;
      const delta = (Number(km||0) || 0) - expKm;
      let kmF = 1.00;
      if(delta > 0) kmF = 1 - (delta/10000)*0.015;
      else kmF = 1 - (delta/10000)*0.005; // si hace menos km, mejora un poco
      kmF = clamp(kmF, 0.70, 1.08);
      f *= kmF;
      f *= segF;
      f *= brandF;
      return clamp(f, 0.08, 0.92);
    }

    const curF = valueFrac(ageNow, kmNow);
    const endF = valueFrac(ageEnd, kmEnd);

    // Ratio desde el estado actual al final del plazo.
    let ratio = (curF>0) ? (endF/curF) : endF;
    ratio = clamp(ratio, 0.25, 0.90);

        const channel = String(state.resaleChannel||"tradein").toLowerCase();
    const channelF = (channel==="private") ? 1.03 : 0.94;

    let res = Math.round(pvp * ratio * channelF);
    // Clamps finales por seguridad
    res = clamp(res, Math.round(pvp*0.10), Math.round(pvp*0.85));
    return res;
  }

  function expectedPaymentFromTIN(principal, months, tin, balloon){
    principal = Number(principal||0);
    months = Number(months||0);
    tin = Number(tin||0);
    balloon = Number(balloon||0);
    if(principal<=0 || months<=0 || tin<=0) return null;
    const r = (tin/100)/12;
    const denom = 1 - Math.pow(1+r, -months);
    if(denom<=0) return null;

    if(balloon>0){
      // Préstamo con valor final (balloon/GMV): se amortiza principal excepto el valor final, que queda pendiente.
      const pvBalloon = balloon/Math.pow(1+r, months);
      const adj = principal - pvBalloon;
      if(adj<=0) return null;
      return adj * (r/denom);
    }
    return principal * (r/denom);
  }
  function autoPlusDealerEligibleForFinance(car){
    const fuel = String(car.fuel||"").toLowerCase();
    if(!(fuel==="ev" || fuel==="phev")) return false;
    const pvp = Number(car.pvpCash||0) || Number(car.pvpCashOrient||0) || 0;
    if(!(pvp>0)) return false;
    const bi = pvp / 1.21;
    return (bi <= 45000);
  }

  function autoPlusDealerDiscountForFinance(car){
    if(!autoPlusDealerEligibleForFinance(car)) return 0;
    return (car.autoPlusDealerAlreadyIncluded==="yes") ? 0 : 1000;
  }



  
  // Auto+ (financiación): ayuda pública (sin descuento punto de venta).
  // Devuelve la ayuda pública estimada (sin IRPF) si aplica (EV/PHEV y ≤45.000€ sin IVA).
  function autoPlusGovHelpForFinance(car){
    try{ computeAutoPlus(car); }catch(e){}
    const fuel = String(car.fuel||"").toLowerCase();
    if(!(fuel==="ev" || fuel==="phev")) return 0;
    if(!car.auto || !car.auto.eligible) return 0;
    const band = String(car.auto.band||"");
    if(band==="needPrice" || band==="over45") return 0;
    const base = Number(car.auto.base||0) || 0;
    return Math.max(0, base);
  }


  function financeMonthlyCost(car, opts){
  opts = opts || {};
  let useOffer = (opts.useOffer !== false); // por defecto: si hay cuota ofrecida, la usamos
  const applyGovToFinance = (car.autoPlusApplyGovToFinance === "yes");
  // Si aplicas la ayuda a la financiación, recalculamos con TIN (la cuota ofrecida ya no sería comparable).
  if(applyGovToFinance && useOffer){ useOffer = false; }
  const months = Number(normalizeTermMonths(state.termMonths));
  const payMonths = (()=>{
    const n = Number(car.installments||0);
    if(Number.isFinite(n) && n>0) return Math.min(months, Math.max(1, Math.round(n)));
    return months;
  })();
  const pvpCash = Number(car.pvpCash||0) || 0;

  // Pago al contado
  if(car.financeEnabled!=="yes"){
    // Un coste mensual equivalente para comparar en el mismo plazo
    const totalPaid = pvpCash;
    return {
      mode:"cash",
      basePrice: pvpCash,
      down: 0,
      disc: 0,
      financedBase: pvpCash,
      openFee: 0,
      principal: pvpCash,
      months,
      payMonths: months,
      loanMonthly: totalPaid/months,
      insuranceInQuota: 0,
      maintInQuota: 0,
      totalPaid,
      tae: null,
      expectedMonthlyByTIN: null,
      expectedBaseByTIN: null,
      diff: 0
    };
  }

  
  // Financiación:
  // Precio usado por FairCar = PVP − descuento por financiar − descuento Auto+ (punto de venta) si aplica.
  let basePrice = 0;
  let dealerDisc = 0;
  const discRaw = Number(car.financeDiscount||0) || 0;
  const pfRaw = Number(car.priceFinanced||0) || 0;

  if(pvpCash>0){
    const discClamped = clamp(discRaw, 0, pvpCash);

    // Descuento Auto+ del punto de venta (solo EV/PHEV elegibles por precio).
    dealerDisc = autoPlusDealerDiscountForFinance(car);

    basePrice = Math.max(0, pvpCash - discClamped - dealerDisc);

    // Mantén el descuento por financiar del usuario (clamp de seguridad).
    car.financeDiscount = discClamped;

    // Precio si financias (usado por FairCar)
    car.priceFinanced = basePrice;
  } else {
    basePrice = pfRaw || 0;
    car.financeDiscount = Math.max(0, discRaw);
    dealerDisc = 0;
  }

  const disc = Number(car.financeDiscount||0) || 0;
const down = Number(car.downPayment||0)||0;

// Auto+ (financiación): ayuda pública estimada (sin IRPF) y aplicación opcional a la financiación
const govHelpAvail = autoPlusGovHelpForFinance(car);
const govHelpApplied = (applyGovToFinance && govHelpAvail>0)
  ? Math.min(govHelpAvail, Math.max(0, basePrice - down))
  : 0;

// Total financiado base (precio - entrada - ayuda aplicada)
const financedBaseCar = Math.max(0, basePrice - down - govHelpApplied);

// Seguros incluidos en la oferta (2 modos):
// - "financed": prima única financiada -> se suma al capital y genera intereses
// - "monthly": pago mensual dentro de la cuota -> se trata como extra mensual (no suma capital)
const hasInsInLoan = (car.hasLifeInLoan === "yes") || (car.insInPayment === "yes");
const insMode = (car.insMode === "financed" || car.insMode === "monthly") ? car.insMode : "monthly";

const insFinancedTotal = (hasInsInLoan && insMode === "financed") ? (Number(car.insFinancedTotal||0)||0) : 0;

// Capital sobre el que se calcula la apertura (caso real VWFS/Skoda: apertura sobre el crédito total, incluyendo seguros financiados)
const financedBase = financedBaseCar + insFinancedTotal;

// Comisión apertura financiada (se suma al total financiado)
const openOn = (car.hasOpenFee === "yes");
const openPct = openOn ? (Number(car.openFeePct||0) || 0) : 0;
const openFee = financedBase * (openPct/100);
const principal = financedBase + openFee;

  // Cuota esperada por TIN (solo préstamo) + extras (si aplican)
  const balloon = (car.financeMode==="flex") ? Math.max(0, Number(car.flexGmv||0)) : 0;

  const expectedBaseByTIN = expectedPaymentFromTIN(principal, payMonths, Number(car.tin||0), balloon);
// Seguros: pago mensual dentro de la cuota (solo si has indicado ese modo)
const lifeMonthlyRaw = Number(car.lifeInsMonthly||0)||0;
const insuranceInQuota = (hasInsInLoan && insMode === "monthly") ? lifeMonthlyRaw : 0;
  const insuranceOutMonthly = 0;
  const maintInQuota = (car.maintIncludedInQuota==="yes") ? (Number(car.maintPlanEurMonth||0)||0) : 0;
  const expectedMonthlyByTIN = expectedBaseByTIN ? (expectedBaseByTIN + insuranceInQuota + maintInQuota) : null;

  // Cuota ofrecida por concesionario (si la tienes). Si no, usamos la calculada.
  const offered = Number(car.monthlyPayment||0)||0;
  const loanMonthly = (useOffer && offered>0) ? offered : (expectedMonthlyByTIN || 0);

  // Coste total pagado durante el plazo: cuotas + entrada (+ valor final si te quedas el coche en flexible).
  // (La apertura ya está dentro del principal, por tanto dentro de la cuota.)
  const flexKeep = (car.financeMode==="flex" && balloon>0 && car.flexEnd==="keep");
  const balloonPaid = flexKeep ? balloon : 0;
  const totalPaid = loanMonthly*payMonths + down + insuranceOutMonthly*payMonths + balloonPaid;

  // TAE real estimada con la cuota (y total financiado real)
  const creditMonthly = Math.max(0, loanMonthly - insuranceInQuota - maintInQuota);
  const tae = creditMonthly>0 ? estimateTAE(financedBase, payMonths, creditMonthly, balloon) : null;

  // Diferencia cuota vs cuota esperada por TIN (incl. seguro si aplica)
  const diff = (expectedMonthlyByTIN && loanMonthly) ? (loanMonthly - expectedMonthlyByTIN) : 0;

  return {
    mode:"finance",
    basePrice, down, disc, dealerDisc, govHelpAvail, govHelpApplied,
    financedBase, openFee, principal,
    months,
    payMonths,
    loanMonthly,
    insuranceInQuota,
    insuranceOutMonthly,
    maintInQuota,
    totalPaid, tae,
    balloon,
    flexKeep,
    balloonPaid,
    creditMonthly,
    expectedMonthlyByTIN, expectedBaseByTIN,
    diff
  };
}


  function computeMonthlyReal(car, ctx){
    ctx = ctx || {};
    const fin = financeMonthlyCost(car);
    const energy = energyMonthlyCost(car);
    const ins = insuranceMonthly(car);
    const maint = maintenanceMonthly(car);
    const tax = circulationTaxMonthly(car);
    const auto = computeAutoPlus(car);
    const dealer = (car.auto && car.auto.dealerBonus==="yes") ? 1000 : 0;
    const govHelpGross = Math.max(0, (auto.help||0) - dealer); // ayuda pública bruta (sin IRPF)
    const netHelp = Math.max(0, (auto.net||0) - dealer);       // ayuda pública neta (después IRPF)
    const applyGovToFinance = (car.autoPlusApplyGovToFinance === "yes" && govHelpGross>0);
    const residualEst = residualEstimate(car);
    car.residualEstimate = residualEst;

    // Financiación flexible (con valor final): puede ser devolución o quedártelo.
    const isFlex = (car.financeMode==="flex" && Number(car.flexGmv||0)>0);
    const flexKeep = isFlex && (car.flexEnd==="keep");

    const forceCompareResidual = !!ctx.forceResidualEstimate;
    const forcedValue = (ctx.forceResidualValue!==undefined && ctx.forceResidualValue!==null) ? Number(ctx.forceResidualValue||0) : null;

    // Valor de reventa: solo aplica si NO devuelves el coche (lineal o flexible si te lo quedas).
    const useResidual = (forceCompareResidual || (state.includeResidual==="yes")) && (!isFlex || flexKeep);

    let residual = 0;
    let residualReason = "none";
    if(useResidual){
      if(forcedValue!==null && Number.isFinite(forcedValue)){
        residual = Math.max(0, forcedValue);
        residualReason = ctx.residualReason || "forced";
      } else if(forceCompareResidual){
        residual = Math.max(0, residualEst);
        residualReason = "compare_est";
      } else if(car.residualUseUser==="yes"){
        residual = Math.max(0, Number(car.residualUser||0));
        residualReason = "user";
      } else {
        residual = Math.max(0, residualEst);
        residualReason = "est";
      }
    }

    const maintInQuota = Number(fin.maintInQuota||0)||0;
    const purchasePaid = fin.totalPaid - maintInQuota*(fin.payMonths||fin.months);
    const totalNetCost = applyGovToFinance
      ? (purchasePaid - residual + (auto.irpf||0))
      : (purchasePaid - netHelp - residual);
    const monthlyFinanceNet = totalNetCost / fin.months;
    const monthlyReal = monthlyFinanceNet + energy.cost + ins + maint + tax;

    return {
      monthlyReal,
      pieces: {
        financeMonthly: monthlyFinanceNet,
        energyMonthly: energy.cost,
        insuranceMonthly: ins,
        maintenanceMonthly: maint,
        taxMonthly: tax,
        netHelpTotal: applyGovToFinance ? 0 : netHelp,
        irpfImpact: auto.irpf,
        helpTotal: auto.help,
        residual
      },
      meta: { fin, energy, auto, residualEst, usedResidual: useResidual, residualReason }
    };
  }

  let stepIndex = 0;

  
  // ----------------------------
  // Perfil guardado (localStorage)
  // ----------------------------
  const PROFILE_KEY = "faircar:savedProfile:v1";

  // ----------------------------
  // IRPF guardado (para Auto+)
  // ----------------------------
  const SAVED_IRPF_KEY = "faircar:savedIrpfPct:v1";

  function getSavedIrpfPct(){
    try{
      const raw = localStorage.getItem(SAVED_IRPF_KEY);
      if(!raw) return null;
      const v = Number(JSON.parse(raw));
      if(!isFinite(v)) return null;
      return clamp(v, 0, 0.50);
    }catch(e){
      return null;
    }
  }

  function saveIrpfPct(pct){
    try{
      const v = clamp(Number(pct), 0, 0.50);
      localStorage.setItem(SAVED_IRPF_KEY, JSON.stringify(v));
      return true;
    }catch(e){
      return false;
    }
  }

  // ----------------------------
  // Coches guardados & comparativas (localStorage)
  // ----------------------------
  const SAVED_CARS_KEY = "faircar:savedCars:v1"; // máx 12
  const SAVED_COMPS_KEY = "faircar:savedComparisons:v1";

  // ----------------------------
  // Solicitudes de servicio (localStorage)
  // ----------------------------
  const SERVICE_CASES_KEY = "faircar:serviceCases:v1"; // máx 30

  function newCaseId(prefix){
    return `${prefix||"case"}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
  }

  function getServiceCases(){
    const arr = readLSArray(SERVICE_CASES_KEY);
    return arr.filter(x=>x && typeof x==="object" && x.id && x.type);
  }

  function upsertServiceCase(item){
    try{
      const arr = readLSArray(SERVICE_CASES_KEY);
      const id = String(item?.id||"");
      if(!id) return false;
      const idx = arr.findIndex(x=>x && x.id===id);
      if(idx>=0) arr[idx] = item;
      else arr.unshift(item);
      if(arr.length>30) arr.length = 30;
      return writeLSArray(SERVICE_CASES_KEY, arr);
    }catch(e){
      return false;
    }
  }

  function readLSArray(key){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    }catch(e){
      return [];
    }
  }

  function writeLSArray(key, arr){
    try{
      localStorage.setItem(key, JSON.stringify(arr||[]));
      return true;
    }catch(e){
      return false;
    }
  }

  function getSavedCars(){
    const arr = readLSArray(SAVED_CARS_KEY);
    // normalizar
    return arr.filter(x=>x && typeof x==="object" && x.id && x.car);
  }

  function makeCarStorageKey(car){
    const b = String(car?.brand||"").trim();
    const m = String(car?.model||"").trim();
    const v = String(car?.versionKey||"").trim();
    const f = String(car?.fuel||"").trim();
    return [b,m,v,f].join("|");
  }

  function pruneCarForStorage(car){
  if(!car) return null;
  // Guardar TODO lo que el usuario haya rellenado (sin metadatos transitorios)
  try{
    const copy = JSON.parse(JSON.stringify(car));
    if(copy && typeof copy === "object"){
      // No guardamos versionMeta (se rehidrata por versionKey)
      copy.versionMeta = null;
      if(copy.ui) delete copy.ui;
    }
    return copy;
  }catch(e){
    return null;
  }
}

  function hydrateCarFromStorage(savedCar, letter){
    const base = makeEmptyCar(letter);
    const pruned = (savedCar && savedCar.car) ? savedCar.car : savedCar;
    if(!pruned || typeof pruned!=="object") return base;
    // merge superficial
    Object.assign(base, pruned);
    // auto: merge conservando defaults
    base.auto = Object.assign(makeEmptyCar(letter).auto, (pruned.auto||{}));
    // restaurar versionMeta si existe key
    try{
      if(base.versionKey && typeof window.getVersionByKey==="function"){
        base.versionMeta = window.getVersionByKey(base.versionKey) || null;
      }
    }catch(e){ /* ignore */ }
    base.letter = letter;
    return base;
  }

  function saveCarToStorage(car){
    const pruned = pruneCarForStorage(car);
    if(!pruned || !(pruned.brand && pruned.model)) return false;
    const list = getSavedCars();
    const key = makeCarStorageKey(pruned);

    // dedupe: si ya existe, lo subimos arriba
    const idx = list.findIndex(x=>x && x.key===key);
    if(idx>=0){
      const existing = list.splice(idx,1)[0];
      existing.car = pruned;
      existing.updatedAt = Date.now();
      list.unshift(existing);
    }else{
      list.unshift({
        id: "car_"+Date.now()+"_"+Math.random().toString(16).slice(2,8),
        key,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        car: pruned
      });
    }

    // cap a 12
    while(list.length>12) list.pop();
    return writeLSArray(SAVED_CARS_KEY, list);
  }

  function deleteSavedCar(id){
    const list = getSavedCars().filter(x=>x.id!==id);
    return writeLSArray(SAVED_CARS_KEY, list);
  }

  function prettySavedCarLine(c){
    if(!c) return "";
    const parts = [];
    // Si hay versión, intentamos resolver nombre
    if(c.versionKey && typeof window.getVersionByKey==="function"){
      try{
        const v = window.getVersionByKey(c.versionKey);
        if(v && v.name) parts.push(v.name);
      }catch(e){/* ignore */}
    }
    if(!parts.length){
      if(c.fuel) parts.push(fuelLabel(c.fuel));
      if(c.engine) parts.push(c.engine);
      if(c.batteryKwh) parts.push(`${Number(c.batteryKwh).toFixed(0)} kWh`);
      if(c.powerKw) parts.push(`${Number(c.powerKw).toFixed(0)} kW`);
    }
    return parts.filter(Boolean).join(" · ");
  }

  function renderSavedCarsPicker({ onUse, onDelete } = {}){
    const items = getSavedCars();
    if(!items.length) return null;
    const box = document.createElement("div");
    box.className = "card";
    box.style.marginTop = "12px";
    box.innerHTML = `
      <div class="section-title">Mis coches guardados</div>
      <div class="smallmuted">Acceso rápido (máximo 12). Se guardan solo en este navegador.</div>
      <div id="savedCarsList" style="margin-top:10px;display:flex;flex-direction:column;gap:10px"></div>
    `;

    const list = box.querySelector("#savedCarsList");
    items.forEach(item=>{
      const c = item.car || {};
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.gap = "10px";
      row.style.alignItems = "center";
      row.style.border = "1px solid var(--line)";
      row.style.borderRadius = "14px";
      row.style.padding = "10px";
      row.innerHTML = `
        <div style="min-width:0">
          <div style="font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(((c.brand||"")+" "+(c.model||"")).trim() || "Coche")}</div>
          <div class="smallmuted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(prettySavedCarLine(c) || "—")}</div>
        </div>
        <div style="display:flex;gap:8px;flex:0 0 auto;align-items:center">
          <button class="btn" type="button" data-use="${esc(item.id)}">Usar</button>
          <button class="btn ghost" type="button" data-del="${esc(item.id)}">Borrar</button>
        </div>
      `;
      list.appendChild(row);
    });

    box.addEventListener("click", (ev)=>{
      const t = ev.target;
      if(!(t instanceof HTMLElement)) return;
      const useId = t.getAttribute("data-use");
      const delId = t.getAttribute("data-del");
      if(useId){
        const item = items.find(x=>x.id===useId);
        if(item) onUse && onUse(item);
      }
      if(delId){
        const ok = deleteSavedCar(delId);
        toast(ok ? "Coche borrado" : "No se pudo borrar (bloqueado por el navegador)");
        onDelete && onDelete(delId);
      }
    });

    return box;
  }

  function getSavedComparisons(){
    const arr = readLSArray(SAVED_COMPS_KEY);
    return arr.filter(x=>x && typeof x==="object" && x.id && x.cars);
  }

  function saveComparisonToStorage(payload){
    if(!payload || !payload.cars || !payload.results) return false;
    const list = getSavedComparisons();
    const id = "cmp_"+Date.now()+"_"+Math.random().toString(16).slice(2,8);
    const item = {
      id,
      createdAt: Date.now(),
      months: Number(payload.months||0)||0,
      better: payload.better||"A",
      deltaMonthly: Number(payload.deltaMonthly||0)||0,
      // schema preparado para 1..4 coches
      cars: [
        pruneCarForStorage(payload.cars.A),
        pruneCarForStorage(payload.cars.B)
      ].filter(Boolean),
      results: {
        A: { monthlyReal: Number(payload.results.A?.monthlyReal||0)||0 },
        B: { monthlyReal: Number(payload.results.B?.monthlyReal||0)||0 }
      }
    };
    list.unshift(item);
    // cap razonable (historial): 30
    while(list.length>30) list.pop();
    return writeLSArray(SAVED_COMPS_KEY, list);
  }

  function getSavedProfile(){
    try{
      const raw = localStorage.getItem(PROFILE_KEY);
      if(!raw) return null;
      const obj = JSON.parse(raw);
      if(!obj || typeof obj !== "object") return null;
      return obj;
    }catch(e){
      return null;
    }
  }

  function extractProfileFromState(){
    return {
      kmYear: state.kmYear,
      cityPct: state.cityPct,
      chargeMode: state.chargeMode,
      priceGas: state.priceGas,
      priceDiesel: state.priceDiesel,
      priceKwhHome: state.priceKwhHome,
      priceKwhStreet: state.priceKwhStreet,
      city: state.city,
      ivtmMunicipalityName: state.ivtmMunicipalityName,
      climate: state.climate,
      ageGroup: state.ageGroup,
      licenseYears: state.licenseYears,
      postalCode: state.postalCode,
      novice: state.novice,
      garage: state.garage,
      insuranceCover: state.insuranceCover,
      includeTires: state.includeTires
    };
  }

  function applyProfileToState(p){
    if(!p) return;
    const safeNum = (v, fallback)=> (typeof v==="number" && isFinite(v)) ? v : fallback;
    const safeStr = (v, fallback)=> (typeof v==="string" && v.trim()) ? v : fallback;
    const safeBool = (v, fallback)=> (typeof v==="boolean") ? v : fallback;

    state.kmYear = safeNum(p.kmYear, state.kmYear);
    state.cityPct = safeNum(p.cityPct, state.cityPct);
    state.chargeMode = safeStr(p.chargeMode, state.chargeMode);
    state.priceGas = safeNum(p.priceGas, state.priceGas);
    state.priceDiesel = safeNum(p.priceDiesel, state.priceDiesel);
    state.priceKwhHome = safeNum(p.priceKwhHome, state.priceKwhHome);
    state.priceKwhStreet = safeNum(p.priceKwhStreet, state.priceKwhStreet);
    state.city = safeStr(p.city, state.city);
    state.ivtmMunicipalityName = safeStr(p.ivtmMunicipalityName, state.ivtmMunicipalityName);
    state.climate = safeStr(p.climate, state.climate);
    state.ageGroup = safeStr(p.ageGroup, state.ageGroup);
    state.licenseYears = safeNum(p.licenseYears, state.licenseYears);
    state.postalCode = safeStr(p.postalCode, state.postalCode);
    state.novice = safeStr(p.novice, state.novice);
    state.garage = safeStr(p.garage, state.garage);
    state.insuranceCover = safeStr(p.insuranceCover, state.insuranceCover);
    state.includeTires = safeStr(p.includeTires, state.includeTires);
  }

  function saveProfileToStorage(profile){
    try{
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return true;
    }catch(e){
      return false;
    }
  }

  function startNewComparison(){
  // Reset solo lo relativo a coches/financiación/resultados
  state.carA = makeEmptyCar("A");
  state.carB = makeEmptyCar("B");
  state.compareEnabled = false;

  // Flujo perfil: volver al comportamiento por defecto (auto-cargar si existe)
  state.profileChoice = null;
  state.skipProfileQuestionnaire = false;
  state.profileInitialized = false;
  state.disableAutoProfile = false;
  state.profileWasAutoApplied = false;

  // Reset flujo de coche guardado
  state.savedCarChoice = null;
  state.carAFromSaved = false;

  stepIndex = 0;
  render();
}

    function stepUseSavedProfile(){
    const saved = getSavedProfile();
    const step = document.createElement("div");
    step.className = "step";

    if(!saved){
      // Si por lo que sea no existe, seguimos como "perfil nuevo"
      state.profileChoice = "no";
      setTimeout(()=>{ stepIndex = 0; render(); }, 0);
      return { hideNext: true, hideBack: true };
    }

    const km = Number(saved.kmYear||0);
    const city = Number(saved.cityPct ?? 50);
    const muni = saved.ivtmMunicipalityName || saved.city || "-";
    const chargeMap = { home:"cargador en casa", work:"carga en trabajo", street:"carga pública" };
    const charge = chargeMap[saved.chargeMode] || (saved.chargeMode || "-");
    const age = saved.ageGroup || "—";
    const coverMap = { third:"terceros", full_excess:"todo riesgo", full_franchise:"todo riesgo con franquicia" };
    const cover = coverMap[saved.insuranceCover] || (saved.insuranceCover || "—");

    step.innerHTML = `
      <h2>¿Usar tu perfil guardado?</h2>
      <p>Si lo usas, te saltas las preguntas iniciales y empiezas directamente por el coche.</p>

      <div class="smallmuted" style="margin-top:10px">
        <b>Perfil guardado:</b> ${km.toLocaleString("es-ES")} km/año · ${city}% ciudad · ${esc(muni)} · ${esc(charge)} · ${esc(age)} · ${esc(cover)}
      </div>
    `;

    const grid = document.createElement("div");
    grid.className = "grid2";
    grid.style.marginTop = "14px";
    grid.appendChild(cardChoice(
      "Sí, usar perfil",
      "Ir directo a tu coche.",
      "⚡",
      false,
      ()=>{
        applyProfileToState(saved);
        state.profileChoice = "yes";
        state.skipProfileQuestionnaire = true;
        stepIndex = 0;
        render();
      }
    ));
    grid.appendChild(cardChoice(
      "No, responder el cuestionario",
      "Ajustar km/año, municipio, seguro, etc.",
      "📝",
      false,
      ()=>{
        state.profileChoice = "no";
        state.skipProfileQuestionnaire = false;
        stepIndex = 0;
        render();
      }
    ));
    step.appendChild(grid);

    const foot = document.createElement("div");
    foot.className = "muted";
    foot.style.marginTop = "10px";
    foot.textContent = "Podrás cambiar esto volviendo atrás.";
    step.appendChild(foot);

    mount.appendChild(step);
    return { hideNext: true, hideBack: true };
  }

      function profileLabelCharge(mode){
    const map = { home:"Cargador en casa", work:"Carga en trabajo", street:"Carga pública" };
    return map[String(mode||"").trim()] || (mode || "—");
  }
  function profileLabelCover(cover){
    const map = { third:"Terceros", full_excess:"Todo riesgo con franquicia", full:"Todo riesgo" };
    return map[String(cover||"").trim()] || (cover || "—");
  }
  function profileLabelNovice(v){
    const s = String(v||"").toLowerCase();
    if(s==="yes" || s==="si" || s==="sí" || s==="true") return "Sí";
    if(s==="no" || s==="false") return "No";
    return v ? String(v) : "—";
  }

  
  function buildProfileDetailsHTML(p){
    const fmtNum = (v)=> (typeof v==="number" && isFinite(v)) ? v.toLocaleString("es-ES") : "—";
    const fmtPct = (v)=> (typeof v==="number" && isFinite(v)) ? (v.toFixed(0) + "%") : "—";
    const safe = (v)=> (v===0 || v) ? String(v) : "—";
    const chargeLabel = (()=>{
      if(p.chargeMode==="home") return "En casa";
      if(p.chargeMode==="street") return "Carga pública";
      return "—";
    })();
    const coverLabel = (()=>{
      const c = String(p.insuranceCover||"").trim();
      if(c==="third") return "Terceros";
      if(c==="full_excess") return "Todo riesgo con franquicia";
      if(c==="full") return "Todo riesgo";
      return safe(p.insuranceCover);
    })();

    const licenseYears = (typeof p.licenseYears==="number" && isFinite(p.licenseYears)) ? p.licenseYears : null;
    const postal = (p.postalCode && String(p.postalCode).trim()) ? String(p.postalCode).trim() : "—";
    const noviceLabel = profileLabelNovice(p.novice);
    const g = String(p.garage||"").toLowerCase();
    const garageLabel = (g==="yes" || g==="si" || g==="sí" || g==="true") ? "Sí" : (g==="no" || g==="false" ? "No" : "—");

    const tires = String(p.includeTires||"yes").toLowerCase();
    const tiresLabel = (tires==="no" || tires==="false") ? "No" : "Sí";

    const cityLabel = p.ivtmMunicipalityName || p.city || "—";
    const climateLabel = p.climate || (p.city ? computeClimate(p.city) : "—");

    return `
      <div class="fc-kv">
        <div class="fc-kv-item"><div class="k">Km/año</div><div class="v">${fmtNum(p.kmYear)}</div></div>
        <div class="fc-kv-item"><div class="k">% ciudad</div><div class="v">${fmtPct(p.cityPct)}</div></div>
        <div class="fc-kv-item"><div class="k">Carga</div><div class="v">${chargeLabel}</div></div>
        <div class="fc-kv-item"><div class="k">Garaje</div><div class="v">${garageLabel}</div></div>
        <div class="fc-kv-item"><div class="k">Ciudad / IVTM</div><div class="v">${cityLabel}</div></div>
        <div class="fc-kv-item"><div class="k">Clima</div><div class="v">${climateLabel || "—"}</div></div>
        <div class="fc-kv-item"><div class="k">Seguro</div><div class="v">${coverLabel}</div></div>
        <div class="fc-kv-item"><div class="k">Neumáticos</div><div class="v">${tiresLabel}</div></div>
        <div class="fc-kv-item"><div class="k">Años de carnet</div><div class="v">${(licenseYears!==null)? (licenseYears+" años") : "—"}</div></div>
        <div class="fc-kv-item"><div class="k">Código postal</div><div class="v">${postal}</div></div>
        <div class="fc-kv-item"><div class="k">Gasolina €/L</div><div class="v">${fmtNum(p.priceGas)}</div></div>
        <div class="fc-kv-item"><div class="k">Diésel €/L</div><div class="v">${fmtNum(p.priceDiesel)}</div></div>
        <div class="fc-kv-item"><div class="k">kWh casa</div><div class="v">${fmtNum(p.priceKwhHome)}</div></div>
        <div class="fc-kv-item"><div class="k">kWh público</div><div class="v">${fmtNum(p.priceKwhStreet)}</div></div>
      </div>
    `;
  }


  function stepProfileSummary(){
    const saved = getSavedProfile();
    if(!saved){
      // Si no existe, vamos al cuestionario
      state.disableAutoProfile = true;
      state.skipProfileQuestionnaire = false;
      stepIndex = 0;
      render();
      return { hideNext:true, hideBack:true };
    }

    const step = document.createElement("div");
    step.className = "step";

    step.innerHTML = `
      <h2>Tu perfil</h2>
      <p class="smallmuted">Lo hemos cargado automáticamente. Si quieres, puedes cambiarlo.</p>

      <details class="fc-details">
        <summary>Ver detalles</summary>
        <div class="fc-details-body">
          ${buildProfileDetailsHTML(saved)}
        </div>
      </details>

      <div class="nav" style="margin-top:14px;justify-content:space-between">
        <button class="btn ghost" id="btnEditProfileInline" type="button">Cambiar perfil</button>
        <button class="btn primary" id="btnContinueProfile" type="button">Continuar</button>
      </div>
`;

    mount.appendChild(step);

    step.querySelector("#btnEditProfileInline").addEventListener("click", ()=>{
      state.disableAutoProfile = true;
      state.skipProfileQuestionnaire = false;
      stepIndex = 0;
      render();
    });
    step.querySelector("#btnContinueProfile").addEventListener("click", ()=>{
      stepIndex++;
      render();
    });

    return { hideNext:true, hideBack:true };
  }

  function stepProfileAutoSaveSummary(){
    const profile = extractProfileFromState();
    const ok = saveProfileToStorage(profile);

    const step = document.createElement("div");
    step.className = "step";

    step.innerHTML = `
      <h2>Tu perfil</h2>
      <p class="smallmuted">${ok ? "Perfil guardado automáticamente. Si quieres, puedes cambiarlo." : "No se pudo guardar el perfil (bloqueado por el navegador). Puedes seguir igualmente."}</p>

      <details class="fc-details">
        <summary>Ver detalles</summary>
        <div class="fc-details-body">
          ${buildProfileDetailsHTML(profile)}
        </div>
      </details>

      <div class="nav" style="margin-top:14px;justify-content:space-between">
        <button class="btn ghost" id="btnEditProfileInline2" type="button">Cambiar perfil</button>
        <button class="btn primary" id="btnContinueProfile2" type="button">Continuar</button>
      </div>
`;

    mount.appendChild(step);

    step.querySelector("#btnEditProfileInline2").addEventListener("click", ()=>{
      state.disableAutoProfile = true;
      state.skipProfileQuestionnaire = false;
      stepIndex = 0;
      render();
    });
    step.querySelector("#btnContinueProfile2").addEventListener("click", ()=>{
      stepIndex++;
      render();
    });

    return { hideNext:true, hideBack:true };
  }

function stepSaveProfilePrompt(){
    const existing = getSavedProfile();
    const step = document.createElement("div");
    step.className = "step";

    const title = existing ? "¿Actualizar tu perfil guardado?" : "¿Guardar tu perfil?";
    const yesText = existing ? "Sí, actualizar" : "Sí, guardar";

    step.innerHTML = `
      <h2 ${titleStyle}>${title}</h2>
      <p>Así, la próxima vez podrás saltarte estas preguntas y empezar directamente por el coche.</p>

      <div class="card" style="margin-top:12px">
        <div class="row"><div class="label">Km/año</div><div class="value">${Number(state.kmYear||0).toLocaleString("es-ES")} km</div></div>
        <div class="row"><div class="label">Ciudad</div><div class="value">${Number(state.cityPct||0)}%</div></div>
        <div class="row"><div class="label">Carga</div><div class="value">${esc(state.chargeMode||"-")}</div></div>
        <div class="row"><div class="label">Municipio</div><div class="value">${esc(state.ivtmMunicipalityName || state.city || "-")}</div></div>
      </div>
    `;

    const grid = document.createElement("div");
    grid.className = "grid2";
    grid.style.marginTop = "14px";

    grid.appendChild(cardChoice(
      yesText,
      "Guardar km/año, municipio, tipo de seguro y precios.",
      "💾",
      false,
      ()=>{
        const ok = saveProfileToStorage(extractProfileFromState());
        toast(ok ? (existing ? "Perfil actualizado" : "Perfil guardado") : "No se pudo guardar el perfil (bloqueado por el navegador)");
        stepIndex++;
        render();
      }
    ));

    grid.appendChild(cardChoice(
      "No",
      "Continuar sin guardar.",
      "➡️",
      false,
      ()=>{
        stepIndex++;
        render();
      }
    ));

    step.appendChild(grid);
    mount.appendChild(step);
    return { hideNext: true };
  }

  function stepSavedCarsGate(){
    const has = getSavedCars().length > 0;
    if(!has){
      // Si por lo que sea ya no hay coches guardados, seguimos flujo normal
      state.savedCarChoice = "no";
      state.carAFromSaved = false;
      setTimeout(()=>{ stepIndex++; render(); }, 0);
      return { hideNext: true };
    }

    const step = document.createElement("div");
    step.className = "step";
    step.innerHTML = `
      <h2>¿Quieres usar tus coches guardados o analizar uno nuevo?</h2>
    `;

    const grid = document.createElement("div");
    grid.className = "grid2";
    grid.style.marginTop = "14px";

    grid.appendChild(cardChoice(
      "Sí",
      "Elegir uno guardado.",
      "🚗",
      false,
      ()=>{
        state.savedCarChoice = "yes";
        state.carAFromSaved = false;

        // Ir SIEMPRE al listado, aunque cambie el número de pasos dinámicos.
        const steps = buildSteps();
        const idx = steps.findIndex(s=>s.id==="car_saved_list");
        stepIndex = (idx>=0 ? idx : stepIndex+1);
        render();
      }
    ));

    grid.appendChild(cardChoice(
      "Analizar nuevo",
      "Registrar y analizar un coche nuevo.",
      "📝",
      false,
      ()=>{
        state.savedCarChoice = "no";
        state.carAFromSaved = false;
        // Para que el usuario no tenga que borrar nada: empezamos el coche A desde cero.
        state.carA = makeEmptyCar("A");

        // Saltar directamente a la pantalla de datos del coche.
        const steps = buildSteps();
        const idx = steps.findIndex(s=>s.id==="carA");
        stepIndex = (idx>=0 ? idx : stepIndex+1);
        render();
      }
    ));


// Perfil cargado: resumen + cambiar (debajo de las 2 opciones)
if(state.profileWasAutoApplied){
  const inline = document.createElement("div");
  inline.style.gridColumn = "1 / -1";
  inline.style.marginTop = "10px";
  inline.style.marginBottom = "0";

  const km = Number(state.kmYear||0)||0;
  const city = Number(state.cityPct ?? 50);
  const muni = state.ivtmMunicipalityName || state.city || "—";
  const ownCharge = (state.chargeMode==="home" || state.chargeMode==="work") ? "Sí" : "No";
  const garage = (state.garage==="yes") ? "Sí" : (state.garage==="no" ? "No" : "—");
  const cover = profileLabelCover(state.insuranceCover);

  const msg = document.createElement("div");
  msg.className = "smallmuted";
  msg.style.marginTop = "0";
  msg.style.marginBottom = "8px";
  msg.innerHTML = `<b>Perfil:</b> ${km.toLocaleString("es-ES")} km/año · ${city}% ciudad · Cargador: ${ownCharge} · Municipio: ${esc(muni)} · Carnet: ${Number(state.licenseYears||0)||0} años · CP: ${esc(state.postalCode||"—")} · Garaje: ${garage} · Seguro: ${esc(cover)}`;

  const row = document.createElement("div");
  row.className = "nav";
  row.style.justifyContent = "flex-start";
  row.style.marginTop = "0";
  row.style.marginBottom = "0";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn ghost";
  btn.textContent = "Cambiar perfil";
  btn.addEventListener("click", ()=>{
    state.disableAutoProfile = true;
    state.skipProfileQuestionnaire = false;
    state.profileWasAutoApplied = false;
    stepIndex = 0;
    render();
  });

  row.appendChild(btn);
  inline.appendChild(msg);
  inline.appendChild(row);
  grid.appendChild(inline);
}


    step.appendChild(grid);
    mount.appendChild(step);
    return { hideNext: true };
  }

  function stepPickSavedCarA(){
    const items = getSavedCars();
    const step = document.createElement("div");
    step.className = "step";

    if(!items.length){
      state.savedCarChoice = "no";
      state.carAFromSaved = false;
      setTimeout(()=>{ stepIndex++; render(); }, 0);
      return { hideNext: true };
    }

    step.innerHTML = `
      <h2>Elige un coche guardado</h2>
      <p>Selecciona uno y seguimos directamente sin volver a pedirte datos.</p>
      <div class="btn-row" style="margin-top:12px; gap:10px; display:flex; flex-wrap:wrap;">
        <button id="btnNewCarA" class="btn">Registrar uno nuevo</button>
      </div>
    `;
    mount.appendChild(step);

    const picker = renderSavedCarsPicker({
      onUse: (item)=>{
        state.carA = hydrateCarFromStorage(item, "A");
        state.carB = makeEmptyCar("B");
        state.compareEnabled = false;

        state.carAFromSaved = true;
        state.lastSavedCarId = item && item.id ? item.id : "";

        // Mostrar un resumen del coche cargado antes de seguir
        const steps = buildSteps();
        let idx = steps.findIndex(s=>s.id==="car_saved_summary");
        if(idx<0) idx = steps.findIndex(s=>s.id==="resultA" || s.id==="compare");
        stepIndex = (idx>=0 ? idx : Math.min(stepIndex+1, steps.length-1));
        render();
      },
      onDelete: ()=>{
        // Si se queda sin coches, salta al flujo normal
        if(getSavedCars().length===0){
          state.savedCarChoice = "no";
          state.carAFromSaved = false;
          const steps = buildSteps();
          const idx = steps.findIndex(s=>s.id==="carA");
          stepIndex = (idx>=0 ? idx : 0);
        }
        render();
      }
    });
    if(picker) step.appendChild(picker);

    step.querySelector("#btnNewCarA").addEventListener("click", ()=>{
      state.savedCarChoice = "no";
      state.carAFromSaved = false;
      state.carA = makeEmptyCar("A");
      const steps = buildSteps();
      const idx = steps.findIndex(s=>s.id==="carA");
      stepIndex = (idx>=0 ? idx : 0);
      render();
    });

    return { hideNext: true };
  }

  function stepSavedCarSummary(){
    const c = state.carA || {};
    const step = document.createElement("div");
    step.className = "step";

    const title = ((c.brand||"") + " " + (c.model||"")).trim() || "Tu coche";
    const ver = prettySavedCarLine(c) || "—";

    const finLine = (String(c.financeEnabled||"") === "yes")
      ? `Sí · ${Number(state.termMonths||0)||0} meses · TIN ${Number(c.tin||0)}%`
      : "No";

    step.innerHTML = `
      <h2>Resumen del coche cargado</h2>
      <p>Hemos cargado <b>todos</b> los datos que guardaste. Si está correcto, continúa.</p>

      <div class="card" style="margin-top:12px">
        <div class="row"><div class="label">Coche</div><div class="value">${esc(title)}</div></div>
        <div class="row"><div class="label">Detalle</div><div class="value">${esc(ver)}</div></div>
        <div class="row"><div class="label">PVP al contado</div><div class="value">${euro(Number(c.pvpCash||0)||0)}</div></div>
        <div class="row"><div class="label">Financiación</div><div class="value">${esc(finLine)}</div></div>
        <div class="row"><div class="label">Auto+ (ayuda neta)</div><div class="value">${euro(Number(c.auto?.helpTotal||0)||0)}</div></div>
        <div class="row"><div class="label">Valor futuro / residual</div><div class="value">${euro(Number((c.residualUseUser==="yes"?c.residualUser:c.residualEstimate)||0)||0)}</div></div>
      </div>

      <div class="btn-row" style="margin-top:14px; gap:10px; display:flex; flex-wrap:wrap;">
        <button id="btnPickAnotherSaved" class="btn ghost">Elegir otro</button>
        <button id="btnAnalyzeNewFromSummary" class="btn">Analizar uno nuevo</button>
        <button id="btnGoResultFromSummary" class="btn primary">Ver resultado</button>
      </div>

      <p class="muted" style="margin-top:10px">Si está todo correcto, pulsa <b>Ver resultado</b>.</p>
    `;

    mount.appendChild(step);

    step.querySelector("#btnPickAnotherSaved").addEventListener("click", ()=>{
      const steps = buildSteps();
      const idx = steps.findIndex(s=>s.id==="car_saved_list");
      stepIndex = (idx>=0 ? idx : Math.max(0, stepIndex-1));
      render();
    });

    step.querySelector("#btnAnalyzeNewFromSummary").addEventListener("click", ()=>{
      state.savedCarChoice = "no";
      state.carAFromSaved = false;
      state.lastSavedCarId = "";
      state.carA = makeEmptyCar("A");
      const steps = buildSteps();
      const idx = steps.findIndex(s=>s.id==="carA");
      stepIndex = (idx>=0 ? idx : 0);
      render();
    });

    step.querySelector("#btnGoResultFromSummary").addEventListener("click", ()=>{
      const steps = buildSteps();
      const targetId = state.compareEnabled ? "compare" : "resultA";
      const idx = steps.findIndex(s=>s.id===targetId);
      stepIndex = (idx>=0 ? idx : Math.min(stepIndex+1, steps.length-1));
      render();
    });

    return { hideNext: true };
  }

  // --- Comparativa (después de ver el resultado del coche A) ---
  function getSavedCarsForCompare(){
    // Excluimos el coche A actual para evitar comparar el coche consigo mismo.
    try{
      const aKey = makeCarStorageKey(pruneCarForStorage(state.carA) || {});
      return getSavedCars().filter(x=>x && x.key && x.key!==aKey);
    }catch(e){
      return getSavedCars();
    }
  }

  function stepCompareGate(){
    const items = getSavedCarsForCompare();
    const hasOthers = items.length > 0;

    const step = document.createElement("div");
    step.className = "step";
    step.innerHTML = `
      <h2>¿Quieres compararlo con algún coche guardado o analizar uno nuevo?</h2>
    `;

    const grid = document.createElement("div");
    grid.className = "grid2";
    grid.style.marginTop = "14px";

    grid.appendChild(cardChoice(
      "Sí",
      hasOthers ? "Elegir un coche guardado." : "Aún no tienes otros coches guardados.",
      "🔁",
      !hasOthers,
      ()=>{
        if(!hasOthers) return;
        state.compareEnabled = true;
        state.compareChoice = "saved";
        state.carBFromSaved = false;
        // Ir al listado de guardados para B
        const steps = buildSteps();
        const idx = steps.findIndex(s=>s.id==="compare_saved_list");
        stepIndex = (idx>=0 ? idx : stepIndex+1);
        render();
      }
    ));

    grid.appendChild(cardChoice(
      "Analizar nuevo",
      "Registrar un coche nuevo para compararlo.",
      "📝",
      false,
      ()=>{
        state.compareEnabled = true;
        state.compareChoice = "new";
        state.carBFromSaved = false;
        state.carB = makeEmptyCar("B");
        const steps = buildSteps();
        const idx = steps.findIndex(s=>s.id==="carB");
        stepIndex = (idx>=0 ? idx : stepIndex+1);
        render();
      }
    ));

    step.appendChild(grid);
    mount.appendChild(step);
    return { hideNext: true };
  }

  function renderSavedCarsPickerFromItems(items, { onUse, onDelete } = {}){
    if(!items || !items.length) return null;
    const box = document.createElement("div");
    box.className = "card";
    box.style.marginTop = "12px";
    box.innerHTML = `
      <div class="section-title">Mis coches guardados</div>
      <div class="smallmuted">Acceso rápido (máximo 12). Se guardan solo en este navegador.</div>
      <div id="savedCarsList" style="margin-top:10px;display:flex;flex-direction:column;gap:10px"></div>
    `;

    const list = box.querySelector("#savedCarsList");
    items.forEach(item=>{
      const c = item.car || {};
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.gap = "10px";
      row.style.alignItems = "center";
      row.style.border = "1px solid var(--line)";
      row.style.borderRadius = "14px";
      row.style.padding = "10px";
      row.innerHTML = `
        <div style="min-width:0">
          <div style="font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(((c.brand||"")+" "+(c.model||"")).trim() || "Coche")}</div>
          <div class="smallmuted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(prettySavedCarLine(c) || "—")}</div>
        </div>
        <div style="display:flex;gap:8px;flex:0 0 auto;align-items:center">
          <button class="btn primary" data-use="${esc(item.id)}">Usar</button>
          <button class="btn ghost" data-del="${esc(item.id)}">Borrar</button>
        </div>
      `;
      list.appendChild(row);

      row.querySelector("button[data-use]").addEventListener("click", ()=>{
        onUse && onUse(item);
      });
      row.querySelector("button[data-del]").addEventListener("click", ()=>{
        deleteSavedCar(item.id);
        onDelete && onDelete();
      });
    });
    return box;
  }

  function stepPickSavedCarB(){
    const items = getSavedCarsForCompare();
    const step = document.createElement("div");
    step.className = "step";

    if(!items.length){
      // No hay otros coches guardados: volvemos a "analizar nuevo"
      state.compareChoice = "new";
      state.carBFromSaved = false;
      const steps = buildSteps();
      const idx = steps.findIndex(s=>s.id==="carB");
      stepIndex = (idx>=0 ? idx : Math.max(0, stepIndex-1));
      setTimeout(()=>render(), 0);
      return { hideNext: true };
    }

    step.innerHTML = `
      <h2>Elige un coche guardado para comparar</h2>
      <p>Selecciona uno y lo cargamos completo.</p>
      <div class="btn-row" style="margin-top:12px; gap:10px; display:flex; flex-wrap:wrap;">
        <button id="btnAnalyzeNewB" class="btn">Analizar uno nuevo</button>
      </div>
    `;
    mount.appendChild(step);

    const picker = renderSavedCarsPickerFromItems(items, {
      onUse: (item)=>{
        state.compareEnabled = true;
        state.compareChoice = "saved";
        state.carB = hydrateCarFromStorage(item, "B");
        state.carBFromSaved = true;

        const steps = buildSteps();
        let idx = steps.findIndex(s=>s.id==="compare_saved_summary");
        if(idx<0) idx = steps.findIndex(s=>s.id==="compare");
        stepIndex = (idx>=0 ? idx : Math.min(stepIndex+1, steps.length-1));
        render();
      },
      onDelete: ()=>{
        render();
      }
    });
    if(picker) step.appendChild(picker);

    step.querySelector("#btnAnalyzeNewB").addEventListener("click", ()=>{
      state.compareEnabled = true;
      state.compareChoice = "new";
      state.carBFromSaved = false;
      state.carB = makeEmptyCar("B");
      const steps = buildSteps();
      const idx = steps.findIndex(s=>s.id==="carB");
      stepIndex = (idx>=0 ? idx : 0);
      render();
    });

    return { hideNext: true };
  }

  function stepSavedCarSummaryB(){
    const c = state.carB || {};
    const step = document.createElement("div");
    step.className = "step";

    const title = ((c.brand||"") + " " + (c.model||"")).trim() || "Coche B";
    const ver = prettySavedCarLine(c) || "—";
    const finLine = (String(c.financeEnabled||"") === "yes")
      ? `Sí · ${Number(state.termMonths||0)||0} meses · TIN ${Number(c.tin||0)}%`
      : "No";

    step.innerHTML = `
      <h2>Resumen del coche cargado</h2>
      <p>Hemos cargado <b>todos</b> los datos del coche guardado para comparar.</p>

      <div class="card" style="margin-top:12px">
        <div class="row"><div class="label">Coche</div><div class="value">${esc(title)}</div></div>
        <div class="row"><div class="label">Detalle</div><div class="value">${esc(ver)}</div></div>
        <div class="row"><div class="label">PVP al contado</div><div class="value">${euro(Number(c.pvpCash||0)||0)}</div></div>
        <div class="row"><div class="label">Financiación</div><div class="value">${esc(finLine)}</div></div>
        <div class="row"><div class="label">Auto+ (ayuda neta)</div><div class="value">${euro(Number(c.auto?.helpTotal||0)||0)}</div></div>
        <div class="row"><div class="label">Valor futuro / residual</div><div class="value">${euro(Number((c.residualUseUser==="yes"?c.residualUser:c.residualEstimate)||0)||0)}</div></div>
      </div>

      <div class="btn-row" style="margin-top:14px; gap:10px; display:flex; flex-wrap:wrap;">
        <button id="btnPickAnotherSavedB" class="btn ghost">Elegir otro</button>
        <button id="btnAnalyzeNewB2" class="btn">Analizar uno nuevo</button>
        <button id="btnGoCompare" class="btn primary">Ver comparativa</button>
      </div>
    `;
    mount.appendChild(step);

    step.querySelector("#btnPickAnotherSavedB").addEventListener("click", ()=>{
      const steps = buildSteps();
      const idx = steps.findIndex(s=>s.id==="compare_saved_list");
      stepIndex = (idx>=0 ? idx : Math.max(0, stepIndex-1));
      render();
    });

    step.querySelector("#btnAnalyzeNewB2").addEventListener("click", ()=>{
      state.compareEnabled = true;
      state.compareChoice = "new";
      state.carBFromSaved = false;
      state.carB = makeEmptyCar("B");
      const steps = buildSteps();
      const idx = steps.findIndex(s=>s.id==="carB");
      stepIndex = (idx>=0 ? idx : 0);
      render();
    });

    step.querySelector("#btnGoCompare").addEventListener("click", ()=>{
      const steps = buildSteps();
      const idx = steps.findIndex(s=>s.id==="compare");
      stepIndex = (idx>=0 ? idx : Math.min(stepIndex+1, steps.length-1));
      render();
    });

    return { hideNext: true };
  }

  function stepFinalRegister(){
    const step = document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>¿Quieres guardar comparativas y comparar más versiones?</h2>
      <p>Para guardar comparativas (y desbloquear comparativas avanzadas) sí necesitarás registrarte.</p>

      <div class="card" style="margin-top:12px">
        <div class="row"><div class="label">Qué obtienes</div><div class="value">Historial, favoritos y más comparaciones</div></div>
        <div class="row"><div class="label">Tu perfil</div><div class="value">${getSavedProfile() ? "Se mantiene guardado" : "Puedes guardarlo sin registrarte"}</div></div>
      </div>

      <div class="btn-row" style="margin-top:14px; gap:10px; display:flex; flex-wrap:wrap;">
        <button id="btnGoRegister" class="btn primary">Quiero registrarme</button>
        <button id="btnContinueNoReg" class="btn">Seguir sin guardar</button>
      </div>
      <p class="muted" style="margin-top:10px">* El registro aún es un placeholder en esta demo.</p>
    `;
    mount.appendChild(step);

    step.querySelector("#btnGoRegister").addEventListener("click", ()=>{
      toast("Registro: pendiente de implementar (pantalla final lista)");
    });

    step.querySelector("#btnContinueNoReg").addEventListener("click", ()=>{
      startNewComparison();
    });

    return { hideNext: true };
  }


function buildSteps(){
    const saved = getSavedProfile();

    // Auto-cargar perfil si existe (sin preguntar), salvo que el usuario haya pulsado "Cambiar perfil".
    if(saved && !state.profileInitialized){
      if(!state.disableAutoProfile){
        applyProfileToState(saved);
        state.skipProfileQuestionnaire = true;
        state.profileWasAutoApplied = true;
      }
      state.profileInitialized = true;
    }else if(!state.profileInitialized){
      state.profileInitialized = true;
    }

    const steps = [];

    // Cuestionario inicial — 1 solo paso rápido
    if(!state.skipProfileQuestionnaire){
      steps.push({id:"perfil_rapido", label:"Tu perfil", fn: stepPerfilRapido});
    }

    // Antes del coche: pregunta de coches guardados SOLO si existen coches guardados.
    // Importante: el paso de pregunta se mantiene para que el usuario pueda volver atrás y cambiar la elección.
    const hasSavedCars = getSavedCars().length > 0;

    if(hasSavedCars){
      steps.push({id:"car_saved_gate", label:"Coche", fn: stepSavedCarsGate});

      if(state.savedCarChoice === "yes"){
        // 1) Listado para elegir (permite volver atrás desde el resumen)
        steps.push({id:"car_saved_list", label:"Coche", fn: stepPickSavedCarA});

        // 2) Resumen del coche seleccionado (solo cuando ya hemos cargado uno)
        const hasCarAState = !!(state.carA && state.carA.brand && state.carA.model);
        if(state.carAFromSaved && hasCarAState){
          steps.push({id:"car_saved_summary", label:"Coche", fn: stepSavedCarSummary});
        }
      }
    }else{
      // Primera vez: no hay coches, no mostramos nada
      state.savedCarChoice = "no";
      state.carAFromSaved = false;
    }

    // Paso del coche (si no viene de un guardado)
    const hasCarA = !!(state.carA && state.carA.brand && state.carA.model);
    const skipCarAInputs = (state.savedCarChoice === "yes" && state.carAFromSaved && hasCarA);

    if(!skipCarAInputs){
      steps.push({id:"carA", label:"Coche", fn: () => stepPickCar(state.carA, "Ahora elige el primer coche que quieras analizar")});

      steps.push({id:"finA_q", label:"Financiacion", fn: () => stepFinanceQuestion(state.carA, "A")});
      if(state.carA.financeEnabled === "yes"){
        steps.push({id:"finA_d", label:"Oferta", fn: () => stepFinanceDetails(state.carA, "A")});
      }
    }

    // Resultado del coche A (siempre)
    steps.push({id:"resultA", label:"Resultado", fn: () => stepSingleResult(state.carA, "A")});

    // Pregunta de comparativa (siempre después del resultado A)
    steps.push({id:"compare_gate", label:"Comparar", fn: stepCompareGate});

    // A partir de aquí, solo si el usuario decide comparar
    if(state.compareEnabled){
      const hasSavedCars = getSavedCars().length > 0;
      const choice = state.compareChoice || "new";

      if(choice === "saved" && hasSavedCars){
        steps.push({id:"compare_saved_list", label:"Coche B", fn: stepPickSavedCarB});
        const hasCarBState = !!(state.carB && state.carB.brand && state.carB.model);
        if(state.carBFromSaved && hasCarBState){
          steps.push({id:"compare_saved_summary", label:"Coche B", fn: stepSavedCarSummaryB});
        }
      }

      // Si no viene de guardado (o aún no se ha elegido), pedimos los datos del coche B
      const hasCarB = !!(state.carB && state.carB.brand && state.carB.model);
      const skipCarBInputs = (choice === "saved" && state.carBFromSaved && hasCarB);
      if(!skipCarBInputs){
        steps.push({id:"carB", label:"Coche B", fn: () => stepPickCar(state.carB, "Coche B")});
        steps.push({id:"finB_q", label:"Financiacion B", fn: () => stepFinanceQuestion(state.carB, "B")});
        if(state.carB.financeEnabled === "yes"){
          steps.push({id:"finB_d", label:"Oferta B", fn: () => stepFinanceDetails(state.carB, "B")});
        }
      }

      steps.push({id:"compare", label:"Resultado", fn: stepCompareResults});
    }

    return steps;
  }


  function setProgress(steps){
    const total = steps.length || 1;
    const currentN = Math.min(stepIndex+1, total);

    if(progressPill){
      progressPill.textContent = `Paso ${currentN}/${total}`;
    }

    const pct = (total<=1) ? 0 : (stepIndex/(total-1))*100;

    if(progressBar){
      progressBar.style.width = `${pct}%`;
      progressBar.setAttribute("aria-valuenow", String(Math.round(pct)));
      progressBar.setAttribute("aria-valuetext", `Paso ${currentN} de ${total}`);
    }

    const titleEl = $("#stepTitle");
    const metaEl  = $("#stepMeta");

    if(titleEl){
      const s = steps[stepIndex] || {};
      const label = s.title || s.label || "";
      titleEl.textContent = label;
    }
    if(metaEl){
      metaEl.textContent = `Paso ${currentN} de ${total}`;
    }
  }

  
  function render(){
    const steps = buildSteps();
    if(stepIndex >= steps.length) stepIndex = steps.length - 1;

    const stepId = steps[stepIndex]?.id || "";

    setProgress(steps);

    if(btnChangeProfile){
      const hasProfile = !!getSavedProfile();
      btnChangeProfile.style.display = hasProfile ? "inline-flex" : "none";
    }
    resultsSingleCard.style.display = "none";
    resultsCompareCard.style.display = "none";

    btnBack.style.visibility = (stepIndex===0) ? "hidden" : "visible";
    btnNext.style.display = "inline-flex";
    btnNext.textContent = (stepIndex===steps.length-1) ? "Reiniciar" : "Continuar";

    if(btnNextNoSave){
      const showNoSave = (stepId==="finA_d" || stepId==="finB_d");
      btnNextNoSave.style.display = showNoSave ? "inline-flex" : "none";
      btnNextNoSave.textContent = "Continuar sin guardar";
    }

    mount.innerHTML = "";
    const meta = steps[stepIndex].fn() || {};
    if(meta.nextText) btnNext.textContent = meta.nextText;
    if(meta.hideNext) btnNext.style.display = "none";
    if(meta.hideNext && btnNextNoSave) btnNextNoSave.style.display = "none";
    if(meta.hideBack) btnBack.style.visibility = "hidden";
  }

  if(btnChangeProfile) btnChangeProfile.addEventListener("click", () => {
  // Permite ajustar/editar el perfil (sin borrar el guardado; solo reabrimos el cuestionario)
  state.disableAutoProfile = true;
  state.skipProfileQuestionnaire = false;
  stepIndex = 0;
  render();
});

if(btnBack) btnBack.addEventListener("click", () => {
    if(stepIndex>0){ stepIndex--; render(); }
  });

  if(btnNext) btnNext.addEventListener("click", () => {
    const steps = buildSteps();
    const stepId = steps[stepIndex]?.id;

    if(stepIndex === steps.length-1){
      // Nunca recargar: en móvil/desktop provoca bucles (vuelve al inicio y no avanza).
      // Reinicio limpio del flujo.
      startNewComparison();
      return;
    }
    if(!validateStep(stepId)) return;

    // Guardar coche automáticamente al finalizar la oferta de financiación
    if(stepId==="finA_d" || stepId==="finB_d"){
      const carToSave = (stepId==="finA_d") ? state.carA : state.carB;
      const missing = [];
      try{
        if(carToSave && carToSave.financeEnabled==="yes"){
          if(carToSave.pvpKnown!=="yes") missing.push("PVP real al contado");
          if(!(Number(carToSave.tin||0)>0)) missing.push("TIN");
          if(carToSave.hasOpenFee!=="yes") missing.push("comisión de apertura");
          if(carToSave.hasLifeInLoan!=="yes") missing.push("seguros (si aplica)");
          if(!(Number(carToSave.monthlyPayment||0)>0)) missing.push("cuota ofrecida");
          if(String(carToSave.financeMode||"")==="flex" && !(Number(carToSave.flexGmv||0)>0)) missing.push("GMV/valor final");
        }
        const ok = saveCarToStorage(carToSave);
        if(ok){
          if(missing.length){
            toast(`Guardado ✅. Guardamos tu coche, pero revisa después: ${missing.join(", ")}.`);
          } else {
            toast("Guardado ✅ en Mis coches guardados.");
          }
        }
      }catch(e){}
    }

    stepIndex++;
    render();
  });

  if(btnNextNoSave) btnNextNoSave.addEventListener("click", () => {
    const steps = buildSteps();
    const stepId = steps[stepIndex]?.id;

    if(stepIndex === steps.length-1){
      startNewComparison();
      return;
    }
    if(!validateStep(stepId)) return;
    // Avanzar sin guardar el coche
    stepIndex++;
    render();
  });

  function validateStep(stepId){
    

if(stepId==="city"){
  if(!String(state.city||"").trim()){
    toast("Selecciona una provincia.");
    return false;
  }
  if(!String(state.ivtmMunicipalityName||"").trim()){
    toast("Selecciona un municipio.");
    return false;
  }
  return true;
}

if(stepId==="ins"){
  // Validación mínima (mejora seguro sin añadir pantallas)
  const yrs = Number(state.licenseYears||0);
  if(!isFinite(yrs) || yrs<0){
    toast("Indica tus años con carnet (número).");
    return false;
  }
  const pc = String(state.postalCode||"").replace(/\s/g,"");
  if(!/^\d{5}$/.test(pc)){
    toast("Indica tu código postal (5 dígitos).");
    return false;
  }
  state.postalCode = pc;
  state.novice = (yrs<2) ? "yes" : "no"; // compatibilidad (perfil antiguo)

  /* Guardar perfil en segundo plano (sin pantalla extra) */
  try{
    const ok = saveProfileToStorage(extractProfileFromState());
    if(ok) state.profileWasAutoApplied = true;
  }catch(e){}
  return true;
}

if(stepId==="carA"){
  const a=state.carA;
  if(!a.brand || !a.model){ toast("Elige marca y modelo del coche."); return false; }
  const f = String(a.fuel||"").toLowerCase();
  if((f==="ev" || f==="phev") && !a.auto.entered){
    // No bloqueamos el avance: solo sugerencia para afinar cálculos.
    toast("Consejo: en Auto+ puedes ajustar ayudas/carga para EV y PHEV.");
    a.ui = a.ui || {}; a.ui.advOpen = true;
    const det = mount.querySelector("details.autoplus-details");
    if(det){
      det.open = true;
      det.classList.add("needs-attention");
setTimeout(()=>det.classList.remove("needs-attention"), 1400);
    }
    a.auto.entered = true;
  }
  return true;
}
    
if(stepId==="carB"){
  const b=state.carB;
  if(!b.brand || !b.model){ toast("Elige marca y modelo del coche 2."); return false; }
  const f = String(b.fuel||"").toLowerCase();
  if((f==="ev" || f==="phev") && !b.auto.entered){
    toast("Consejo: en Auto+ puedes ajustar ayudas/carga para EV y PHEV.");
    b.ui = b.ui || {}; b.ui.advOpen = true;
    const det = mount.querySelector("details.autoplus-details");
    if(det){
      det.open = true;
      det.classList.add("needs-attention");
setTimeout(()=>det.classList.remove("needs-attention"), 1400);
    }
    b.auto.entered = true;
  }
  return true;
}
    if(stepId==="fin_A"){
      const a=state.carA;
      if(a.financeEnabled==="yes"){
        // La cuota del concesionario es opcional: si no la tienes, usamos la cuota calculada.
        if(!a.pvpCash || a.tin===null || a.tin===undefined){ toast("Completa PVP y TIN."); return false; }
      } else {
        if(!a.pvpCash){ toast("Indica el PVP al contado."); return false; }
      }
    }
    if(stepId==="fin_B"){
      const b=state.carB;
      if(b.financeEnabled==="yes"){
        // La cuota del concesionario es opcional: si no la tienes, usamos la cuota calculada.
        if(!b.pvpCash || b.tin===null || b.tin===undefined){ toast("Completa PVP y TIN del coche 2."); return false; }
      } else {
        if(!b.pvpCash){ toast("Indica el PVP al contado del coche 2."); return false; }
      }
    }
    return true;
  }

  function toast(msg){
    const d=document.createElement("div");
    d.style.position="fixed";
    d.style.left="50%";
    d.style.bottom="16px";
    d.style.transform="translateX(-50%)";
    d.style.padding="10px 12px";
    d.style.borderRadius="14px";
    d.style.background="rgba(15,23,42,.95)";
    d.style.border="1px solid rgba(148,163,184,.25)";
    d.style.boxShadow="0 10px 30px rgba(0,0,0,.35)";
    d.style.fontWeight="900";
    d.textContent=msg;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),2200);
  }

  function cardChoice(title, desc, ico, active, onClick){
    const div=document.createElement("div");
    div.className = "cardopt" + (active ? " active":"");
    div.addEventListener("click", onClick);
    div.innerHTML = `
      <div class="opt-ico">${ico}</div>
      <div>
        <div class="opt-title">${title}</div>
        <div class="opt-desc">${desc||""}</div>
      </div>`;
    return div;
  }

  function field(label, inputEl, hint){
    const wrap=document.createElement("div");
    wrap.className="field";
    wrap.innerHTML = `<div class="label">${label}</div>`;
    wrap.appendChild(inputEl);
    if(hint){
      const h=document.createElement("div"); h.className="hint"; h.textContent=hint;
      wrap.appendChild(h);
    }
    return wrap;
  }

  function input(type, value, placeholder){
    const el=document.createElement("input");
    el.className="input";
    el.type=type;
    if(value!==undefined) el.value=String(value);
    if(placeholder) el.placeholder=placeholder;
    return el;
  }

  function select(options, value){
    const el=document.createElement("select");
    options.forEach(([v, t]) => {
      const o=document.createElement("option"); o.value=v; o.textContent=t;
      el.appendChild(o);
    });
    el.value=value;
    return el;
  }


  
function makeIrpfControl(){
  const wrap=document.createElement("div");
  wrap.className="irpf-control";

  function snap1(v){
    v = clamp(Number(v||0), 0, 50);
    return Math.round(v);
  }

  function setPct(v, save){
    const s = snap1(v);
    state.irpfPct = s/100;
    num.value = String(s);
    range.value = String(s);
    if(save){
      // Guardado automático: así no se repite el paso en Auto+
      saveIrpfPct(state.irpfPct);
    }
  }

  const top=document.createElement("div");
  top.className="irpf-top";

  const left=document.createElement("div");
  left.className="small";
  left.textContent="Tipo marginal (aprox)";

  const right=document.createElement("div");
  right.className="irpf-right";

  const num=input("number", snap1((state.irpfPct||0.15)*100), "");
  num.min="0"; num.max="50"; num.step="1";
  num.addEventListener("input", ()=> setPct(num.value, true));

  const pctTag=document.createElement("div");
  pctTag.className="small";
  pctTag.textContent="%";

  right.appendChild(num);
  right.appendChild(pctTag);

  top.appendChild(left);
  top.appendChild(right);

  const range=document.createElement("input");
  range.type="range";
  range.min="0"; range.max="50"; range.step="1";
  range.value = String(snap1((state.irpfPct||0.15)*100));
  range.className="irpf-range";
  range.addEventListener("input", ()=> setPct(range.value, true));

  const guide=document.createElement("details");
  guide.className="details";
  guide.innerHTML = `
    <summary>ℹ️ Guía rápida por ingresos (orientativa)</summary>
    <div class="small" style="margin-top:8px;line-height:1.55">
      Si no sabes tu tipo marginal, usa esta referencia aproximada por ingresos brutos anuales
      (puede variar por comunidad autónoma y situación personal):<br>
      • ≤ 15.000€ → 0–15%<br>
      • 15.000–25.000€ → 15–20%<br>
      • 25.000–35.000€ → 20–30%<br>
      • 35.000–60.000€ → 30–37%<br>
      • 60.000–100.000€ → 37–45%<br>
      • > 100.000€ → 45–50%
    </div>
  `;

  wrap.appendChild(top);
  wrap.appendChild(range);
  wrap.appendChild(guide);

  // sync initial (sin guardar)
  setPct(snap1((state.irpfPct||0.15)*100), false);
  return wrap;
}



// Autocompletado propio (evita problemas de <datalist> en Android)
  function makeAutocomplete({ value="", placeholder="", getItems, onCommit }){
    const wrap=document.createElement("div");
    wrap.className="ac-wrap";

    const inp=input("text", value, placeholder);
    inp.autocomplete="off";
    inp.spellcheck=false;

    const menu=document.createElement("div");
    menu.className="ac-menu";
    menu.style.display="none";
    wrap.appendChild(inp);
    wrap.appendChild(menu);

    let activeIndex=-1;
    let currentItems=[];

    function close(){
      menu.style.display="none";
      menu.innerHTML="";
      activeIndex=-1;
      currentItems=[];
    }

    function openWith(items){
      currentItems = items; // lista completa (scroll en el menú)
      if(!currentItems.length){ close(); return; }
      menu.innerHTML = currentItems.map((it, i)=>(
        `<div class="ac-item" data-i="${i}">${escapeHtml(it)}</div>`
      )).join("");
      menu.style.display="block";
      activeIndex=-1;
    }

    function escapeHtml(s){
      return String(s)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
    }

    function refresh(){
      const q = normalize(inp.value);
      const items = (getItems ? getItems() : []) || [];
      if(!q){
        openWith(items.slice(0, 5000));
        return;
      }
      const starts=[];
      const contains=[];
      for(const it of items){
        const n = normalize(it);
        if(!n) continue;
        if(n.startsWith(q)) starts.push(it);
        else if(n.includes(q)) contains.push(it);
      }
      openWith(starts.concat(contains).slice(0, 800));
    }

    function commit(val){
      inp.value = val || "";
      close();
      if(onCommit) onCommit(inp.value);
    }

    inp.addEventListener("focus", refresh);
    inp.addEventListener("input", refresh);

    inp.addEventListener("keydown", (e)=>{
      if(menu.style.display!=="block") return;
      const max = currentItems.length-1;
      if(e.key==="ArrowDown"){
        e.preventDefault();
        activeIndex = Math.min(max, activeIndex+1);
      } else if(e.key==="ArrowUp"){
        e.preventDefault();
        activeIndex = Math.max(0, activeIndex-1);
      } else if(e.key==="Enter"){
        if(activeIndex>=0 && currentItems[activeIndex]){
          e.preventDefault();
          commit(currentItems[activeIndex]);
        } else {
          // Si coincide exacto con un item, lo “confirma”
          const items=(getItems?getItems():[])||[];
          const exact = items.find(x=>normalize(x)===normalize(inp.value));
          if(exact){ e.preventDefault(); commit(exact); }
        }
      } else if(e.key==="Escape"){
        close();
      }
      // pintar activo
      if(activeIndex>=0){
        [...menu.querySelectorAll(".ac-item")].forEach(el=>el.classList.remove("active"));
        const el=menu.querySelector(`.ac-item[data-i="${activeIndex}"]`);
        if(el){ el.classList.add("active"); el.scrollIntoView({block:"nearest"}); }
      }
    });

    menu.addEventListener("mousedown",(e)=>{
      const item=e.target.closest(".ac-item");
      if(!item) return;
      e.preventDefault(); // evita blur antes de click
      const i=Number(item.getAttribute("data-i"));
      if(Number.isFinite(i) && currentItems[i]) commit(currentItems[i]);
    });

    inp.addEventListener("blur", ()=>{
      // cerrar con delay por si hay click en menú
      setTimeout(()=>{
        // Si escribió exacto a un item, lo confirmamos (útil en móvil)
        const items=(getItems?getItems():[])||[];
        const exact = items.find(x=>normalize(x)===normalize(inp.value));
        if(exact) commit(exact);
        else close();
      }, 120);
    });

    return { wrap, input: inp, close, refresh, commit };
  }


  function stepUsage(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>Vamos a calcular tus consumos</h2>
      <p>Con tus km/año y el reparto ciudad/carretera estimamos el consumo y el coste mensual (gasolina/diésel/kWh).</p>
    `;

    // Kilómetros/año
    const kmTitle=document.createElement("div");
    kmTitle.className="section-title";
    kmTitle.style.marginTop="12px";
    kmTitle.textContent="Kilómetros al año";
    step.appendChild(kmTitle);

    const kmRow=document.createElement("div");
    kmRow.className="row";
    kmRow.style.marginTop="10px";
    const kmLabel=document.createElement("div"); kmLabel.className="label"; kmLabel.textContent="Kilómetros/año";
    const kmValue=document.createElement("div"); kmValue.className="value"; kmValue.textContent=`${state.kmYear.toLocaleString("es-ES")} km`;
    kmRow.appendChild(kmLabel); kmRow.appendChild(kmValue);
    step.appendChild(kmRow);

    const kmSlider=document.createElement("input");
    kmSlider.type="range"; kmSlider.min="0"; kmSlider.max="100000"; kmSlider.step="1000"; kmSlider.value=String(state.kmYear);
    kmSlider.className="slider";

    const kmHint=document.createElement("div");
    kmHint.className="hint";
    kmHint.textContent = `≈ ${(state.kmYear/12).toFixed(0)} km/mes`;

    kmSlider.addEventListener("input", ()=>{
      state.kmYear = Number(kmSlider.value);
      kmValue.textContent = `${state.kmYear.toLocaleString("es-ES")} km`;
      kmHint.textContent = `≈ ${(state.kmYear/12).toFixed(0)} km/mes`;
    });

    step.appendChild(kmSlider);
    step.appendChild(kmHint);

    const sep=document.createElement("hr");
    sep.className="sep";
    sep.style.marginTop="14px";
    step.appendChild(sep);

    // Ciudad vs carretera
    const mixTitle=document.createElement("div");
    mixTitle.className="section-title";
    mixTitle.style.marginTop="12px";
    mixTitle.textContent="Ciudad vs carretera";
    step.appendChild(mixTitle);

    const cRow=document.createElement("div");
    cRow.className="row";
    cRow.style.marginTop="10px";
    const cLabel=document.createElement("div"); cLabel.className="label"; cLabel.textContent="Ciudad";
    const cVal=document.createElement("div"); cVal.className="value"; cVal.textContent=`${state.cityPct}%`;
    cRow.appendChild(cLabel); cRow.appendChild(cVal);
    step.appendChild(cRow);

    const cSlider=document.createElement("input");
    cSlider.type="range"; cSlider.min="0"; cSlider.max="100"; cSlider.step="5"; cSlider.value=String(state.cityPct);
    cSlider.className="slider";

    const rRow=document.createElement("div");
    rRow.className="row";
    rRow.style.marginTop="10px";
    const rLabel=document.createElement("div"); rLabel.className="label"; rLabel.textContent="Carretera";
    const rVal=document.createElement("div"); rVal.className="value"; rVal.textContent=`${100-state.cityPct}%`;
    rRow.appendChild(rLabel); rRow.appendChild(rVal);

    cSlider.addEventListener("input", ()=>{
      state.cityPct = Number(cSlider.value);
      cVal.textContent = `${state.cityPct}%`;
      rVal.textContent = `${100-state.cityPct}%`;
    });

    step.appendChild(cSlider);
    step.appendChild(rRow);

    const mixHint=document.createElement("div");
    mixHint.className="hint";
    mixHint.textContent="Arrastra en tramos de 5%.";
    step.appendChild(mixHint);

    mount.appendChild(step);
  }


  function stepKmYear(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>¿Cuántos kilómetros haces al año?</h2>
      <p>Empieza con una estimación. Luego podrás ajustar.</p>
    `;
    const row=document.createElement("div"); row.className="row"; row.style.marginTop="12px";
    row.innerHTML = `<div class="label">Kilómetros/año</div><div class="value" id="kmVal">${state.kmYear.toLocaleString("es-ES")} km</div>`;
    step.appendChild(row);

    const s=document.createElement("input");
    s.type="range"; s.min="0"; s.max="100000"; s.step="1000"; s.value=String(state.kmYear);
    s.className="slider";
    s.addEventListener("input", ()=>{
      state.kmYear = Number(s.value);
      $("#kmVal").textContent = `${state.kmYear.toLocaleString("es-ES")} km`;
      $("#kmMonth").textContent = `≈ ${(state.kmYear/12).toFixed(0)} km/mes`;
    });
    step.appendChild(s);

    const hint=document.createElement("div");
    hint.className="hint"; hint.id="kmMonth";
    hint.textContent = `≈ ${(state.kmYear/12).toFixed(0)} km/mes`;
    step.appendChild(hint);

    mount.appendChild(step);
  }

  function stepCityRoad(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>¿Cuánto es ciudad vs carretera?</h2>
      <p>Arrastra en tramos de 5%.</p>
    `;
    const row=document.createElement("div"); row.className="row"; row.style.marginTop="12px";
    row.innerHTML = `<div class="label">Ciudad</div><div class="value" id="cVal">${state.cityPct}%</div>`;
    step.appendChild(row);

    const s=document.createElement("input");
    s.type="range"; s.min="0"; s.max="100"; s.step="5"; s.value=String(state.cityPct);
    s.className="slider";
    s.addEventListener("input", ()=>{
      state.cityPct = Number(s.value);
      $("#cVal").textContent = `${state.cityPct}%`;
      $("#rVal").textContent = `${100-state.cityPct}%`;
    });
    step.appendChild(s);

    const row2=document.createElement("div"); row2.className="row"; row2.style.marginTop="10px";
    row2.innerHTML = `<div class="label">Carretera</div><div class="value" id="rVal">${100-state.cityPct}%</div>`;
    step.appendChild(row2);

    mount.appendChild(step);
  }

  function stepCharge(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>¿Tienes cargador propio o posibilidad de instalarlo?</h2>
      <p>Esto solo afecta si eliges <b>EV</b> o <b>PHEV</b>. Si no puedes cargar en casa, asumimos <b>carga pública</b> (suele ser más cara).</p>
    `;

    const grid=document.createElement("div");
    grid.className="grid2";
    grid.style.gridTemplateColumns = "repeat(2, 1fr)";
    grid.appendChild(cardChoice("Sí", "Puedo cargar en casa (precio kWh editable).", "🏠⚡", state.chargeMode==="home", ()=>{ state.chargeMode="home"; render(); }));
    grid.appendChild(cardChoice("No", "Dependeré de carga pública (precio kWh editable).", "🛣️⚡", state.chargeMode==="street", ()=>{ state.chargeMode="street"; render(); }));
    step.appendChild(grid);

    const prices=document.createElement("div");
    prices.style.marginTop="12px";
    prices.innerHTML = `<hr class="sep">`;

    if(state.chargeMode==="home"){
      const el=input("number", state.priceKwhHome, "");
      el.step="0.01";
      el.addEventListener("input", ()=> state.priceKwhHome = Number(el.value||0));
      prices.appendChild(field("Precio medio kWh en casa (€)", el, "Editable (tarifa hogar)."));
    } else {
      const el=input("number", state.priceKwhStreet, "");
      el.step="0.01";
      el.addEventListener("input", ()=> state.priceKwhStreet = Number(el.value||0));
      prices.appendChild(field("Precio medio kWh en cargadores públicos (€)", el, "Editable (carga pública)."));
    }

    const g=input("number", state.priceGas, "");
    g.step="0.01";
    g.addEventListener("input", ()=> state.priceGas = Number(g.value||0));
    prices.appendChild(field("Precio gasolina (€ / L)", g, "Editable (media orientativa)."));

    const d=input("number", state.priceDiesel, "");
    d.step="0.01";
    d.addEventListener("input", ()=> state.priceDiesel = Number(d.value||0));
    prices.appendChild(field("Precio diésel (€ / L)", d, "Editable (media orientativa)."));

    step.appendChild(prices);
    mount.appendChild(step);
  }

  // Paso combinado: primero "carga" (antiguo paso 2) y debajo "uso" (antiguo paso 1)
    // Paso combinado: uso real + carga (precios en desplegable)
  // Paso de perfil rápido: fusiona uso, municipio y seguro en 1 pantalla
  function stepPerfilRapido(){
    const step = document.createElement("div");
    step.className = "step";
    step.innerHTML = `
      <h2>Cuéntanos cómo usas el coche</h2>
      <p class="hint">Con estos datos estimamos el coste real mensual. Son orientativos y puedes cambiarlos después.</p>
    `;

    // --- KM/AÑO ---
    const kmRow = document.createElement("div");
    kmRow.className = "row";
    kmRow.style.marginBottom = "6px";
    const kmLabel = document.createElement("div"); kmLabel.className = "label"; kmLabel.textContent = "Kilómetros al año";
    const kmVal = document.createElement("div"); kmVal.className = "value"; kmVal.textContent = `${(state.kmYear||15000).toLocaleString("es-ES")} km`;
    kmRow.appendChild(kmLabel); kmRow.appendChild(kmVal);
    step.appendChild(kmRow);

    const kmSlider = document.createElement("input");
    kmSlider.type = "range"; kmSlider.min = "5000"; kmSlider.max = "60000"; kmSlider.step = "1000";
    kmSlider.value = String(state.kmYear || 15000); kmSlider.className = "slider";
    kmSlider.addEventListener("input", () => { state.kmYear = Number(kmSlider.value); kmVal.textContent = `${Number(kmSlider.value).toLocaleString("es-ES")} km`; });
    step.appendChild(kmSlider);

    // --- CIUDAD/CARRETERA ---
    const mixRow = document.createElement("div");
    mixRow.className = "row"; mixRow.style.marginTop = "14px";
    const mixLabel = document.createElement("div"); mixLabel.className = "label"; mixLabel.textContent = "Reparto uso";
    const mixVal = document.createElement("div"); mixVal.className = "value"; mixVal.id = "pfCVal"; mixVal.textContent = `Ciudad ${state.cityPct}% · Carretera ${100-state.cityPct}%`;
    mixRow.appendChild(mixLabel); mixRow.appendChild(mixVal);
    step.appendChild(mixRow);

    const mixSlider = document.createElement("input");
    mixSlider.type = "range"; mixSlider.min = "0"; mixSlider.max = "100"; mixSlider.step = "10";
    mixSlider.value = String(state.cityPct||50); mixSlider.className = "slider";
    mixSlider.addEventListener("input", () => {
      state.cityPct = Number(mixSlider.value);
      mixVal.textContent = `Ciudad ${state.cityPct}% · Carretera ${100-state.cityPct}%`;
    });
    step.appendChild(mixSlider);

    // --- CARGADOR (solo relevante para EV/PHEV) ---
    const chargeTitle = document.createElement("div");
    chargeTitle.className = "section-title"; chargeTitle.style.marginTop = "16px";
    chargeTitle.textContent = "¿Tienes cargador en casa? (para EV/PHEV)";
    step.appendChild(chargeTitle);

    const chargeGrid = document.createElement("div");
    chargeGrid.className = "grid2";
    chargeGrid.appendChild(cardChoice("Sí, en casa", "kWh casa editable.", "🏠⚡", state.chargeMode==="home", ()=>{ state.chargeMode="home"; render(); }));
    chargeGrid.appendChild(cardChoice("No, público", "kWh público editable.", "🛣️⚡", state.chargeMode==="street", ()=>{ state.chargeMode="street"; render(); }));
    step.appendChild(chargeGrid);

    // --- AJUSTES AVANZADOS (desplegable) ---
    const det = document.createElement("details");
    det.className = "fc-details";
    det.style.marginTop = "16px";
    const sum = document.createElement("summary");
    sum.innerHTML = `<span style="font-weight:600">Ajustes avanzados</span> <span class="smallmuted">Provincia, seguro, precios energía</span>`;
    det.appendChild(sum);

    const body = document.createElement("div");
    body.className = "fc-details-body";
    body.style.paddingTop = "12px";

    // Provincia
    const PROVINCIAS = ["Álava","Albacete","Alicante","Almería","Asturias","Ávila","Badajoz","Barcelona","Burgos","Cáceres","Cádiz","Cantabria","Castellón","Ciudad Real","Córdoba","Cuenca","Girona","Granada","Guadalajara","Gipuzkoa","Huelva","Huesca","Illes Balears","Jaén","A Coruña","La Rioja","Las Palmas","León","Lleida","Lugo","Madrid","Málaga","Murcia","Navarra","Ourense","Palencia","Pontevedra","Salamanca","Santa Cruz de Tenerife","Segovia","Sevilla","Soria","Tarragona","Teruel","Toledo","Valencia","Valladolid","Bizkaia","Zamora","Zaragoza","Ceuta","Melilla"];
    const sel = document.createElement("select"); sel.className = "input";
    const opt0 = document.createElement("option"); opt0.value=""; opt0.textContent="Provincia…"; sel.appendChild(opt0);
    PROVINCIAS.forEach(p => { const o=document.createElement("option"); o.value=p; o.textContent=p; if(state.city===p) o.selected=true; sel.appendChild(o); });
    sel.addEventListener("change", () => { state.city = sel.value; state.climate = computeClimate(sel.value); });
    body.appendChild(field("Provincia (IVTM + clima)", sel));

    // Años carnet
    const yearsIn = input("number", typeof state.licenseYears==="number" ? state.licenseYears : 8, "Ej: 8");
    yearsIn.min="0"; yearsIn.max="60"; yearsIn.step="1";
    yearsIn.addEventListener("input", ()=>{ state.licenseYears = clamp(Number(yearsIn.value||8),0,60); });
    body.appendChild(field("Años con carnet (seguro)", yearsIn));

    // Tipo seguro
    const segSel = document.createElement("select"); segSel.className = "input";
    [["third","A terceros"],["full_excess","Todo riesgo con franquicia"],["full","Todo riesgo"]].forEach(([v,l]) => {
      const o=document.createElement("option"); o.value=v; o.textContent=l; if(state.insuranceCover===v) o.selected=true; segSel.appendChild(o);
    });
    segSel.addEventListener("change", ()=>{ state.insuranceCover = segSel.value; });
    body.appendChild(field("Tipo de seguro", segSel));

    // Precios energía
    const g=input("number", state.priceGas, ""); g.step="0.01";
    g.addEventListener("input", ()=>{ state.priceGas = Number(g.value||0); });
    body.appendChild(field("Gasolina (€/L)", g));

    const d=input("number", state.priceDiesel, ""); d.step="0.01";
    d.addEventListener("input", ()=>{ state.priceDiesel = Number(d.value||0); });
    body.appendChild(field("Diésel (€/L)", d));

    const kwh = input("number", state.chargeMode==="home" ? state.priceKwhHome : state.priceKwhStreet, ""); kwh.step="0.01";
    kwh.addEventListener("input", ()=>{
      if(state.chargeMode==="home") state.priceKwhHome = Number(kwh.value||0);
      else state.priceKwhStreet = Number(kwh.value||0);
    });
    body.appendChild(field("kWh (€/kWh)", kwh));

    det.appendChild(body);
    step.appendChild(det);
    mount.appendChild(step);

    // Al avanzar: guardar perfil automáticamente
    return {
      onNext: () => {
        state.skipProfileQuestionnaire = true;
        try{ saveProfile({ kmYear: state.kmYear, cityPct: state.cityPct, chargeMode: state.chargeMode, city: state.city, climate: state.climate, licenseYears: state.licenseYears, insuranceCover: state.insuranceCover, ageGroup: state.ageGroup, garage: state.garage, priceGas: state.priceGas, priceDiesel: state.priceDiesel, priceKwhHome: state.priceKwhHome, priceKwhStreet: state.priceKwhStreet, postalCode: state.postalCode, includeTires: state.includeTires }); }catch(e){}
      }
    };
  }

    function stepUsageCharge(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>Tu uso real</h2>
      <p class="hint">Con tus km/año y el reparto ciudad/carretera estimamos consumo y coste mensual (gasolina/diésel/kWh).</p>
    `;

    // --- (1) Kilómetros/año ---
    const kmTitle=document.createElement("div");
    kmTitle.className="section-title";
    kmTitle.style.marginTop="12px";
    kmTitle.textContent="Kilómetros al año";
    step.appendChild(kmTitle);

    const kmRow=document.createElement("div");
    kmRow.className="row";
    kmRow.style.marginTop="10px";
    const kmLabel=document.createElement("div"); kmLabel.className="label"; kmLabel.textContent="Kilómetros/año";
    const kmValue=document.createElement("div"); kmValue.className="value"; kmValue.textContent=`${state.kmYear.toLocaleString("es-ES")} km`;
    kmRow.appendChild(kmLabel); kmRow.appendChild(kmValue);
    step.appendChild(kmRow);

    const kmSlider=document.createElement("input");
    kmSlider.type="range"; kmSlider.min="0"; kmSlider.max="100000"; kmSlider.step="1000"; kmSlider.value=String(state.kmYear);
    kmSlider.className="slider";

    const kmHint=document.createElement("div");
    kmHint.className="hint";
    kmHint.textContent = `≈ ${(state.kmYear/12).toFixed(0)} km/mes`;

    kmSlider.addEventListener("input", ()=>{
      state.kmYear = Number(kmSlider.value);
      kmValue.textContent = `${state.kmYear.toLocaleString("es-ES")} km`;
      kmHint.textContent = `≈ ${(state.kmYear/12).toFixed(0)} km/mes`;
    });

    step.appendChild(kmSlider);
    step.appendChild(kmHint);

    const sep1=document.createElement("hr");
    sep1.className="sep";
    sep1.style.marginTop="14px";
    step.appendChild(sep1);

    // --- (2) Ciudad vs carretera ---
    const mixTitle=document.createElement("div");
    mixTitle.className="section-title";
    mixTitle.style.marginTop="12px";
    mixTitle.textContent="Ciudad vs carretera";
    step.appendChild(mixTitle);

    const cRow=document.createElement("div");
    cRow.className="row";
    cRow.style.marginTop="10px";
    const cLabel=document.createElement("div"); cLabel.className="label"; cLabel.textContent="Ciudad";
    const cVal=document.createElement("div"); cVal.className="value"; cVal.textContent=`${state.cityPct}%`;
    cRow.appendChild(cLabel); cRow.appendChild(cVal);
    step.appendChild(cRow);

    const cSlider=document.createElement("input");
    cSlider.type="range"; cSlider.min="0"; cSlider.max="100"; cSlider.step="5"; cSlider.value=String(state.cityPct);
    cSlider.className="slider";

    const rRow=document.createElement("div");
    rRow.className="row";
    rRow.style.marginTop="10px";
    const rLabel=document.createElement("div"); rLabel.className="label"; rLabel.textContent="Carretera";
    const rVal=document.createElement("div"); rVal.className="value"; rVal.textContent=`${100-state.cityPct}%`;
    rRow.appendChild(rLabel); rRow.appendChild(rVal);

    cSlider.addEventListener("input", ()=>{
      state.cityPct = Number(cSlider.value);
      cVal.textContent = `${state.cityPct}%`;
      rVal.textContent = `${100-state.cityPct}%`;
    });

    step.appendChild(cSlider);
    step.appendChild(rRow);

    const mixHint=document.createElement("div");
    mixHint.className="hint";
    mixHint.textContent="Arrastra en tramos de 5%.";
    step.appendChild(mixHint);

    const sep2=document.createElement("hr");
    sep2.className="sep";
    sep2.style.marginTop="14px";
    step.appendChild(sep2);

    // --- (3) Cargador / modo carga ---
    const chargeTitle=document.createElement("div");
    chargeTitle.className="section-title";
    chargeTitle.style.marginTop="12px";
    chargeTitle.textContent="¿Tienes cargador propio o posibilidad de instalarlo?";
    step.appendChild(chargeTitle);

    const chargeP=document.createElement("div");
    chargeP.className="hint";
    chargeP.textContent="Esto solo afecta si eliges EV o PHEV. Si no puedes cargar en casa, asumimos carga pública (suele ser más cara).";
    step.appendChild(chargeP);

    const grid=document.createElement("div");
    grid.className="grid2";
    grid.style.gridTemplateColumns = "repeat(2, 1fr)";
    grid.appendChild(cardChoice("Sí", "Puedo cargar en casa (kWh editable).", "🏠⚡", state.chargeMode==="home", ()=>{ state.chargeMode="home"; render(); }));
    grid.appendChild(cardChoice("No", "Dependeré de carga pública (kWh editable).", "🛣️⚡", state.chargeMode==="street", ()=>{ state.chargeMode="street"; render(); }));
    step.appendChild(grid);

    // --- (4) Precios energéticos en desplegable (cerrado por defecto) ---
    const buildEnergySummary = ()=>{
      const kwhLine = (state.chargeMode==="home")
        ? `kWh casa ${euro(state.priceKwhHome)}/kWh`
        : `kWh público ${euro(state.priceKwhStreet)}/kWh`;
      return `Gasolina ${euro(state.priceGas)}/L · Diésel ${euro(state.priceDiesel)}/L · ${kwhLine}`;
    };

    const det = document.createElement("details");
    det.className = "fc-details";
    det.open = !!state.energyPricesOpen;
    det.addEventListener("toggle", ()=>{ state.energyPricesOpen = det.open; });

    const sum = document.createElement("summary");
    sum.innerHTML = `
      <div>
        Precios energéticos (estimación)
        <div class="smallmuted" style="font-weight:600;margin-top:4px">${buildEnergySummary()}</div>
      </div>
    `;
    det.appendChild(sum);

    const sumMuted = sum.querySelector(".smallmuted");
    const refreshSummary = ()=>{ if(sumMuted) sumMuted.textContent = buildEnergySummary(); };

    const body = document.createElement("div");
    body.className = "fc-details-body";

    if(state.chargeMode==="home"){
      const el=input("number", state.priceKwhHome, "");
      el.step="0.01";
      el.addEventListener("input", ()=>{ state.priceKwhHome = Number(el.value||0); refreshSummary(); });
      body.appendChild(field("Precio medio kWh en casa (€/kWh)", el, "Editable (tarifa hogar)."));
    } else {
      const el=input("number", state.priceKwhStreet, "");
      el.step="0.01";
      el.addEventListener("input", ()=>{ state.priceKwhStreet = Number(el.value||0); refreshSummary(); });
      body.appendChild(field("Precio medio kWh en cargadores públicos (€/kWh)", el, "Editable (carga pública)."));
    }

    const g=input("number", state.priceGas, "");
    g.step="0.01";
    g.addEventListener("input", ()=>{ state.priceGas = Number(g.value||0); refreshSummary(); });
    body.appendChild(field("Precio gasolina (€ / L)", g, "Editable (media orientativa)."));

    const d=input("number", state.priceDiesel, "");
    d.step="0.01";
    d.addEventListener("input", ()=>{ state.priceDiesel = Number(d.value||0); refreshSummary(); });
    body.appendChild(field("Precio diésel (€ / L)", d, "Editable (media orientativa)."));

    det.appendChild(body);
    step.appendChild(det);

    const tiresTitle=document.createElement("div");
    tiresTitle.className="section-title";
    tiresTitle.style.marginTop="14px";
    tiresTitle.textContent="Mantenimiento: neumáticos";
    step.appendChild(tiresTitle);

    const gridT=document.createElement("div");
    gridT.className="grid2";
    gridT.appendChild(cardChoice("Incluir neumáticos", "Incluye desgaste y cambios según km/año.", "🛞", state.includeTires!=="no", ()=>{ state.includeTires="yes"; render(); }));
    gridT.appendChild(cardChoice("No incluir", "Si prefieres contarlos aparte.", "➖", state.includeTires==="no", ()=>{ state.includeTires="no"; render(); }));
    step.appendChild(gridT);

    const tiresHint=document.createElement("div");
    tiresHint.className="hint";
    tiresHint.textContent="Solo afecta al mantenimiento estimado. Si haces muchos km o es SUV/potente, puede notarse.";
    step.appendChild(tiresHint);

    mount.appendChild(step);
  }



function stepCityClimate(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>Provincia</h2>
      <p>Selecciona tu provincia para ajustar el clima estimado (afecta al consumo, especialmente en EV).</p>
    `;

    const PROVINCIAS = ["Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Illes Balears", "Jaén", "A Coruña", "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Bizkaia", "Zamora", "Zaragoza", "Ceuta", "Melilla"];

    const sel = document.createElement("select");
    sel.className="input";
    const opt0=document.createElement("option");
    opt0.value=""; opt0.textContent="Selecciona provincia…";
    sel.appendChild(opt0);
    PROVINCIAS.forEach(p=>{
      const o=document.createElement("option");
      o.value=p; o.textContent=p;
      sel.appendChild(o);
    });
    sel.value = state.city || "";
    sel.addEventListener("change", ()=>{
      state.city = sel.value;
      state.climate = computeClimate(state.city);

      // Municipio (para IVTM): por defecto, capital si es Sevilla/Madrid y el usuario no ha escrito nada
      if(!String(state.ivtmMunicipalityName||"").trim()){
        if(state.city==="Sevilla") state.ivtmMunicipalityName="Sevilla";
        else if(state.city==="Madrid") state.ivtmMunicipalityName="Madrid";
      }
      render();
    });
    step.appendChild(field("Provincia", sel));

    const clima=document.createElement("div");
    clima.className="hint";
    clima.textContent = state.city
      ? `Clima estimado: ${state.climate.icon} ${state.climate.label}`
      : "Elige una provincia para estimar el clima.";
    step.appendChild(clima);

    // IVTM (sin pedir más datos): solo municipio. 
    const ivtmTitle = document.createElement("div");
    ivtmTitle.className = "section-title";
    ivtmTitle.textContent = "Impuesto de circulación (IVTM)";
    step.appendChild(ivtmTitle);

    const ivtmHint = document.createElement("div");
    ivtmHint.className = "hint";
    ivtmHint.textContent = "Usamos tu municipio para estimar el IVTM y prorratearlo a €/mes. En Madrid y Sevilla aplicamos tarifas municipales conocidas; en el resto usamos tarifa estatal mínima × coeficientes agregados (2025) y mostramos un rango. En EV, si tenemos Pe kW por versión (o lo introduces opcionalmente), la estimación mejora.";
    step.appendChild(ivtmHint);

    const muni = document.createElement("select");
    muni.className = "select";
    const provName = state.city || "";
    const data = (window.MUNICIPIOS_INE_2026 && provName) ? (window.MUNICIPIOS_INE_2026[provName] || []) : [];
    const optM0 = document.createElement("option");
    optM0.value = "";
    optM0.textContent = provName ? "Selecciona municipio" : "Selecciona provincia primero";
    muni.appendChild(optM0);

    // Si venías con un municipio guardado pero no existe en la lista actual, lo vaciamos para evitar incoherencias
    if(state.ivtmMunicipalityName && data.length && !data.includes(state.ivtmMunicipalityName)){
      state.ivtmMunicipalityName = "";
    }

    data.forEach(name=>{
      const o=document.createElement("option");
      o.value=name;
      o.textContent=name;
      if(state.ivtmMunicipalityName===name) o.selected=true;
      muni.appendChild(o);
    });

    muni.disabled = (!provName) || (data.length===0);
    muni.addEventListener("change", ()=>{ state.ivtmMunicipalityName = muni.value; });
    step.appendChild(field("Municipio", muni));
mount.appendChild(step);
  }


  function stepInsuranceProfile(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>Seguro (estimación orientativa)</h2>
      <p>Sin complicarlo: afinamos el seguro con <b>años de carnet</b> y <b>código postal</b> (capital vs resto). No preguntamos siniestros: asumimos 0 con culpa.</p>
    `;

    const grid0 = document.createElement("div");
    grid0.className = "grid2";
    grid0.style.marginTop = "12px";

    const yearsIn = input("number", (typeof state.licenseYears==="number" ? state.licenseYears : ""), "Ej: 8");
    yearsIn.min = "0"; yearsIn.max = "60"; yearsIn.step = "1";
    yearsIn.addEventListener("input", ()=>{
      const v = Number(yearsIn.value||0);
      state.licenseYears = clamp(isFinite(v)?v:8, 0, 60);
    });
    grid0.appendChild(field("Años con carnet", yearsIn, "Ej: 0, 3, 8, 15… (mejora mucho el seguro)."));

    const cpIn = input("text", state.postalCode || "", "Ej: 41001");
    cpIn.maxLength = 5;
    cpIn.inputMode = "numeric";
    cpIn.pattern = "\\d{5}";
    cpIn.addEventListener("input", ()=>{
      state.postalCode = String(cpIn.value||"").replace(/\s/g,"").slice(0,5);
    });
    grid0.appendChild(field("Código postal", cpIn, "Ajuste suave: capital vs resto."));

    step.appendChild(grid0);

    const grid=document.createElement("div");
    grid.className="grid2";
    grid.style.marginTop = "10px";
    grid.appendChild(cardChoice("18–25", "Perfil joven.", "🧑‍🦱", state.ageGroup==="18-25", ()=>{ state.ageGroup="18-25"; render(); }));
    grid.appendChild(cardChoice("26+", "Perfil adulto.", "🧑", state.ageGroup==="26+", ()=>{ state.ageGroup="26+"; render(); }));
    step.appendChild(grid);

    const grid3=document.createElement("div");
    grid3.className="grid2";
    grid3.appendChild(cardChoice("Garaje: Sí", "Suele bajar el seguro.", "🏠", state.garage==="yes", ()=>{ state.garage="yes"; render(); }));
    grid3.appendChild(cardChoice("Garaje: No", "Suele subir un poco.", "🅿️", state.garage==="no", ()=>{ state.garage="no"; render(); }));
    step.appendChild(grid3);

    const coverTitle=document.createElement("div");
    coverTitle.className="section-title";
    coverTitle.style.marginTop="14px";
    coverTitle.textContent="Tipo de seguro (para afinar la estimación)";
    step.appendChild(coverTitle);

    const grid4=document.createElement("div");
    grid4.className="grid2";
    grid4.style.gridTemplateColumns="repeat(3, 1fr)";
    grid4.appendChild(cardChoice("A terceros", "Cobertura básica (suele ser el más barato).", "🛡️", state.insuranceCover==="third", ()=>{ state.insuranceCover="third"; render(); }));
    grid4.appendChild(cardChoice("Todo riesgo con franquicia", "Equilibrio habitual (intermedio).", "🧾", state.insuranceCover==="full_excess", ()=>{ state.insuranceCover="full_excess"; render(); }));
    grid4.appendChild(cardChoice("Todo riesgo", "Cobertura amplia (suele ser el más caro).", "⭐", state.insuranceCover==="full", ()=>{ state.insuranceCover="full"; render(); }));
    step.appendChild(grid4);

    const coverHint=document.createElement("div");
    coverHint.className="hint";
    coverHint.innerHTML = "Estimación orientativa: puede variar por historial/bonificaciones. <b>Si has tenido siniestros con culpa</b>, el precio real del seguro puede subir.";
    step.appendChild(coverHint);

    mount.appendChild(step);
  }

  
  // stepMaintenance removed (moved into financing step)




  function stepResidual(){
    const step=document.createElement("div");
    step.className="step";

    const flexA = (state.carA.financeMode==="flex" && Number(state.carA.flexGmv||0)>0);
    const flexB = (state.carB.financeMode==="flex" && Number(state.carB.flexGmv||0)>0);
    const flexKeepA = flexA && (state.carA.flexEnd==="keep");
    const flexKeepB = flexB && (state.carB.flexEnd==="keep");
    const anyFlexReturn = (flexA && !flexKeepA) || (flexB && !flexKeepB);
    const anyFlexKeep   = flexKeepA || flexKeepB;

    step.innerHTML = `
      <h2>¿Vas a vender el coche al final del plazo?</h2>
      <p>Si al terminar el plazo <b>vendes</b> el coche y recuperas dinero, FairCar puede <b>descontar</b> ese valor para ver el <b>coste neto real</b>.</p>
      <p class="small">Esto es una <b>estimación orientativa</b>. En el siguiente paso podrás ver el valor estimado y modificarlo si crees que será distinto.</p>
      ${anyFlexReturn ? `<p class="small">Nota: en financiación flexible marcada como <b>devolver</b>, no hay reventa (entregas el coche). Esta opción solo afecta a coches que <b>te quedas</b> al final.</p>` : ``}
      ${anyFlexKeep ? `<p class="small">En financiación flexible si te lo <b>quedas</b>, FairCar suma el valor final y, si activas esta opción, descuenta la reventa.</p>` : ``}
    `;

    const grid=document.createElement("div");
    grid.className="grid2";
    grid.appendChild(cardChoice("Sí, vender y descontar reventa", "Ver el coste neto real si lo vendes.", "💶", state.includeResidual==="yes", ()=>{ state.includeResidual="yes"; render(); }));
    grid.appendChild(cardChoice("No", "Ver solo lo pagado durante el plazo.", "🚫", state.includeResidual==="no", ()=>{ state.includeResidual="no"; render(); }));
    step.appendChild(grid);


    if(state.includeResidual==="yes"){
      const sellTitle=document.createElement("div");
      sellTitle.className="section-title";
      sellTitle.style.marginTop="14px";
      sellTitle.textContent="¿Cómo lo venderías?";
      step.appendChild(sellTitle);

      const gridSell=document.createElement("div");
      gridSell.className="grid2";
      gridSell.appendChild(cardChoice("Entrega a concesionario", "Más cómodo, normalmente algo menos de dinero.", "🏢", state.resaleChannel!=="private", ()=>{ state.resaleChannel="tradein"; render(); }));
      gridSell.appendChild(cardChoice("Venta particular", "Suele dar más, pero requiere tiempo.", "🤝", state.resaleChannel==="private", ()=>{ state.resaleChannel="private"; render(); }));
      step.appendChild(gridSell);

      const sellHint=document.createElement("div");
      sellHint.className="hint";
      sellHint.textContent="Ajusta la reventa estimada. Es orientativo: si crees que será otra cifra, luego puedes editarla en resultados.";
      step.appendChild(sellHint);
    }

    mount.appendChild(step);
  }


  // --- NUEVO FLUJO: 1 coche → financiación → resultado → (opcional) comparar con otro coche ---

  function stepPickCar(car, title){
    // Estado UI (para no perder el desplegable de Auto+ al re-render)
    car.ui = car.ui || {};

    const step=document.createElement("div");
    step.className="step";

    const isFirstCar = (car && car.letter === "A");
    const titleStyle = isFirstCar ? 'style="font-size:30px;line-height:1.12;margin-bottom:8px"' : '';

    step.innerHTML = `
      <h2 ${titleStyle}>${title}</h2>
      <p>Elige <b>marca</b>, <b>modelo</b> y, si está disponible, una <b>versión</b>. La versión define la motorización y la potencia (CV/kW) para cálculos más realistas.</p>
    `;

    // Banner (solo si el perfil se cargó automáticamente): permite cambiar perfil sin una pantalla extra
    if(state.profileWasAutoApplied && car && car.letter==="A" && getSavedCars().length===0){
      const msg = document.createElement("div");
      msg.className = "smallmuted";
      msg.style.marginTop = "-6px";
      msg.style.marginBottom = "10px";
      msg.textContent = "Tu perfil lo hemos cargado automáticamente. Si quieres, puedes cambiarlo.";
      const row = document.createElement("div");
      row.className = "nav";
      row.style.justifyContent = "flex-start";
      row.style.marginTop = "-2px";
      row.style.marginBottom = "12px";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.textContent = "Cambiar perfil";
      btn.addEventListener("click", ()=>{
        state.disableAutoProfile = true;
        state.skipProfileQuestionnaire = false;
        state.profileWasAutoApplied = false;
        stepIndex = 0;
        render();
      });
      row.appendChild(btn);
      step.appendChild(msg);
      step.appendChild(row);
    }


    // --- Botón de importar presupuesto en paso 1 ---
    const importBox = document.createElement("div");
    importBox.className = "hint";
    importBox.style.cssText = "margin-bottom:16px;padding:14px 16px";
    importBox.innerHTML = `
      <div class="label" style="margin-bottom:6px">📄 ¿Tienes el presupuesto del concesionario?</div>
      <div class="smallmuted" style="margin-bottom:12px">Importa la foto o PDF y FairCar rellenará marca, modelo y datos de financiación automáticamente.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <label style="cursor:pointer">
          <input type="file" accept="image/*" capture="environment" style="display:none" id="impCamBtn_${car.letter}">
          <span class="btn ghost">📷 Foto del presupuesto</span>
        </label>
        <label style="cursor:pointer">
          <input type="file" accept="image/*,application/pdf,.pdf" style="display:none" id="impFileBtn_${car.letter}">
          <span class="btn ghost">📎 PDF / imagen</span>
        </label>
      </div>
      <div id="impStatus_${car.letter}" class="smallmuted" style="margin-top:8px;display:none"></div>
    `;
    step.appendChild(importBox);

    // Lógica de importar desde paso 1
    function _setupImportBtn1(inputEl){
      inputEl.addEventListener("change", async ()=>{
        const file = inputEl.files && inputEl.files[0];
        if(!file) return;
        inputEl.value = "";

        // Aviso de privacidad — solo una vez por sesión
        const privacyOk = (() => { try{ return sessionStorage.getItem("fc_privacy_ok")==="1"; }catch(e){ return false; } })();
        if(!privacyOk){
          const ok = window.confirm("📋 Aviso de privacidad\n\nLa foto se envía a una IA para leer los datos del presupuesto. No se guarda la imagen.\n\nRecomendamos tapar datos personales de la foto (nombre, DNI, dirección) antes de subir.\n\n¿Continuar?");
          if(!ok) return;
          try{ sessionStorage.setItem("fc_privacy_ok","1"); }catch(e){}
        }

        // Límite: 5 importaciones por sesión
        let importCount = 0;
        try{ importCount = parseInt(sessionStorage.getItem("fc_import_count")||"0",10)||0; }catch(e){}
        if(importCount >= 5){
          alert("Has alcanzado el límite de 5 importaciones por sesión.\nRecarga la página para continuar.");
          return;
        }
        try{ sessionStorage.setItem("fc_import_count", String(importCount+1)); }catch(e){}

        const statusEl = importBox.querySelector("#impStatus_" + car.letter);
        if(statusEl){ statusEl.style.display="block"; statusEl.textContent="Leyendo presupuesto…"; }
        const onProg = (p, msg)=>{ if(statusEl) statusEl.textContent = msg || "Procesando…"; };
        try{
          await budgetImportFlow({ file, car, letter: car.letter, onProgress: onProg });
          if(statusEl){ statusEl.textContent="✅ Presupuesto importado"; setTimeout(()=>{ statusEl.style.display="none"; },3000); }
          render();
        }catch(e){
          if(statusEl){ statusEl.textContent="❌ " + (e && e.message ? e.message : "Error al importar"); }
        }
      });
    }
    const camInput1 = importBox.querySelector("#impCamBtn_" + car.letter);
    const fileInput1 = importBox.querySelector("#impFileBtn_" + car.letter);
    if(camInput1) _setupImportBtn1(camInput1);
    if(fileInput1) _setupImportBtn1(fileInput1);
    // --- Fin botón importar ---

    const brandAC = makeAutocomplete({
      value: car.brand,
      placeholder: "Ej: Audi",
      getItems: () => allBrands,
      onCommit: (val)=>{
        car.brand = resolveFromList(val, allBrands);
        car.model = "";
        car.versionKey = "";
        car.versionMeta = null;
        car.manualVersion = false;
        // Reset IVTM advanced fields when changing brand/model
        car.dgtLabel = "";
        car.dgtLabelManual = false;
        car.cylinders = 0;
        car.peKw = 0;
        render();
      }
    });
    step.appendChild(field("Marca", brandAC.wrap));

    const modelAC = makeAutocomplete({
      value: car.model,
      placeholder: car.brand ? "Ej: A3" : "Primero elige marca",
      getItems: () => getModelsForBrand(car.brand),
      onCommit: (val)=>{
        car.model = resolveFromList(val, getModelsForBrand(car.brand));
        car.versionKey = "";
        car.versionMeta = null;
        car.manualVersion = false;
        // Reset IVTM advanced fields when changing model
        car.dgtLabel = "";
        car.dgtLabelManual = false;
        car.cylinders = 0;
        car.peKw = 0;

        const d = getModelData(car.brand, car.model);
        if(d && d.segment && segmentMap[d.segment]) car.segment = segmentMap[d.segment];

        // Si el modelo tiene precio "desde" (patch/admin), úsalo como PVP inicial si el usuario aún no ha tocado precios
        if(d && typeof d.priceFrom === "number" && d.priceFrom > 0){
          if(!car.pvpCash || Number(car.pvpCash)<=0){
            car.pvpCash = d.priceFrom;
            if(!car.priceFinanced || Number(car.priceFinanced)<=0) car.priceFinanced = d.priceFrom;
          }
        }

        // Si el modelo solo tiene 1 tipo de motor, lo fijamos (fallback, por si no hay versión elegida)
        const m = getMotorizationsFor(car.brand, car.model);
        if(m.length===1) car.fuel = m[0];

        const fNow = String(car.fuel||"").toLowerCase();
        if(fNow==="ev" || fNow==="phev"){
          car.ui = car.ui || {};
          car.ui.advOpen = true;
}

        render();
      }
    });
    step.appendChild(field("Modelo", modelAC.wrap, car.brand ? "Sugerencias según la marca elegida." : "Selecciona una marca para ver modelos."));

    // Selector de versión (v3)
    if(HAS_V3 && car.brand && car.model){
      const versions = (typeof window.getVersions==="function") ? window.getVersions(car.brand, car.model) : [];
      const verSel = document.createElement("select");
      verSel.innerHTML = window.buildVersionSelect(car.brand, car.model);
      verSel.value = car.versionKey || "";
      verSel.addEventListener("change", ()=>{
        car.versionKey = verSel.value || "";
        car.versionMeta = null;
        car.manualVersion = false;

        const opt = verSel.selectedOptions && verSel.selectedOptions[0] ? verSel.selectedOptions[0] : null;
        if(opt && car.versionKey){
          const meta = {
            type: (opt.dataset.type || ""),
            cv: Number(opt.dataset.cv || 0),
            kw: Number(opt.dataset.kw || 0),
            battery: Number(opt.dataset.battery || 0),
            displacement: (opt.dataset.displacement || "").trim(),
            price: Number(opt.dataset.price || 0),
            priceMax: Number(opt.dataset.pricemax || 0),
            peKw: Number(opt.dataset.pekw || 0),
            label: opt.textContent || ""
          };
          car.versionMeta = meta;

          // Aplicar a estado del coche para cálculos
          if(meta.type && motorMap[meta.type]) car.fuel = motorMap[meta.type];
          if(meta.kw) car.powerKw = meta.kw;
          if(meta.displacement) car.engine = meta.displacement;
          if((car.fuel==="ev" || car.fuel==="phev") && meta.battery) car.batteryKwh = meta.battery;
          if(car.fuel==="ev" && meta.peKw) car.peKw = meta.peKw;

          // Precio recomendado (solo si todavía está a 0)
          if(meta.price && (!car.pvpCash || Number(car.pvpCash)<=0)){
            car.pvpCash = meta.price;
            // Mantener coherencia si el usuario aún no tocó financiación
            if(!car.priceFinanced || Number(car.priceFinanced)<=0) car.priceFinanced = meta.price;
          }
        }
        // Etiqueta DGT: volver a modo automático al cambiar de versión (editable)
        car.dgtLabel = "";
        car.dgtLabelManual = false;

        const fNow = String(car.fuel||"").toLowerCase();
        if(fNow==="ev" || fNow==="phev"){
          car.ui = car.ui || {};
          car.ui.advOpen = true;
}

        render();
      });

      step.appendChild(field("Versión", verSel, versions.length ? "Opciones agrupadas por tipo de motor. Incluye CV/kW y precio orientativo." : "No hay versiones para este modelo en la BD."));

      if(car.versionMeta && (car.versionKey || car.manualVersion)){
        const info=document.createElement("div");
        info.className="hint is-big";
        const tLbl = {
          gasolina:"⛽ Gasolina",
          diesel:"🛢 Diésel",
          hibrido:"🔋 Híbrido",
          phev:"🔌 PHEV",
          ev:"⚡ Eléctrico"
        }[car.versionMeta.type] || car.versionMeta.type || fuelLabel(car.fuel);

        const priceTxt = car.versionMeta.price ? `${Number(car.versionMeta.price).toLocaleString('es-ES')}€` : "—";
        const powTxt = car.versionMeta.cv ? `${car.versionMeta.cv} cv (${car.versionMeta.kw||car.powerKw} kW)` : `${car.powerKw||"—"} kW`;
        const extra = (car.fuel==="ev" || car.fuel==="phev")
          ? (car.versionMeta.battery ? ` · Batería: ${car.versionMeta.battery} kWh` : "")
          : (car.versionMeta.displacement ? ` · Motor: ${car.versionMeta.displacement}L` : "");
        info.innerHTML = `<b>Datos de la versión</b> · ${tLbl} · Potencia: ${powTxt}${extra}<br><span class="small">Precio orientativo “desde”: <b>${priceTxt}</b> (editable en financiación).</span>`;
        step.appendChild(info);
      } else if(versions.length){
        const info=document.createElement("div");
        info.className="hint";
        info.textContent = "Consejo: elige una versión para fijar motorización y potencia automáticamente (y mejorar el cálculo de consumos).";
        step.appendChild(info);
      }
    }

    // Entrada manual de versión (cuando falte en BD o para sobreescribir)
    if(car.brand && car.model && !car.versionKey){
      const wrapManual = document.createElement("div");
      wrapManual.className = "manual-version-box";

      const top = document.createElement("div");
      top.className = "manual-version-top";

      const title = document.createElement("div");
      title.innerHTML = `<b>¿No encuentras tu versión?</b> Puedes introducirla manualmente para continuar con cálculos realistas.`;
      top.appendChild(title);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.textContent = car.manualVersion ? "Ocultar versión manual" : "Introducir versión manual";
      btn.addEventListener("click", ()=>{
        car.manualVersion = !car.manualVersion;
        if(car.manualVersion){
          car.versionKey = "";
          // preparar meta manual base
          car.versionMeta = car.versionMeta || { manual:true, label:"" };
        }
        render();
      });
      top.appendChild(btn);

      wrapManual.appendChild(top);

      if(car.manualVersion){
        const grid = document.createElement("div");
        grid.className = "grid2";
        grid.style.marginTop = "10px";

        const motorLabels = {
          gasoline: "Gasolina",
          diesel: "Diésel",
          hev: "Híbrido (HEV)",
          phev: "Híbrido enchufable (PHEV)",
          ev: "Eléctrico (EV)"
        };

        const fuelSel = select([
          ["gasoline","Gasolina"],
          ["diesel","Diésel"],
          ["hev","Híbrido (HEV)"],
          ["phev","Híbrido enchufable (PHEV)"],
          ["ev","Eléctrico (EV)"]
        ], car.fuel);

        const fuelRow = field("Motorización", fuelSel, "Si no eliges versión de la BD, este dato es clave.");
        grid.appendChild(fuelRow);

        // --- Ajuste IVTM (opcional) ---


        // 2) Nº de cilindros (solo motores térmicos): mejora el cálculo si no hay CVF.
        const cylIn = input("number", car.cylinders || "", "");
        cylIn.step = "1"; cylIn.min = "2"; cylIn.max = "16";
        cylIn.addEventListener("input", ()=>{
          car.cylinders = Number(cylIn.value||0);
          updateMeta();
          updateInfo();
        });
        const cylField = field("Nº cilindros (opcional)", cylIn, "Si lo sabes, mejora el cálculo de CVF en motores térmicos.");
        grid.appendChild(cylField);

        // 3) Potencia efectiva (kW) (solo EV): mejora el cálculo si no hay CVF.
        const peIn = input("number", car.peKw || "", "");
        peIn.step = "1"; peIn.min = "10"; peIn.max = "400";
        peIn.addEventListener("input", ()=>{
          car.peKw = Number(peIn.value||0);
          updateMeta();
          updateInfo();
        });
        const peField = field("Potencia efectiva (kW) (opcional)", peIn, "Solo EV: viene en ficha técnica como potencia nominal/efectiva y es la usada para el IVTM.");
        grid.appendChild(peField);

        const powKw = input("number", car.powerKw || 0, "");
        powKw.step = "1"; powKw.min="30"; powKw.max="1000";
        const powCv = input("number", car.powerKw ? Math.round(Number(car.powerKw)*1.35962) : 0, "");
        powCv.step = "1"; powCv.min="40"; powCv.max="1500";

        function syncFromKw(){
          const kw = Number(powKw.value||0);
          powCv.value = kw ? String(Math.round(kw*1.35962)) : "";
        }
        function syncFromCv(){
          const cv = Number(powCv.value||0);
          powKw.value = cv ? String(Math.round(cv/1.35962)) : "";
        }

        powKw.addEventListener("input", ()=>{
          car.powerKw = Number(powKw.value||0);
          syncFromKw();
          updateMeta();
          updateInfo();
        });
        powCv.addEventListener("input", ()=>{
          syncFromCv();
          car.powerKw = Number(powKw.value||0);
          updateMeta();
          updateInfo();
        });

        grid.appendChild(field("Potencia (kW)", powKw, "Si solo sabes CV, usa el campo de la derecha."));
        grid.appendChild(field("Potencia (CV)", powCv, "Se convierte automáticamente a kW."));

        // ICE: cilindrada. EV/PHEV: batería.
        const eng = input("text", car.engine || "", "Ej: 1.5");
        eng.addEventListener("input", ()=>{
          car.engine = eng.value;
          updateMeta();
          updateInfo();
        });

        const bat = input("number", car.batteryKwh || 0, "");
        bat.step="1"; bat.min="5"; bat.max="250";
        bat.addEventListener("input", ()=>{
          car.batteryKwh = Number(bat.value||0);
          updateMeta();
          updateInfo();
        });

        const engField = field("Cilindrada (L)", eng, "Ej: 1.0, 1.5, 2.0. Útil para estimar consumos (ICE/HEV/PHEV).");
        const batField = field("Batería (kWh)", bat, "EV/PHEV: mejora la estimación de consumo real.");
        grid.appendChild(engField);
        grid.appendChild(batField);

        const label = input("text", (car.versionMeta && car.versionMeta.label && car.versionMeta.label.indexOf("Manual:")===0) ? car.versionMeta.label.replace(/^Manual:\s*/,"") : "", "Ej: 1.5 TSI 150 DSG Style");
        label.addEventListener("input", ()=>{
          if(!car.versionMeta) car.versionMeta = {manual:true};
          car.versionMeta.label = label.value ? `Manual: ${label.value}` : "Manual";
          updateInfo();
        });
        grid.appendChild(field("Acabado / versión (opcional)", label, "Solo para mostrarlo en el resumen/resultados."));

        function updateVisibility(){
          const f = fuelSel.value;
          car.fuel = f;
          // mostrar/ocultar campos
          engField.style.display = (f==="ev") ? "none" : "block";
          cylField.style.display = (f==="ev") ? "none" : "block";
          peField.style.display  = (f==="ev") ? "block" : "none";
          // PHEV también suele tener motor térmico: dejamos cilindrada visible
          batField.style.display = (f==="ev" || f==="phev") ? "block" : "none";
          if(f==="ev" || f==="phev"){
            if(!car.batteryKwh) car.batteryKwh = 50;
          } else {
            if(!car.engine) car.engine = "1.0";
          }
          // Actualizar etiqueta DGT automáticamente si el usuario no la ha editado
          ensureDgtLabel(car);
          try{ dgtSel.value = car.dgtLabel; }catch(e){}
          updateMeta();
          updateInfo();
        }

        fuelSel.addEventListener("change", ()=>{
          updateVisibility();

          const fNow = String(car.fuel||"").toLowerCase();
          if(fNow==="ev" || fNow==="phev"){
            car.ui = car.ui || {};
            car.ui.advOpen = true;
}

          render();
        });

        function updateMeta(){
          const typeMap = { gasoline:"gasolina", diesel:"diesel", hev:"hibrido", phev:"phev", ev:"ev" };
          const type = typeMap[car.fuel] || "gasolina";
          const kw = Number(car.powerKw||0);
          const cv = kw ? Math.round(kw*1.35962) : 0;

          const meta = car.versionMeta && car.versionMeta.manual ? car.versionMeta : {};
          meta.manual = true;
          meta.type = type;
          meta.kw = kw;
          meta.cv = cv;
          // Datos opcionales para IVTM (no se muestran siempre)
          meta.dgtLabel = car.dgtLabel;
          meta.cylinders = Number(car.cylinders||0) || 0;
          meta.peKw = Number(car.peKw||0) || 0;
          meta.battery = (car.fuel==="ev" || car.fuel==="phev") ? Number(car.batteryKwh||0) : 0;
          meta.displacement = (car.fuel==="ev") ? "" : String(car.engine||"").trim();
          meta.price = Number(car.pvpCash||0) || 0;
          meta.priceMax = 0;
          if(!meta.label) meta.label = "Manual";
          car.versionMeta = meta;
        }

        const info = document.createElement("div");
        info.className = "hint";
        info.style.marginTop = "8px";

        function updateInfo(){
          const meta = car.versionMeta || {};
          const tLbl = {
            gasolina:"⛽ Gasolina",
            diesel:"🛢 Diésel",
            hibrido:"🔋 Híbrido",
            phev:"🔌 PHEV",
            ev:"⚡ Eléctrico"
          }[meta.type] || fuelLabel(car.fuel);

          const priceTxt = meta.price ? `${Number(meta.price).toLocaleString('es-ES')}€` : "—";
          const powTxt = meta.cv ? `${meta.cv} cv (${meta.kw||car.powerKw||0} kW)` : `${car.powerKw||"—"} kW`;
          const extra = (car.fuel==="ev" || car.fuel==="phev")
            ? (meta.battery ? ` · Batería: ${meta.battery} kWh` : "")
            : (meta.displacement ? ` · Motor: ${meta.displacement}L` : "");
          info.innerHTML = `<b>Versión manual</b> · ${tLbl} · Potencia: ${powTxt}${extra}<br><span class="small">Precio orientativo “desde”: <b>${priceTxt}</b> (editable en financiación).</span>`;
        }

        updateVisibility();
        updateMeta();
        updateInfo();

        wrapManual.appendChild(grid);
        wrapManual.appendChild(info);
      } else {
        const hint=document.createElement("div");
        hint.className="hint";
        hint.textContent = "Si no encuentras modelo o versión, escribe el nombre y usa “Introducir versión manual”.";
        wrapManual.appendChild(hint);
      }

      step.appendChild(wrapManual);
    }


    // Segmento
    const segSel = select([["utilitario","🚗 Utilitario"],["berlina","🚘 Berlina"],["suv","🚙 SUV"],["deportivo","🏎️ Deportivo"]], car.segment);
    segSel.addEventListener("change", ()=>{
      car.segment=segSel.value;
      const f = String(car.fuel||"").toLowerCase();
      if(f==="ev" || f==="phev"){
        car.ui = car.ui || {};
        car.ui.advOpen = true;
render();
      }
    });
    step.appendChild(field("Segmento (autorrelleno)", segSel, "Se autocompleta al elegir modelo, pero puedes editarlo."));

    // Etiqueta DGT (autorrelleno; bloqueada en EV/HEV/PHEV salvo que el usuario la desbloquee)
    ensureDgtLabel(car);
    const dgtSelMain = select(DGT_LABEL_OPTIONS, normalizeDgtLabel(car.dgtLabel) || inferDgtLabelAuto(car));
    dgtSelMain.addEventListener("change", ()=>{
      car.dgtLabel = dgtSelMain.value;
      car.dgtLabelManual = true;
    });

    const dgtWrap = document.createElement("div");
    dgtWrap.className = "field";
    dgtWrap.innerHTML = `<div class="label">Etiqueta DGT (autorrelleno)</div>`;
    dgtWrap.appendChild(dgtSelMain);

    const fuelKey = String(car.fuel||"").toLowerCase();
    const shouldLockDgt = !car.dgtLabelManual && (fuelKey==="ev" || fuelKey==="hev" || fuelKey==="phev");

    const hintCommon = document.createElement("div");
    hintCommon.className = "hint";
    hintCommon.textContent = "Se usa para bonificaciones del IVTM si tu municipio las aplica. En PHEV puede ser CERO si tiene ≥40 km eléctricos: ajusta si lo sabes.";

    if(shouldLockDgt){
      dgtSelMain.disabled = true;
      const h = document.createElement("div");
      h.className = "hint";
      const reason = (fuelKey==="ev") ? "Eléctrico → CERO" : ((fuelKey==="hev") ? "Híbrido → ECO" : "PHEV → ECO/CERO según autonomía");
      h.textContent = `Autodetectada por la versión (${reason}).`;
      dgtWrap.appendChild(h);

      const row = document.createElement("div");
      row.style.marginTop = "8px";
      const btnUnlock = document.createElement("button");
      btnUnlock.type = "button";
      btnUnlock.className = "btn ghost";
      btnUnlock.textContent = "Editar etiqueta";
      btnUnlock.addEventListener("click", ()=>{
        car.dgtLabelManual = true;
        dgtSelMain.disabled = false;
        toast("Etiqueta en modo manual");
      });
      row.appendChild(btnUnlock);
      dgtWrap.appendChild(row);
      dgtWrap.appendChild(hintCommon);
    } else {
      dgtWrap.appendChild(hintCommon);
    }

    step.appendChild(dgtWrap);

    // PVP al contado (con IVA) — necesario aunque NO financies
    let pvpIn = null;
    if(car.brand && car.model){
      // Si ya hay precio en la versión y el usuario no ha puesto PVP, lo usamos como base
      if((!car.pvpCash || Number(car.pvpCash)<=0) && car.versionMeta && Number(car.versionMeta.price||0)>0){
        car.pvpCash = Number(car.versionMeta.price||0);
        if(!car.priceFinanced || Number(car.priceFinanced)<=0) car.priceFinanced = car.pvpCash;
      }

      pvpIn = input("number", car.pvpCash || 0, "");
      pvpIn.step="100";
      pvpIn.addEventListener("input", ()=>{
        const v = Number(pvpIn.value||0);
        car.pvpCash = v;
        if(car.versionMeta) car.versionMeta.price = v;
        if(!car.priceFinanced || Number(car.priceFinanced)<=0) car.priceFinanced = v;
        refreshAutoPlusTramo();
      });
      step.appendChild(field("PVP estimado FairCar (€)", pvpIn, "Estimación con IVA. Se usa para el cálculo y para determinar el tramo de precio de Auto+."));
    }

    // Auto+ y ajustes avanzados (como antes) — tramo de precio automático (PVP con IVA → sin IVA)
    const adv = document.createElement("details");
    adv.className = "details autoplus-details";
    adv.style.marginTop = "10px";
    adv.innerHTML = `<summary>⚡ Auto+ y ajustes avanzados</summary>`;

    // Mantener el desplegable abierto si el usuario ya lo abrió.
    // En EV/PHEV exigimos que lo abra al menos una vez para continuar.
    const isEvOrPhev = (String(car.fuel||"").toLowerCase()==="ev" || String(car.fuel||"").toLowerCase()==="phev");
    adv.open = !!car.ui.advOpen;
    adv.addEventListener("toggle", ()=>{
      car.ui.advOpen = adv.open;
      if(adv.open && isEvOrPhev){
        car.auto.entered = true;
      }
    });

    const advBox = document.createElement("div");
    advBox.style.marginTop = "10px";

    // Referencias UI (para refrescar cuando cambie el PVP)
    let autoSummary = null;
    let detCalc = null;
    let madeSel = null;
    let batSel = null;
    let baseIn = null;
    let baseHintEl = null;
    let baseResetBtn = null;

    function refreshAutoPlusTramo(){
      const f = String(car.fuel||"").toLowerCase();
      const isEvOrPhev = (f==="ev" || f==="phev");

      if(!isEvOrPhev){
        if(autoSummary) autoSummary.innerHTML = `<b>Neto Auto+:</b> —`;
        if(detCalc) detCalc.style.display = "none";
        if(madeSel) madeSel.disabled = true;
        if(batSel) batSel.disabled = true;
        if(baseIn) baseIn.disabled = true;
        if(baseResetBtn) baseResetBtn.style.display = "none";
        return;
      }

      autoPlusUpdateFromPrice(car);

      const pvp = Number(car.pvpCash||0)||0;
      const eligible = !!car.auto.eligible;

      // Si supera 45.000€ sin IVA (pvp informado y no elegible), ocultamos el desplegable para simplificar
      if(detCalc){
        const hide = (pvp>0 && !eligible);
        detCalc.style.display = hide ? "none" : "block";
        if(hide) detCalc.open = false;
      }

      // Resumen simplificado (fuera del detalle): solo Neto
      if(autoSummary){
        if(pvp<=0){
          autoSummary.innerHTML = `<b>Neto Auto+ estimado:</b> — <span class="small">Introduce el PVP para estimar.</span>`;
        } else if(!eligible){
          autoSummary.innerHTML = `<b>Neto Auto+:</b> — <span class="small"><b>No aplica</b> (supera 45.000€ sin IVA).</span>`;
        } else {
          const calc = computeAutoPlus(car);
          autoSummary.innerHTML = `<b>Neto Auto+ estimado:</b> ${euro(calc.net)}`;
        }
      }

      // Base Auto+ automática (y sobre-editable)
      if(baseIn){
        const baseMotor = (f==="phev") ? 1125 : 2250;
        const extraMade = (car.auto.madeEU==="yes") ? 675 : 0;
        const extraBat  = (car.auto.batteryEU==="yes") ? 450 : 0;
        const bonusPrice = (pvp>0 && eligible) ? Math.max(0, Number(car.auto.priceBonus||0) || 0) : 0;

        const totalBaseAuto = eligible ? (baseMotor + bonusPrice + extraMade + extraBat) : 0;
        car.auto.baseAuto = totalBaseAuto;

        const lock = (pvp>0 && !eligible);
        if(lock){
          car.auto.baseUserOn = false;
          car.auto.baseUser = 0;
          car.auto.base = 0;
          baseIn.value = "0";
          baseIn.disabled = true;
          if(baseResetBtn) baseResetBtn.style.display = "none";
          if(baseHintEl) baseHintEl.textContent = `No aplica por superar 45.000€ sin IVA. Base fija a 0€ (no editable).`;
        } else {
          baseIn.disabled = false;

          const overrideOn = !!car.auto.baseUserOn;
          if(!overrideOn){
            baseIn.value = String(Math.round(totalBaseAuto));
            car.auto.base = totalBaseAuto;
          } else {
            const v = Math.max(0, Number(baseIn.value||car.auto.baseUser||0) || 0);
            car.auto.baseUser = v;
            car.auto.base = v;
            baseIn.value = String(Math.round(v));
          }

          if(baseResetBtn) baseResetBtn.style.display = (car.auto.baseUserOn ? "inline-flex" : "none");

          if(baseHintEl){
            if(pvp<=0){
              baseHintEl.textContent = `Automático: ${Math.round(totalBaseAuto).toLocaleString('es-ES')}€ (sin bonus por precio hasta introducir PVP). Puedes sobre-editarlo.`;
            } else {
              baseHintEl.textContent = `Automático: ${Math.round(totalBaseAuto).toLocaleString('es-ES')}€ (incluye bonus por precio y extras UE). Puedes sobre-editarlo.`;
            }
          }
        }
      }

      // Si está fuera de límite, deshabilitamos ajustes (y si sobre-editas la base, también para evitar confusión)
      const lock = (pvp>0 && !eligible);
      const overrideOn = !!car.auto.baseUserOn;
      if(madeSel) madeSel.disabled = lock || overrideOn;
      if(batSel) batSel.disabled = lock || overrideOn;
    }

    // Auto+ (solo EV/PHEV) — mantenemos opciones como antes, pero SIN selector manual de tramo
    const fNow = String(car.fuel||"").toLowerCase();
    if(fNow==="ev" || fNow==="phev"){
      // En el Programa Auto+ para M1/N1, el punto de venta aporta un descuento mínimo adicional de 1.000€.
      // Lo fijamos a "sí" para evitar confusión (y simplificar la UI).
      car.auto.dealerBonus = "yes";

      const autoBox = document.createElement("div");
      autoBox.innerHTML = `<div class="section-title">Auto+ (solo EV/PHEV)</div>`;

      // Resumen visible (solo el neto). El detalle va plegado.
      autoSummary = document.createElement("div");
      autoSummary.className = "hint";
      autoBox.appendChild(autoSummary);

      detCalc = document.createElement("details");
      detCalc.className = "fc-details autoplus-calc";
      // UX: Abrimos "Ajustes Auto+" por defecto cuando aplica, para que el usuario no lo pase por alto.
      // Una vez que el usuario lo abre/cierra manualmente, recordamos su preferencia.
      car.ui = car.ui || {};
      const hasPref = (typeof car.ui.autoCalcOpen === "boolean");
      detCalc.open = hasPref ? car.ui.autoCalcOpen : true;
      detCalc.addEventListener("toggle", ()=>{ car.ui.autoCalcOpen = detCalc.open; });

      const sumCalc = document.createElement("summary");
      sumCalc.innerHTML = `<span>Ajustes Auto+</span><span class="small">Base · UE · descuento</span>`;
      detCalc.appendChild(sumCalc);

      const bodyCalc = document.createElement("div");
      bodyCalc.className = "fc-details-body";

      // Base Auto+ (automática pero sobre-editable)
      const baseDefault = (fNow==="phev") ? 1125 : 2250;
      const baseInitial = (car.auto.baseUserOn) ? (Number(car.auto.baseUser||0)||0) : (Number(car.auto.baseAuto||0)||baseDefault);

      const base = input("number", Math.round(baseInitial), "");
      base.step = "25";
      base.addEventListener("input", ()=>{
        car.auto.baseUserOn = true;
        car.auto.baseUser = Number(base.value||0);
        refreshAutoPlusTramo();
      });

      const baseWrap = document.createElement("div");
      baseWrap.className = "field";
      baseWrap.innerHTML = `<div class="label">Base Auto+ (€)</div>`;

      const baseRow = document.createElement("div");
      baseRow.style.display = "flex";
      baseRow.style.gap = "10px";
      baseRow.style.alignItems = "center";

      baseRow.appendChild(base);

      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "btn ghost";
      resetBtn.textContent = "Automático";
      resetBtn.addEventListener("click", ()=>{
        car.auto.baseUserOn = false;
        car.auto.baseUser = 0;
        refreshAutoPlusTramo();
      });
      baseResetBtn = resetBtn;
      baseRow.appendChild(resetBtn);

      baseWrap.appendChild(baseRow);

      const h = document.createElement("div");
      h.className = "hint";
      h.textContent = "Se calcula automáticamente, pero puedes sobre-editarlo. Si supera 45.000€ sin IVA, se fija a 0€.";
      baseWrap.appendChild(h);

      baseIn = base;
      baseHintEl = h;
      bodyCalc.appendChild(baseWrap);

      // Ajustes opcionales (se aplican al cálculo automático). Si sobre-editas la base, se desactivan para evitar confusión.
      madeSel = select([["no","No"],["yes","Sí (+675€)"]], car.auto.madeEU);
      madeSel.addEventListener("change", ()=>{ car.auto.madeEU = madeSel.value; refreshAutoPlusTramo(); });
      bodyCalc.appendChild(field("Fabricación Europa", madeSel));

      batSel = select([["no","No"],["yes","Sí (+450€)"]], car.auto.batteryEU);
      batSel.addEventListener("change", ()=>{ car.auto.batteryEU = batSel.value; refreshAutoPlusTramo(); });
      bodyCalc.appendChild(field("Batería EU", batSel));

      // Descuento mínimo del punto de venta (fijo; no editable)
      const dealerFixed = input("number", 1000, "");
      dealerFixed.readOnly = true;
      dealerFixed.tabIndex = -1;
      bodyCalc.appendChild(field(
        "Descuento mínimo del punto de venta (€)",
        dealerFixed,
        "En el Programa Auto+ (turismos M1 y furgonetas N1) el punto de venta debe aplicar un descuento adicional de al menos 1.000€ sobre el precio de venta."
      ));

      detCalc.appendChild(bodyCalc);
      autoBox.appendChild(detCalc);

      const savedIrpf = getSavedIrpfPct();
      const hasSavedIrpf = (savedIrpf!==null && typeof savedIrpf==="number" && isFinite(savedIrpf));
      if(hasSavedIrpf){
        state.irpfPct = clamp(savedIrpf, 0, 0.50);
      }

      const pctTxt = ()=> `${Math.round(clamp(Number(state.irpfPct ?? 0.15), 0, 0.50) * 100)}%`;

      if(hasSavedIrpf){
        const det = document.createElement("details");
        det.className = "fc-details";

        const sum = document.createElement("summary");
        sum.innerHTML = `<span>IRPF aplicado: <b class="irpf-sum">${pctTxt()}</b></span><span class="small">Cambiar</span>`;
        det.appendChild(sum);

        const body = document.createElement("div");
        body.className = "fc-details-body";

        const irpf = makeIrpfControl();
        irpf.querySelectorAll("input").forEach(el=> el.addEventListener("input", ()=>{
          refreshAutoPlusTramo();
          const b = sum.querySelector(".irpf-sum");
          if(b) b.textContent = pctTxt();
        }));

        body.appendChild(field("IRPF marginal (0–50%)", irpf, "Se guarda automáticamente para futuras comparativas."));
        det.appendChild(body);
        autoBox.appendChild(det);
      } else {
        const irpf = makeIrpfControl();
        // refrescar estimación cuando cambie el IRPF
        irpf.querySelectorAll("input").forEach(el=> el.addEventListener("input", refreshAutoPlusTramo));
        autoBox.appendChild(field("IRPF marginal estimado (0–50%)", irpf, "Se guarda automáticamente para futuras comparativas."));
      }

      refreshAutoPlusTramo();
      advBox.appendChild(autoBox);
    } else {
      const h = document.createElement("div");
      h.className = "hint";
      h.textContent = "Auto+ solo aplica a EV/PHEV. Si eliges un eléctrico o PHEV, aquí verás el asistente.";
      advBox.appendChild(h);
    }

    adv.appendChild(advBox);
    step.appendChild(adv);

    mount.appendChild(step);

    return { nextText: "Continuar" };
  }

  function stepFinanceQuestion(car, letter){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>¿Lo vas a financiar?</h2>
      <p>Si vas a financiar, aquí es donde suelen aparecer “trucos”: diferencia entre precio contado y financiado, comisión de apertura, seguros y cuota real. En el siguiente paso introducirás tu oferta para estimar <b>cuota</b>, <b>TAE</b> y detectar incoherencias.</p>
    `;
    const grid=document.createElement("div");
    grid.className="grid2";
    grid.appendChild(cardChoice("Sí, voy a financiar", "Veremos cuota, TIN, comisiones y seguros.", "💳", car.financeEnabled==="yes", ()=>{ car.financeEnabled="yes"; render(); }));
    grid.appendChild(cardChoice("No, pago al contado", "Calculo equivalente durante el plazo analizado.", "💶", car.financeEnabled==="no", ()=>{ car.financeEnabled="no"; render(); }));
    step.appendChild(grid);

    const h=document.createElement("div"); h.className="hint";
    h.textContent = car.financeEnabled==="yes"
      ? "Consejo: pide al concesionario el precio al contado real y el detalle de comisión/seguros."
      : "Usaremos el PVP al contado y lo repartiremos en el plazo de análisis para compararlo en €/mes.";
    step.appendChild(h);

    mount.appendChild(step);
    return { nextText: "Continuar" };
  }

  function stepFinanceDetails(car, letter){
  const step=document.createElement("div");
  step.className="step";
  step.innerHTML = `<h2>Oferta de financiación — Coche ${letter==="A"?"A":"B"}</h2>`;

  // Resumen del coche
  const sum=document.createElement("div");
  sum.className="hint is-big";
  sum.style.marginTop="2px";
  sum.innerHTML = `<b>${car.brand||"—"} ${car.model||""}</b> · ${fuelLabel(car.fuel)} · ${segLabel(car.segment)}`;
  step.appendChild(sum);

  // ─── Herencia A→B ───
  if(letter==="B"){
    if(!car._financeModeTouched){ car.financeMode = state.carA?.financeMode || "linear"; }
    if(!car._downPaymentTouched){ car.downPayment = Number(state.carA?.downPayment||0); }
  }

  // ─── Modal aviso comparativa (coche B) ───
  function warnFinanceChange(fieldName, revertFn){
    if(letter!=="B") return false;
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px";
    overlay.innerHTML = `
      <div style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;max-width:400px;width:100%;box-shadow:var(--shadow)">
        <div style="font-size:22px;margin-bottom:8px">⚠️ Comparativa menos fiable</div>
        <p style="color:var(--muted);margin:0 0 16px 0;line-height:1.45">Para comparar de forma justa, ambos coches deberían tener el mismo tipo, plazo y entrada.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button id="warnKeep" class="btn" style="flex:1">Igualar a ${esc(state.carA?.brand||"Coche A")} ✓</button>
          <button id="warnContinue" class="btn ghost" style="flex:1">Continuar así</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#warnKeep").addEventListener("click",()=>{ revertFn(); car._financeNotComparable=false; overlay.remove(); render(); });
    overlay.querySelector("#warnContinue").addEventListener("click",()=>{ car._financeNotComparable=true; car._financeModeTouched=true; overlay.remove(); render(); });
    overlay.addEventListener("click",(e)=>{ if(e.target===overlay){ overlay.remove(); revertFn(); render(); } });
    return true;
  }

  // ══════════════════════════════════════════════
  // BLOQUE 0 — Tipo de financiación + plazo
  // ══════════════════════════════════════════════
  const b0 = document.createElement("div");
  b0.className = "fc-fin-block";
  b0.style.marginTop = "14px";

  const fmTitle = document.createElement("div");
  fmTitle.className = "fc-fin-block-title";
  fmTitle.textContent = "Tipo de financiación";
  b0.appendChild(fmTitle);

  const fmGrid = document.createElement("div");
  fmGrid.className = "grid2";
  fmGrid.style.marginTop = "8px";
  fmGrid.appendChild(cardChoice("Lineal (cuota fija)","La financiación estándar: amortizas todo en el plazo.","📈",
    car.financeMode!=="flex",
    ()=>{
      if(letter==="B" && state.carA?.financeMode==="flex" && !car._financeModeTouched){
        car.financeMode="linear"; car.flexGmv=0;
        warnFinanceChange("tipo",()=>{ car.financeMode=state.carA.financeMode||"flex"; if(!car.flexGmv) car.flexGmv=Math.round((car.pvpCash||0)*0.35)||0; });
      } else { car.financeMode="linear"; car.flexGmv=0; render(); }
    }
  ));
  fmGrid.appendChild(cardChoice("Flexible (valor final / GMV)","Cuota más baja + un valor final (si te quedas el coche) o lo entregas al final.","🔁",
    car.financeMode==="flex",
    ()=>{
      if(letter==="B" && state.carA?.financeMode!=="flex" && !car._financeModeTouched){
        car.financeMode="flex"; if(!car.flexGmv) car.flexGmv=Math.round((car.pvpCash||car.priceFinanced||0)*0.35)||0;
        warnFinanceChange("tipo",()=>{ car.financeMode=state.carA.financeMode||"linear"; car.flexGmv=0; });
      } else { car.financeMode="flex"; if(!car.flexGmv) car.flexGmv=Math.round((car.pvpCash||car.priceFinanced||0)*0.35)||0; render(); }
    }
  ));
  b0.appendChild(fmGrid);

  // Flexible: GMV + decisión al final
  if(car.financeMode==="flex"){
    if(!car.flexEnd) car.flexEnd="return";
    const gmv=input("number",car.flexGmv,""); gmv.step="100";
    gmv.addEventListener("input",()=>{ car.flexGmv=Number(gmv.value||0); recalc(); });
    b0.appendChild(field("Valor final / GMV (€)",gmv,"Si te quedas el coche, este importe se paga al final."));

    const endTitle=document.createElement("div"); endTitle.className="section-title"; endTitle.style.marginTop="10px"; endTitle.textContent="Al final del plazo";
    b0.appendChild(endTitle);
    const endGrid=document.createElement("div"); endGrid.className="grid2";
    endGrid.appendChild(cardChoice("Devolver el coche","No pagas el valor final en efectivo.","↩️",car.flexEnd!=="keep",()=>{ car.flexEnd="return"; recalc(); render(); }));
    endGrid.appendChild(cardChoice("Quedártelo","Sumamos el valor final al total pagado.","🔒",car.flexEnd==="keep",()=>{ car.flexEnd="keep"; recalc(); render(); }));
    b0.appendChild(endGrid);

    const inst=input("number",Number(car.installments||0)||0,""); inst.step="1"; inst.min="0"; inst.max="180";
    inst.addEventListener("input",()=>{ car.installments=Number(inst.value||0)||0; recalc(); });
    b0.appendChild(field("Nº cuotas mensuales (opcional)",inst,"Ej: 48 cuotas + última cuota GMV. Si lo dejas en 0, FairCar usa el plazo."));
  }

  // Plazo
  if(letter==="A"){
    const term=input("number",state.termMonths,""); term.step="12"; term.min="12"; term.max="180";
    term.addEventListener("input",()=>{ state.termMonths=Number(term.value||state.termMonths||60); recalc(); });
    term.addEventListener("change",()=>{ state.termMonths=normalizeTermMonths(term.value); term.value=state.termMonths; recalc(); });
    b0.appendChild(field("Plazo de financiación (meses)",term,"Único para ambos coches. Puedes escribir cualquier valor (ej: 49)."));
  } else {
    const inf=document.createElement("div"); inf.className="hint"; inf.textContent=`Plazo: ${state.termMonths} meses (igual que coche A).`;
    b0.appendChild(inf);
  }
  step.appendChild(b0);

  // ══════════════════════════════════════════════
  // BLOQUE 1 — Datos esenciales de la oferta
  // ══════════════════════════════════════════════
  const b1 = document.createElement("div");
  b1.className = "fc-fin-block";
  b1.style.marginTop = "12px";

  const b1title = document.createElement("div");
  b1title.className = "fc-fin-block-title";
  b1title.textContent = "Oferta del concesionario";
  b1.appendChild(b1title);

  // Importar presupuesto
  const importBox=document.createElement("div");
  importBox.className="hint is-big";
  importBox.style.marginTop="8px";
  importBox.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="min-width:0">
        <div style="font-weight:900">Importar presupuesto</div>
        <div class="smallmuted" style="margin-top:2px">Rellena todos los datos automáticamente con foto o PDF.</div>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap">
        <button class="btn ghost" type="button" id="btnBudgetCamera_${letter}" style="white-space:nowrap;display:flex;align-items:center;gap:5px"><span style="font-size:15px">📷</span> Foto</button>
        <button class="btn ghost" type="button" id="btnBudgetImport_${letter}" style="white-space:nowrap;display:flex;align-items:center;gap:5px"><span style="font-size:15px">📎</span> PDF / imagen</button>
      </div>
    </div>
    <div id="budgetStatus_${letter}" style="display:none;margin-top:10px;padding:8px 12px;border-radius:10px;background:var(--info-bg);border:1px solid var(--info-border);font-size:13px;color:var(--lead)">
      <span style="font-size:16px">⏳</span> <span id="budgetStatusText_${letter}">Procesando…</span>
    </div>
  `;
  const budgetCamera=document.createElement("input"); budgetCamera.type="file"; budgetCamera.accept="image/*"; budgetCamera.setAttribute("capture","environment"); budgetCamera.style.display="none"; importBox.appendChild(budgetCamera);
  const budgetFile=document.createElement("input"); budgetFile.type="file"; budgetFile.accept="image/*,application/pdf,.pdf"; budgetFile.style.display="none"; importBox.appendChild(budgetFile);
  b1.appendChild(importBox);

  function setBudgetStatus(msg){
    const bar=importBox.querySelector(`#budgetStatus_${letter}`); const txt=importBox.querySelector(`#budgetStatusText_${letter}`);
    if(!bar||!txt) return;
    bar.style.display=msg?"block":"none"; if(msg) txt.textContent=msg;
  }
  importBox.querySelector(`#btnBudgetCamera_${letter}`).addEventListener("click",()=>{ budgetCamera.value=""; budgetCamera.click(); });
  importBox.querySelector(`#btnBudgetImport_${letter}`).addEventListener("click",()=>{ budgetFile.value=""; budgetFile.click(); });
  async function handleBudgetFile(f){ if(!f) return; setBudgetStatus("Leyendo archivo…"); try{ await budgetImportFlow({file:f,car,letter,onProgress:(msg)=>setBudgetStatus(msg)}); }finally{ setBudgetStatus(null); } }
  budgetCamera.addEventListener("change",async()=>{ await handleBudgetFile(budgetCamera.files&&budgetCamera.files[0]); });
  budgetFile.addEventListener("change",async()=>{ await handleBudgetFile(budgetFile.files&&budgetFile.files[0]); });

  // ── Campos editables (grid 2 columnas) ──
  const g1 = document.createElement("div");
  g1.className = "grid2 keep2";
  g1.style.marginTop = "10px";

  // Cuota ofrecida
  const cuotaOffer=input("number",car.monthlyPayment,""); cuotaOffer.step="0.01";
  cuotaOffer.addEventListener("input",()=>{ car.monthlyPayment=Number(cuotaOffer.value||0); recalc(); });
  g1.appendChild(field("Cuota ofrecida (€/mes)",cuotaOffer,"Solo para comprobar si cuadra con el TIN."));

  // PVP al contado — siempre visible, sin pregunta previa
  function getOrientativePvp(){
    let p=0;
    try{ if(car.versionMeta && Number(car.versionMeta.price||0)>0) p=Number(car.versionMeta.price||0); }catch(e){}
    if(!(p>0)){ try{ const md=getModelData(car.brand,car.model); if(md) p=Number(md.priceFrom||0)||Number(md.price||0)||0; }catch(e){} }
    if(!(p>0)) p=Number(car.pvpCashOrient||0)||Number(car.pvpCash||0)||25000;
    return Math.round(p);
  }
  const orientPvp0=getOrientativePvp();
  car.pvpCashOrient=orientPvp0;
  if(!car.pvpKnown) car.pvpKnown=(Number(car.pvpCashManual||0)>0)?"yes":"no";

  const pvp=input("number",Number(car.pvpCashManual||0)||orientPvp0,""); pvp.step="100";
  pvp.addEventListener("input",()=>{
    const v=Number(pvp.value||0);
    car.pvpCash=v; car.pvpCashManual=v; car.pvpKnown="yes";
    syncPriceFin(); recalc();
  });
  const pvpWrap=field("PVP al contado (€)",pvp,"Precio sin financiación. Si no lo sabes, el orientativo de la versión es: "+euro(orientPvp0));
  if(!car.pvpCashManual || Number(car.pvpCashManual||0)<=0){
    const pvpHint=document.createElement("div"); pvpHint.className="hint"; pvpHint.textContent=`Orientativo según versión: ${euro(orientPvp0)}. Pide el PVP real al concesionario.`;
    pvpWrap.appendChild(pvpHint);
  }
  g1.appendChild(pvpWrap);

  // Entrada
  const down=input("number",car.downPayment,""); down.step="100";
  down.addEventListener("input",()=>{
    const newVal=Number(down.value||0);
    if(letter==="B" && !car._downPaymentTouched && Math.abs(newVal-Number(state.carA?.downPayment||0))>50){
      const prevVal=Number(car.downPayment||0);
      car.downPayment=newVal;
      warnFinanceChange("entrada",()=>{ car.downPayment=Number(state.carA?.downPayment||0); down.value=String(car.downPayment); recalc(); });
      car._downPaymentTouched=true;
    } else { car.downPayment=newVal; }
    recalc();
  });
  g1.appendChild(field("Entrada (€)",down));

  // Descuento por financiar
  const discIn=input("number",car.financeDiscount||0,""); discIn.step="100";
  discIn.addEventListener("input",()=>{ car.financeDiscount=Number(discIn.value||0); syncPriceFin(); recalc(); });
  g1.appendChild(field("Bonificación por financiar (€)",discIn,"Ej: descuento TFS/VWFS. FairCar lo resta del PVP."));

  // TIN
  const tin=input("number",car.tin,""); tin.step="0.01";
  tin.addEventListener("input",()=>{ car.tin=Number(tin.value||0); recalc(); });
  g1.appendChild(field("TIN (%)",tin));

  // TAE oficial (solo referencia, no afecta cálculos)
  const taeOficial=input("number",car.tae||"",""); taeOficial.step="0.01";
  taeOficial.addEventListener("input",()=>{ car.tae=Number(taeOficial.value||0)||0; recalc(); });
  g1.appendChild(field("TAE oficial (%)",taeOficial,"La TAE del contrato. FairCar la compara con su estimación para detectar discrepancias."));

  b1.appendChild(g1);
  step.appendChild(b1);

  // ══════════════════════════════════════════════
  // BLOQUE 2 — Comisión de apertura (colapsable)
  // ══════════════════════════════════════════════
  const hasAnyOpenFee = Number(car.openFeePct||0)>0 || Number(car._openFeeAmt||0)>0;
  const d2=document.createElement("details");
  d2.className="fc-details"; d2.style.marginTop="8px";
  if(hasAnyOpenFee) d2.open=true;
  d2.innerHTML=`<summary>Comisión de apertura ${hasAnyOpenFee ? `<span class="badge warn" style="margin-left:8px;font-size:11px">Activa</span>` : `<span style="color:var(--muted);font-size:12px;margin-left:8px">Sin comisión</span>`}</summary>`;
  const d2body=document.createElement("div"); d2body.className="fc-details-body";

  const openGrid=document.createElement("div"); openGrid.className="grid2 keep2"; openGrid.style.marginTop="4px";
  const openAmt=input("number",car._openFeeAmt||0,""); openAmt.step="10"; openAmt.placeholder="0";
  const open=input("number",car.openFeePct||0,""); open.step="0.01"; open.placeholder="0";

  function syncOpenFeeAmtToPct(){
    const base=Math.max(1,(Number(car.priceFinanced||0)||Number(car.pvpCash||0)||1)-Number(car.downPayment||0));
    const amt=Number(openAmt.value||0); if(amt>0 && base>0){ const pct=Math.round((amt/base)*10000)/100; car.openFeePct=pct; open.value=String(pct); }
    else if(Number(open.value||0)<=0){ car.openFeePct=0; }
    car._openFeeAmt=amt; recalc();
  }
  function syncOpenFeePctToAmt(){
    const base=Math.max(1,(Number(car.priceFinanced||0)||Number(car.pvpCash||0)||1)-Number(car.downPayment||0));
    const pct=Number(open.value||0); if(pct>0 && base>0){ const amt=Math.round(base*pct/100); car._openFeeAmt=amt; openAmt.value=String(amt); }
    else if(Number(openAmt.value||0)<=0){ car._openFeeAmt=0; }
    car.openFeePct=pct; recalc();
  }
  openAmt.addEventListener("input",syncOpenFeeAmtToPct);
  open.addEventListener("input",syncOpenFeePctToAmt);

  openGrid.appendChild(field("Importe (€)",openAmt,"Si aparece en € en la oferta (ej: 'Gastos formalización: 973€')."));
  openGrid.appendChild(field("Porcentaje (%)",open,"Si aparece en % en la oferta (ej: 'Comisión apertura: 2,5%)."));
  d2body.appendChild(openGrid);
  const openHint=document.createElement("div"); openHint.className="hint"; openHint.textContent="Se calculan mutuamente. Rellena uno solo si solo tienes uno de los dos.";
  d2body.appendChild(openHint);
  d2.appendChild(d2body);
  step.appendChild(d2);

  // ══════════════════════════════════════════════
  // BLOQUE 3 — Extras incluidos (colapsable)
  // ══════════════════════════════════════════════
  // Inicializar extras desde Vision JSON si los hay
  if(!car._extras) car._extras=[];

  // Mantenimiento incluido (no en _extras, es campo separado)
  car.autoPlusDealerAlreadyIncluded=car.autoPlusDealerAlreadyIncluded||"no";
  car.autoPlusApplyGovToFinance=car.autoPlusApplyGovToFinance||"no";
  car.lifeService=car.lifeService||{wanted:"no",wantCheaper:"no",nameDni:"",policyNo:"",insurer:"",deliveryDate:"",email:"",whatsapp:"",notes:"",caseId:""};

  const hasExtras=car._extras.length>0||Number(car.lifeInsMonthly||0)>0||Number(car.insFinancedTotal||0)>0;
  const d3=document.createElement("details");
  d3.className="fc-details"; d3.style.marginTop="8px";
  if(hasExtras) d3.open=true;
  d3.innerHTML=`<summary>Extras incluidos en la oferta ${hasExtras?`<span class="badge warn" style="margin-left:8px;font-size:11px">${car._extras.length||"Sí"}</span>`:`<span style="color:var(--muted);font-size:12px;margin-left:8px">Seguros, mantenimiento…</span>`}</summary>`;
  const d3body=document.createElement("div"); d3body.className="fc-details-body";

  // Lista de extras
  const extrasList=document.createElement("div"); extrasList.id=`extrasList_${letter}`; extrasList.style.marginTop="4px";
  function renderExtrasList(){
    extrasList.innerHTML="";
    car._extras.forEach((ex,i)=>{
      const row=document.createElement("div");
      row.style.cssText="display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)";
      const badge=ex.tipo==="mensual_cuota"?"🔄 Mensual":"💰 Prima única";
      const taeTag=ex.entra_tae?`<span class="badge ok" style="font-size:10px">En TAE</span>`:`<span class="badge warn" style="font-size:10px">No en TAE</span>`;
      row.innerHTML=`
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;font-size:13px">${_escHtml(ex.nombre||"Extra")} <span style="font-weight:400;color:var(--muted);font-size:12px">${badge}</span> ${taeTag}</div>
          <div style="color:var(--muted);font-size:12px;margin-top:2px">${euro(ex.importe||0)}${ex.tipo==="mensual_cuota"?"/mes":" total"}</div>
        </div>
        <button type="button" class="btn ghost" style="padding:4px 8px;font-size:12px" data-del="${i}">✕</button>
      `;
      row.querySelector(`[data-del]`).addEventListener("click",()=>{ car._extras.splice(i,1); syncExtrasToCarFields(); renderExtrasList(); recalc(); });
      extrasList.appendChild(row);
    });
    // Aviso cancelación si hay mensual
    const mensual=car._extras.filter(e=>e.tipo==="mensual_cuota");
    if(mensual.length>0){
      const svcBox=document.createElement("div");
      svcBox.className="fc-fin-block";
      svcBox.style.cssText="margin-top:10px;background:var(--warn-bg);border-color:var(--warn-border)";
      svcBox.innerHTML=`
        <div style="font-weight:800;font-size:13px">💡 Estos seguros suelen ser cancelables</div>
        <div class="hint" style="margin-top:4px">Los seguros incluidos en cuota <b>no suelen ser obligatorios por ley</b>. Puedes cancelarlos habitualmente en los primeros 30 días o en renovación anual.</div>
        <details class="fc-details" style="margin-top:8px">
          <summary>Ver pasos para cancelar + plantilla</summary>
          <div class="fc-details-body">
            <ol class="service-steps">
              <li>Pide el <b>nº de póliza</b>, <b>aseguradora</b> y <b>fecha de entrega</b> de la documentación.</li>
              <li>Envía una comunicación <b>por escrito</b> (email/carta) a la aseguradora dentro del plazo de desistimiento.</li>
              <li>Guarda el justificante de envío y confirma la baja por escrito.</li>
              <li>Antes de cancelarlo, revisa si el seguro estaba ligado a una <b>bonificación de TIN</b>.</li>
            </ol>
            <div class="btn-row" style="margin-top:10px;gap:10px;display:flex;flex-wrap:wrap">
              <button type="button" class="btn ghost" id="btnLifeTpl2_${letter}">Descargar plantilla</button>
              <button type="button" class="btn ghost" id="btnLifeMail2_${letter}">Copiar email</button>
            </div>
          </div>
        </details>
      `;
      extrasList.appendChild(svcBox);
      svcBox.querySelector(`#btnLifeTpl2_${letter}`)?.addEventListener("click",()=>{
        downloadTextFile("faircar_cancelacion_seguro.txt",buildLifeTemplate());
      });
      svcBox.querySelector(`#btnLifeMail2_${letter}`)?.addEventListener("click",async()=>{
        const txt=buildLifeTemplate();
        try{ if(navigator.clipboard) await navigator.clipboard.writeText(txt); else{ const ta=document.createElement("textarea"); ta.value=txt; ta.style="position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); } toast("Copiado ✅"); }catch(e){ toast("Copiado ✅"); }
      });
    }
    // Aviso primas únicas no en TAE
    const primasNoTae=car._extras.filter(e=>e.tipo==="prima_unica"&&!e.entra_tae);
    if(primasNoTae.length>0){
      const warn=document.createElement("div");
      warn.style.cssText="margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--warn-bg);border:1px solid var(--warn-border);font-size:12px;color:var(--warn-text)";
      warn.innerHTML=`⚠️ <b>Prima única financiada fuera de la TAE</b>: pagas intereses sobre el importe del seguro durante todo el plazo. Coste oculto real.`;
      extrasList.appendChild(warn);
    }
  }

  function syncExtrasToCarFields(){
    // Calcular totales desde _extras para compatibilidad con el motor de cálculo
    const mensualTotal=car._extras.filter(e=>e.tipo==="mensual_cuota").reduce((s,e)=>s+Number(e.importe||0),0);
    const primaTotal=car._extras.filter(e=>e.tipo==="prima_unica").reduce((s,e)=>s+Number(e.importe||0),0);
    if(mensualTotal>0){
      car.lifeInsMonthly=mensualTotal; car.hasLifeInLoan="yes"; car.insInPayment="yes"; car.insMode="monthly";
    } else {
      car.lifeInsMonthly=0;
    }
    if(primaTotal>0){
      car.insFinancedTotal=primaTotal; car.hasLifeInLoan="yes"; car.insMode="financed";
    } else {
      car.insFinancedTotal=0;
    }
    if(mensualTotal<=0 && primaTotal<=0){ car.hasLifeInLoan="no"; car.insInPayment="no"; }
  }

  d3body.appendChild(extrasList);

  // Formulario para añadir extra manualmente
  const addForm=document.createElement("div");
  addForm.style.cssText="margin-top:12px;padding:12px;border-radius:12px;border:1px dashed var(--line);background:var(--glass)";
  addForm.innerHTML=`
    <div style="font-weight:800;font-size:13px;margin-bottom:8px">➕ Añadir extra</div>
    <div class="grid2 keep2">
      <div class="field"><div class="label">Nombre</div><input class="input" id="extraNombre_${letter}" type="text" placeholder="Ej: Seguro vida" /></div>
      <div class="field"><div class="label">Tipo</div>
        <select class="input" id="extraTipo_${letter}">
          <option value="mensual_cuota">Mensual en cuota</option>
          <option value="prima_unica">Prima única financiada</option>
        </select>
      </div>
      <div class="field"><div class="label">Importe (€)</div><input class="input" id="extraImporte_${letter}" type="number" step="1" placeholder="0" /></div>
      <div class="field"><div class="label" style="margin-bottom:10px">¿Entra en la TAE?</div>
        <select class="input" id="extraTae_${letter}">
          <option value="no">No (habitual)</option>
          <option value="si">Sí</option>
        </select>
      </div>
    </div>
    <button type="button" class="btn ghost" id="btnAddExtra_${letter}" style="margin-top:8px">Añadir</button>
  `;
  addForm.querySelector(`#btnAddExtra_${letter}`).addEventListener("click",()=>{
    const nombre=String(addForm.querySelector(`#extraNombre_${letter}`).value||"").trim();
    const tipo=addForm.querySelector(`#extraTipo_${letter}`).value;
    const importe=Number(addForm.querySelector(`#extraImporte_${letter}`).value||0);
    const entra_tae=addForm.querySelector(`#extraTae_${letter}`).value==="si";
    if(!nombre||importe<=0){ toast("Rellena nombre e importe"); return; }
    car._extras.push({nombre,tipo,importe,entra_tae});
    syncExtrasToCarFields();
    renderExtrasList();
    recalc();
    addForm.querySelector(`#extraNombre_${letter}`).value="";
    addForm.querySelector(`#extraImporte_${letter}`).value="";
  });
  d3body.appendChild(addForm);

  // Mantenimiento incluido en cuota
  const maintTitle2=document.createElement("div"); maintTitle2.className="section-title"; maintTitle2.style.marginTop="14px"; maintTitle2.textContent="Plan de mantenimiento";
  d3body.appendChild(maintTitle2);
  const maintGrid=document.createElement("div"); maintGrid.className="grid2 keep2";
  maintGrid.appendChild(cardChoice("Incluido en la cuota","Si la cuota ya trae mantenimiento, lo sumamos y lo mostramos aparte en el resultado.","🧾",car.maintIncludedInQuota==="yes",()=>{ car.maintIncludedInQuota="yes"; render(); }));
  maintGrid.appendChild(cardChoice("No / no lo sé","FairCar lo estimará aparte (mantenimiento medio).","🔧",car.maintIncludedInQuota!=="yes",()=>{ car.maintIncludedInQuota="no"; car.maintPlanEurMonth=0; render(); }));
  d3body.appendChild(maintGrid);
  if(car.maintIncludedInQuota==="yes"){
    const m=input("number",car.maintPlanEurMonth,"Ej: 25"); m.step="1";
    m.addEventListener("input",()=>{ car.maintPlanEurMonth=Number(m.value||0); recalc(); });
    d3body.appendChild(field("Mantenimiento incluido (€/mes)",m));
  } else {
    const mh=document.createElement("div"); mh.className="hint"; mh.textContent="FairCar lo estimará aparte según segmento y motorización.";
    d3body.appendChild(mh);
  }

  d3.appendChild(d3body);
  step.appendChild(d3);

  // ══════════════════════════════════════════════
  // PANEL — FairCar calcula (resultados)
  // ══════════════════════════════════════════════
  const calcPanel=document.createElement("div");
  calcPanel.className="fc-fin-block";
  calcPanel.style.cssText="margin-top:12px;background:var(--blueSoft);border-color:var(--blueSoftBorder)";

  const calcTitle=document.createElement("div"); calcTitle.className="fc-fin-block-title"; calcTitle.textContent="FairCar calcula";
  calcPanel.appendChild(calcTitle);
  const calcSub=document.createElement("div"); calcSub.className="hint"; calcSub.style.marginTop="0"; calcSub.textContent="Resultados automáticos — solo lectura";
  calcPanel.appendChild(calcSub);

  // Auto+ bloques (dealer discount + gov help)
  const dealerAutoWrap=document.createElement("div"); dealerAutoWrap.style.display="none";
  const govHelpWrap=document.createElement("div"); govHelpWrap.style.display="none";

  // Campos readonly
  function roField(labelText, id, hint){
    const f=document.createElement("div"); f.className="field";
    const l=document.createElement("div"); l.className="label"; l.textContent=labelText;
    const inp=input("number",0,""); inp.readOnly=true; inp.tabIndex=-1; inp.id=id+"_"+letter; inp.step="0.01";
    inp.style.cssText="background:var(--glass);opacity:.8;cursor:default";
    f.appendChild(l); f.appendChild(inp);
    if(hint){ const h=document.createElement("div"); h.className="hint"; h.textContent=hint; f.appendChild(h); }
    return {wrap:f, inp};
  }

  const {wrap:wPriceFin, inp:priceFinEl}=roField("Precio si financias usado por FairCar (€)","pricefin");
  const {wrap:wOpenEur, inp:openEurEl}=roField("Comisión apertura (€)","openeur");
  const {wrap:wPrincipal, inp:principalNoIntEl}=roField("Importe del préstamo (sin intereses) (€)","principal");
  const {wrap:wInterest, inp:interestPaidEl}=roField("Intereses estimados (€)","interest");
  const {wrap:wCuotaCalc, inp:cuotaCalc}=roField("Cuota calculada por TIN (€/mes)","cuotacalc");
  const {wrap:wTotalOffer, inp:totalOfferEl}=roField("Total según letra ofrecida (€)","totaloffer","Cuota ofrecida × cuotas.");
  const {wrap:wTotalInt, inp:totalWithIntEl}=roField("Precio total estimado (€)","totalint","Incluye entrada + intereses + extras marcados.");

  // TAE en fila
  const taeRow2=document.createElement("div"); taeRow2.className="grid2 keep2";
  const {wrap:wTaeEst, inp:taeInline}=roField("TAE estimada (%)","taeest");
  const {wrap:wTaeReal, inp:taeRealEl}=roField("TAE real según cuota (%)","taereal");
  taeRow2.appendChild(wTaeEst); taeRow2.appendChild(wTaeReal);

  // Auto+ — descuento punto de venta
  const dealerDiscEl=input("number",0,""); dealerDiscEl.readOnly=true; dealerDiscEl.tabIndex=-1;
  dealerAutoWrap.appendChild(field("Descuento Auto+ punto de venta (€)",dealerDiscEl));
  const dealerChk=document.createElement("label"); dealerChk.style.cssText="display:flex;gap:10px;align-items:flex-start;cursor:pointer;margin-top:8px";
  dealerChk.innerHTML=`<input type="checkbox" id="chkAutoPlusDealerIncl_${letter}" ${car.autoPlusDealerAlreadyIncluded==="yes"?"checked":""} style="margin-top:3px"/>
    <span class="small">Ya está incluido en mi presupuesto</span>`;
  dealerAutoWrap.appendChild(dealerChk);
  const _chkDealerIncl=dealerChk.querySelector("input");
  _chkDealerIncl.addEventListener("change",()=>{ car.autoPlusDealerAlreadyIncluded=_chkDealerIncl.checked?"yes":"no"; syncPriceFin(); recalc(); });

  // Auto+ — ayuda pública
  const govHelpEl=input("number",0,""); govHelpEl.readOnly=true; govHelpEl.tabIndex=-1;
  govHelpWrap.appendChild(field("Ayuda Auto+ pública estimada (sin IRPF) (€)",govHelpEl));
  const govChk=document.createElement("label"); govChk.style.cssText="display:flex;gap:10px;align-items:flex-start;cursor:pointer;margin-top:8px";
  govChk.innerHTML=`<input type="checkbox" id="chkAutoPlusGovApply_${letter}" ${car.autoPlusApplyGovToFinance==="yes"?"checked":""} style="margin-top:3px"/>
    <span class="small">Descontar ayuda Auto+ de la financiación</span>`;
  govHelpWrap.appendChild(govChk);
  const govHint=document.createElement("div"); govHint.className="smallmuted"; govHint.style.marginTop="6px"; govHelpWrap.appendChild(govHint);
  const _chkGovApply=govChk.querySelector("input");
  _chkGovApply.addEventListener("change",()=>{ car.autoPlusApplyGovToFinance=_chkGovApply.checked?"yes":"no"; recalc(); });

  calcPanel.appendChild(dealerAutoWrap);
  calcPanel.appendChild(govHelpWrap);
  calcPanel.appendChild(wPriceFin);
  calcPanel.appendChild(wOpenEur);
  calcPanel.appendChild(wPrincipal);
  calcPanel.appendChild(wInterest);
  calcPanel.appendChild(wCuotaCalc);
  calcPanel.appendChild(taeRow2);
  calcPanel.appendChild(wTotalOffer);
  calcPanel.appendChild(wTotalInt);

  // PVP note + quota check + tae box
  let pvpNotConfirmedNote=null;
  function refreshPvpNotConfirmedNote(){
    if(!pvpNotConfirmedNote) return;
    const show=(car.pvpKnown!=="yes");
    pvpNotConfirmedNote.style.display=show?"block":"none";
    if(show) pvpNotConfirmedNote.innerHTML=`ℹ️ <b>PVP orientativo</b>: ${euro(car.pvpCashOrient||car.pvpCash||0)} según versión. Pide el PVP real al concesionario para afinar.`;
  }
  pvpNotConfirmedNote=document.createElement("div"); pvpNotConfirmedNote.className="quota-check"; calcPanel.appendChild(pvpNotConfirmedNote); refreshPvpNotConfirmedNote();

  const quotaCheck=document.createElement("div"); quotaCheck.className="quota-check"; calcPanel.appendChild(quotaCheck);
  const taeBox=document.createElement("div"); taeBox.className="tae-box"; calcPanel.appendChild(taeBox);

  step.appendChild(calcPanel);

  // Aviso discrepancia
  const mismatchBox=document.createElement("div"); mismatchBox.className="mismatch-box"; mismatchBox.style.display="none"; step.appendChild(mismatchBox);

  // ══ Helpers ══
  function syncPriceFin(){
    const p=Number(car.pvpCash||0)||0; const d=Number(car.financeDiscount||0)||0;
    if(p>0){
      const dc=clamp(d,0,p);
      if(dc!==d){ car.financeDiscount=dc; discIn.value=String(dc); }
      const dealerDisc=autoPlusDealerDiscountForFinance(car);
      const pfv=Math.max(0,p-dc-dealerDisc);
      car.priceFinanced=pfv; priceFinEl.value=String(Math.round(pfv));
    } else { priceFinEl.value=String(Math.round(Number(car.priceFinanced||0)||0)); }
  }

  // Funciones de plantilla/email de cancelación (reutilizadas)
  function buildLifeTemplate(){
    const nm=car.lifeService?.nameDni||"[NOMBRE Y DNI]";
    const pol=car.lifeService?.policyNo||"[Nº PÓLIZA / SOLICITUD]";
    const asg=car.lifeService?.insurer||"[ASEGURADORA]";
    const dt=car.lifeService?.deliveryDate||"[FECHA ENTREGA PÓLIZA/DOC]";
    return `ASUNTO: Desistimiento / solicitud de baja — seguro vinculado\n\nA la atención de: ${asg}\n\nYo, ${nm}, solicito la baja/desistimiento del seguro vinculado a mi financiación.\nNº póliza/solicitud: ${pol}\nFecha de entrega de póliza/documentación: ${dt}\n\nSolicito confirmación por escrito de la tramitación y, en su caso, la devolución de la parte de prima no consumida.\n\nAtentamente,\n${nm}\nFecha: ${new Date().toISOString().slice(0,10)}`;
  }
  function downloadTextFile(filename,text){
    try{ const blob=new Blob([text],{type:"text/plain;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },0); }catch(e){ const w=window.open("","_blank"); if(w){ w.document.write(`<pre>${String(text).replace(/</g,"&lt;")}</pre>`); w.document.close(); } }
  }

  // ══ recalc ══
  function recalc(){
    const fin=financeMonthlyCost(car,{useOffer:false});
    const months=Number(fin.months||0)||0;
    const payMonths=Number(fin.payMonths||fin.months||0)||0;

    priceFinEl.value=String(Math.round(fin.basePrice||0));
    discIn.value=String(Math.round(fin.disc||0));

    // Auto+ dealer
    const eligible=autoPlusDealerEligibleForFinance(car);
    dealerAutoWrap.style.display=eligible?"block":"none";
    if(eligible){ dealerDiscEl.value=String(Math.round(Number(fin.dealerDisc||0))); _chkDealerIncl.checked=(car.autoPlusDealerAlreadyIncluded==="yes"); }
    else{ dealerDiscEl.value=""; }

    // Auto+ gov
    const govAvail=Number(fin.govHelpAvail||0)||0;
    govHelpWrap.style.display=(govAvail>0)?"block":"none";
    if(govAvail>0){
      govHelpEl.value=String(Math.round(govAvail)); _chkGovApply.checked=(car.autoPlusApplyGovToFinance==="yes");
      const pct=clamp(Number(state.irpfPct??0.15),0,0.50);
      govHint.textContent=car.autoPlusApplyGovToFinance==="yes"?`Impacto fiscal estimado (IRPF ${Math.round(pct*100)}%): ${euro(-govAvail*pct)}`:"";
    } else { govHelpEl.value=""; _chkGovApply.checked=false; car.autoPlusApplyGovToFinance="no"; govHint.textContent=""; }

    openEurEl.value=String(Math.round(fin.openFee||0));
    principalNoIntEl.value=String(Math.round(fin.principal||0));
    cuotaCalc.value=fin.expectedMonthlyByTIN?(Math.round(fin.expectedMonthlyByTIN*100)/100):"";
    taeInline.value=fin.tae?(Math.round(fin.tae*100)/100):"";

    const offeredNow=Number(car.monthlyPayment||0)||0;
    const lifeOffer=(((car.hasLifeInLoan==="yes")||(car.insInPayment==="yes"))&&(car.insMode==="monthly"))?(Number(car.lifeInsMonthly||0)||0):0;
    const maintOffer=(car.maintIncludedInQuota==="yes")?(Number(car.maintPlanEurMonth||0)||0):0;
    const creditMonthlyOfferNow=Math.max(0,offeredNow-lifeOffer-maintOffer);
    const taeRealNow=(payMonths>0&&fin.financedBase>0&&creditMonthlyOfferNow>0)?estimateTAE(fin.financedBase,payMonths,creditMonthlyOfferNow,Number(fin.balloon||0)||0):null;
    taeRealEl.value=(taeRealNow!==null&&Number.isFinite(taeRealNow))?(Math.round(taeRealNow*100)/100):"";

    const downV=Number(fin.down||0)||0;
    const creditMonthly=Number(fin.creditMonthly||0)||0;
    const lifeM=Number(fin.insuranceInQuota||0)||0;
    const maintM=Number(fin.maintInQuota||0)||0;
    const lifeOut=Number(fin.insuranceOutMonthly||0)||0;
    const balloonV=Number(fin.balloon||0)||0;
    const interestPaid=(payMonths>0&&(creditMonthly>0||fin.principal>0))?Math.max(0,(creditMonthly*payMonths+balloonV)-(Number(fin.principal||0)||0)):0;
    interestPaidEl.value=(payMonths>0&&(creditMonthly>0||fin.principal>0))?String(Math.round(interestPaid)):"";
    const total=(payMonths>0)?(downV+creditMonthly*payMonths+lifeM*payMonths+maintM*payMonths+lifeOut*payMonths+balloonV):0;
    totalWithIntEl.value=(payMonths>0&&(creditMonthly>0||fin.principal>0))?String(Math.round(total)):"";
    const offered=Number(car.monthlyPayment||0)||0;
    const totalOff=(payMonths>0&&offered>0)?(offered*payMonths+balloonV):0;
    totalOfferEl.value=(payMonths>0&&offered>0)?String(Math.round(totalOff)):"";

    // Quota check
    if(fin.expectedMonthlyByTIN&&offered>0){
      const diff=offered-fin.expectedMonthlyByTIN;
      const ok=Math.abs(diff)<=15;
      quotaCheck.className="quota-check "+(ok?"good":"bad");
      quotaCheck.textContent=ok?`✅ Cuota coherente con el TIN (diferencia ${diff>0?"+":""}${euro(diff)}/mes)`:`❌ No cuadra con el TIN: ${diff>0?"+":""}${euro(diff)}/mes. Posibles extras ocultos (apertura/seguros/precio real).`;
    } else if(fin.expectedMonthlyByTIN){
      quotaCheck.className="quota-check"; quotaCheck.textContent="ℹ️ Cuota calculada. Si tienes la cuota del concesionario, introdúcela para comprobar si cuadra.";
    } else { quotaCheck.className="quota-check"; quotaCheck.textContent="ℹ️ Rellena TIN y precio para calcular cuota y TAE."; }

    // TAE box
    if(fin.tae){ const v=taeVerdict(car.tin,fin.tae); taeBox.className="tae-box "+(v.cls||""); taeBox.innerHTML=`<div><b>TAE estimada</b> (TIN + apertura): <b>${fin.tae.toFixed(2)}%</b></div><div class="small" style="margin-top:6px">${v.text}</div>`; }
    else{ taeBox.className="tae-box"; taeBox.innerHTML=`<div><b>TAE estimada</b>: —</div><div class="small" style="margin-top:6px">Rellena PVP, entrada, apertura, TIN y plazo para estimar la TAE.</div>`; }

    // Mismatch box
    (function(){
      const monthsN=Number(payMonths||months||0)||0;
      const offeredMonthly=Number(car.monthlyPayment||0)||0;
      const expectedMonthly=Number(fin.expectedMonthlyByTIN||0)||0;
      const totalExpected=(monthsN>0)?total:0;
      const balloonOffer=Number(fin.balloon||0)||0;
      const totalOffered=(monthsN>0&&offeredMonthly>0)?Math.round(offeredMonthly*monthsN+balloonOffer):0;
      const diffTotal=(totalOffered>0&&totalExpected>0)?(totalOffered-Math.round(totalExpected)):0;
      const diffMonthly=(offeredMonthly>0&&expectedMonthly>0)?(offeredMonthly-expectedMonthly):0;
      const show=(totalOffered>0&&totalExpected>0&&diffTotal>300);
      if(!show){ mismatchBox.style.display="none"; mismatchBox.innerHTML=""; return; }
      const knownLife=((car.hasLifeInLoan==="yes")||(car.insInPayment==="yes"))?(Number(car.lifeInsMonthly||0)||0):0;
      const knownMaint=(car.maintIncludedInQuota==="yes")?(Number(car.maintPlanEurMonth||0)||0):0;
      const creditMonthlyOffer=Math.max(0,offeredMonthly-knownLife-knownMaint);
      const taeOffer=(monthsN>0&&fin.financedBase>0&&creditMonthlyOffer>0)?estimateTAE(fin.financedBase,monthsN,creditMonthlyOffer,Number(fin.balloon||0)||0):null;
      const questions=[];
      if(car.pvpKnown!=="yes") questions.push("¿Cuál es el precio real al contado final?");
      if(Number(car.openFeePct||0)<=0&&Number(car._openFeeAmt||0)<=0) questions.push("¿Hay comisión de apertura?");
      if(!car._extras||car._extras.length===0) questions.push("¿Hay seguros o servicios incluidos en la cuota?");
      if(car.maintIncludedInQuota!=="yes") questions.push("¿Hay plan de mantenimiento incluido en la cuota?");
      const qText=questions.join("\n");
      const listItems=questions.map(q=>`<li>${_escHtml(q)}</li>`).join("");
      mismatchBox.style.display="block";
      mismatchBox.innerHTML=`
        <div class="mismatch-head">FairCar: esta oferta no cuadra</div>
        <div class="mismatch-body">
          <div class="mismatch-line">Con los datos actuales el coste esperado sería <b>${euro(Math.round(totalExpected))}</b> pero con la letra del concesionario pagarías <b>${euro(totalOffered)}</b>. Diferencia de <b>${euro(diffTotal)}</b>. Diferencia mensual: <b>${diffMonthly>0?"+":""}${euro(diffMonthly)}/mes</b>. TAE estimada <b>${(fin.tae!==null&&Number.isFinite(fin.tae))?fin.tae.toFixed(2):"—"}%</b> vs TAE real según cuota <b>${(taeOffer!==null&&Number.isFinite(taeOffer))?taeOffer.toFixed(2):"—"}%</b>.</div>
          ${questions.length>0?`<div class="mismatch-sub">Preguntas para el vendedor</div><ul class="mismatch-list">${listItems}</ul><div class="cta-row" style="margin-top:10px"><button type="button" class="btn ghost" id="btnCopyQuestions_${letter}">📋 Copiar preguntas para el vendedor</button></div>`:""}
        </div>`;
      mismatchBox.querySelector(`#btnCopyQuestions_${letter}`)?.addEventListener("click",async()=>{
        const btn=mismatchBox.querySelector(`#btnCopyQuestions_${letter}`);
        try{ if(navigator.clipboard) await navigator.clipboard.writeText(qText); else{ const ta=document.createElement("textarea"); ta.value=qText; ta.style="position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); } const old=btn.textContent; btn.textContent="Copiado ✅"; setTimeout(()=>{ btn.textContent=old; },1500); }catch(e){}
      });
    })();

    refreshPvpNotConfirmedNote();
  }

  // Inicializar
  renderExtrasList();
  syncExtrasToCarFields();
  syncPriceFin();
  recalc();

  mount.appendChild(step);
  return { nextText: "Guardar resultados" };
}



    function fillSingleResults(car, letter){
    const A = computeMonthlyReal(car);

    $("#carSingleTitle").textContent = `${car.brand||"Coche"} ${car.model||""}`.trim();
    setCarImage("carSingleImg", car.brand, car.model);
    $("#carSingleSub").textContent = `${fuelLabel(car.fuel)} · ${segLabel(car.segment)} · Plazo ${state.termMonths} meses`;
    $("#carSingleReal").textContent = euro(A.monthlyReal);
    $("#carSingleBreakdown").innerHTML = breakdownHTML(A.pieces, A.meta, car);
    $("#singleHowCalc").innerHTML = howCalcHTML();

    // Semáforo de trato
    const singleCard = resultsSingleCard.querySelector(".col");
    if(singleCard && (Number(car.tae||0) > 0 || Number(car.openFeePct||0) > 0)){
      const existingTL = singleCard.querySelector(".fc-traffic-light");
      if(existingTL) existingTL.remove();
      const tlWrap = document.createElement("div");
      tlWrap.className = "fc-traffic-light";
      renderTrafficLight(car, tlWrap);
      singleCard.appendChild(tlWrap);
    }

    resultsSingleCard.style.display = "block";
  }

  function stepSingleResult(car, letter){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>Resultado — Coche ${letter}</h2>
      <p>Este es el coste mensual real estimado durante ${state.termMonths} meses.</p>
    `;

    mount.appendChild(step);
    fillSingleResults(car, letter);

    // Auto-guardar el coche (todo lo que has rellenado) para reutilizarlo luego
    saveCarToStorage(car);

    // En el coche A, el siguiente paso será la pregunta de comparativa.
    if(letter==="A"){
      return { nextText: "Continuar" };
    }

    return { nextText: "Ver comparativa" };
  }

  function stepCompareResults(){
    // Auto-guardar ambos coches (todo lo rellenado)
    saveCarToStorage(state.carA);
    saveCarToStorage(state.carB);

    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>Comparativa final</h2>
      <p>Coste mensual real estimado durante ${state.termMonths} meses.</p>
    `;
    mount.appendChild(step);

    const flexA = (state.carA.financeMode==="flex" && Number(state.carA.flexGmv||0)>0);
    const flexB = (state.carB.financeMode==="flex" && Number(state.carB.flexGmv||0)>0);
    const oneFlex = (flexA && !flexB) || (!flexA && flexB);

    if(oneFlex){
      const box = document.createElement("div");
      box.className = "quota-check";
      box.innerHTML = `
        <div><b>Financiación flexible:</b> has indicado GMV/valor final en uno de los coches. En financiación flexible, el resultado depende de si <b>devuelves</b> o te lo <b>quedas</b>. Si te lo quedas, FairCar suma el valor final (GMV) y puedes activar el descuento de <b>reventa</b> en el paso correspondiente.</div>
      `;
      step.appendChild(box);
    }

    const A = computeMonthlyReal(state.carA);
    const B = computeMonthlyReal(state.carB);

    $("#carATitle").textContent = `${state.carA.brand||"Coche A"} ${state.carA.model||""}`.trim();
    setCarImage("carAImg", state.carA.brand, state.carA.model);
    $("#carASub").textContent = `${fuelLabel(state.carA.fuel)} · ${segLabel(state.carA.segment)} · Plazo ${state.termMonths} meses`;
    $("#carBTitle").textContent = `${state.carB.brand||"Coche B"} ${state.carB.model||""}`.trim();
    setCarImage("carBImg", state.carB.brand, state.carB.model);
    $("#carBSub").textContent = `${fuelLabel(state.carB.fuel)} · ${segLabel(state.carB.segment)} · Plazo ${state.termMonths} meses`;

    $("#carAReal").textContent = euro(A.monthlyReal);
    $("#carBReal").textContent = euro(B.monthlyReal);

    

    $("#carAQuota").textContent = `${A.meta.fin.mode==="cash" ? "Pago equivalente" : "Cuota mensual"}: ${euro(A.meta.fin.loanMonthly)}`;
    $("#carBQuota").textContent = `${B.meta.fin.mode==="cash" ? "Pago equivalente" : "Cuota mensual"}: ${euro(B.meta.fin.loanMonthly)}`;
$("#carABreakdown").innerHTML = breakdownHTML(A.pieces, A.meta, state.carA);
    $("#carBBreakdown").innerHTML = breakdownHTML(B.pieces, B.meta, state.carB);

    // Semáforo en comparativa
    try{
      ["A","B"].forEach(letter => {
        const car = letter === "A" ? state.carA : state.carB;
        const col = document.querySelector(letter === "A" ? ".two-cols .col:first-child" : ".two-cols .col:last-child");
        if(col && (Number(car.tae||0) > 0 || Number(car.openFeePct||0) > 0)){
          const existing = col.querySelector(".fc-traffic-light");
          if(existing) existing.remove();
          const tlWrap = document.createElement("div");
          tlWrap.className = "fc-traffic-light";
          renderTrafficLight(car, tlWrap);
          col.appendChild(tlWrap);
        }
      });
    }catch(e){}

    // Selector de prioridad (perfil de decisión)
    try{
      const recText = $("#recommendText");
      const recBox = recText ? recText.parentElement : null;
      if(recBox){
        let picker = document.getElementById("decisionProfilePicker");
        if(!picker){
          picker = document.createElement("div");
          picker.id = "decisionProfilePicker";
          recBox.insertBefore(picker, recText);
        }
        picker.innerHTML = buildDecisionProfilePickerHTML(state.decisionProfile, true);
        picker.querySelectorAll("button[data-prof]").forEach(btn=>{
          btn.onclick = () => {
            state.decisionProfile = btn.getAttribute("data-prof") || "normal";
            render();
          };
        });
      }
    }catch(e){}

    const decision = decideWinnerFaircar(A, B, state.carA, state.carB, state.decisionProfile);
    const better = decision.winners.global;

    $("#recommendText").innerHTML = decision.explainHtml;

    $("#howCalc").innerHTML = howCalcHTML();

    if(btnDownloadPdf){
      btnDownloadPdf.onclick = downloadComparePDF;
    }

    if(btnFaircarStudy){
      btnFaircarStudy.onclick = () => {
        try{
          const payload = buildFaircarStudyPayload(A, B, better, { oneFlex, flexA, flexB, decision, decisionProfile: state.decisionProfile });
          localStorage.setItem("faircar:lastStudy", JSON.stringify(payload));
          location.href = "recomendacion.html";
        }catch(e){
          console.error(e);
          toast("No se pudo abrir el Estudio FairCar. Reintenta.");
        }
      };
    }

    resultsCompareCard.style.display = "block";
    return { nextText: "Reiniciar" };
  }


  function stepCarsCompare(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>Elige dos coches y mete la oferta</h2>
      <p>Todo es editable. El plazo de financiación será el mismo para ambos.</p>
    `;
    const term = input("number", state.termMonths, "");
    term.step="12"; term.min="12"; term.max="180";
    term.addEventListener("input", ()=>{ state.termMonths = Number(term.value||state.termMonths||60); });
    term.addEventListener("change", ()=>{ state.termMonths = normalizeTermMonths(term.value); term.value = state.termMonths; });
    step.appendChild(field("Plazo de financiación (meses) — único para ambos", term, "Puedes escribir cualquier valor (ej: 49). Con las flechas sube/baja de 12 en 12."));

    const wrap=document.createElement("div");
    wrap.className="two-cols";
    wrap.appendChild(carEditor(state.carA));
    wrap.appendChild(carEditor(state.carB));
    step.appendChild(wrap);
    mount.appendChild(step);
  }

  function hr(){
    const h=document.createElement("hr"); h.className="sep"; return h;
  }

  function carEditor(car){
    const col=document.createElement("div");
    col.className="col";
    col.innerHTML = `
      <div class="col-head">
        <div>
          <div class="col-title">Coche ${car.letter}</div>
          <div class="col-sub">Marca · modelo · motorización · financiación</div>
        </div>
      </div>
    `;

    const brandAC = makeAutocomplete({
      value: car.brand,
      placeholder: "Ej: Volkswagen",
      getItems: () => allBrands,
      onCommit: (val)=>{
        car.brand = val;
        car.model = "";
        render();
      }
    });
    col.appendChild(field("Marca", brandAC.wrap));

    const models = getModelsForBrand(car.brand);
    const modelAC = makeAutocomplete({
      value: car.model,
      placeholder: "Ej: Golf",
      getItems: () => getModelsForBrand(car.brand),
      onCommit: (val)=>{
        car.model = val;
        const d = getModelData(car.brand, car.model);
        if(d){
          // Autorrelleno suave (si coincide exacto)
          if(d.segment && segmentMap[d.segment]) car.segment = segmentMap[d.segment];
          const m = getMotorizationsFor(car.brand, car.model);
          if(m.length===1) car.fuel = m[0];
        }
        render();
      }
    });
    col.appendChild(field("Modelo", modelAC.wrap, (models.length? "Sugerencias según marca." : "Si no sale, escríbelo.")));

    const availableMotors = getMotorizationsFor(car.brand, car.model);
    const motorLabels = {
      gasoline: "Gasolina",
      diesel: "Diésel",
      hev: "Híbrido (HEV)",
      phev: "Híbrido enchufable (PHEV)",
      ev: "Eléctrico (EV)"
    };
    const motorOptions = availableMotors.map(k=>[k, motorLabels[k] || k]);
    const fuelSel = select(motorOptions.length ? motorOptions : [
      ["gasoline","Gasolina"],
      ["diesel","Diésel"],
      ["hev","Híbrido (HEV)"],
      ["phev","Híbrido enchufable (PHEV)"],
      ["ev","Eléctrico (EV)"]
    ], car.fuel);
    fuelSel.addEventListener("change", ()=>{ car.fuel=fuelSel.value; render(); });
    col.appendChild(field("Motorización", fuelSel, (availableMotors.length && car.brand && car.model) ? "Sugerencias según modelo." : ""));

    const segSel = select([["utilitario","🚗 Utilitario"],["berlina","🚘 Berlina"],["suv","🚙 SUV"],["deportivo","🏎️ Deportivo"]], car.segment);
    segSel.addEventListener("change", ()=>{ car.segment=segSel.value; });
    col.appendChild(field("Tipo de coche (segmento)", segSel));

    const pow = input("number", car.powerKw, "");
    pow.step="1"; pow.min="50"; pow.max="400";
    pow.addEventListener("input", ()=>{ car.powerKw = Number(pow.value||100); });
    col.appendChild(field("Potencia (kW)", pow));

    if(car.fuel==="ev" || car.fuel==="phev"){
      const bat = input("number", car.batteryKwh, "");
      bat.step="1"; bat.min="10"; bat.max="150";
      bat.addEventListener("input", ()=>{ car.batteryKwh = Number(bat.value||50); });
      col.appendChild(field("Batería (kWh)", bat));
    } else {
      const eng = input("text", car.engine, "Ej: 1.0");
      eng.addEventListener("input", ()=>{ car.engine = eng.value; });
      col.appendChild(field("Motor (ej: 1.0, 1.5, 2.0)", eng));
    }

    const newSel = select([["new","Nuevo"],["km0","KM0"],["used","Ocasión"]], car.isNew);
    newSel.addEventListener("change", ()=>{ car.isNew=newSel.value; });
    col.appendChild(field("Estado", newSel));

    const year = input("number", car.year, "");
    year.step="1"; year.min="2000"; year.max=String(new Date().getFullYear());
    year.addEventListener("input", ()=>{ car.year = Number(year.value||new Date().getFullYear()); });
    col.appendChild(field("Año matriculación", year));

    const kmNow = input("number", car.kmNow, "");
    kmNow.step="1000"; kmNow.min="0";
    kmNow.addEventListener("input", ()=>{ car.kmNow = Number(kmNow.value||0); });
    col.appendChild(field("Km actuales (si no es nuevo)", kmNow));

    col.appendChild(hr());

    const pvp = input("number", car.pvpCash, "");
    pvp.step="100";
    pvp.addEventListener("input", ()=>{ car.pvpCash = Number(pvp.value||0); });
    col.appendChild(field("PVP al contado (€)", pvp));

    const pf = input("number", car.priceFinanced, "");
    pf.step="100";
    pf.readOnly = true;
    pf.tabIndex = -1;

    const disc = input("number", car.financeDiscount, "");
    disc.step="100";

    function syncPF(){
      const p = Number(car.pvpCash||0)||0;
      const d = Number(car.financeDiscount||0)||0;

      if(p>0){
        const dc = clamp(d, 0, p);
        if(dc!==d){
          car.financeDiscount = dc;
          disc.value = String(dc);
        }
        car.priceFinanced = Math.max(0, p - dc);
      }
      pf.value = String(Math.round(Number(car.priceFinanced||0)||0));
    }

    disc.addEventListener("input", ()=>{ car.financeDiscount = Number(disc.value||0); syncPF(); });
    pvp.addEventListener("input", ()=>{ syncPF(); });

    col.appendChild(field("Precio financiando concesionario (calculado) (€)", pf, "PVP − descuento por financiar."));
    col.appendChild(field("Descuento/bonificación por financiar (€)", disc));

    syncPF();

    const down = input("number", car.downPayment, "");
    down.step="100";
    down.addEventListener("input", ()=>{ car.downPayment = Number(down.value||0); });
    col.appendChild(field("Entrada (€)", down));

    const tin = input("number", car.tin, "");
    tin.step="0.01";
    tin.addEventListener("input", ()=>{ car.tin = Number(tin.value||0); });
    col.appendChild(field("TIN (%)", tin));

    const cuota = input("number", car.monthlyPayment, "");
    cuota.step="1";
    cuota.addEventListener("input", ()=>{ car.monthlyPayment = Number(cuota.value||0); });
    col.appendChild(field("Cuota mensual (€/mes)", cuota));

    const open = input("number", car.openFeePct, "");
    open.step="0.1";
    open.addEventListener("input", ()=>{ car.openFeePct = Number(open.value||0); });
    col.appendChild(field("Comisión apertura (%)", open));

    const ins = input("number", car.lifeInsMonthly, "");
    ins.step="1";
    ins.addEventListener("input", ()=>{ car.lifeInsMonthly = Number(ins.value||0); });
    col.appendChild(field("Seguro vida/financiación (€/mes)", ins));

    const insIn = select([["no","No (se paga aparte)"],["yes","Sí (ya va en la cuota)"]], car.insInPayment);
    insIn.addEventListener("change", ()=>{ car.insInPayment = insIn.value; });
    col.appendChild(field("¿Seguro incluido en la cuota?", insIn));

    if(car.fuel==="ev" || car.fuel==="phev"){
      col.appendChild(hr());
      const autoBox=document.createElement("div");
      autoBox.innerHTML = `<div class="section-title">Auto+ (solo EV/PHEV)</div><div class="small">Estimación según tu regla (editable en el futuro).</div>`;
      const baseMotor = (car.fuel==="phev") ? 1125 : 2250;
      const base = input("number", baseMotor, "");
      base.readOnly = true;
      base.tabIndex = -1;

      function syncBaseAutoPlusLegacy(){
        const extraMade = (car.auto.madeEU==="yes") ? 675 : 0;
        const extraBat  = (car.auto.batteryEU==="yes") ? 450 : 0;
        const total = baseMotor + extraMade + extraBat;
        car.auto.base = total;
        base.value = String(Math.round(total));
      }

      autoBox.appendChild(field("Base Auto+ (€)", base, "Base por motorización + extras (fabricación EU / batería EU)."));

      const tier = select([["lt35","< 35.000€ (+1.125€)"],["35to45","35.000–45.000€ (+675€)"],["none","+ de 45.000€ (no aplica)"]], car.auto.priceTier);
      tier.addEventListener("change", ()=>{ car.auto.priceTier = tier.value; });
      autoBox.appendChild(field("Tramo precio", tier));

      const made = select([["no","No"],["yes","Sí (+675€)"]], car.auto.madeEU);
      made.addEventListener("change", ()=>{ car.auto.madeEU = made.value; syncBaseAutoPlusLegacy(); });
      autoBox.appendChild(field("Fabricación Europa", made));

      const batEU = select([["no","No"],["yes","Sí (+450€)"]], car.auto.batteryEU);
      batEU.addEventListener("change", ()=>{ car.auto.batteryEU = batEU.value; syncBaseAutoPlusLegacy(); });
      autoBox.appendChild(field("Batería EU", batEU));

      syncBaseAutoPlusLegacy();

      // Descuento mínimo del punto de venta (fijo; no editable)
      car.auto.dealerBonus = "yes";
      const dealerFixed = input("number", 1000, "");
      dealerFixed.readOnly = true;
      dealerFixed.tabIndex = -1;
      autoBox.appendChild(field(
        "Descuento mínimo del punto de venta (€)",
        dealerFixed,
        "En el Programa Auto+ (turismos M1 y furgonetas N1) el punto de venta debe aplicar un descuento adicional de al menos 1.000€ sobre el precio de venta."
      ));

      const irpf = makeIrpfControl();
      autoBox.appendChild(field("IRPF marginal estimado (0–50%)", irpf, "Se aplica a la parte gravable de la ayuda (aprox)."));

      col.appendChild(autoBox);
    }

    if(state.includeResidual==="yes" && (car.financeMode!=="flex" || car.flexEnd==="keep")){
      col.appendChild(hr());
      const resBox=document.createElement("div");
      resBox.innerHTML = `<div class="section-title">Valor de reventa (opcional)</div><div class="small">FairCar estima cuánto podrías recuperar al final. Puedes editarlo si crees que será distinto.</div>`;
      const use = select([["no","Usar estimación FairCar"],["yes","Pondré mi valor (editable)"]], car.residualUseUser);
      use.addEventListener("change", ()=>{ car.residualUseUser = use.value; render(); });
      resBox.appendChild(field("¿Quieres editar el valor de reventa?", use));

      if(car.residualUseUser==="yes"){
        const r = input("number", car.residualUser, "");
        r.step="100";
        r.addEventListener("input", ()=>{ car.residualUser = Number(r.value||0); });
        resBox.appendChild(field("Tu valor de reventa (€)", r));
      } else {
        const est = residualEstimate(car);
        const estLine=document.createElement("div");
        estLine.className="hint";
        estLine.textContent = `Estimación FairCar: ${euro(est)} (orientativa; editable si activas la opción).`;
        resBox.appendChild(estLine);
      }
      col.appendChild(resBox);
    }

    col.appendChild(hr());
    const preview=document.createElement("div");
    const fin = financeMonthlyCost(car);
    const tae = fin.tae;
    const exp = fin.expectedMonthlyByTIN;
    const diff = fin.diff;
    const warn = (exp && fin.loanMonthly && Math.abs(diff) > 15);

    preview.innerHTML = `
      <div class="section-title">Vista previa</div>
      <div class="small">TAE estimada: <b>${tae? tae.toFixed(2)+"%":"— (faltan datos)"}</b> ·
      Cuota esperada por TIN (aprox): <b>${exp? euro(exp):"—"}</b></div>
      ${warn ? `<div class="small" style="margin-top:8px;color:#fde68a"><b>⚠ Alerta:</b> la cuota no cuadra con el TIN. Posibles costes ocultos (apertura/seguros/precio real).</div>` : ``}
    `;
    col.appendChild(preview);

    return col;
  }

  function stepResults(){
    const step=document.createElement("div");
    step.className="step";
    step.innerHTML = `
      <h2>Resultados</h2>
      <p>Comparación con coste mensual real (durante el plazo de financiación).</p>
    `;
    mount.appendChild(step);

    const flexA = (state.carA.financeMode==="flex" && Number(state.carA.flexGmv||0)>0);
    const flexB = (state.carB.financeMode==="flex" && Number(state.carB.flexGmv||0)>0);
    const oneFlex = (flexA && !flexB) || (!flexA && flexB);

    if(oneFlex){
      const box = document.createElement("div");
      box.className = "quota-check";
      box.innerHTML = `
        <div><b>Financiación flexible:</b> has indicado GMV/valor final en uno de los coches. En financiación flexible, el resultado depende de si <b>devuelves</b> o te lo <b>quedas</b>. Si te lo quedas, FairCar suma el valor final (GMV) y puedes activar el descuento de <b>reventa</b> en el paso correspondiente.</div>
      `;
      step.appendChild(box);
    }

    const A = computeMonthlyReal(state.carA);
    const B = computeMonthlyReal(state.carB);

    $("#carATitle").textContent = `${state.carA.brand||"Coche A"} ${state.carA.model||""}`.trim();
    setCarImage("carAImg", state.carA.brand, state.carA.model);
    $("#carASub").textContent = `${fuelLabel(state.carA.fuel)} · ${segLabel(state.carA.segment)} · Plazo ${state.termMonths} meses`;
    $("#carBTitle").textContent = `${state.carB.brand||"Coche B"} ${state.carB.model||""}`.trim();
    setCarImage("carBImg", state.carB.brand, state.carB.model);
    $("#carBSub").textContent = `${fuelLabel(state.carB.fuel)} · ${segLabel(state.carB.segment)} · Plazo ${state.termMonths} meses`;

    $("#carAReal").textContent = euro(A.monthlyReal);
    $("#carBReal").textContent = euro(B.monthlyReal);

    $("#carABreakdown").innerHTML = breakdownHTML(A.pieces, A.meta, state.carA);
    $("#carBBreakdown").innerHTML = breakdownHTML(B.pieces, B.meta, state.carB);

    const delta = A.monthlyReal - B.monthlyReal;
    const better = (delta<=0) ? "A" : "B";
    const diffAbs = Math.abs(delta);

    $("#recommendText").innerHTML = better==="A"
      ? `Te sale mejor el <b>Coche A</b> por <b>${euro(diffAbs)}</b> al mes (estimación), durante ${state.termMonths} meses.`
      : `Te sale mejor el <b>Coche B</b> por <b>${euro(diffAbs)}</b> al mes (estimación), durante ${state.termMonths} meses.`;

    $("#howCalc").innerHTML = howCalcHTML();

    resultsCompareCard.style.display = "block";
  }

  function fuelLabel(f){ return ({gasoline:"Gasolina",diesel:"Diésel",hev:"HEV",phev:"PHEV",ev:"EV"})[f]||f; }
  function segLabel(s){ return ({utilitario:"Utilitario",berlina:"Berlina",suv:"SUV",deportivo:"Deportivo"})[s]||s; }

  function rowLine(k, v, goodBad){
    const cls = goodBad ? ("v "+goodBad) : "v";
    return `<div class="r"><div class="k">${k}</div><div class="${cls}">${v}</div></div>`;
  }

  function breakdownHTML(pieces, meta, car){
    const fin = meta.fin;
    const lines=[];
    const cuotaLabel = (fin.mode==="cash") ? "Pago equivalente (€/mes)" : "Cuota mensual (pago real)";
    lines.push(rowLine(cuotaLabel, euro(fin.loanMonthly)));
    lines.push(rowLine("Financiación neta (€/mes)", euro(pieces.financeMonthly)));
    lines.push(rowLine((car.fuel==="ev" ? "Energía" : "Combustible") + " (€/mes)", euro(pieces.energyMonthly)));
    lines.push(rowLine("Seguro estimado (€/mes)", euro(pieces.insuranceMonthly)));
    lines.push(rowLine(car.maintIncludedInQuota==="yes" ? "Mantenimiento (plan incluido por usuario)" : "Mantenimiento (estimación FairCar)", euro(pieces.maintenanceMonthly)));
    {
      const m = car && car._ivtmMeta ? car._ivtmMeta : null;
      let extra = "";
      if(m && (m.method==="coef_capital_2025" || m.method==="coef_prov_2025")){
        const minM = (m.annualMin||0)/12;
        const maxM = (m.annualMax||0)/12;
        extra = ` <span class="muted">(rango ${euro(minM)}–${euro(maxM)})</span>`;
      }
      let extra2 = "";
      if((car.fuel==="ev") && !(Number(car.peKw||0)>0)){
        extra2 = ` <span class="muted">(aprox: falta Pe kW)</span>`;
      }
      lines.push(rowLine("Impuesto circulación (€/mes)", euro(pieces.taxMonthly)+extra+extra2));
    }

    if((car.fuel==="ev"||car.fuel==="phev")){
      lines.push(rowLine("Ayuda Auto+ (neta)", euro(pieces.netHelpTotal), "good"));
      if(pieces.irpfImpact>0) lines.push(rowLine("IRPF estimado (impacto)", "−"+euro(pieces.irpfImpact), "bad"));
    } else {
      lines.push(rowLine("Ayuda Auto+", "No aplica"));
    }
    if(meta.usedResidual){
      let label = "Valor residual descontado";
      if(meta.residualReason==="gmv") label = "Valor final (GMV) y reventa";
      if(meta.residualReason==="compare_est") label = "Valor residual estimado (comparativa)";
      lines.push(rowLine(label, "−"+euro(pieces.residual), "good"));
    }

    // TAE real estimada (con la cuota usada y el total financiado real)
lines.push(rowLine("TAE real estimada", fin.tae ? fin.tae.toFixed(2)+"%" : "—"));
if(fin.tae){
  const v = taeVerdict(car.tin, fin.tae);
  const cls = v.cls==="good" ? "good" : (v.cls==="warn" ? "" : "bad");
  lines.push(rowLine("Lectura FairCar", v.text, cls));
}

// Coherencia cuota vs TIN (si hay TIN)
if(fin.expectedMonthlyByTIN && fin.loanMonthly){
  const diff = fin.loanMonthly - fin.expectedMonthlyByTIN;
  const warn = Math.abs(diff) > 15;
  if(warn) lines.push(rowLine("⚠ Cuota vs TIN (diferencia)", `${diff>0?"+":""}${euro(diff)}/mes`, "bad"));
  else lines.push(rowLine("Cuota vs TIN", "Coherente", "good"));
}

    return lines.join("");
  }

    function howCalcHTML(){
    const kmM = monthlyDistance();
    const mode = ({home:"casa",work:"trabajo gratis",street:"calle"})[state.chargeMode];

    const anyOffer = (Number(((state.carA && state.carA.monthlyPayment)||0))>0) || (Number(((state.carB && state.carB.monthlyPayment)||0))>0);
    const usedQuota = anyOffer ? "cuota del concesionario (si la has indicado)" : "cuota calculada con el TIN";
    return `
      <div style="margin-top:8px;line-height:1.65">
        <div><b>En sencillo:</b> FairCar intenta convertir “la cuota” en un <b>coste mensual real</b> (lo que realmente te cuesta tener el coche durante el plazo), sumando uso y restando ayudas/valor final si aplica.</div>

        <div style="margin-top:10px"><b>1) Financiación / compra</b></div>
        <div class="small">
          • Partimos del <b>PVP</b> y restamos <b>descuento por financiar</b> y <b>entrada</b>.<br>
          • Sumamos la <b>comisión de apertura</b> al total financiado.<br>
          • Con el <b>TIN</b> y el <b>plazo</b> obtenemos la cuota (usamos ${usedQuota}).
        </div>

        <div style="margin-top:10px"><b>2) Costes de uso</b></div>
        <div class="small">
          • <b>Energía/combustible</b>: según tus km/mes y precios (gasolina/diésel/kWh) y tu modo de carga.<br>
          • <b>Seguro</b> y <b>mantenimiento</b>: estimaciones según perfil y segmento.
        </div>

        <div style="margin-top:10px"><b>3) Coste real mensual (verde)</b></div>
        <div class="small">
          • (Todo lo pagado durante el plazo + costes de uso − <b>ayuda Auto+</b> − <b>valor de reventa</b> (si marcas que vas a vender al final; en flexible solo si te lo quedas)) ÷ meses.
        </div>

        <div style="margin-top:10px" class="small">
          <b>Datos usados:</b> ${state.kmYear.toLocaleString("es-ES")} km/año (≈ ${kmM.toFixed(0)} km/mes), ciudad ${state.cityPct}% / carretera ${100-state.cityPct}%, provincia ${state.city||"—"} ${state.climate.icon} (${state.climate.label}).<br>
          Precios: gasolina ${euro(state.priceGas)}/L, diésel ${euro(state.priceDiesel)}/L, kWh casa ${euro(state.priceKwhHome)}/kWh, kWh calle ${euro(state.priceKwhStreet)}/kWh, modo carga: ${mode}.<br>
          Seguro: edad ${state.ageGroup}, carnet ${Number(state.licenseYears||0)||0} años, CP ${state.postalCode||"—"}, garaje ${state.garage}.<br>
          <span class="smallmuted">Nota: si has tenido siniestros con culpa, el precio real del seguro puede subir.</span>
        </div>
      </div>
    `;
  }

  // Descargar comparativa en PDF: usa el diálogo de impresión del navegador (Guardar como PDF)
  // y estilos @media print para imprimir solo la comparativa.
  function downloadComparePDF(){
    if(!state.compareEnabled){
      toast("Activa la comparativa para descargar el PDF.");
      return;
    }
    // Recalcula por seguridad con el estado actual
    const flexA = (state.carA.financeMode==="flex" && Number(state.carA.flexGmv||0)>0);
    const flexB = (state.carB.financeMode==="flex" && Number(state.carB.flexGmv||0)>0);
    const oneFlex = (flexA && !flexB) || (!flexA && flexB);

    const A = computeMonthlyReal(state.carA);
    const B = computeMonthlyReal(state.carB);
    const decision = decideWinnerFaircar(A, B, state.carA, state.carB, state.decisionProfile);

    const pdf = document.getElementById("pdfBlock");
    if(pdf){
      pdf.innerHTML = buildPdfCompareHTML(A, B, decision);
    }

    // Asegura que la tarjeta esté visible antes de imprimir
    resultsCompareCard.style.display = "block";
    resultsCompareCard.scrollIntoView({behavior:"smooth", block:"start"});

    document.body.classList.add("print-compare");

    const cleanup = () => {
      document.body.classList.remove("print-compare");
      if(pdf) pdf.innerHTML = "";
    };
    window.addEventListener("afterprint", cleanup, { once:true });
    window.print();
    // Fallback por si afterprint no dispara
    setTimeout(cleanup, 1500);
  }

  // Descargar PDF desde la página de recomendación (Estudio FairCar)
  function downloadStudyPDF(payload){
    if(!payload || !payload.results || !payload.cars){
      toast("No hay estudio listo para exportar.");
      return;
    }
    const pdf = document.getElementById("pdfStudyBlock");
    if(!pdf){
      toast("No encuentro el bloque PDF en la página.");
      return;
    }

    const prevMonths = state.termMonths;
    const prevA = state.carA;
    const prevB = state.carB;
    const prevCompare = state.compareEnabled;

    // Reutilizamos el generador de PDF de comparativa
    try{
      state.termMonths = Number(payload.months||state.termMonths||0)||0;
      state.carA = payload.cars.A || state.carA;
      state.carB = payload.cars.B || state.carB;
      state.compareEnabled = true;

      const prof = payload?.extra?.decisionProfile || payload?.inputs?.decisionProfile || payload?.decisionProfile || "normal";
      const decision = decideWinnerFaircar(payload.results.A, payload.results.B, payload.cars?.A || state.carA, payload.cars?.B || state.carB, prof);
      pdf.innerHTML = buildPdfCompareHTML(payload.results.A, payload.results.B, decision);

      document.body.classList.add("print-study");
      const cleanup = () => {
        document.body.classList.remove("print-study");
        pdf.innerHTML = "";
        state.termMonths = prevMonths;
        state.carA = prevA;
        state.carB = prevB;
        state.compareEnabled = prevCompare;
      };
      window.addEventListener("afterprint", cleanup, { once:true });
      window.print();
      // fallback
      setTimeout(cleanup, 1500);
    }catch(e){
      console.error(e);
      toast("No se pudo generar el PDF");
      state.termMonths = prevMonths;
      state.carA = prevA;
      state.carB = prevB;
      state.compareEnabled = prevCompare;
    }
  }


  // ===== FairCar Study (última página) =====
  function deepClone(obj){
    try{ return JSON.parse(JSON.stringify(obj)); }catch(e){ return obj; }
  }

  function fmtPct(n){
    if(n===null || n===undefined || !Number.isFinite(Number(n))) return "—";
    const v = Number(n);
    return (v.toFixed(1)).replace(".",",") + "%";
  }

  function money(n){
    return euro(Number(n||0));
  }

  function buildFaircarStudyPayload(A, B, better, extra){
    const months = Number(state.termMonths||0)||0;
    const payload = {
      v: 1,
      createdAt: Date.now(),
      months,
      inputs: {
        kmYear: state.kmYear,
        cityPct: state.cityPct,
        chargeMode: state.chargeMode,

        // Precios energía
        priceGas: state.priceGas,
        priceDiesel: state.priceDiesel,
        priceKwhHome: state.priceKwhHome,
        priceKwhStreet: state.priceKwhStreet,

        // Perfil seguro
        ageGroup: state.ageGroup,
        licenseYears: state.licenseYears,
        postalCode: state.postalCode,
        garage: state.garage,
        insuranceCover: state.insuranceCover,

        // Impuestos / ubicación
        province: state.city,
        municipality: state.ivtmMunicipalityName,

        // Reventa / mantenimiento
        includeResidual: state.includeResidual,
        resaleChannel: state.resaleChannel,
        includeTires: state.includeTires,

        // Auto+
        irpfPct: state.irpfPct,

        compareFairResidual: state.compareFairResidual,
        decisionProfile: state.decisionProfile,
      },
      cars: {
        A: deepClone(state.carA),
        B: deepClone(state.carB)
      },
      results: { A, B },
      better,
      deltaMonthly: Number(A.monthlyReal - B.monthlyReal),
      extra: extra || {}
    };
    return payload;
  }

  function computeConfidence(diffMonthly, avgMonthly){
    const d = Math.abs(Number(diffMonthly||0));
    const avg = Math.max(1, Number(avgMonthly||0));
    const rel = d/avg;
    if(d >= 60 || rel >= 0.06) return { cls:"good", text:"Confianza alta" };
    if(d >= 25 || rel >= 0.03) return { cls:"warn", text:"Confianza media" };
    return { cls:"", text:"Confianza baja (muy parejos)" };
  }

  function financeSignals(car, res){
    const fin = res?.meta?.fin || {};
    let score = 100;
    const bullets = [];
    const risk = [];

    if(fin.mode !== "finance"){
      bullets.push("Pago al contado (sin financiación).");
      return { score, bullets, risk, fin };
    }

    if(Number(fin.tae||0)>0) bullets.push(`TAE real estimada: <b>${fmtPct(fin.tae)}</b>.`);
    if(Number(car.tin||0)>0) bullets.push(`TIN indicado: ${fmtPct(car.tin)}.`);

    const openFee = Number(fin.openFee||0);
    const openPct = Number(car.openFeePct||0);
    if(openFee>0){
      score -= 12;
      risk.push("apertura");
      bullets.push(`Comisión de apertura: <b>${openPct.toFixed(1).replace(".",",")}%</b> (≈ ${money(openFee)}).`);
    }

    const insQ = Number(fin.insuranceInQuota||0);
    if(insQ>0){
      score -= 14;
      risk.push("seguro");
      bullets.push(`Seguro incluido en la cuota: <b>${money(insQ)}/mes</b>.`);
    }

    const maintQ = Number(fin.maintInQuota||0);
    if(maintQ>0){
      score -= 10;
      risk.push("mantenimiento");
      bullets.push(`Mantenimiento incluido en la cuota: <b>${money(maintQ)}/mes</b>.`);
    }

    const balloon = Number(fin.balloon||0);
    if(balloon>0){
      score -= 10;
      risk.push("balloon");
      bullets.push(`Pago final (GMV/valor futuro): <b>${money(balloon)}</b>.`);
    }

    const diff = Number(fin.diff||0);
    if(Number.isFinite(diff) && Math.abs(diff) > 15){
      score -= 12;
      risk.push("cuota_inflada");
      bullets.push(`Aviso: la cuota está <b>${money(Math.abs(diff))}/mes</b> ${diff>0 ? "por encima" : "por debajo"} de lo esperable por TIN (suele indicar extras/condiciones).`);
    }

    score = clamp(score, 0, 100);
    return { score, bullets, risk, fin };
  }

  function purchaseNetBreakdown(res, months){
    const fin = res?.meta?.fin || {};
    const maintInQuota = Number(fin.maintInQuota||0)||0;
    const purchasePaid = Number(fin.totalPaid||0) - maintInQuota*months; // evita doble contar mantenimiento
    const helpNet = Number(res?.meta?.auto?.net||0)||0;
    const residual = Number(res?.pieces?.residual||0)||0;
    const netPurchase = purchasePaid - helpNet - residual;
    return { purchasePaid, helpNet, residual, netPurchase };
  }

  function buildStudyReasons(payload, decision){
    const months = Number(payload.months||0)||0;
    const A = payload.results.A, B = payload.results.B;
    const better = (decision && decision.winners && decision.winners.global) ? decision.winners.global : payload.better;

    const win = (better==="A") ? { car: payload.cars.A, res: A, letter:"A" }
                               : { car: payload.cars.B, res: B, letter:"B" };
    const lose = (better==="A") ? { car: payload.cars.B, res: B, letter:"B" }
                                : { car: payload.cars.A, res: A, letter:"A" };

    const costAdvMonthly = (better==="A")
      ? (Number(B.monthlyReal||0) - Number(A.monthlyReal||0))
      : (Number(A.monthlyReal||0) - Number(B.monthlyReal||0)); // + => ganador más barato

    const costAdvAbs = Math.abs(costAdvMonthly);
    const costAdvTotal = costAdvAbs*months;

    const reasons = [];

    const rule = decision?.rule || "cost";
    reasons.push({
      title: "Coste total (lo que pesa)",
      text: (costAdvMonthly>=0)
        ? `En <b>${months} meses</b>, el ${win.letter==="A" ? "Coche A" : "Coche B"} cuesta aproximadamente <b>${money(costAdvTotal)}</b> menos (≈ <b>${money(costAdvAbs)}/mes</b>).`
        : `En <b>${months} meses</b>, el ${win.letter==="A" ? "Coche A" : "Coche B"} cuesta aproximadamente <b>${money(costAdvTotal)}</b> más (≈ <b>${money(costAdvAbs)}/mes</b>), pero gana en la ponderación global (${rule==="balanced" ? "empate técnico en coste" : "criterios de tranquilidad/financiación"}).`
    });

    const sigW = financeSignals(win.car, win.res);
    const sigL = financeSignals(lose.car, lose.res);
    const taeW = sigW.fin?.tae;
    const taeL = sigL.fin?.tae;

    if(Number(taeW||0)>0 && Number(taeL||0)>0){
      const gap = Number(taeL) - Number(taeW);
      if(Math.abs(gap) >= 0.8){
        reasons.push({
          title: "Financiación más limpia",
          text: `La <b>TAE real estimada</b> es mejor en el ganador: <b>${fmtPct(taeW)}</b> vs <b>${fmtPct(taeL)}</b>. Menos coste financiero y menos sorpresa en la letra pequeña.`
        });
      }
    } else if(sigW.score !== sigL.score && Math.abs(sigW.score - sigL.score) >= 10){
      reasons.push({
        title: "Menos letra pequeña",
        text: `El ganador tiene una financiación más “limpia”: <b>${sigW.score}/100</b> vs <b>${sigL.score}/100</b> en transparencia (comisiones/seguros en cuota/pago final).`
      });
    }

    const helpW = Number(win.res?.meta?.auto?.net||0);
    const helpL = Number(lose.res?.meta?.auto?.net||0);
    const helpGap = helpW - helpL;
    if(Math.abs(helpGap) >= 400){
      reasons.push({
        title: "Ayudas (Auto+)",
        text: `En el ganador, las ayudas netas son mayores: <b>${money(helpW)}</b> vs <b>${money(helpL)}</b>. Eso equivale a ~<b>${money(Math.abs(helpGap)/months)}/mes</b> en este plazo.`
      });
    }

    const resW = Number(win.res?.pieces?.residual||0);
    const resL = Number(lose.res?.pieces?.residual||0);
    const resGap = resW - resL;
    if(Math.abs(resGap) >= 600){
      reasons.push({
        title: "Valor futuro mejor tratado",
        text: `FairCar descuenta el valor recuperable al final: <b>${money(resW)}</b> vs <b>${money(resL)}</b>. Eso reduce el coste real mensual del ganador.`
      });
    }

    const useW = (Number(win.res?.pieces?.energyMonthly||0)+Number(win.res?.pieces?.maintenanceMonthly||0)+Number(win.res?.pieces?.taxMonthly||0))*months;
    const useL = (Number(lose.res?.pieces?.energyMonthly||0)+Number(lose.res?.pieces?.maintenanceMonthly||0)+Number(lose.res?.pieces?.taxMonthly||0))*months;
    const useGap = useW - useL;
    if(Math.abs(useGap) >= 300){
      reasons.push({
        title: "Coste de uso más favorable",
        text: `Con tus km/año y tu % ciudad, el uso sale mejor en el ganador: diferencia aprox <b>${money(Math.abs(useGap))}</b> en ${months} meses.`
      });
    }

    const safW = getBrandSafetyMeta(win.car.brand);
    const safL = getBrandSafetyMeta(lose.car.brand);
    if(safW && safL){
      const g = Number(safW.scoreFinal||0) - Number(safL.scoreFinal||0);
      if(Number.isFinite(g) && Math.abs(g) >= 0.5){
        reasons.push({
          title: "Seguridad y fiabilidad (marca)",
          text: `La marca del ganador puntúa mejor en seguridad/calidad: <b>${Number(safW.scoreFinal).toFixed(1)}/10</b>${safW.ncapStars?` (${safW.ncapStars}★ Euro NCAP)`:''} vs <b>${Number(safL.scoreFinal).toFixed(1)}/10</b>. A igualdad de euros, esta diferencia suele importar.`
        });
      }
    }
    return reasons.slice(0,5);
  }

  function buildWhatWouldChange(payload){
    const months = Number(payload.months||0)||0;
    const A = payload.results.A, B = payload.results.B;
    const better = payload.better;

    const win = (better==="A") ? { car: payload.cars.A, res: A, letter:"A" }
                               : { car: payload.cars.B, res: B, letter:"B" };
    const lose = (better==="A") ? { car: payload.cars.B, res: B, letter:"B" }
                                : { car: payload.cars.A, res: A, letter:"A" };

    const needMonthly = Math.abs(Number(payload.deltaMonthly||0));
    const finL = lose.res?.meta?.fin || {};
    const lines = [];

    const insQ = Number(finL.insuranceInQuota||0);
    if(insQ>0){
      const left = Math.max(0, needMonthly - insQ);
      lines.push(`Si puedes sacar el <b>seguro</b> fuera de la cuota (≈ ${money(insQ)}/mes), recortas gran parte de la diferencia. Te quedaría por recuperar ~${money(left)}/mes.`);
    }

    const openFee = Number(finL.openFee||0);
    if(openFee>0){
      const m = openFee / Math.max(1, months);
      lines.push(`Negociar la <b>comisión de apertura</b> (≈ ${money(openFee)}) equivale a ~${money(m)}/mes en este plazo.`);
    }

    const helpW = Number(win.res?.meta?.auto?.net||0);
    const helpL = Number(lose.res?.meta?.auto?.net||0);
    if(helpW>helpL+300){
      const m = (helpW - helpL) / Math.max(1, months);
      lines.push(`Si el perdedor igualara las <b>ayudas</b> (≈ +${money(helpW-helpL)} netos), la brecha baja ~${money(m)}/mes.`);
    }

    const balloon = Number(finL.balloon||0);
    if(balloon>0){
      lines.push(`Ojo: este coche deja un <b>pago final</b> de ${money(balloon)}. Si lo refinancias o renuevas, el coste real puede subir.`);
    }

    if(lines.length===0){
      lines.push(`Están muy parejos. Para que ganara el perdedor, tendría que recortar ~${money(needMonthly)}/mes (bajando precio/TAE o mejorando ayudas/residual).`);
    }

    return lines.slice(0,4);
  }

  function numOrDash(n){
    const v = Number(n);
    return (Number.isFinite(v)) ? v : null;
  }
  function fmtNum(n, digits){
    const v = numOrDash(n);
    if(v===null) return "—";
    const d = (digits===undefined || digits===null) ? 0 : Number(digits||0);
    return v.toLocaleString("es-ES",{minimumFractionDigits:d, maximumFractionDigits:d});
  }
  function fmtEur(n){ 
    const v = numOrDash(n);
    return (v===null) ? "—" : euro(v);
  }
  function fmtBool(x){ return x ? "Sí" : "No"; }

  function insuranceMonthlyMeta(car){
    // replicamos la lógica de insuranceMonthly() para poder mostrar factores en debug
    const base = (state.ageGroup==="18-25") ? 70 : 52;

    const segAdd = (car.segment==="utilitario") ? -5
                 : (car.segment==="berlina") ? 0
                 : (car.segment==="suv") ? 8
                 : 14;

    const yrs = (typeof state.licenseYears==="number" && isFinite(state.licenseYears)) ? state.licenseYears : 8;
    let expF = 1.0;
    if(yrs < 2) expF = 1.20;
    else if(yrs < 5) expF = 1.08;
    else if(yrs < 10) expF = 1.00;
    else expF = 0.95;

    const garageF = (state.garage==="yes") ? 0.97 : 1.00;

    const premiumBrands = ["BMW","Mercedes-Benz","Audi","Porsche","Lexus","Land Rover","Jaguar","Volvo"];
    const brandF = premiumBrands.includes(car.brand) ? 1.08 : 1.00;

    const fuelF = (car.fuel==="ev") ? 1.03 : (car.fuel==="phev") ? 1.02 : 1.00;

    let coverF = 1.0;
    switch(state.insuranceCover){
      case "third": coverF = 0.78; break;
      case "full": coverF = 1.22; break;
      case "full_excess":
      default: coverF = 1.00; break;
    }

    const price = Number(car.pvpCash||0) || Number(car.priceFinanced||0) || 25000;
    let priceF = 1.0;
    if(price>0){
      priceF = clamp(0.82 + (price/25000)*0.18, 0.88, 1.30);
    }

    let zoneF = 1.00;
    const pc = String(state.postalCode||"").replace(/\s/g,"");
    if(/^\d{5}$/.test(pc)){
      const last3 = Number(pc.slice(2));
      zoneF = (last3<=199) ? 1.03 : 0.99;
    }
    zoneF = clamp(zoneF, 0.95, 1.05);

    const rawNormal = (base + segAdd) * expF * garageF * brandF * fuelF * coverF * priceF * zoneF;
    const raw = rawNormal * 0.94;
    const monthly = Math.max(18, Math.round(raw));

    return {
      monthly,
      parts: { base, segAdd, yrs, expF, garageF, brandF, fuelF, coverF, price, priceF, zoneF, rawNormal, raw },
      notes: "Asumimos 0 siniestros con culpa. Si los has tenido, el precio real puede subir."
    };
  }

  function maintenanceMonthlyMeta(car){
    // replicamos maintenanceMonthly() para mostrar componentes
    const included = (car.maintIncludedInQuota==="yes");
    if(included){
      const monthly = Math.max(0, Number(car.maintPlanEurMonth||0));
      return { monthly, parts:{ included:true, maintInQuota: monthly }, notes:"Plan de mantenimiento dentro de la cuota." };
    }

    const segBase = (car.segment==="utilitario") ? 24
                  : (car.segment==="berlina") ? 30
                  : (car.segment==="suv") ? 36
                  : 46;

    const premiumBrands = ["BMW","Mercedes-Benz","Audi","Porsche","Lexus","Land Rover","Jaguar","Volvo"];
    const brandF = premiumBrands.includes(car.brand) ? 1.30 : 1.00;

    const motorF = (car.fuel==="ev") ? 0.70 : (car.fuel==="phev") ? 1.12 : (car.fuel==="hev") ? 1.05 : 1.00;

    const kmY = Number(state.kmYear||0) || 0;
    const useF = clamp(1 + ((kmY-10000)/20000)*0.10, 0.90, 1.20);

    const nowY = new Date().getFullYear();
    const carYear = Number(car.year||nowY) || nowY;
    const age = clamp(nowY - carYear, 0, 25);
    const kmNow = Number(car.kmNow||0) || 0;

    let ageKmF = 1.00;
    if(car.isNew==="used" || car.isNew==="km0"){
      const ageOver = Math.max(0, age - 4);
      const k1 = Math.max(0, kmNow - 60000);
      const k2 = Math.max(0, kmNow - 120000);
      ageKmF *= (1 + ageOver * 0.035);
      ageKmF *= (1 + (k1/60000) * 0.06);
      ageKmF *= (1 + (k2/60000) * 0.08);
      ageKmF = clamp(ageKmF, 1.00, 1.55);
    }

    let tiresMonthly = 0;
    let tiresMeta = null;
    if(state.includeTires!=="no"){
      const setBase = (car.segment==="utilitario") ? 380
                    : (car.segment==="berlina") ? 460
                    : (car.segment==="suv") ? 560
                    : 650;
      let costF = premiumBrands.includes(car.brand) ? 1.10 : 1.00;
      if(car.fuel==="ev") costF *= 1.08;
      const perf = performanceFactor(car);
      if(perf > 1.15) costF *= 1.10;

      const lifeBase = (car.segment==="suv") ? 32000 : 36000;
      let lifeKm = lifeBase / clamp(perf, 1.0, 1.35);
      if(car.fuel==="ev") lifeKm *= 0.92;
      lifeKm = clamp(lifeKm, 20000, 50000);

      const kmM = kmY / 12;
      tiresMonthly = (setBase * costF) * (kmM / lifeKm);
      tiresMonthly = clamp(tiresMonthly, 0, 32);
      tiresMeta = { setBase, costF, perf, lifeKm, kmM };
    }

    const monthlyRaw = segBase * brandF * motorF * useF * ageKmF + tiresMonthly;
    const monthly = Math.max(12, Math.round(monthlyRaw));
    return { monthly, parts:{ segBase, brandF, motorF, useF, ageKmF, tiresMonthly, tiresMeta, included:false, age, kmNow }, notes:"Incluye revisiones y desgaste habitual; no incluye averías graves." };
  }

  function buildDebugTable(rows){
    return `
      <div class="rows">
        ${rows.map(r=>{
          const v = (r.value===undefined || r.value===null) ? "—" : r.value;
          return `<div class="row"><div class="k">${esc(r.label)}</div><div class="v">${v}</div></div>`;
        }).join("")}
      </div>
    `;
  }

  function buildCarDiagnosticsHTML(letter, car, res){
    const name = (`${car.brand||""} ${car.model||""}`).trim() || `Coche ${letter}`;
    const fin = res?.meta?.fin || {};
    const energy = res?.meta?.energy || {};
    const auto = res?.meta?.auto || {};
    const ivtm = car?._ivtmMeta || {};
    const insM = insuranceMonthlyMeta(car);
    const maintM = maintenanceMonthlyMeta(car);

    const finRows = [
      {label:"Modo", value: esc(fin.mode||"—")},
      {label:"Plazo", value: `${fmtNum(fin.months)} meses`},
      {label:"PVP usado", value: fmtEur(fin.basePrice)},
      {label:"Entrada", value: fmtEur(fin.down)},
      {label:"Descuento financiar", value: fmtEur(fin.disc)},
      {label:"Auto+ (aplicado a financiación)", value: fmtBool(car.autoPlusApplyGovToFinance==="yes")},
      {label:"Ayuda aplicada al capital", value: fmtEur(fin.govHelpApplied)},
      {label:"Seguros financiados (prima única)", value: fmtEur((Number(car.insFinancedTotal||0)||0))},
      {label:"Apertura", value: fmtEur(fin.openFee)},
      {label:"Capital (principal)", value: fmtEur(fin.principal)},
      {label:"Cuota total (con extras)", value: fmtEur(fin.loanMonthly) + "/mes"},
      {label:"Cuota crédito (sin extras)", value: fmtEur(fin.creditMonthly) + "/mes"},
      {label:"Extras en cuota: seguro", value: fmtEur(fin.insuranceInQuota) + "/mes"},
      {label:"Extras en cuota: mantenimiento", value: fmtEur(fin.maintInQuota) + "/mes"},
      {label:"Valor final (GMV)", value: fmtEur(fin.balloon)},
      {label:"Final: me lo quedo", value: fmtBool(fin.flexKeep)},
      {label:"Total pagado en plazo", value: fmtEur(fin.totalPaid)},
      {label:"TAE estimada", value: fmtPct(fin.tae)},
    ];

    const enRows = [];
    enRows.push({label:"Tipo", value: esc(energy.type||"—")});
    enRows.push({label:"Origen consumo", value: esc(energy.src||"—")});
    if(energy.kwh100) enRows.push({label:"Consumo", value: `${fmtNum(energy.kwh100,1)} kWh/100`});
    if(energy.l100)   enRows.push({label:"Consumo", value: `${fmtNum(energy.l100,1)} L/100`});
    if(energy.kwhMonth) enRows.push({label:"Energía/mes", value: `${fmtNum(energy.kwhMonth,1)} kWh`});
    if(energy.lMonth)   enRows.push({label:"Combustible/mes", value: `${fmtNum(energy.lMonth,1)} L`});
    if(energy.price!==undefined) enRows.push({label:"Precio usado", value: fmtEur(energy.price)});
    enRows.push({label:"Coste energía", value: fmtEur(energy.cost) + "/mes"});

    const insRows = [
      {label:"Modalidad", value: esc(state.insuranceCover||"—")},
      {label:"Edad", value: esc(payload?.inputs?.ageGroup||"—")},
      {label:"Años carnet", value: fmtNum(payload?.inputs?.licenseYears)},
      {label:"CP", value: esc(payload?.inputs?.postalCode||"")},
      {label:"Base", value: fmtEur(insM.parts.base)},
      {label:"Ajuste segmento", value: fmtNum(insM.parts.segAdd)},
      {label:"Factor experiencia", value: fmtNum(insM.parts.expF,2)},
      {label:"Factor garaje", value: fmtNum(insM.parts.garageF,2)},
      {label:"Factor marca", value: fmtNum(insM.parts.brandF,2)},
      {label:"Factor motorización", value: fmtNum(insM.parts.fuelF,2)},
      {label:"Factor cobertura", value: fmtNum(insM.parts.coverF,2)},
      {label:"Factor precio coche", value: fmtNum(insM.parts.priceF,2)},
      {label:"Factor zona (CP)", value: fmtNum(insM.parts.zoneF,2)},
      {label:"Seguro estimado", value: `<b>${fmtEur(insM.monthly)}/mes</b>`},
    ];

    const maintRows = [
      {label:"Incluye neumáticos", value: fmtBool(payload?.inputs?.includeTires!=="no")},
      {label:"Edad coche", value: `${fmtNum(maintM.parts.age)} años`},
      {label:"Km actuales", value: `${fmtNum(maintM.parts.kmNow)} km`},
      {label:"Base segmento", value: fmtEur(maintM.parts.segBase)},
      {label:"Factor marca", value: fmtNum(maintM.parts.brandF,2)},
      {label:"Factor motor", value: fmtNum(maintM.parts.motorF,2)},
      {label:"Factor uso", value: fmtNum(maintM.parts.useF,2)},
      {label:"Factor edad/km", value: fmtNum(maintM.parts.ageKmF,2)},
      {label:"Neumáticos prorrateo", value: fmtEur(maintM.parts.tiresMonthly)},
      {label:"Mantenimiento estimado", value: `<b>${fmtEur(maintM.monthly)}/mes</b>`},
    ];

    const ivtmRows = [
      {label:"Método", value: esc(ivtm.method||"—")},
      {label:"CVF usado", value: fmtNum(ivtm.cvf,2)},
      {label:"Anual (min)", value: fmtEur(ivtm.annualMin)},
      {label:"Anual (max)", value: fmtEur(ivtm.annualMax)},
      {label:"Anual (usado)", value: `<b>${fmtEur(ivtm.annual)}</b>`},
      {label:"Mensual", value: `<b>${fmtEur((Number(ivtm.annual||0)||0)/12)}/mes</b>`},
    ];

    const resRows = [
      {label:"Canal venta", value: esc(state.resaleChannel||"tradein")},
      {label:"Reventa estimada", value: fmtEur(res?.meta?.residualEst)},
      {label:"Reventa usada en cálculo", value: fmtEur(res?.pieces?.residual)},
      {label:"Motivo", value: esc(res?.meta?.residualReason||"—")},
      {label:"Usando reventa", value: fmtBool(!!res?.meta?.usedResidual)},
    ];

    const autoRows = [
      {label:"Aplica Auto+", value: fmtBool(!!auto?.help || (car.fuel==="ev"||car.fuel==="phev"))},
      {label:"Elegible", value: fmtBool(!!car?.auto?.eligible)},
      {label:"Banda precio", value: esc(car?.auto?.band||"—")},
      {label:"Ayuda total", value: fmtEur(auto?.help)},
      {label:"IRPF", value: fmtEur(auto?.irpf)},
      {label:"Ayuda neta", value: fmtEur(auto?.net)},
    ];

    return `
      <div class="card" style="padding:14px;margin-top:10px">
        <div style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap">
          <div style="font-weight:900">Diagnóstico — ${esc(name)}</div>
          <div class="pill" style="opacity:.9">${esc(letter)}</div>
        </div>
        <div class="grid-2" style="margin-top:10px">
          <div>
            <div class="section-title" style="font-size:13px">Financiación</div>
            ${buildDebugTable(finRows)}
          </div>
          <div>
            <div class="section-title" style="font-size:13px">Energía</div>
            ${buildDebugTable(enRows)}
          </div>
          <div>
            <div class="section-title" style="font-size:13px">Seguro</div>
            ${buildDebugTable(insRows)}
            <div class="smallmuted" style="margin-top:6px;font-size:12px">${esc(insM.notes||"")}</div>
          </div>
          <div>
            <div class="section-title" style="font-size:13px">Mantenimiento</div>
            ${buildDebugTable(maintRows)}
          </div>
          <div>
            <div class="section-title" style="font-size:13px">IVTM</div>
            ${buildDebugTable(ivtmRows)}
          </div>
          <div>
            <div class="section-title" style="font-size:13px">Reventa y Auto+</div>
            ${buildDebugTable(resRows)}
            <div style="height:10px"></div>
            ${buildDebugTable(autoRows)}
          </div>
        </div>
      </div>
    `;
  }

  function buildStudyDebugPanelHTML(payload, carA, carB, A, B, decision){
    if(!DEBUG) return "";
    return `
      <details class="details" style="margin-top:10px;border-color:rgba(239,68,68,.25)">
        <summary>🛠️ Detalle técnico (diagnóstico interno)</summary>
        <div class="smallmuted" style="margin-top:8px">
          Esto es para validar cálculos. No es “marketing”: muestra factores y supuestos usados.
        </div>
        <div class="card" style="padding:12px;margin-top:10px">
          <div class="section-title" style="font-size:13px">Inputs del perfil</div>
          ${buildDebugTable([
            {label:"km/año", value: fmtNum(payload?.inputs?.kmYear)},
            {label:"% ciudad", value: fmtNum(payload?.inputs?.cityPct) + "%"},
            {label:"carga", value: esc(payload?.inputs?.chargeMode||"—")},
            {label:"plazo", value: fmtNum(payload?.months) + " meses"},
            {label:"incluye reventa", value: fmtBool(payload?.inputs?.includeResidual==="yes")},
            {label:"incluye neumáticos", value: fmtBool(payload?.inputs?.includeTires!=="no")},
            {label:"perfil decisión", value: esc(payload?.inputs?.decisionProfile||"normal")},
            {label:"edad", value: esc(payload?.inputs?.ageGroup||"—")},
            {label:"años carnet", value: fmtNum(payload?.inputs?.licenseYears)},
            {label:"CP", value: esc(payload?.inputs?.postalCode||"")},
            {label:"provincia", value: esc(payload?.inputs?.province||"")},
            {label:"municipio IVTM", value: esc(payload?.inputs?.municipality||"")},
          ])}
        </div>

        <div class="card" style="padding:12px;margin-top:10px">
          <div class="section-title" style="font-size:13px">Decisión FairCar</div>
          ${buildDebugTable([
            {label:"regla aplicada", value: esc(decision?.rule||"—")},
            {label:"detalle", value: esc(decision?.ruleDetail||"—")},
            {label:"ganador global", value: esc(decision?.winners?.global||"—")},
            {label:"ganador coste", value: esc(decision?.winners?.cost||"—")},
            {label:"ganador financiación", value: esc(decision?.winners?.finance||"—")},
            {label:"ganador tranquilidad", value: esc(decision?.winners?.tranquility||"—")},
            {label:"delta mensual (A-B)", value: fmtEur(payload?.deltaMonthly) + "/mes"},
            {label:"CCR A", value: fmtEur(decision?.ccr?.A?.ccr)},
            {label:"CCR B", value: fmtEur(decision?.ccr?.B?.ccr)},
            {label:"CCR gap", value: fmtEur(Math.abs(decision?.ccr?.deltaCCR||0))},
          ])}
        </div>

        ${buildCarDiagnosticsHTML("A", carA, A)}
        ${buildCarDiagnosticsHTML("B", carB, B)}

        <div class="split" style="margin-top:12px;align-items:center">
          <div class="smallmuted">Tip: abre esta página con <code>?debug=1</code> para activar este panel.</div>
          <button type="button" class="btn ghost" id="btnDbgOff">Desactivar debug</button>
        </div>
      </details>
    `;
  }



  function renderFaircarStudy(payload){
    const months = Number(payload.months||0)||0;
    const A = payload.results.A, B = payload.results.B;
    const prof = payload?.extra?.decisionProfile || payload?.inputs?.decisionProfile || payload?.decisionProfile || "normal";
    const decision = decideWinnerFaircar(A, B, payload.cars?.A, payload.cars?.B, prof);
    const better = decision.winners.global;

    payload.inputs = payload.inputs || {};
    payload.extra  = payload.extra  || {};
    payload.inputs.decisionProfile = decision.profile;
    payload.extra.decisionProfile  = decision.profile;
    payload.better = better;

    const carA = payload.cars?.A || {};
    const carB = payload.cars?.B || {};

    // Nombres siempre Marca + Modelo
    const nameA = (`${carA.brand||""} ${carA.model||""}`).trim() || "Coche A";
    const nameB = (`${carB.brand||""} ${carB.model||""}`).trim() || "Coche B";
    const winName  = (better==="A") ? nameA : nameB;
    const loseName = (better==="A") ? nameB : nameA;
    const winCar   = (better==="A") ? carA : carB;
    const loseCar  = (better==="A") ? carB : carA;
    const winRes   = (better==="A") ? A : B;
    const loseRes  = (better==="A") ? B : A;

    const imgA = getModelImageURL(carA.brand, carA.model);
    const imgB = getModelImageURL(carB.brand, carB.model);

    const ccrA_data = decision.ccr["A"];
    const ccrB_data = decision.ccr["B"];
    const dirtyA = decision.dirtyFlags["A"];
    const dirtyB = decision.dirtyFlags["B"];

    const safA = getBrandSafetyMeta(carA.brand);
    const safB = getBrandSafetyMeta(carB.brand);
    const depA = getBrandDepreciation(carA.brand);
    const depB = getBrandDepreciation(carB.brand);

    const fitEvA  = decision.evFit["A"];
    const fitPhA  = decision.phevFit["A"];
    const fitEvB  = decision.evFit["B"];
    const fitPhB  = decision.phevFit["B"];
    const fitInfoA = fitEvA || fitPhA;
    const fitInfoB = fitEvB || fitPhB;

    const sigA = financeSignals(carA, A);
    const sigB = financeSignals(carB, B);
    const buyA = purchaseNetBreakdown(A, months);
    const buyB = purchaseNetBreakdown(B, months);

    const costPer100A = calcCostPer100km(A);
    const costPer100B = calcCostPer100km(B);

    const whatChange = buildWhatWouldChange(payload);

    if(!studyMount) return;

    // ─── Cálculos compartidos ─────────────────────────────────────────────────
    const finComparable = !(carA._financeNotComparable || carB._financeNotComparable)
      && (carA.financeMode === carB.financeMode || (carA.financeMode !== "flex" && carB.financeMode !== "flex"))
      && (Math.abs(Number(carA.downPayment||0) - Number(carB.downPayment||0)) <= 50);

    const useA = Number(A.pieces.energyMonthly||0)+Number(A.pieces.maintenanceMonthly||0)+Number(A.pieces.taxMonthly||0)+Number(A.pieces.insuranceMonthly||0);
    const useB = Number(B.pieces.energyMonthly||0)+Number(B.pieces.maintenanceMonthly||0)+Number(B.pieces.taxMonthly||0)+Number(B.pieces.insuranceMonthly||0);
    const useDiff = Math.abs(useA - useB);
    const cheaperUsoName = (useA <= useB) ? nameA : nameB;

    const ccrDiff      = Math.abs(decision.ccr.deltaCCR);
    const ccrMonthDiff = Math.abs(decision.ccr.deltaCCRmonth);
    const ccrWinName   = (ccrA_data.ccr <= ccrB_data.ccr) ? nameA : nameB;
    const finTie       = (ccrDiff < 200) || (ccrA_data.ccr === 0 && ccrB_data.ccr === 0);

    const scoreA = safA ? Number(safA.scoreFinal||0) : 0;
    const scoreB = safB ? Number(safB.scoreFinal||0) : 0;
    const marcaWinName = (scoreA >= scoreB) ? nameA : nameB;
    const marcaTie     = Math.abs(scoreA-scoreB) < 0.3;

    // ─── CAMBIO B: Header de 3 ganadores de un vistazo ───────────────────────
    function buildSummaryHeader(){
      function pill(ico, label, winner, tie){
        return `
          <div class="fc-pill">
            <div class="fc-pill-ico">${ico}</div>
            <div>
              <div class="fc-pill-label">${label}</div>
              <div class="fc-pill-winner">${tie ? "Muy parecidos" : esc(winner)}</div>
            </div>
          </div>
        `;
      }
      return `
        <div class="fc-summary-header">
          ${pill("💳","Mejor financiación", ccrWinName, finTie)}
          ${pill("⛽","Más barato de usar", cheaperUsoName, useDiff < 10)}
          ${pill("🏷️","Mejor marca/fiabilidad", marcaWinName, marcaTie)}
        </div>
        <div class="hint" style="margin-top:8px;margin-bottom:2px">FairCar compara los tres aspectos que más importan al comprar un coche. Elige abajo qué pesa más para ti y la conclusión se adapta.</div>
      `;
    }

    // ─── BLOQUE 1: FINANCIACIÓN ───────────────────────────────────────────────
    function buildFinBlock(){
      const aF = A.meta.fin || {};
      const bF = B.meta.fin || {};

      function finSummary(name, ccr, dirty, fin){
        if(fin.mode !== "finance") return `<div class="fc-fin-row"><b>${esc(name)}</b><span>Pago al contado</span></div>`;
        const total  = money(ccr.ccr||0);
        const perMes = money(ccr.ccrMonth||0);
        const int_   = money(ccr.intereses||0);
        const ap_    = money(ccr.apertura||0);
        const extra_ = money(ccr.extrasLoan||0);
        return `
          <div class="fc-fin-card">
            <div class="fc-fin-name">${esc(name)}</div>
            <div class="fc-fin-total">${total} <span class="fc-fin-sub">en total (${perMes}/mes)</span></div>
            <div class="fc-fin-breakdown">
              <span>Intereses: <b>${int_}</b></span>
              <span>Apertura: <b>${ccr.apertura > 0 ? ap_ : "ninguna"}</b></span>
              <span>Extras vinculados: <b>${ccr.extrasLoan > 0 ? extra_ : "ninguno"}</b></span>
              ${dirty.count >= 1 ? `<span style="color:#f87171">⚠ ${dirty.count} alerta${dirty.count>1?"s":""}: ${dirty.flags.map(f=>f.text).join(", ")}</span>` : `<span style="color:#4ade80">✓ Oferta limpia</span>`}
            </div>
          </div>
        `;
      }

      let finVerdict = "";
      if(!finComparable){
        finVerdict = `⚠️ Condiciones distintas (tipo, plazo o entrada difieren): la comparativa de financiación puede no ser fiable.`;
      } else if(ccrA_data.ccr===0 && ccrB_data.ccr===0){
        finVerdict = `Ambos al contado — sin coste de crédito.`;
      } else if(finTie){
        finVerdict = `Financiaciones similares — diferencia de solo <b>${money(ccrDiff)}</b> en todo el plazo.`;
      } else {
        const other = (ccrWinName===nameA) ? nameB : nameA;
        finVerdict = `<b>${esc(ccrWinName)}</b> te ahorra <b>${money(ccrDiff)}</b> en intereses y comisión de apertura a lo largo del plazo (≈ <b>${money(ccrMonthDiff)}/mes</b>). Eso es dinero que no va al coche, va al banco.`;
      }

      const comparBadge = finComparable
        ? `<span class="badge good">✓ Condiciones iguales</span>`
        : `<span class="badge warn">⚠ Condiciones distintas</span>`;

      return `
        <div class="fc-block">
          <div class="fc-block-head">
            <div class="fc-block-ico">💳</div>
            <div style="flex:1">
              <div class="fc-block-title">${finTie ? "Financiación" : `<b>${esc(ccrWinName)}</b> tiene mejor financiación`}</div>
              <div class="fc-block-sub">${finVerdict}</div>
            </div>
          </div>
          <div class="fc-block-badges" style="margin-top:8px">${comparBadge}</div>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            ${finSummary(nameA, ccrA_data, dirtyA, aF)}
            ${finSummary(nameB, ccrB_data, dirtyB, bF)}
          </div>
          <details class="details" style="margin-top:10px">
            <summary>Cuotas estimadas y totales pagados</summary>
            <div style="margin-top:10px">
              <div class="rows">
                <div class="r"><div>Cuota estimada — ${esc(nameA)}</div><div><b>${euro(A.meta.fin.loanMonthly)}/mes</b></div></div>
                <div class="r"><div>Cuota estimada — ${esc(nameB)}</div><div><b>${euro(B.meta.fin.loanMonthly)}/mes</b></div></div>
                <div class="r"><div>Total pagado en ${months}m — ${esc(nameA)}</div><div><b>${money(Number(A.meta.fin.loanMonthly||0)*months + Number(carA.downPayment||0))}</b></div></div>
                <div class="r"><div>Total pagado en ${months}m — ${esc(nameB)}</div><div><b>${money(Number(B.meta.fin.loanMonthly||0)*months + Number(carB.downPayment||0))}</b></div></div>
              </div>
            </div>
          </details>
        </div>
      `;
    }

    // ─── BLOQUE 2: COSTE DE USO ───────────────────────────────────────────────
    function buildUsoBlock(){
      const pvpA = Number(carA.pvpCash||0);
      const pvpB = Number(carB.pvpCash||0);
      const pvpDiff = Math.abs(pvpA - pvpB);
      const moreExpName  = (pvpA >= pvpB) ? nameA : nameB;
      const moreExpHelp  = (pvpA >= pvpB) ? Number(A.pieces.netHelpTotal||0) : Number(B.pieces.netHelpTotal||0);
      const sobreprecioNeto = Math.max(0, pvpDiff - moreExpHelp);
      let breakEvenHtml = "";
      if(pvpDiff >= 500 && useDiff >= 15){
        const beMonths = Math.round(sobreprecioNeto / useDiff);
        if(beMonths > 0 && beMonths < 360){
          const beYears = (beMonths / 12).toFixed(1);
          breakEvenHtml = `
            <div class="fc-breakeven">
              <span class="fc-breakeven-ico">💡</span>
              <span>El sobreprecio de <b>${esc(moreExpName)}</b> (descontadas ayudas: <b>${money(sobreprecioNeto)}</b>) se recupera en <b>~${beMonths} meses</b> (${beYears} años) gracias al ahorro de uso.</span>
            </div>`;
        }
      }

      // Texto PHEV/EV de encaje
      let motorText = "";
      if(fitInfoA || fitInfoB){
        motorText = `<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">`;
        if(fitInfoA){
          const cls = fitInfoA.verdict==="bad"?"bad":fitInfoA.verdict==="warn"?"warn":"good";
          motorText += `<div class="fc-motor-fit ${cls}"><b>${esc(fuelLabel(carA.fuel))} ${esc(nameA)}</b>: ${fitInfoA.reason}</div>`;
        }
        if(fitInfoB){
          const cls = fitInfoB.verdict==="bad"?"bad":fitInfoB.verdict==="warn"?"warn":"good";
          motorText += `<div class="fc-motor-fit ${cls}"><b>${esc(fuelLabel(carB.fuel))} ${esc(nameB)}</b>: ${fitInfoB.reason}</div>`;
        }
        motorText += `</div>`;
      }

      const usoVerdict = useDiff < 10
        ? `Coste de uso similar — diferencia de solo ±${money(useDiff)}/mes.`
        : `<b>${esc(cheaperUsoName)}</b> cuesta <b>${money(useDiff)}/mes menos</b> en energía, mantenimiento, seguro e impuestos. En un año: <b>${money(useDiff*12)}</b> de diferencia.`;

      // Mini barras comparativas de uso
      const maxUse = Math.max(useA, useB, 1);
      const barA = Math.round((useA/maxUse)*100);
      const barB = Math.round((useB/maxUse)*100);

      return `
        <div class="fc-block">
          <div class="fc-block-head">
            <div class="fc-block-ico">⛽</div>
            <div style="flex:1">
              <div class="fc-block-title">${useDiff>=10 ? `<b>${esc(cheaperUsoName)}</b> es más barato de usar` : "Coste de uso similar"}</div>
              <div class="fc-block-sub">${usoVerdict}</div>
            </div>
          </div>
          ${breakEvenHtml}
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <div class="fc-bar-row">
              <div class="fc-bar-label">${esc(nameA)}</div>
              <div class="fc-bar-track"><div class="fc-bar-fill ${useA<=useB?"good":""}" style="width:${barA}%"></div></div>
              <div class="fc-bar-val">${euro(useA)}/mes</div>
            </div>
            <div class="fc-bar-row">
              <div class="fc-bar-label">${esc(nameB)}</div>
              <div class="fc-bar-track"><div class="fc-bar-fill ${useB<useA?"good":""}" style="width:${barB}%"></div></div>
              <div class="fc-bar-val">${euro(useB)}/mes</div>
            </div>
          </div>
          ${motorText}
          <details class="details" style="margin-top:10px">
            <summary>Ver desglose detallado de uso</summary>
            <div style="margin-top:10px">
              <div class="rows">
                <div class="r"><div>Energía — ${esc(nameA)}</div><div><b>${euro(A.pieces.energyMonthly)}/mes</b></div></div>
                <div class="r"><div>Energía — ${esc(nameB)}</div><div><b>${euro(B.pieces.energyMonthly)}/mes</b></div></div>
                <div class="r"><div>Mantenimiento — ${esc(nameA)}</div><div><b>${euro(A.pieces.maintenanceMonthly)}/mes</b></div></div>
                <div class="r"><div>Mantenimiento — ${esc(nameB)}</div><div><b>${euro(B.pieces.maintenanceMonthly)}/mes</b></div></div>
                <div class="r"><div>Seguro — ${esc(nameA)}</div><div><b>${euro(A.pieces.insuranceMonthly)}/mes</b></div></div>
                <div class="r"><div>Seguro — ${esc(nameB)}</div><div><b>${euro(B.pieces.insuranceMonthly)}/mes</b></div></div>
                <div class="r"><div>Impuestos — ${esc(nameA)}</div><div><b>${euro(A.pieces.taxMonthly)}/mes</b></div></div>
                <div class="r"><div>Impuestos — ${esc(nameB)}</div><div><b>${euro(B.pieces.taxMonthly)}/mes</b></div></div>
                ${costPer100A!==null?`<div class="r"><div>€/100 km todo incluido — ${esc(nameA)}</div><div><b>~${costPer100A.toFixed(0)}€</b></div></div>`:""}
                ${costPer100B!==null?`<div class="r"><div>€/100 km todo incluido — ${esc(nameB)}</div><div><b>~${costPer100B.toFixed(0)}€</b></div></div>`:""}
              </div>
            </div>
          </details>
        </div>
      `;
    }

    // ─── BLOQUE 3: MARCA Y FIABILIDAD (CAMBIO C: barras visuales) ─────────────
    function buildMarcaBlock(){
      // Barra de indicador visual (0-10)
      function indBar(val, max, cls){
        const pct = Math.round((Number(val||0)/max)*100);
        return `<div class="fc-bar-track" style="height:6px"><div class="fc-bar-fill ${cls}" style="width:${pct}%"></div></div>`;
      }

      function marcaCard(name, saf, dep){
        if(!saf) return `
          <div class="fc-marca-card">
            <div class="fc-marca-name">${esc(name)}</div>
            <div class="smallmuted">Sin datos suficientes aún para esta marca.</div>
          </div>`;

        const score = Number(saf.scoreFinal||0);
        const fiab  = Number(saf.fiabilidadOCU||0);
        const depr  = Number(saf.devaluacion||0);
        const seg   = Number(saf.seguridadPasiva||0);
        const cls   = (score>=8.2)?"good":(score>=7.0)?"warn":"bad";

        return `
          <div class="fc-marca-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div class="fc-marca-name">${esc(name)}</div>
              <span class="badge ${cls}" style="font-size:13px;font-weight:900">${score.toFixed(1)}/10${saf.ncapStars?` · ${saf.ncapStars}★`:""}</span>
            </div>
            <div style="font-size:13px;line-height:1.5;margin-bottom:10px">${saf.resumen||""}</div>
            <div class="fc-indica-grid">
              <div class="fc-indica">
                <div class="fc-indica-label">Fiabilidad OCU</div>
                ${indBar(fiab,10,"good")}
                <div class="fc-indica-val">${fiab.toFixed(1)}/10</div>
              </div>
              <div class="fc-indica">
                <div class="fc-indica-label">Retención de valor</div>
                ${indBar(depr,10, depr>=7?"good":depr>=5?"warn":"bad")}
                <div class="fc-indica-val">${depr.toFixed(1)}/10</div>
              </div>
              <div class="fc-indica">
                <div class="fc-indica-label">Seguridad pasiva</div>
                ${indBar(seg,10,"good")}
                <div class="fc-indica-val">${seg.toFixed(1)}/10</div>
              </div>
            </div>
            ${saf.devaluacionNota ? `<div class="smallmuted" style="margin-top:8px;font-size:12px">📉 ${saf.devaluacionNota}</div>` : ""}
          </div>
        `;
      }

      const verdictMarca = marcaTie
        ? `Marcas con características similares en fiabilidad y seguridad.`
        : `<b>${esc(marcaWinName)}</b> destaca en fiabilidad${depA.level==="low"&&marcaWinName===nameA||depB.level==="low"&&marcaWinName===nameB ? " y mejor retención de valor" : ""}.`;

      return `
        <div class="fc-block">
          <div class="fc-block-head">
            <div class="fc-block-ico">🏷️</div>
            <div style="flex:1">
              <div class="fc-block-title">${marcaTie ? "Marca y fiabilidad" : `<b>${esc(marcaWinName)}</b> destaca en marca`}</div>
              <div class="fc-block-sub">${verdictMarca}</div>
            </div>
          </div>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:10px">
            ${marcaCard(nameA, safA, depA)}
            ${marcaCard(nameB, safB, depB)}
          </div>
        </div>
      `;
    }

    // ─── CAMBIO E: Conclusión concreta con nombres y cifras ───────────────────
    function buildConclusion(){
      const aM = Number(A.monthlyReal||0), bM = Number(B.monthlyReal||0);
      const cheapMonthName  = (aM<=bM) ? nameA : nameB;
      const expMonthName    = (aM<=bM) ? nameB : nameA;
      const diffMes = money(Math.abs(aM-bM));
      const diffMesVal = Math.abs(aM-bM);

      // Construir resumen de qué gana en cada dimensión
      const finWin   = finTie ? null : ccrWinName;
      const usoWin   = useDiff < 10 ? null : cheaperUsoName;
      const marcaWin = marcaTie ? null : marcaWinName;

      // Contar cuántas dimensiones gana cada coche
      const scoresCount = {[nameA]:0, [nameB]:0};
      if(finWin)   scoresCount[finWin]++;
      if(usoWin)   scoresCount[usoWin]++;
      if(marcaWin) scoresCount[marcaWin]++;

      const overallWin  = scoresCount[nameA] >= scoresCount[nameB] ? nameA : nameB;
      const overallLose = (overallWin===nameA) ? nameB : nameA;
      const overallScore = Math.max(scoresCount[nameA], scoresCount[nameB]);

      let conclusionText = "";
      switch(decision.profile){
        case "budget":
          if(diffMesVal < 10){
            conclusionText = `Coste mensual casi idéntico — diferencia de solo ${diffMes}/mes. Elige el que mejor encaje con tus necesidades de financiación y uso.`;
          } else {
            conclusionText = `<b>${esc(cheapMonthName)}</b> es el más económico: <b>${diffMes}/mes menos</b> en coste total real. En ${months} meses, eso son <b>${money(diffMesVal*months)} de diferencia</b>. Si tu prioridad es la cuota, esta es tu opción.`;
          }
          break;
        case "conservative":
          if(marcaWin){
            const mw = (marcaWin===nameA) ? safA : safB;
            conclusionText = `Para quien busca tranquilidad a largo plazo, <b>${esc(marcaWin)}</b> es la opción más sólida${mw ? ` (${mw.scoreFinal}/10 en fiabilidad y seguridad)` : ""}. ${depA.level==="low"&&marcaWin===nameA || depB.level==="low"&&marcaWin===nameB ? "Además, retiene mejor su valor." : ""}`;
          } else {
            conclusionText = `Las dos marcas están muy igualadas en fiabilidad. En ese caso, el desempate lo da la financiación: <b>${finWin||cheapMonthName}</b>.`;
          }
          break;
        case "traveler":
          if(usoWin){
            const diff12 = money(useDiff*12);
            conclusionText = `Para alguien que conduce mucho, el coste de uso es lo que más pesa. <b>${esc(usoWin)}</b> sale <b>${money(useDiff)}/mes más barato</b> en energía y mantenimiento — <b>${diff12} al año</b>. ${fitInfoA||fitInfoB ? "Ten en cuenta el encaje de motorización arriba." : ""}`;
          } else {
            conclusionText = `Coste de uso muy similar para los dos. Con muchos km, mira el encaje de motorización: qué tipo de conducción tienes y si puedes cargar en casa.`;
          }
          break;
        default:{ // normal / equilibrado
          const parts = [];
          if(finWin)  parts.push(`mejor financiación: <b>${esc(finWin)}</b> (${money(ccrDiff)} menos en crédito)`);
          if(usoWin)  parts.push(`más barato de usar: <b>${esc(usoWin)}</b> (${money(useDiff)}/mes)`);
          if(marcaWin) parts.push(`mejor fiabilidad de marca: <b>${esc(marcaWin)}</b>`);

          if(overallScore >= 2){
            conclusionText = `<b>${esc(overallWin)}</b> gana en ${overallScore} de los 3 aspectos. `
              + (parts.length ? "En detalle: " + parts.join("; ") + "." : "")
              + (diffMesVal>10 ? ` Además, ${cheapMonthName} es ${diffMes}/mes más económico.` : "");
          } else if(parts.length){
            conclusionText = parts.join("; ") + ". Cada opción tiene sus puntos fuertes; elige según lo que más values.";
          } else {
            conclusionText = `Los dos coches están muy igualados. Ninguno domina claramente — la decisión es personal.`;
          }
        }
      }

      return `
        <div class="fc-block" style="border-color:rgba(11,95,255,.35);background:var(--blueSoft)">
          <div class="fc-block-head">
            <div class="fc-block-ico">📋</div>
            <div style="flex:1">
              <div class="fc-block-title">Tu conclusión</div>
              <div class="fc-block-sub" style="margin-top:4px">${conclusionText}</div>
            </div>
          </div>
          <div style="margin-top:12px">
            ${buildDecisionProfilePickerHTML(decision.profile, true)}
          </div>
        </div>
      `;
    }

    // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────
    studyMount.innerHTML = `
      <div class="fc-vs-header">
        <div class="fc-vs-car">
          ${imgA ? `<img src="${esc(imgA)}" alt="${esc(nameA)}" class="fc-vs-img" />` : `<div class="fc-vs-img fc-vs-img-placeholder">🚗</div>`}
          <div class="fc-vs-name">${esc(nameA)}</div>
          <div class="smallmuted">${esc(fuelLabel(carA.fuel))}</div>
          <div class="fc-vs-price">${euro(A.monthlyReal)}/mes</div>
        </div>
        <div class="fc-vs-sep">vs</div>
        <div class="fc-vs-car">
          ${imgB ? `<img src="${esc(imgB)}" alt="${esc(nameB)}" class="fc-vs-img" />` : `<div class="fc-vs-img fc-vs-img-placeholder">🚗</div>`}
          <div class="fc-vs-name">${esc(nameB)}</div>
          <div class="smallmuted">${esc(fuelLabel(carB.fuel))}</div>
          <div class="fc-vs-price">${euro(B.monthlyReal)}/mes</div>
        </div>
      </div>

      ${buildSummaryHeader()}

      <div class="hr"></div>
      ${buildFinBlock()}
      <div class="hr"></div>
      ${buildUsoBlock()}
      <div class="hr"></div>
      ${buildMarcaBlock()}
      <div class="hr"></div>
      ${buildConclusion()}
      <div class="hr"></div>

      <details class="details">
        <summary>Desglose completo mes a mes</summary>
        <div class="grid-2" style="margin-top:10px">
          <div>
            <div style="font-weight:700;margin-bottom:6px">${esc(nameA)}</div>
            <div class="rows">${breakdownHTML(A.pieces, A.meta, carA)}</div>
          </div>
          <div>
            <div style="font-weight:700;margin-bottom:6px">${esc(nameB)}</div>
            <div class="rows">${breakdownHTML(B.pieces, B.meta, carB)}</div>
          </div>
        </div>
      </details>

      <details class="details" style="margin-top:8px">
        <summary>¿Qué tendría que cambiar para equilibrar?</summary>
        <ul class="checklist" style="margin-top:8px">
          ${whatChange.map(x=>`<li>${x}</li>`).join("")}
        </ul>
      </details>

      ${buildStudyDebugPanelHTML(payload, carA, carB, A, B, decision)}

      <div class="split" style="margin-top:14px">
        <a class="btn ghost screen-only" href="wizard.html">← Volver a la comparativa</a>
        <div class="screen-only" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">
          <button class="btn ghost" id="btnSaveStudyComparison" type="button">Guardar</button>
          <button class="btn ghost" id="btnStudyPdf" type="button">PDF</button>
          <button class="btn" id="btnStudyRecalc" type="button">Recalcular</button>
        </div>
      </div>
      <div id="pdfStudyBlock" class="pdf-only"></div>
      <div class="smallmuted" style="margin-top:10px;font-size:12px">
        ⚠ Todo es una estimación basada en los datos que introdujiste. Pide siempre por escrito: TAE, comisión de apertura, seguros vinculados y si hay pago final (GMV).
      </div>
    `;

    // Eventos perfil
    try{
      studyMount.querySelectorAll("button[data-prof]").forEach(btn=>{
        btn.onclick = () => {
          const k = btn.getAttribute("data-prof") || "normal";
          payload.inputs = payload.inputs || {};
          payload.extra  = payload.extra  || {};
          payload.inputs.decisionProfile = k;
          payload.extra.decisionProfile  = k;
          localStorage.setItem("faircar:lastStudy", JSON.stringify(payload));
          renderFaircarStudy(payload);
        };
      });
    }catch(e){}

    const btnRecalc = document.getElementById("btnStudyRecalc");
    if(btnRecalc) btnRecalc.onclick = () => { location.href = "wizard.html"; };

    const btnSave = document.getElementById("btnSaveStudyComparison");
    if(btnSave){
      btnSave.onclick = () => {
        const ok1 = saveComparisonToStorage(payload);
        const ok2 = saveCarToStorage(payload?.cars?.A || state.carA);
        const ok3 = saveCarToStorage(payload?.cars?.B || state.carB);
        toast((ok1&&ok2&&ok3) ? "Comparativa guardada" : "No se pudo guardar");
      };
    }

    const btnPdf = document.getElementById("btnStudyPdf");
    if(btnPdf) btnPdf.onclick = () => downloadStudyPDF(payload);

    const btnDbgOff = document.getElementById("btnDbgOff");
    if(btnDbgOff){
      btnDbgOff.onclick = () => {
        try{ localStorage.removeItem(FC_DEBUG_LS); }catch(e){}
        try{
          const u = new URL(location.href);
          u.searchParams.delete("debug");
          location.href = u.toString();
        }catch(e){
          location.href = "recomendacion.html";
        }
      };
    }
  }


  function applyPayloadInputsToState(inputs){
    try{
      if(!inputs || typeof inputs!=="object") return;
      // Uso
      if(inputs.kmYear!==undefined) state.kmYear = inputs.kmYear;
      if(inputs.cityPct!==undefined) state.cityPct = inputs.cityPct;
      if(inputs.chargeMode) state.chargeMode = inputs.chargeMode;

      // Precios energía
      if(inputs.priceGas!==undefined) state.priceGas = inputs.priceGas;
      if(inputs.priceDiesel!==undefined) state.priceDiesel = inputs.priceDiesel;
      if(inputs.priceKwhHome!==undefined) state.priceKwhHome = inputs.priceKwhHome;
      if(inputs.priceKwhStreet!==undefined) state.priceKwhStreet = inputs.priceKwhStreet;

      // Seguro
      if(inputs.ageGroup) state.ageGroup = inputs.ageGroup;
      if(inputs.licenseYears!==undefined) state.licenseYears = inputs.licenseYears;
      if(inputs.postalCode!==undefined) state.postalCode = inputs.postalCode;
      if(inputs.garage) state.garage = inputs.garage;
      if(inputs.insuranceCover) state.insuranceCover = inputs.insuranceCover;

      // Ubicación/IVTM
      if(inputs.province!==undefined) state.city = inputs.province;
      if(inputs.municipality!==undefined) state.ivtmMunicipalityName = inputs.municipality;
      state.climate = computeClimate(state.city);

      // Reventa/mantenimiento
      if(inputs.includeResidual!==undefined) state.includeResidual = inputs.includeResidual;
      if(inputs.resaleChannel) state.resaleChannel = inputs.resaleChannel;
      if(inputs.includeTires!==undefined) state.includeTires = inputs.includeTires;

      // Auto+
      if(inputs.irpfPct!==undefined) state.irpfPct = inputs.irpfPct;

      if(inputs.compareFairResidual!==undefined) state.compareFairResidual = inputs.compareFairResidual;
      if(inputs.decisionProfile) state.decisionProfile = inputs.decisionProfile;
    }catch(e){}
  }

  function initFaircarStudyPage(){
    try{
      const raw = localStorage.getItem("faircar:lastStudy");
      if(!raw){
        if(studyMount){
          studyMount.innerHTML = `
            <h2>Estudio FairCar</h2>
            <p class="smallmuted">No encuentro una comparativa previa en este navegador. Vuelve al wizard y pulsa <b>“Estudio FairCar”</b> al final.</p>
            <a class="btn" href="wizard.html">Ir al wizard</a>
          `;
        }
        return;
      }
      const payload = JSON.parse(raw);
      if(!payload || !payload.results || !payload.cars) throw new Error("Payload inválido");
      applyPayloadInputsToState(payload.inputs||{});
      renderFaircarStudy(payload);
    }catch(e){
      console.error(e);
      if(studyMount){
        studyMount.innerHTML = `
          <h2>Estudio FairCar</h2>
          <p class="smallmuted">Hubo un problema leyendo la comparativa guardada. Vuelve al wizard y genera el estudio otra vez.</p>
          <a class="btn" href="wizard.html">Ir al wizard</a>
        `;
      }
    }
  }
  
  // ===== Tests (interno) =====
  function approxEqual(a,b,tol){
    const x = Number(a), y = Number(b);
    if(!Number.isFinite(x) || !Number.isFinite(y)) return false;
    return Math.abs(x-y) <= (tol===undefined?0.05:Number(tol));
  }

  function runSmokeTests(){
    const baseSnapshot = deepClone(state);

    function reset(){
      // restaura estado base (deep)
      const snap = deepClone(baseSnapshot);
      // borrado superficial + assign para no dejar basura
      Object.keys(state).forEach(k=>{ try{ delete state[k]; }catch(e){} });
      Object.assign(state, snap);
    }

    function setState(patch){
      Object.assign(state, patch||{});
    }

    function mkCar(letter, patch){
      const c = makeEmptyCar(letter);
      Object.assign(c, patch||{});
      // Normalizar algunos defaults comunes para tests
      if(!c.segment) c.segment = "utilitario";
      if(!c.powerKw) c.powerKw = 85;
      return c;
    }

    const results = [];
    function add(name, fn){
      try{
        reset();
        const out = fn();
        results.push({ name, pass: !!out.pass, detail: out.detail||"" });
      }catch(e){
        results.push({ name, pass:false, detail: "EXCEPTION: " + (e && e.message ? e.message : String(e)) });
      }
    }

    // T1: consistencia suma de piezas (km=0 => energía 0)
    add("T1 Consistencia: monthlyReal = suma piezas", ()=>{
      setState({ kmYear:0, termMonths:60, includeResidual:"no", priceGas:1.45, priceDiesel:1.40, priceKwhHome:0.20, priceKwhStreet:0.45 });
      const car = mkCar("A", { fuel:"gasoline", financeEnabled:"no", pvpCash:24000, segment:"utilitario" });
      const res = computeMonthlyReal(car);
      const sum = Number(res.pieces.financeMonthly) + Number(res.pieces.energyMonthly) + Number(res.pieces.insuranceMonthly)
                + Number(res.pieces.maintenanceMonthly) + Number(res.pieces.taxMonthly);
      return { pass: approxEqual(res.monthlyReal, sum, 0.05) && approxEqual(res.pieces.energyMonthly, 0, 0.01),
               detail: `real=${res.monthlyReal.toFixed(2)} sum=${sum.toFixed(2)} energy=${res.pieces.energyMonthly.toFixed(2)}` };
    });

    // T2: cuota crédito limpia excluye extras en cuota
    add("T2 Crédito: creditMonthly excluye seguro/mant en cuota", ()=>{
      setState({ kmYear:0, termMonths:60 });
      const car = mkCar("A", {
        fuel:"gasoline", financeEnabled:"yes", pvpCash:30000, financeDiscount:0, downPayment:0,
        tin:6.5, monthlyPayment:500, hasOpenFee:"yes", openFeePct:3.5,
        insInPayment:"yes", insMode:"monthly", lifeInsMonthly:30,
        maintIncludedInQuota:"yes", maintPlanEurMonth:20,
        financeMode:"linear"
      });
      const res = computeMonthlyReal(car);
      const fin = res.meta.fin;
      const expectedCredit = 500 - 30 - 20;
      const pass = approxEqual(fin.creditMonthly, expectedCredit, 0.01) && approxEqual(fin.loanMonthly, 500, 0.01);
      return { pass, detail: `loanMonthly=${fin.loanMonthly} creditMonthly=${fin.creditMonthly} expected=${expectedCredit}` };
    });

    // T3: CCR no incluye extras (solo crédito)
    add("T3 CCR: no incluye extras en cuota", ()=>{
      setState({ kmYear:0, termMonths:60 });
      const car = mkCar("A", {
        fuel:"gasoline", financeEnabled:"yes", pvpCash:30000, downPayment:0,
        tin:6.5, monthlyPayment:500, hasOpenFee:"yes", openFeePct:3.5,
        insInPayment:"yes", insMode:"monthly", lifeInsMonthly:30,
        maintIncludedInQuota:"yes", maintPlanEurMonth:20,
        financeMode:"linear"
      });
      const res = computeMonthlyReal(car);
      const ccr = calcCreditRealCost(car, res);
      const fin = res.meta.fin;
      const received = Number(fin.financedBase||0)||0;
      const creditPaid = Number(fin.creditMonthly||0)*Number(fin.months||0);
      const expected = Math.max(0, creditPaid - received);
      const pass = approxEqual(ccr.ccr, expected, 0.5) && (ccr.extrasLoan > 0);
      return { pass, detail: `ccr=${ccr.ccr.toFixed(2)} expected=${expected.toFixed(2)} extrasLoan=${ccr.extrasLoan.toFixed(2)}` };
    });

    // T4: Flex devolver no paga balloon
    add("T4 Flex devolver: balloonPaid=0", ()=>{
      setState({ kmYear:0, termMonths:60, includeResidual:"yes" });
      const car = mkCar("A", {
        fuel:"gasoline", financeEnabled:"yes", pvpCash:28000, downPayment:1000,
        financeMode:"flex", flexGmv:15000, flexEnd:"return",
        tin:7.0, monthlyPayment:380
      });
      const res = computeMonthlyReal(car);
      const fin = res.meta.fin;
      const pass = (fin.balloonPaid===0) && (fin.flexKeep===false) && approxEqual(fin.totalPaid, 380*60 + 1000, 0.5);
      return { pass, detail: `totalPaid=${fin.totalPaid} balloonPaid=${fin.balloonPaid}` };
    });

    // T5: Flex quedártelo paga balloon y puede usar reventa
    add("T5 Flex keep: balloonPaid=GMV y reventa aplicable", ()=>{
      setState({ kmYear:0, termMonths:60, includeResidual:"yes" });
      const car = mkCar("A", {
        fuel:"gasoline", financeEnabled:"yes", pvpCash:28000, downPayment:1000,
        financeMode:"flex", flexGmv:15000, flexEnd:"keep",
        tin:7.0, monthlyPayment:380
      });
      const res = computeMonthlyReal(car);
      const fin = res.meta.fin;
      const pass = (fin.balloonPaid===15000) && (fin.flexKeep===true) && (res.meta.usedResidual===true) && (res.pieces.residual>0);
      return { pass, detail: `balloonPaid=${fin.balloonPaid} residualUsed=${res.pieces.residual}` };
    });

    // T6: EV sin peKw usa CVF por segmento (no potencia pico)
    add("T6 IVTM EV: sin peKw usa CVF por segmento", ()=>{
      setState({ city:"Sevilla", ivtmMunicipalityName:"", kmYear:12000 });
      const car = mkCar("A", { fuel:"ev", segment:"suv", powerKw:300, peKw:0, pvpCash:42000 });
      const taxM = circulationTaxMonthly(car);
      const cvf = Number(car._ivtmMeta && car._ivtmMeta.cvf);
      const pass = (cvf===16) && (taxM>=0);
      return { pass, detail: `cvf=${cvf} taxM=${taxM.toFixed(2)}` };
    });

    // T7: Usado aumenta mantenimiento vs nuevo
    add("T7 Mantenimiento: usado > nuevo", ()=>{
      setState({ kmYear:12000, includeTires:"no" });
      const nowY = new Date().getFullYear();
      const carNew = mkCar("A", { fuel:"gasoline", segment:"suv", brand:"Toyota", isNew:"new", year:nowY, kmNow:0 });
      const carUsed = mkCar("B", { fuel:"gasoline", segment:"suv", brand:"Toyota", isNew:"used", year:nowY-8, kmNow:140000 });
      const mNew = maintenanceMonthly(carNew);
      const mUsed = maintenanceMonthly(carUsed);
      return { pass: (mUsed > mNew), detail: `new=${mNew} used=${mUsed}` };
    });

    // T8: Neumáticos activados suben mantenimiento con km alto
    add("T8 Neumáticos: includeTires sí > no", ()=>{
      const nowY = new Date().getFullYear();
      const car = mkCar("A", { fuel:"ev", segment:"suv", brand:"Tesla", isNew:"new", year:nowY, kmNow:0 });
      setState({ kmYear:24000, includeTires:"yes" });
      const mYes = maintenanceMonthly(car);
      setState({ kmYear:24000, includeTires:"no" });
      const mNo = maintenanceMonthly(car);
      return { pass: (mYes > mNo), detail: `yes=${mYes} no=${mNo}` };
    });

    // T9: Canal venta particular > entrega concesionario
    add("T9 Reventa: particular > concesionario", ()=>{
      const nowY = new Date().getFullYear();
      const car = mkCar("A", { fuel:"gasoline", segment:"berlina", brand:"Toyota", pvpCash:30000, isNew:"new", year:nowY, kmNow:0 });
      setState({ resaleChannel:"tradein" });
      const rT = residualEstimate(car);
      setState({ resaleChannel:"private" });
      const rP = residualEstimate(car);
      return { pass: (rP > rT), detail: `tradein=${rT} private=${rP}` };
    });

    // T10: Auto+ aplicado a financiación => netHelpTotal=0, IRPF>0 (EV elegible)
    add("T10 Auto+: aplicar a financiación cambia netHelp/IRPF", ()=>{
      setState({ kmYear:0, termMonths:60, irpfPct:0.15 });
      const car = mkCar("A", { fuel:"ev", pvpCash:42000, financeEnabled:"yes", downPayment:0, tin:5.0, monthlyPayment:600, autoPlusApplyGovToFinance:"yes" });
      // Ajustes Auto+ (si no hay precios, computeAutoPlus ya usa pvp)
      car.auto.madeEU = "no"; car.auto.batteryEU="no"; car.auto.dealerBonus="yes";
      const res = computeMonthlyReal(car);
      const pass = (Number(res.pieces.netHelpTotal||0)===0) && (Number(res.pieces.irpfImpact||0) > 0);
      return { pass, detail: `netHelpTotal=${res.pieces.netHelpTotal} irpf=${res.pieces.irpfImpact}` };
    });

    const passed = results.filter(r=>r.pass).length;
    return { passed, total: results.length, results };
  }

  function initTestsPage(){
    if(!testsMount) return;
    const runAndRender = ()=>{
      const out = runSmokeTests();
      const rows = out.results.map(r=>{
        const cls = r.pass ? "good" : "bad";
        return `
          <div class="row ${cls}" style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
            <div style="font-weight:800">${esc(r.name)}</div>
            <div style="text-align:right">
              <div style="font-weight:900">${r.pass ? "OK" : "FAIL"}</div>
              <div class="smallmuted" style="font-size:12px;max-width:520px">${esc(r.detail||"")}</div>
            </div>
          </div>
        `;
      }).join("");

      testsMount.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div>
            <div class="section-title">Tests internos FairCar</div>
            <div class="smallmuted">Batería mínima para detectar roturas en cálculos clave (financiación, reventa, IVTM, etc.).</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
            <div class="pill">✅ ${out.passed}/${out.total}</div>
            <button class="btn" id="btnRunTests" type="button">Re-ejecutar</button>
            <a class="btn ghost" href="wizard.html">Ir al wizard</a>
          </div>
        </div>
        <div class="card" style="padding:12px;margin-top:12px">
          <div class="rows">${rows}</div>
        </div>
        <div class="hint" style="margin-top:10px">
          Si un test falla, revisa el último cambio en <code>assets/app.js</code> que afecte ese bloque.
        </div>
      `;
      const btn = document.getElementById("btnRunTests");
      if(btn) btn.onclick = runAndRender;
    };
    runAndRender();
  }

  // Export interno (debug/tests)
  try{
    const shouldExport = DEBUG || !!testsMount;
    if(shouldExport && typeof window!=="undefined"){
      window.FAIRCAR_ENGINE = {
        state,
        makeEmptyCar,
        normalizeTermMonths,
        financeMonthlyCost,
        energyMonthlyCost,
        insuranceMonthly,
        maintenanceMonthly,
        circulationTaxMonthly,
        residualEstimate,
        computeAutoPlus,
        computeMonthlyReal,
        calcCreditRealCost,
        decideWinnerFaircar
      };
      window.FAIRCAR_TESTS = { run: runSmokeTests };
      window.FAIRCAR_DEBUG = {
        enabled: DEBUG,
        enable: ()=>{ try{ localStorage.setItem(FC_DEBUG_LS,"1"); }catch(e){} },
        disable: ()=>{ try{ localStorage.removeItem(FC_DEBUG_LS); }catch(e){} }
      };
    }
  }catch(e){}
  // ===== /Tests =====


// ===== /FairCar Study =====


  if(location.hash==="#demo"){
    state.kmYear = 12000;
    state.cityPct = 85;
    state.chargeMode = "home";
    state.city = "Sevilla";
    state.climate = computeClimate(state.city);
    state.ageGroup = "26+";
    state.novice = "no";
    state.garage = "yes";
    state.includeResidual = "yes";
    state.termMonths = 60;

    state.carA.brand="Tesla"; state.carA.model="Model 3"; state.carA.fuel="ev"; state.carA.segment="berlina"; state.carA.powerKw=150;
    state.carA.pvpCash=37970; state.carA.downPayment=1500; state.carA.tin=0.99; state.carA.monthlyPayment=450;
    state.carA.openFeePct=0; state.carA.lifeInsMonthly=0; state.carA.insInPayment="no";
    state.carA.auto.base=2250; state.carA.auto.priceTier="35to45"; state.carA.auto.madeEU="no"; state.carA.auto.batteryEU="no"; state.carA.auto.dealerBonus="no"; state.carA.auto.incomeTier="mid";

    state.carB.brand="Volkswagen"; state.carB.model="Golf"; state.carB.fuel="gasoline"; state.carB.segment="utilitario"; state.carB.powerKw=85;
    state.carB.pvpCash=28900; state.carB.downPayment=1500; state.carB.tin=6.99; state.carB.monthlyPayment=430;
    state.carB.openFeePct=5; state.carB.lifeInsMonthly=0; state.carB.insInPayment="no";
  }


  if(testsMount){
    initTestsPage();
    return;
  }
  if(studyMount){
    initFaircarStudyPage();
    return;
  }
  if(mount){
    render();
  }
})();
