(function(){
  const DEFAULT_INTERVAL = 5000; // 5s
  const FADE = 600; // duración de cada fase del fundido en ms
  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cards = document.querySelectorAll('.rotator');

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const el = entry.target;
      if(entry.isIntersecting){
        start(el);
      }else{
        stop(el);
      }
    });
  }, {threshold: .2});

  cards.forEach(card=>{
    const imgs = getImages(card);
    const imgEl = card.querySelector('img');
    imgEl.src = imgs[0];
    imgEl.dataset.index = '0';

    // preload restantes
    imgs.slice(1).forEach(src=>{ const i = new Image(); i.src = src; });

    // hover pause (desktop)
    card.addEventListener('mouseenter', ()=> stop(card));
    card.addEventListener('mouseleave', ()=> start(card));

    io.observe(card);
  });

  function getImages(card){
    return card.dataset.images.split(',').map(s=>s.trim()).filter(Boolean);
  }

  function nextIndex(current, length){
    return (current + 1) % length;
  }

  async function fadeToBlack(card, nextSrc){
    const media = card.querySelector('.media');
    const base  = media.querySelector('img');
    if(card._busy) return;
    card._busy = true;

    const img = new Image();
    img.src = nextSrc;
    const ready = img.decode ? img.decode() : new Promise(res=>{
      img.onload = img.onerror = res;
    });
    await ready;

    base.style.opacity = '0';
    await new Promise(res=>setTimeout(res, FADE));
    base.src = nextSrc;
    base.style.opacity = '1';
    setTimeout(()=>{ card._busy = false; }, FADE);
  }

  function tick(card){
    if(card._busy) return;
    const imgs = getImages(card);
    const base = card.querySelector('img');
    const current = Number(base.dataset.index || '0');
    const next = nextIndex(current, imgs.length);
    const nextSrc = imgs[next];

    fadeToBlack(card, nextSrc);
    base.dataset.index = String(next);
  }

  function start(card){
    if(PREFERS_REDUCED) return;
    if(card._timer) return;
    const interval = Number(card.dataset.interval || DEFAULT_INTERVAL);
    card._timer = setInterval(()=>tick(card), interval);
  }

  function stop(card){
    if(card._timer){
      clearInterval(card._timer);
      card._timer = null;
    }
  }
})();

