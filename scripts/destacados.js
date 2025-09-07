(function(){
  const INTERVAL = 2000; // 2s
  const cards = document.querySelectorAll('.rotator');

  // Solo iniciar si está en viewport (mejor rendimiento)
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
    // Primer frame
    const imgs = getImages(card);
    const imgEl = card.querySelector('img');
    imgEl.src = imgs[0];
    imgEl.dataset.index = '0';

    // Pausa en hover (en desktop)
    card.addEventListener('mouseenter', ()=> stop(card));
    card.addEventListener('mouseleave', ()=> start(card));

    // Observar visibilidad
    io.observe(card);
  });

  function getImages(card){
    return card.dataset.images.split(',').map(s=>s.trim()).filter(Boolean);
  }

  function tick(card){
    const imgs = getImages(card);
    const imgEl = card.querySelector('img');
    const idx = (Number(imgEl.dataset.index||'0') + 1) % imgs.length;
    imgEl.src = imgs[idx];
    imgEl.dataset.index = String(idx);
  }

  function start(card){
    if(card._timer) return;
    card._timer = setInterval(()=>tick(card), INTERVAL);
  }

  function stop(card){
    if(card._timer){ clearInterval(card._timer); card._timer = null; }
  }
})();
