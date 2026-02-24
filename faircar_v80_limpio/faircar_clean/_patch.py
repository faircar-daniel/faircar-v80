import re
from pathlib import Path
p = Path('/mnt/data/_v42/assets/app.js')
txt = p.read_text(encoding='utf-8')

# 1) Remove old profile banner in stepSavedCarsGate (above grid)
txt, n1 = re.subn(r"\n\s*if\(state\.profileWasAutoApplied\)\{[\s\S]*?step\.appendChild\(row\);\n\s*\}\n\n\n", "\n\n", txt)

# 2) Insert new inline profile banner between 'Sí' and 'Analizar nuevo'
insert = """

    // Aviso de perfil: debajo de \"Sí\" (sin pantalla extra)
    if(state.profileWasAutoApplied){
      const inline = document.createElement(\"div\");
      inline.style.gridColumn = \"1 / -1\";
      inline.style.marginTop = \"-6px\";
      inline.style.marginBottom = \"6px\";

      const msg = document.createElement(\"div\");
      msg.className = \"smallmuted\";
      msg.style.marginTop = \"0\";
      msg.style.marginBottom = \"6px\";
      msg.textContent = \"Tu perfil lo hemos cargado automáticamente. Si quieres, puedes cambiarlo.\";

      const row = document.createElement(\"div\");
      row.className = \"nav\";
      row.style.justifyContent = \"flex-start\";
      row.style.marginTop = \"0\";
      row.style.marginBottom = \"0\";

      const btn = document.createElement(\"button\");
      btn.type = \"button\";
      btn.className = \"btn ghost\";
      btn.textContent = \"Cambiar perfil\";
      btn.addEventListener(\"click\", ()=>{
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
"""

needle = r"\n\n\s*grid\.appendChild\(cardChoice\(\n\s*\"Analizar nuevo\"," 
# Use a more direct replace
m = re.search(r"\n\n(\s*)grid\.appendChild\(cardChoice\(\n\s*\"Analizar nuevo\"," , txt)
if not m:
    raise SystemExit('Could not find insertion point for Analizar nuevo card')
ins_pos = m.start()
txt = txt[:ins_pos] + insert + txt[ins_pos:]

# 3) Ensure all button labels say only 'Cambiar perfil'
txt = txt.replace('Cambiar perfil y continuar', 'Cambiar perfil')

p.write_text(txt, encoding='utf-8')
print('patched', n1)
