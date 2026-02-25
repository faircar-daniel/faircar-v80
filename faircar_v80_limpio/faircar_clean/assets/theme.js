/* FairCar theme switcher — night/day con auto-detección del sistema */
(function(){
  function updateToggle(theme){
    var btn = document.getElementById('fcThemeToggle');
    if(!btn) return;
    btn.textContent = theme === 'day' ? '🌙' : '☀️';
    btn.setAttribute('aria-label', theme === 'day' ? 'Cambiar a modo noche' : 'Cambiar a modo día');
    btn.setAttribute('title', theme === 'day' ? 'Modo noche' : 'Modo día');
  }

  function updateLogo(theme){
    var map = {
      night: { src: "assets/brand/faircar_logo-night.png", src2x: "assets/brand/faircar_logo-night@2x.png" },
      day:   { src: "assets/brand/faircar_logo-day.png",   src2x: "assets/brand/faircar_logo-day@2x.png" }
    };
    var cfg = map[theme] || map.night;
    var imgs = document.querySelectorAll('img[data-brand-logo], img.brand-logo-img');
    if(!imgs || !imgs.length) return;
    imgs.forEach(function(img){
      img.setAttribute('src', cfg.src);
      img.setAttribute('srcset', cfg.src + ' 1x, ' + cfg.src2x + ' 2x');
    });
  }

  function applyTheme(theme){
    var root = document.documentElement;
    if(theme === 'day'){
      root.setAttribute('data-theme', 'day');
    } else {
      root.removeAttribute('data-theme');
    }
    try{ localStorage.setItem('FC_THEME', theme); }catch(e){}
    updateToggle(theme);
    updateLogo(theme);
    window._fcCurrentTheme = theme;
  }

  function toggleTheme(){
    var current = window._fcCurrentTheme || 'night';
    applyTheme(current === 'night' ? 'day' : 'night');
  }

  function initTheme(){
    // 1. Preferencia guardada del usuario
    var saved = null;
    try{ saved = localStorage.getItem('FC_THEME'); }catch(e){}

    // 2. Si no hay preferencia, detectar el sistema operativo
    if(!saved){
      try{
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        saved = prefersDark ? 'night' : 'day';
      }catch(e){ saved = 'night'; }
    }

    applyTheme(saved);

    // Escuchar cambios del sistema si el usuario no ha elegido manualmente
    try{
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
        var manual = null;
        try{ manual = localStorage.getItem('FC_THEME'); }catch(err){}
        // Solo auto-cambiar si el usuario no ha tocado el toggle manualmente
        if(!manual){
          applyTheme(e.matches ? 'night' : 'day');
        }
      });
    }catch(e){}

    // Botón toggle
    document.addEventListener('click', function(e){
      var btn = e.target && e.target.closest ? e.target.closest('#fcThemeToggle') : null;
      if(!btn) return;
      // Marcar que el usuario ha elegido manualmente
      toggleTheme();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initTheme);
  }else{
    initTheme();
  }

  window.FairCarTheme = { applyTheme: applyTheme, toggle: toggleTheme };
})();
