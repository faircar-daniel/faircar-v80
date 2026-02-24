FairCar (static demo)
=====================

Contenido:
- index.html (landing)
- wizard.html (flujo / análisis)
- admin.html (admin catálogo: marcas/modelos/versiones)
- _headers (protección Basic Auth para admin.html)
- assets/styles.css
- assets/app.js
- assets/carDatabase-v3.js
- assets/carDatabase-patch.js
- assets/dbPatchRuntime.js (aplica el patch persistente + local)
- assets/modelImages.js
- assets/brandModels_es.js

Deploy (Netlify):
- Arrastra la carpeta (o el ZIP) en Netlify -> "Deploy site"
- Publish directory: (raíz) /  (no hay build)

Admin catálogo (protegido):
- URL: /admin.html
- Protección: Basic Auth via _headers
- Credenciales por defecto (CAMBIA ESTO):
  usuario: admin
  clave: CAMBIA-ESTA-CLAVE

Patch del catálogo:
- Cambios rápidos (sin redeploy): se guardan en localStorage.
- Para hacerlo permanente en Netlify:
  1) En /admin.html -> "Exportar patch (JSON)"
  2) Guarda el fichero como: assets/faircar_db_patch.json
  3) Súbelo al proyecto y redeploy.
