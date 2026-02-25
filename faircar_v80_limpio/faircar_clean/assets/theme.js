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

    // Actualizar todos los botones toggle que haya en la página
    document.querySelectorAll('#fcThemeToggle').forEach(function(btn){
      btn.textContent = (theme === 'day') ? '🌙' : '☀️';
    });

    // Actualizar logo
    var logoSrc = (theme === 'day')
      ? 'assets/brand/faircar_logo-day.png'
      : 'assets/brand/faircar_logo-night.png';
    document.querySelectorAll('img[data-brand-logo], img.brand-logo-img').forEach(function(img){
      img.src = logoSrc;
    });
  }

  // Exponer globalmente para que el onclick del botón lo pueda llamar
  window.fcToggleTheme = function(){
    applyTheme(window._fcTheme === 'day' ? 'night' : 'day');
  };

  window.FairCarTheme = { apply: applyTheme };

  function init(){
    var saved;
    try{ saved = localStorage.getItem('FC_THEME'); }catch(e){ saved = null; }
    if(!saved){
      try{
        saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
      }catch(e){ saved = 'night'; }
    }
    applyTheme(saved);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
