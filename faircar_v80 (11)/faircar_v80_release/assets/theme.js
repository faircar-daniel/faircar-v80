/* FairCar theme switcher (night/day/ocean) */
(function(){
  function updateActive(theme){
    var dots = document.querySelectorAll('.theme-dot');
    if(!dots || !dots.length) return;
    dots.forEach(function(btn){
      var t = btn.getAttribute('data-theme-pick');
      var active = (t === theme);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function updateLogo(theme){
    var map = {
      night: { src: "assets/brand/faircar_logo-night.png", src2x: "assets/brand/faircar_logo-night@2x.png" },
      day: { src: "assets/brand/faircar_logo-day.png", src2x: "assets/brand/faircar_logo-day@2x.png" },
      ocean: { src: "assets/brand/faircar_logo-ocean.png", src2x: "assets/brand/faircar_logo-ocean@2x.png" }
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
    if(theme === 'night'){
      root.removeAttribute('data-theme');
    }else{
      root.setAttribute('data-theme', theme);
    }
    try{ localStorage.setItem('FC_THEME', theme); }catch(e){}
    updateActive(theme);
    updateLogo(theme);
  }

  function initTheme(){
    var saved = 'night';
    try{ saved = localStorage.getItem('FC_THEME') || 'night'; }catch(e){}
    applyTheme(saved);

    document.addEventListener('click', function(e){
      var btn = e.target && e.target.closest ? e.target.closest('[data-theme-pick]') : null;
      if(!btn) return;
      var t = btn.getAttribute('data-theme-pick') || 'night';
      applyTheme(t);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initTheme);
  }else{
    initTheme();
  }

  window.FairCarTheme = { applyTheme: applyTheme };
})();
