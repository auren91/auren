(function(){
  const DEFAULT_INTERVAL = 3000; // 3s
  const FADE = 600; // duración del crossfade en ms

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

  function crossfadeTo(card, nextSrc){
    const media = card.querySelector('.media');
    const base  = media.querySelector('img');

    // capa fantasma
    const ghost = base.cloneNode();
    ghost.classList.add('fade-layer');
    ghost.src = nextSrc;
    ghost.style.opacity = '0';
    media.appendChild(ghost);

    // fuerza un reflow para que el transition arranque
    void ghost.offsetWidth;

    // anima
    ghost.style.opacity = '1';
    base.style.opacity = '0';

    // al terminar el fade, fijar nuevo src y limpiar
    setTimeout(()=>{
      base.src = nextSrc;
      base.style.opacity = '1';
      ghost.remove();
    }, FADE);
  }

  function tick(card){
    const imgs = getImages(card);
    const base = card.querySelector('img');
    const current = Number(base.dataset.index || '0');
    const next = nextIndex(current, imgs.length);
    const nextSrc = imgs[next];

    crossfadeTo(card, nextSrc);
    base.dataset.index = String(next);
  }

  function start(card){
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

