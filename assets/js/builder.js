// Constructor de Pulsera Italiana
// Merge resuelto: incluye slots editables y selector de color de pulsera
let charms = [];
const charmsPromise = fetch('./data/charms.json')
  .then(r => { if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
  .catch(err => {
    console.warn('No se pudo cargar catálogo de charms, usando fallback.', err);
    return [
      {id:'charm-01',name:'Charm 01',category:'Charms',tags:[],color:'Multicolor',material:'Esmalte',imgFront:'img/charms/charm-01.png',imgBack:'img/charms/charm-01.png',stock:12,badge:'Descuento',discountPercent:15,price:79,priceOriginal:93},
      {id:'charm-02',name:'Charm 02',category:'Charms',tags:[],color:'Multicolor',material:'Esmalte',imgFront:'img/charms/charm-02.png',imgBack:'img/charms/charm-02.png',stock:10,badge:'Descuento',discountPercent:20,price:70,priceOriginal:88}
    ];
  });

const baseCharms = {
  plata: {
    id: 'base-plata',
    name: 'Eslabón liso',
    price: 0,
    isBase: true,
    imgFront: 'img/pulsera-plata.webp',
    imgBack: 'img/pulsera-plata.webp'
  },
  dorado: {
    id: 'base-dorado',
    name: 'Eslabón liso',
    price: 0,
    isBase: true,
    imgFront: 'img/pulsera-dorado.webp',
    imgBack: 'img/pulsera-dorado.webp'
  },
  negro: {
    id: 'base-negro',
    name: 'Eslabón liso',
    price: 0,
    isBase: true,
    imgFront: 'img/pulsera-negro.webp',
    imgBack: 'img/pulsera-negro.webp'
  }
};

const baseById = {
  'base-plata': baseCharms.plata,
  'base-dorado': baseCharms.dorado,
  'base-negro': baseCharms.negro
};

function getCharm(id){
  return charms.find(c=>c.id===id) || baseById[id];
}

function isBase(id){
  return !!baseById[id];
}

function getBaseId(color){
  return baseCharms[color].id;
}

let braceletColor = localStorage.getItem('auren.braceletColor') || 'plata';
let braceletSize = 18;
let slots = Array(braceletSize).fill(getBaseId(braceletColor));
let undoStack = [];
let redoStack = [];

const MIN = 10, MAX = 24;
const slotCountEl = document.getElementById('slotCount');
const btnMinus = document.getElementById('slotMinus');
const btnPlus  = document.getElementById('slotPlus');
const slotHint = document.getElementById('slotHint');

function pushState(){
  undoStack.push(JSON.stringify({slots, color:braceletColor, slotCount:braceletSize}));
  if(undoStack.length>30) undoStack.shift();
  redoStack = [];
  updatePersist();
}

function saveState(){
  pushState();
}

function loadState(){
  try{
    return JSON.parse(localStorage.getItem('auren-bracelet')) || {};
  }catch(e){
    return {};
  }
}

function restoreState(state){
  const obj=JSON.parse(state);
  slots=obj.slots;
  braceletColor=obj.color || braceletColor;
  localStorage.setItem('auren.braceletColor',braceletColor);
  braceletSize=obj.slotCount || obj.size || braceletSize;
  const hero=document.getElementById('braceletHero');
  if(hero) hero.dataset.color=braceletColor;
  renderBracelet();
  updateTotals();
}

function refreshStepState(n){
  if(!btnMinus || !btnPlus) return;
  btnMinus.disabled = (n <= MIN);
  btnPlus.disabled  = (n >= MAX);
}

function showHint(msg){
  if(!slotHint) return;
  slotHint.textContent = msg;
  setTimeout(()=>{ if(slotHint.textContent===msg) slotHint.textContent=''; },2500);
}

function rebuildBraceletGrid(size){
  const base = getBaseId(braceletColor);
  braceletSize = size;
  if(slots.length > size){
    slots = slots.slice(0,size);
  }else{
    slots.length = size;
    for(let i=0;i<size;i++) if(!slots[i]) slots[i]=base;
  }
  renderBracelet();
  updateTotals();
}

function animateGridBounce(){
  const grid=document.getElementById('braceletView');
  if(grid){
    grid.classList.add('grid-bounce');
    setTimeout(()=>grid.classList.remove('grid-bounce'),300);
  }
}

function applySlotCount(n,{from='input'}={}){
  const clamped=Math.max(MIN,Math.min(MAX,Number(n)||18));
  const finalMsg=`Eslabones establecidos en ${clamped}`;
  slotCountEl.value=clamped;
  refreshStepState(clamped);
  rebuildBraceletGrid(clamped);
  if(from!=='init') saveState();
  if(typeof animateGridBounce==='function') animateGridBounce();
  if(clamped!==n){
    if(n<MIN) showHint(`El mínimo es ${MIN} eslabones ✨`);
    if(n>MAX) showHint(`El máximo es ${MAX} eslabones ✨`);
    setTimeout(()=>showHint(finalMsg),800);
  }else{
    showHint(finalMsg);
  }
}

if(slotCountEl){
  btnMinus.addEventListener('click',()=>applySlotCount(Number(slotCountEl.value)-1,{from:'minus'}));
  btnPlus.addEventListener('click',()=>applySlotCount(Number(slotCountEl.value)+1,{from:'plus'}));
  slotCountEl.addEventListener('change',()=>applySlotCount(Number(slotCountEl.value),{from:'change'}));
  slotCountEl.addEventListener('input',()=>refreshStepState(Number(slotCountEl.value)));
  slotCountEl.addEventListener('keydown',e=>{
    if(e.key==='ArrowUp'){e.preventDefault();btnPlus.click();}
    if(e.key==='ArrowDown'){e.preventDefault();btnMinus.click();}
    if(e.key==='PageUp'){e.preventDefault();applySlotCount(Number(slotCountEl.value)+2,{from:'pgup'});}
    if(e.key==='PageDown'){e.preventDefault();applySlotCount(Number(slotCountEl.value)-2,{from:'pgdn'});}
  });
}

function firstEmptySlot(){
  return slots.findIndex(id=>isBase(id));
}

function addCharm(id, index){
  const charm=getCharm(id);
  if(!charm || charm.stock<=0) return;
  if(index === undefined) index = firstEmptySlot();
  if(index === -1) return;
  slots[index] = id;
  pushState();
  renderSlot(index);
  updateTotals();
}

function removeCharm(index){
  slots[index] = getBaseId(braceletColor);
  pushState();
  renderSlot(index);
  updateTotals();
}

function swapSlots(a,b){
  [slots[a], slots[b]] = [slots[b], slots[a]];
  pushState();
  renderSlot(a);
  renderSlot(b);
  updateTotals();
}

function setBraceletColor(color){
  braceletColor=color;
  localStorage.setItem('auren.braceletColor',braceletColor);
  slots=slots.map(id=>isBase(id)?getBaseId(color):id);
  pushState();
  for(let i=0;i<braceletSize;i++) renderSlot(i);
  const hero=document.getElementById('braceletHero');
  if(hero) hero.dataset.color=braceletColor;
  updateTotals();
}

function renderFilters(){
  const tagSet = new Set();
  const colorSet = new Set();
  const materialSet = new Set();
  charms.forEach(c=>{c.tags.forEach(t=>tagSet.add(t)); colorSet.add(c.color); materialSet.add(c.material);});
  const tagContainer = document.getElementById('filter-tags');
  tagContainer.innerHTML='';
  tagSet.forEach(t=>{
    const btn=document.createElement('button');btn.textContent=t;btn.dataset.tag=t;btn.addEventListener('click',()=>{btn.classList.toggle('active');renderCatalog();});tagContainer.appendChild(btn);
  });
  const colorContainer=document.getElementById('filter-color');
  colorContainer.innerHTML='';
  colorSet.forEach(t=>{
    const btn=document.createElement('button');btn.textContent=t;btn.dataset.color=t;btn.addEventListener('click',()=>{btn.classList.toggle('active');renderCatalog();});colorContainer.appendChild(btn);
  });
  const materialContainer=document.getElementById('filter-material');
  materialContainer.innerHTML='';
  materialSet.forEach(t=>{
    const btn=document.createElement('button');btn.textContent=t;btn.dataset.material=t;btn.addEventListener('click',()=>{btn.classList.toggle('active');renderCatalog();});materialContainer.appendChild(btn);
  });
}

function getFilters(){
  const search = document.getElementById('search').value.toLowerCase();
  const tags=[...document.querySelectorAll('#filter-tags button.active')].map(b=>b.dataset.tag);
  const colors=[...document.querySelectorAll('#filter-color button.active')].map(b=>b.dataset.color);
  const materials=[...document.querySelectorAll('#filter-material button.active')].map(b=>b.dataset.material);
  const min=parseInt(document.getElementById('price-min').value,10);
  const max=parseInt(document.getElementById('price-max').value,10);
  const sort=document.getElementById('sort').value;
  return {search,tags,colors,materials,min,max,sort};
}

function renderCatalog(){
  const {search,tags,colors,materials,min,max,sort}=getFilters();
  let list = charms.filter(c=>
    c.name.toLowerCase().includes(search) &&
    c.price>=min && c.price<=max &&
    (tags.length?tags.some(t=>c.tags.includes(t)):true) &&
    (colors.length?colors.includes(c.color):true) &&
    (materials.length?materials.includes(c.material):true)
  );
  switch(sort){
    case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
    case 'new': list.sort((a,b)=>b.id.localeCompare(a.id)); break;
  }
  const catalog=document.getElementById('catalog');
  catalog.innerHTML='';
  list.forEach((c,i)=>{
    const out=c.stock<=0;
    const card=document.createElement('div');card.className='charm-card fade-in';card.dataset.id=c.id;
    card.tabIndex=0;
    card.setAttribute('aria-label',c.name);
    if(out) card.classList.add('out'); else card.draggable=true;
    card.style.animationDelay=`${i*50}ms`;
    const priceHTML=`<div class="price"><span class="price-old">$${c.priceOriginal}</span><span class="price-new">$${c.price}</span></div>`;
    card.innerHTML=`<img src="${c.imgFront}" alt="${c.name} frente" class="front" loading="lazy"><img src="${c.imgBack}" alt="${c.name} reverso" class="back" loading="lazy"><h4>${c.name}</h4>${priceHTML}${c.badge?`<span class=\"badge badge-descuento\">${c.badge}</span>`:''}${out?`<span class=\"badge agotado\">Agotado</span>`:''}<button class="add"${out?' disabled':''} aria-label="Agregar ${c.name}">Agregar</button>`;
    if(!out){
      card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',c.id);});
      const addBtn=card.querySelector('.add');
      addBtn.addEventListener('click',()=>addCharm(c.id));
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();addCharm(c.id);}});
    }
    catalog.appendChild(card);
  });
  catalog.classList.toggle('compact',document.getElementById('compact').checked);
}

function renderBracelet(){
  const container=document.getElementById('braceletView');
  container.innerHTML='';
  for(let i=0;i<braceletSize;i++) renderSlot(i);
}

function slotKeyHandler(e){
  const i=parseInt(e.currentTarget.dataset.index,10);
  if((e.key==='Delete' || e.key==='Backspace') && !isBase(slots[i])){ e.preventDefault(); removeCharm(i); }
  if(e.key==='ArrowLeft' && i>0){ e.preventDefault(); swapSlots(i,i-1); document.querySelector(`.slot[data-index="${i-1}"]`).focus(); }
  if(e.key==='ArrowRight' && i<braceletSize-1){ e.preventDefault(); swapSlots(i,i+1); document.querySelector(`.slot[data-index="${i+1}"]`).focus(); }
}

function renderSlot(i){
  const container=document.getElementById('braceletView');
  const existing=container.querySelector(`.slot[data-index="${i}"]`);
  const slot=document.createElement('div');
  slot.className='slot fade-in';
  slot.style.animationDelay=`${i*50}ms`;
  slot.dataset.index=i;
  slot.tabIndex=0;
  slot.textContent=String(i+1).padStart(2,'0');
  slot.setAttribute('aria-label',`Slot ${i+1}`);
  slot.addEventListener('dragover',e=>e.preventDefault());
  slot.addEventListener('drop',handleDrop);
  slot.addEventListener('keydown',slotKeyHandler);
  if(slots[i]){
    const charm=getCharm(slots[i]);
    if(charm){
      const color = charm.id.split('-')[1];
      if(charm.isBase){
        const colorName=color.charAt(0).toUpperCase()+color.slice(1);
        slot.classList.add('filled','base',charm.id);
        slot.title=`Eslabón liso (${colorName})`;
        slot.innerHTML=`<img src="${charm.imgFront}" alt="Eslabón liso (${colorName})" onerror="this.style.display='none';this.parentElement.classList.add('no-img');">`;
      }else{
        slot.classList.add('filled');
        slot.innerHTML=`<img src="${charm.imgFront}" alt="${charm.name}">`;
        const rm=document.createElement('button');
        rm.className='remove';
        rm.textContent='x';
        rm.setAttribute('aria-label','Quitar charm');
        rm.addEventListener('click',()=>removeCharm(i));
        slot.appendChild(rm);
        if(charm.stock<=0){
          slot.classList.add('out');
          const warn=document.createElement('span');warn.className='badge agotado';warn.textContent='Agotado';slot.appendChild(warn);
        }
        slot.draggable=true;
        slot.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/slot',i);});
        let startX=null;
        slot.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;});
        slot.addEventListener('touchend',e=>{
          if(startX===null) return;
          const dx=e.changedTouches[0].clientX-startX;
          if(Math.abs(dx)>30){
            if(dx<0 && i<braceletSize-1) swapSlots(i,i+1);
            else if(dx>0 && i>0) swapSlots(i,i-1);
          }
          startX=null;
        });
      }
    }
  }
  if(existing) container.replaceChild(slot, existing); else container.appendChild(slot);
}

function triggerSnap(index){
  const el=document.querySelector(`.slot[data-index="${index}"]`);
  if(el){
    el.classList.add('snap');
    setTimeout(()=>el.classList.remove('snap'),200);
  }
}

function handleDrop(e){
  e.preventDefault();
  const targetIndex=parseInt(e.currentTarget.dataset.index,10);
  const fromSlot=e.dataTransfer.getData('text/slot');
  const charmId=e.dataTransfer.getData('text/plain');
  if(fromSlot){
    const from=parseInt(fromSlot,10);
    if(!isBase(slots[targetIndex]) && !e.shiftKey){
      swapSlots(from,targetIndex);
      triggerSnap(targetIndex);
    }else{
      slots[targetIndex]=slots[from];
      slots[from]=getBaseId(braceletColor);
      pushState();
      renderSlot(targetIndex);
      renderSlot(from);
      updateTotals();
      triggerSnap(targetIndex);
    }
  }else if(charmId){
    const charm=getCharm(charmId);
    if(!charm || charm.stock<=0) return;
    if(!isBase(slots[targetIndex]) && !e.shiftKey){
      const temp=slots[targetIndex];
      slots[targetIndex]=charmId;
      const empty=firstEmptySlot();
      if(empty!==-1) slots[empty]=temp;
      renderSlot(targetIndex);
      if(empty!==-1) renderSlot(empty);
    }else{
      slots[targetIndex]=charmId;
      renderSlot(targetIndex);
    }
    pushState();
    updateTotals();
    triggerSnap(targetIndex);
  }
}

function updateTotals(){
  const charmIds=slots.filter(id=>!isBase(id));
  const baseCount=slots.filter(id=>isBase(id)).length;
  const total=charmIds.reduce((s,id)=>s+(getCharm(id)?.price||0),0);
  const colorName=braceletColor.charAt(0).toUpperCase()+braceletColor.slice(1);
  document.getElementById('bracelet-total').textContent=`Total: $${total}`;
  document.getElementById('bracelet-status').textContent=`Eslabones: ${braceletSize} | Color: ${colorName} | Eslabones lisos: ${baseCount}`;
  const promo=document.getElementById('bracelet-promo');
  if(promo){promo.textContent=total>=400?'Pulsera gratis':'';}
}

function saveLocal(){
  const filters={...getFilters(),compact:document.getElementById('compact').checked};
  localStorage.setItem('auren-bracelet',JSON.stringify({slotCount:braceletSize,color:braceletColor,slots,filters}));
  localStorage.setItem('auren.braceletColor',braceletColor);
}

function applyFilters(filters={}){
  document.getElementById('search').value=filters.search||'';
  document.getElementById('price-min').value=filters.min||document.getElementById('price-min').min;
  document.getElementById('price-max').value=filters.max||document.getElementById('price-max').max;
  document.getElementById('sort').value=filters.sort||'relevance';
  document.getElementById('compact').checked=filters.compact||false;
  document.querySelectorAll('#filter-tags button').forEach(b=>b.classList.toggle('active',filters.tags?.includes(b.dataset.tag)));
  document.querySelectorAll('#filter-color button').forEach(b=>b.classList.toggle('active',filters.colors?.includes(b.dataset.color)));
  document.querySelectorAll('#filter-material button').forEach(b=>b.classList.toggle('active',filters.materials?.includes(b.dataset.material)));
}

function loadLocal(){
  const data=localStorage.getItem('auren-bracelet');
  if(data){
    const obj=JSON.parse(data);
    braceletSize=obj.slotCount || obj.size || braceletSize;
    braceletColor=obj.color || braceletColor;
    localStorage.setItem('auren.braceletColor',braceletColor);
    slots=obj.slots || [];
    applyFilters(obj.filters||{});
    updatePriceDisplay();
    renderCatalog();
  }
  slots.length=braceletSize;
  for(let i=0;i<braceletSize;i++){
    const id=slots[i];
    if(!id || !getCharm(id) || isBase(id)) slots[i]=getBaseId(braceletColor);
  }
  if(slotCountEl) slotCountEl.value=braceletSize;
  const hero=document.getElementById('braceletHero');
  if(hero) hero.dataset.color=braceletColor;
  renderBracelet();
  updateTotals();
}

function encodeDesign(){
  return btoa(JSON.stringify({size:braceletSize,color:braceletColor,slots}));
}

function decodeDesign(str){
  try {
    const obj=JSON.parse(atob(str));
    obj.color=obj.color||'plata';
    const arr=obj.slots||[];
    arr.length=obj.size;
    obj.slots=arr.map(id=>id&&getCharm(id)?id:getBaseId(obj.color));
    return obj;
  } catch(e){ return null; }
}

function updatePersist(){
  const url=new URL(location);
  url.searchParams.set('design',encodeDesign());
  history.replaceState(null,'',url);
  saveLocal();
}

function sendWhatsApp(){
  const colorName=braceletColor.charAt(0).toUpperCase()+braceletColor.slice(1);
  const lines=slots.map((id,i)=>{
    const c=getCharm(id);
    if(!c || c.isBase) return null;
    return `${String(i+1).padStart(2,'0')}) [${c.id}] ${c.name} – $${c.price}${c.badge==='Descuento'?' (Descuento)':''}`;
  }).filter(Boolean).join('%0A');
  const total=slots.filter(id=>!isBase(id)).reduce((s,id)=>s+(getCharm(id)?.price||0),0);
  const baseCount=slots.filter(id=>isBase(id)).length;
  const promo=total>=400? '%0APromo aplicada: Pulsera gratis':'';
  const msg=`Hola Auren, quiero esta pulsera italiana:%0AEslabones: ${braceletSize}%0AColor de pulsera: ${colorName}%0A${lines}${lines?'%0A':''}Eslabones lisos: ${baseCount}%0ASubtotal charms: $${total}${promo}%0ATotal a pagar: $${total}%0A¿Opciones de pago, por favor?`;
  window.open(`https://wa.me/523142836428?text=${msg}`,'_blank');
}

// Descargar imagen del diseño
async function downloadMock(){
  if(slots.every(id=>isBase(id))){
    alert('No hay charms en tu diseño');
    return;
  }
  const cell=80;
  const margin=10;
  const canvas=document.createElement('canvas');
  canvas.width=braceletSize*cell + margin*2;
  canvas.height=cell + margin*2;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const images=await Promise.all(slots.map(id=>{
    const c=getCharm(id);
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=reject;
      img.src=c.imgFront;
    });
  }));

  images.forEach((img,i)=>{
    const x=margin + i*cell;
    ctx.drawImage(img,x,margin,cell,cell);
  });

  const link=document.createElement('a');
  link.href=canvas.toDataURL('image/png');
  link.download='pulsera-mock.png';
  link.click();
}

// Undo/redo
function undo(){
  if(undoStack.length){
    const state=undoStack.pop();
    redoStack.push(JSON.stringify({slots, color:braceletColor, slotCount:braceletSize}));
    restoreState(state);
  }
}
function redo(){
  if(redoStack.length){
    const state=redoStack.pop();
    undoStack.push(JSON.stringify({slots, color:braceletColor, slotCount:braceletSize}));
    restoreState(state);
  }
}

// Event bindings
window.addEventListener('DOMContentLoaded',async()=>{
  charms = await charmsPromise;
  charms.forEach(c=>{const img=new Image();img.src=c.imgFront;});
  renderFilters();
  renderCatalog();
  const params=new URLSearchParams(location.search);
  const colorParam=params.get('color');
  if(colorParam){braceletColor=colorParam;}
  const qs=params.get('design');
  if(qs){
    const obj=decodeDesign(qs);
    if(obj){braceletSize=obj.slotCount || obj.size;braceletColor=colorParam || obj.color || braceletColor;slots=obj.slots;}
  } else {
    const saved=loadState();
    if(saved.slotCount){
      braceletSize=saved.slotCount;
      slots=saved.slots || [];
      if(!colorParam && !localStorage.getItem('auren.braceletColor') && saved.color) braceletColor=saved.color;
      applyFilters(saved.filters||{});
      updatePriceDisplay();
      renderCatalog();
    }
    slots.length=braceletSize;
    for(let i=0;i<braceletSize;i++){
      const id=slots[i];
      if(!id || !getCharm(id) || isBase(id)) slots[i]=getBaseId(braceletColor);
    }
  }
  slots=slots.map(id=>isBase(id)?getBaseId(braceletColor):id);
  localStorage.setItem('auren.braceletColor',braceletColor);
  if(slotCountEl) slotCountEl.value=braceletSize;
  const hero=document.getElementById('braceletHero');
  if(hero) hero.dataset.color=braceletColor;
  applySlotCount(Number(slotCountEl.value),{from:'init'});
  document.getElementById('search').addEventListener('input',renderCatalog);
  document.getElementById('price-min').addEventListener('input',()=>{updatePriceDisplay();renderCatalog();});
  document.getElementById('price-max').addEventListener('input',()=>{updatePriceDisplay();renderCatalog();});
  document.getElementById('sort').addEventListener('change',renderCatalog);
  document.getElementById('compact').addEventListener('change',renderCatalog);
  document.getElementById('undo').addEventListener('click',undo);
  document.getElementById('redo').addEventListener('click',redo);
  document.getElementById('clear').addEventListener('click',()=>{if(confirm('¿Vaciar pulsera?')){slots=Array(braceletSize).fill(getBaseId(braceletColor));pushState();renderBracelet();updateTotals();}});
  document.getElementById('save').addEventListener('click',saveLocal);
  document.getElementById('load').addEventListener('click',loadLocal);
  document.getElementById('exportPng').addEventListener('click',downloadMock);
  document.getElementById('whatsappBtn').addEventListener('click',sendWhatsApp);
  const filterToggle=document.getElementById('filter-toggle');
  const filters=document.querySelector('.filters');
  const overlay=document.getElementById('filter-overlay');
  if(filterToggle){
    filterToggle.addEventListener('click',()=>{
      filters.classList.toggle('open');
      overlay.classList.toggle('open');
    });
  }
  if(overlay){
    overlay.addEventListener('click',()=>{
      filters.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
});

function updatePriceDisplay(){
  const min=document.getElementById('price-min').value;
  const max=document.getElementById('price-max').value;
  document.getElementById('price-display').textContent=`$${min} - $${max}`;
}
updatePriceDisplay();
