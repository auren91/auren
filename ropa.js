const PAGE_SIZE = 24;
let items = [];
let filtered = [];
let page = 0;

const favKey = 'auren.favs';

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
  article.innerHTML=`<div class="media" data-src="${it.img}">
    <img src="${it.img}" alt="${it.name}" loading="lazy" decoding="async">
    <div class="lens" aria-hidden="true"></div>
    <button class="fav" aria-label="Añadir a favoritos">${isFav(it.id)?'♥':'♡'}</button>
  </div>
  <div class="info"><h3 class="name">${it.name}</h3>
    <div class="price"><s>$${it.priceOriginal}</s><strong>$${it.price}</strong> <span class="badge">Descuento</span></div>
  </div>`;
  const media = article.querySelector('.media');
  const lens = article.querySelector('.lens');
  media.addEventListener('mousemove',e=>{
    const rect = media.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lens.style.left = `${x-80}px`;
    lens.style.top = `${y-80}px`;
    lens.style.backgroundImage = `url(${it.img})`;
    lens.style.backgroundPosition = `${(x/rect.width)*100}% ${(y/rect.height)*100}%`;
  });
  media.addEventListener('mouseleave',()=>{lens.style.backgroundImage='';});
  media.addEventListener('click',()=>openModal(it));
  article.querySelector('.fav').addEventListener('click',e=>{e.stopPropagation();toggleFav(it.id);e.target.textContent=isFav(it.id)?'♥':'♡';});
  return article;
}

function loadNextPage(){
  const slice = filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const grid = document.getElementById('grid');
  slice.forEach(it=>grid.appendChild(createCard(it)));
  page++;
  if(page*PAGE_SIZE >= filtered.length) observer.unobserve(sentinel);
}

function openModal(it){
  const backdrop = document.getElementById('quick-view');
  const box = backdrop.querySelector('.modal-content');
  box.innerHTML = `<div class="media"><img src="${it.img}" alt="${it.name}"></div>
    <h3>${it.name}</h3>
    <div class="price"><s>$${it.priceOriginal}</s><strong>$${it.price}</strong></div>
    <button id="fav-modal">${isFav(it.id)?'Quitar de favoritos':'Añadir a favoritos'}</button>
    <a id="wa-share" href="https://wa.me/?text=${encodeURIComponent(it.name+' $'+it.price+' '+location.href)}" target="_blank">Compartir WhatsApp</a>`;
  backdrop.classList.remove('hidden');
  document.getElementById('fav-modal').addEventListener('click',()=>{toggleFav(it.id);applyFilters();closeModal();});
}
function closeModal(){
  document.getElementById('quick-view').classList.add('hidden');
}

document.querySelector('#quick-view .close').addEventListener('click',closeModal);
document.getElementById('quick-view').addEventListener('click',e=>{if(e.target.id==='quick-view')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

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
