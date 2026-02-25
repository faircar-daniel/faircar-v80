/* FairCar theme switcher — night/day */
(function(){

  function applyTheme(theme){
    var root = document.documentElement;
    if(theme === 'day'){
      root.setAttribute('data-theme', 'day');
    } else {
      root.removeAttribute('data-theme');
    }
    try{ localStorage.setItem('FC_THEME', theme); }catch(e){}
    window._fcTheme = theme;

    // Actualizar botón: en noche mostramos ☀️ (pulsa para ir a día), en día mostramos 🌙
    var btn = document.getElementById('fcThemeToggle');
    if(btn) btn.textContent = (theme === 'day') ? '🌙' : '☀️';

    // Actualizar logo
    var logoSrc = (theme === 'day')
      ? 'assets/brand/faircar_logo-day.png'
      : 'assets/brand/faircar_logo-night.png';
    document.querySelectorAll('img[data-brand-logo], img.brand-logo-img').forEach(function(img){
      img.src = logoSrc;
    });
  }

  function init(){
    // Leer preferencia guardada, si no hay usar sistema
    var saved;
    try{ saved = localStorage.getItem('FC_THEME'); }catch(e){ saved = null; }
    if(!saved){
      try{
        saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
      }catch(e){ saved = 'night'; }
    }
    applyTheme(saved);

    // Click en el toggle
    document.addEventListener('click', function(e){
      var btn = e.target && e.target.closest ? e.target.closest('#fcThemeToggle') : null;
      if(!btn) return;
      applyTheme(window._fcTheme === 'day' ? 'night' : 'day');
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.FairCarTheme = { apply: applyTheme };
})();
