/* ============================================================
   FairCar — DB Patch Runtime (v1)

   Objetivo:
   - Mantener carDatabase-v3.js intacta.
   - Permitir añadir/borrar (borrado lógico) marcas/modelos/versiones
     desde admin.html.
   - Persistencia en 2 capas:
       1) assets/faircar_db_patch.json (persistente en Netlify)
       2) localStorage (cambios rápidos del admin sin redeploy)

   Importante:
   - Se carga DESPUÉS de carDatabase-v3.js y carDatabase-patch.js
     y ANTES de app.js.
   - Usa XHR síncrono para evitar carreras (app.js se ejecuta después).
 ============================================================ */

(function(){
  const LS_KEY = "faircar_db_patch_v1";

  function safeParseJSON(text){
    try { return JSON.parse(text); } catch(e){ return null; }
  }

  function loadJsonSync(url){
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, false); // sync
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return safeParseJSON(xhr.responseText);
      return null;
    } catch(e){
      return null;
    }
  }

  function getLocalPatch(){
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? safeParseJSON(raw) : null;
    } catch(e){
      return null;
    }
  }

  function mergePatches(basePatch, overridePatch){
    // overridePatch gana. No hacemos deep-merge perfecto; lo suficiente para upsert/disable.
    const out = {
      upsert: {},
      disable: { brands: [], models: {}, versions: {} }
    };
    const a = basePatch || out;
    const b = overridePatch || null;

    // upsert: merge shallow por marca/modelo; versiones se upsert por nombre al aplicar.
    out.upsert = Object.assign({}, a.upsert || {});
    if (b && b.upsert){
      for (const brand of Object.keys(b.upsert)){
        out.upsert[brand] = Object.assign({}, out.upsert[brand] || {}, b.upsert[brand] || {});
        // models
        if (b.upsert[brand] && b.upsert[brand].models){
          out.upsert[brand].models = Object.assign({}, (out.upsert[brand].models||{}), b.upsert[brand].models);
        }
      }
    }

    // disable: concatenar arrays y merge maps
    const addUnique = (arr, items)=>{
      const s = new Set(arr);
      (items||[]).forEach(x=>s.add(x));
      return Array.from(s);
    };
    out.disable.brands = addUnique((a.disable && a.disable.brands) || [], (b && b.disable && b.disable.brands) || []);

    const mergeMapList = (mapA, mapB)=>{
      const outMap = Object.assign({}, mapA||{});
      for (const k of Object.keys(mapB||{})){
        outMap[k] = addUnique(outMap[k]||[], mapB[k]||[]);
      }
      return outMap;
    };
    out.disable.models = mergeMapList((a.disable&&a.disable.models)||{}, (b&&b.disable&&b.disable.models)||{});

    // versions: {Brand:{Model:[names]}}
    const vOut = Object.assign({}, (a.disable&&a.disable.versions)||{});
    const vB = (b&&b.disable&&b.disable.versions)||{};
    for (const brand of Object.keys(vB)){
      vOut[brand] = Object.assign({}, vOut[brand]||{});
      for (const model of Object.keys(vB[brand]||{})){
        vOut[brand][model] = addUnique(vOut[brand][model]||[], vB[brand][model]||[]);
      }
    }
    out.disable.versions = vOut;

    return out;
  }

  function upsertVersion(targetModel, v){
    if (!targetModel.versions) targetModel.versions = [];
    const name = (v && v.name) ? String(v.name) : "";
    if (!name) return;
    const idx = targetModel.versions.findIndex(x => String(x.name) === name);
    if (idx >= 0){
      targetModel.versions[idx] = Object.assign({}, targetModel.versions[idx], v);
    } else {
      targetModel.versions.push(v);
    }
  }

  function applyPatch(db, patch){
    if (!db || typeof db !== "object" || !patch) return;

    // Disable brands
    const disBrands = (patch.disable && patch.disable.brands) || [];
    disBrands.forEach(brand => { if (db[brand]) delete db[brand]; });

    // Disable models
    const disModels = (patch.disable && patch.disable.models) || {};
    for (const brand of Object.keys(disModels)){
      if (!db[brand] || !db[brand].models) continue;
      disModels[brand].forEach(model => { if (db[brand].models[model]) delete db[brand].models[model]; });
    }

    // Disable versions
    const disVersions = (patch.disable && patch.disable.versions) || {};
    for (const brand of Object.keys(disVersions)){
      if (!db[brand] || !db[brand].models) continue;
      for (const model of Object.keys(disVersions[brand]||{})){
        const m = db[brand].models[model];
        if (!m || !Array.isArray(m.versions)) continue;
        const toRemove = new Set(disVersions[brand][model]||[]);
        m.versions = m.versions.filter(v => !toRemove.has(String(v.name)));
      }
    }

    // Upsert brands/models/versions
    const up = patch.upsert || {};
    for (const brand of Object.keys(up)){
      const b = up[brand] || {};
      if (!db[brand]) db[brand] = { brand_info:{}, models:{} };
      if (b.brand_info) db[brand].brand_info = Object.assign({}, db[brand].brand_info||{}, b.brand_info);
      if (!db[brand].models) db[brand].models = {};

      const models = (b.models || {});
      for (const model of Object.keys(models)){
        const mPatch = models[model] || {};
        if (!db[brand].models[model]) db[brand].models[model] = { versions: [] };

        // Merge model base fields (segment, maintenance_yearly, etc.)
        const tgt = db[brand].models[model];
        const { versions, ...rest } = mPatch;
        Object.assign(tgt, rest);

        // Upsert versions by name
        (versions || []).forEach(v => upsertVersion(tgt, v));
      }
    }
  }

  // Expose for admin page
  window.FAIRCAR_DB_PATCH = {
    LS_KEY,
    loadJsonSync,
    getLocalPatch,
    mergePatches,
    applyPatch,
  };

  // Apply runtime patch immediately
  const filePatch = loadJsonSync("assets/faircar_db_patch.json");
  const localPatch = getLocalPatch();
  const merged = mergePatches(filePatch, localPatch);
  try {
    if (window.CAR_DB) applyPatch(window.CAR_DB, merged);
  } catch(e){
    // swallow
  }
})();
