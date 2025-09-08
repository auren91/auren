const PAGE_SIZE = 24;
let items = [];
let filtered = [];
let page = 0;

const favKey = 'auren.favs';

/* Detecta touch para fallback */
const isTouch = matchMedia('(pointer: coarse)').matches;

function normalize(str){
  return str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9\s]/g,'');
}

function levenshtein(a,b){
  const m = [];
  for(let i=0;i<=b.length;i++){m[i]=[i];}
  for(let j=0;j<=a.length;j++){m[0][j]=j;}
  for(let i=1;i<=b.length;i++){
    for(let j=1;j<=a.length;j++){
      m[i][j] = b[i-1]===a[j-1]? m[i-1][j-1]:1+Math.min(m[i-1][j],m[i][j-1],m[i-1][j-1]);
    }
  }
  return m[b.length][a.length];
}

function loadData(){
  const cache = localStorage.getItem('auren.ropa.v1');
  if(cache){
    try{items = JSON.parse(cache); return Promise.resolve();}catch{}
  }
  return fetch('data/ropa.json').then(r=>r.json()).then(data=>{items=data;localStorage.setItem('auren.ropa.v1',JSON.stringify(data));});
}

function isFav(id){
  const favs = JSON.parse(localStorage.getItem(favKey)||'[]');
  return favs.includes(id);
}
function toggleFav(id){
  let favs = JSON.parse(localStorage.getItem(favKey)||'[]');
  if(favs.includes(id)) favs = favs.filter(f=>f!==id); else favs.push(id);
  localStorage.setItem(favKey, JSON.stringify(favs));
}

/* LENS en tarjetas */
function initCardLens(){
  document.querySelectorAll('.card .media').forEach(media=>{
    if(media.dataset.lensReady) return;
    media.dataset.lensReady = 'true';
    if(isTouch){ media.classList.add('is-touch'); return; }

    let lens = media.querySelector('.lens');
    if(!lens){
      lens = document.createElement('div');
      lens.className = 'lens';
      media.appendChild(lens);
    }
    const img = media.querySelector('img');
    const src = img.currentSrc || img.src;
    lens.style.backgroundImage = `url("${src}")`;

    const move = (e)=>{
      const rect = media.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const px = Math.max(0, Math.min(1, x));
      const py = Math.max(0, Math.min(1, y));
      const bx = px * 100;
      const by = py * 100;
      lens.style.left = `${px * (rect.width - lens.offsetWidth)}px`;
      lens.style.top  = `${py * (rect.height - lens.offsetHeight)}px`;
      lens.style.backgroundPosition = `${bx}% ${by}%`;
    };

    media.addEventListener('mousemove', move);
    media.addEventListener('mouseleave', ()=>{});
  });
}

/* QUICK-VIEW: zoom + pan dentro del modal */
function initQuickViewZoom(){
  const dlg = document.querySelector('.qv');
  if(!dlg || dlg.dataset.zoomReady) return;
  dlg.dataset.zoomReady = 'true';
  const img = dlg.querySelector('.qv__img');
  const wrap = dlg.querySelector('.qv__imageWrap');

  let scale = 1, originX = 0, originY = 0, isPanning = false, startX=0, startY=0, tx=0, ty=0;

  const apply = ()=>{
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    img.style.transformOrigin = `${originX}% ${originY}%`;
  };

  dlg.resetZoom = ()=>{ scale=1; tx=ty=0; originX=0; originY=0; apply(); };

  // Controles
  dlg.querySelector('.qv__zoomIn')?.addEventListener('click', ()=>{ scale = Math.min(3, scale + .25); apply(); });
  dlg.querySelector('.qv__zoomOut')?.addEventListener('click', ()=>{ scale = Math.max(1, scale - .25); if(scale===1){tx=ty=0;} apply(); });
  dlg.querySelector('.qv__zoomReset')?.addEventListener('click', ()=>{ scale = 1; tx = ty = 0; apply(); });

  // Doble click para centrar zoom
  img.addEventListener('dblclick', (e)=>{
    const rect = img.getBoundingClientRect();
    originX = ((e.clientX - rect.left) / rect.width) * 100;
    originY = ((e.clientY - rect.top)  / rect.height) * 100;
    scale = (scale === 1) ? 2 : 1;
    if(scale === 1){ tx = ty = 0; }
    apply();
  });

  // Pan (arrastre) cuando scale>1
  img.addEventListener('mousedown', (e)=>{
    if(scale === 1) return;
    isPanning = true; img.style.cursor='grabbing';
    startX = e.clientX - tx; startY = e.clientY - ty;
  });
  window.addEventListener('mouseup', ()=>{ isPanning=false; img.style.cursor='grab'; });
  window.addEventListener('mousemove', (e)=>{
    if(!isPanning) return;
    tx = e.clientX - startX;
    ty = e.clientY - startY;
    apply();
  });

  // Pinch-zoom (básico) en táctiles
  let touchDist = 0;
  wrap.addEventListener('touchstart', (e)=>{
    if(e.touches.length===2){
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDist = Math.hypot(dx,dy);
    }
  }, {passive:true});
  wrap.addEventListener('touchmove', (e)=>{
    if(e.touches.length===2){
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d  = Math.hypot(dx,dy);
      const delta = (d - touchDist)/200; // sensibilidad
      scale = Math.max(1, Math.min(3, scale + delta));
      touchDist = d;
      apply();
    }
  }, {passive:true});
}

/* Al abrir/cerrar Modal, asegura tamaños y overflow */
function openQuickView(it){
  const dlg = document.querySelector('.qv');
  if(!dlg) return;
  const img = dlg.querySelector('.qv__img');
  img.src = it.img;
  img.alt = it.name;
  dlg.querySelector('#qv-title').textContent = it.name;
  const price = dlg.querySelector('.qv__price');
  price.querySelector('s').textContent = `$${it.priceOriginal}`;
  price.querySelector('strong').textContent = `$${it.price}`;
  const actions = dlg.querySelector('.qv__actions');
  actions.innerHTML = `<button class="fav-modal">${isFav(it.id)?'Quitar de favoritos':'Añadir a favoritos'}</button>
    <a href="https://wa.me/?text=${encodeURIComponent(it.name+' $'+it.price+' '+location.href)}" target="_blank">Compartir WhatsApp</a>`;
  actions.querySelector('.fav-modal').addEventListener('click',()=>{toggleFav(it.id);applyFilters();closeQuickView();});

  document.body.style.overflow = 'hidden';
  dlg.classList.add('is-open');
  dlg.resetZoom?.();
}
function closeQuickView(){
  document.querySelector('.qv')?.classList.remove('is-open');
  document.body.style.overflow = '';
}

window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;

document.addEventListener('DOMContentLoaded', ()=>{
  initCardLens();
  initQuickViewZoom();
});

function applyFilters(){
  const q = normalize(document.getElementById('search').value.trim());
  const colors = Array.from(document.querySelectorAll('input[name="color"]:checked')).map(el=>el.value);
  const min = parseInt(document.getElementById('price-min').value,10);
  const max = parseInt(document.getElementById('price-max').value,10);
  filtered = items.filter(it=>{
    if(it.price < min || it.price > max) return false;
    if(colors.length && !colors.includes(it.dominant)) return false;
    if(q){
      const text = normalize(it.name + ' ' + it.id + ' ' + it.tags.join(' '));
      if(text.includes(q)) {it._score = 0; return true;}
      const dist = levenshtein(q, text.slice(0,q.length));
      if(dist<=2){it._score=dist; return true;}
      return false;
    }
    it._score = 0;
    return true;
  });
  sortItems();
  page=0;
  document.getElementById('grid').innerHTML='';
  loadNextPage();
}

function sortItems(){
  const mode = document.getElementById('sort').value;
  filtered.sort((a,b)=>{
    if(mode==='price-asc') return a.price-b.price;
    if(mode==='price-desc') return b.price-a.price;
    if(mode==='new') return new Date(b.createdAt)-new Date(a.createdAt);
    return a._score-b._score; // relevance
  });
}

function createCard(it){
  const article = document.createElement('article');
  article.className='card';
  article.innerHTML=`<div class="media">
    <img src="${it.img}" alt="${it.name}" loading="lazy" decoding="async">
    <button class="fav" aria-label="Añadir a favoritos">${isFav(it.id)?'♥':'♡'}</button>
  </div>
  <div class="info"><h3 class="name">${it.name}</h3>
    <div class="price"><s>$${it.priceOriginal}</s><strong>$${it.price}</strong> <span class="badge">Descuento</span></div>
  </div>`;
  const media = article.querySelector('.media');
  media.addEventListener('click',()=>openQuickView(it));
  article.querySelector('.fav').addEventListener('click',e=>{e.stopPropagation();toggleFav(it.id);e.target.textContent=isFav(it.id)?'♥':'♡';});
  return article;
}

function loadNextPage(){
  const slice = filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const grid = document.getElementById('grid');
  slice.forEach(it=>grid.appendChild(createCard(it)));
  initCardLens();
  page++;
  if(page*PAGE_SIZE >= filtered.length) observer.unobserve(sentinel);
}

document.addEventListener('keydown',e=>{if(e.key==='Escape') closeQuickView();});

const sentinel = document.getElementById('sentinel');
const observer = new IntersectionObserver(entries=>{
  if(entries.some(e=>e.isIntersecting)) loadNextPage();
});
observer.observe(sentinel);

document.getElementById('search').addEventListener('input',debounce(applyFilters,300));
Array.from(document.querySelectorAll('input[name="color"]')).forEach(el=>el.addEventListener('change',applyFilters));
document.getElementById('price-min').addEventListener('input',()=>{if(+priceMin.value>+priceMax.value) priceMax.value=priceMin.value; applyFilters();});
document.getElementById('price-max').addEventListener('input',()=>{if(+priceMax.value<+priceMin.value) priceMin.value=priceMax.value; applyFilters();});
document.getElementById('sort').addEventListener('change',()=>{sortItems();page=0;document.getElementById('grid').innerHTML='';loadNextPage();});
document.getElementById('compact').addEventListener('change',e=>{
  document.getElementById('grid').classList.toggle('compact',e.target.checked);
});

function debounce(fn,ms){let t;return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms);};}

loadData().then(()=>{applyFilters();});
