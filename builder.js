// Constructor de Pulsera Italiana
const charms = charmsCatalog;

const baseCharms = {
  plata: {
    id: 'base-plata',
    name: 'Eslabón liso',
    price: 0,
    isBase: true,
    imgFront: '/img/pulsera/link-plata.png',
    imgBack: '/img/pulsera/link-plata.png'
  },
  dorado: {
    id: 'base-dorado',
    name: 'Eslabón liso',
    price: 0,
    isBase: true,
    imgFront: '/img/pulsera/link-dorado.png',
    imgBack: '/img/pulsera/link-dorado.png'
  },
  negro: {
    id: 'base-negro',
    name: 'Eslabón liso',
    price: 0,
    isBase: true,
    imgFront: '/img/pulsera/link-negro.png',
    imgBack: '/img/pulsera/link-negro.png'
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

let braceletColor = 'plata';
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
  braceletSize=obj.slotCount || obj.size || braceletSize;
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
  const grid=document.getElementById('bracelet');
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
  renderBracelet();
  updateTotals();
}

function removeCharm(index){
  slots[index] = getBaseId(braceletColor);
  pushState();
  renderBracelet();
  updateTotals();
}

function swapSlots(a,b){
  [slots[a], slots[b]] = [slots[b], slots[a]];
  pushState();
  renderBracelet();
  updateTotals();
}

function setBraceletColor(color){
  braceletColor=color;
  slots=slots.map(id=>isBase(id)?getBaseId(color):id);
  pushState();
  renderBracelet();
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
    if(out) card.classList.add('out'); else card.draggable=true;
    card.style.animationDelay=`${i*50}ms`;
    const priceHTML=`<div class="price"><span class="price-old">$${c.priceOriginal}</span><span class="price-new">$${c.price}</span></div>`;
    card.innerHTML=`<img src="${c.imgFront}" alt="${c.name} frente" class="front"><img src="${c.imgBack}" alt="${c.name} reverso" class="back"><h4>${c.name}</h4>${priceHTML}${c.badge?`<span class="badge badge-descuento">${c.badge}</span>`:''}${out?`<span class="badge agotado">Agotado</span>`:''}<button class="add"${out?' disabled':''}>Agregar</button>`;
    if(!out){
      card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',c.id);});
      card.querySelector('.add').addEventListener('click',()=>addCharm(c.id));
    }
    catalog.appendChild(card);
  });
  catalog.classList.toggle('compact',document.getElementById('compact').checked);
}

function renderBracelet(){
  const container=document.getElementById('bracelet');
  container.innerHTML='';
  for(let i=0;i<braceletSize;i++){
    const slot=document.createElement('div');
    slot.className='slot fade-in';
    slot.style.animationDelay=`${i*50}ms`;
    slot.dataset.index=i;
    slot.textContent=String(i+1).padStart(2,'0');
    slot.addEventListener('dragover',e=>e.preventDefault());
    slot.addEventListener('drop',handleDrop);
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
          const rm=document.createElement('button');rm.className='remove';rm.textContent='x';rm.addEventListener('click',()=>removeCharm(i));slot.appendChild(rm);
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
    container.appendChild(slot);
  }
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
      renderBracelet();
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
    }else{
      slots[targetIndex]=charmId;
    }
    pushState();
    renderBracelet();
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
  if(promo){promo.textContent=total>=400?'Pulsera incluida GRATIS':'';}
}

function saveLocal(){
  localStorage.setItem('auren-bracelet',JSON.stringify({slotCount:braceletSize,color:braceletColor,slots}));
}

function loadLocal(){
  const data=localStorage.getItem('auren-bracelet');
  if(data){
    const obj=JSON.parse(data);
    braceletSize=obj.slotCount || obj.size || braceletSize;
    braceletColor=obj.color || braceletColor;
    slots=obj.slots || [];
  }
  slots.length=braceletSize;
  for(let i=0;i<braceletSize;i++){
    const id=slots[i];
    if(!id || !getCharm(id) || isBase(id)) slots[i]=getBaseId(braceletColor);
  }
  if(slotCountEl) slotCountEl.value=braceletSize;
  const colorRadio=document.querySelector(`input[name="braceletColor"][value="${braceletColor}"]`);
  if(colorRadio) colorRadio.checked=true;
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
    return `${String(i+1).padStart(2,'0')}) [${c.id}] ${c.name} – $${c.price}`;
  }).filter(Boolean).join('%0A');
  const total=slots.filter(id=>!isBase(id)).reduce((s,id)=>s+(getCharm(id)?.price||0),0);
  const baseCount=slots.filter(id=>isBase(id)).length;
  const promo=total>=400? '%0APromo aplicada: pulsera GRATIS':'';
  const msg=`Hola Auren, quiero esta pulsera italiana:%0AEslabones: ${braceletSize} | Color: ${colorName}%0A${lines}${lines?'%0A':''}Eslabones lisos: ${baseCount}%0ASubtotal charms: $${total}${promo}%0ATotal a pagar: $${total}%0A¿Opciones de pago, por favor?`;
  window.open(`https://wa.me/523142836428?text=${msg}`,'_blank');
}

// Descargar imagen del diseño
async function downloadMock(){
  const filled=slots.filter(id=>!isBase(id));
  if(!filled.length){
    alert('No hay charms en tu diseño');
    return;
  }
  const cell=100;
  const cols=6;
  const rows=Math.ceil(filled.length/cols);
  const canvas=document.createElement('canvas');
  canvas.width=cols*cell;
  canvas.height=rows*cell;
  const ctx=canvas.getContext('2d');

  const images=await Promise.all(filled.map(id=>{
    const c=getCharm(id);
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=reject;
      img.src=c.imgFront;
    });
  }));

  images.forEach((img,i)=>{
    const x=(i%cols)*cell;
    const y=Math.floor(i/cols)*cell;
    ctx.drawImage(img,x,y,cell,cell);
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
window.addEventListener('DOMContentLoaded',()=>{
  renderFilters();
  renderCatalog();
  const qs=new URLSearchParams(location.search).get('design');
  if(qs){
    const obj=decodeDesign(qs);
    if(obj){braceletSize=obj.slotCount || obj.size;braceletColor=obj.color;slots=obj.slots;}
  } else {
    const saved=loadState();
    if(saved.slotCount){
      braceletSize=saved.slotCount;
      braceletColor=saved.color || braceletColor;
      slots=saved.slots || [];
    }
    slots.length=braceletSize;
    for(let i=0;i<braceletSize;i++){
      const id=slots[i];
      if(!id || !getCharm(id) || isBase(id)) slots[i]=getBaseId(braceletColor);
    }
  }
  if(slotCountEl) slotCountEl.value=braceletSize;
  const colorRadio=document.querySelector(`input[name="braceletColor"][value="${braceletColor}"]`);
  if(colorRadio) colorRadio.checked=true;
  applySlotCount(Number(slotCountEl.value),{from:'init'});
  document.getElementById('search').addEventListener('input',renderCatalog);
  document.getElementById('price-min').addEventListener('input',()=>{updatePriceDisplay();renderCatalog();});
  document.getElementById('price-max').addEventListener('input',()=>{updatePriceDisplay();renderCatalog();});
  document.getElementById('sort').addEventListener('change',renderCatalog);
  document.getElementById('compact').addEventListener('change',renderCatalog);
  document.querySelectorAll('input[name="braceletColor"]').forEach(r=>r.addEventListener('change',e=>setBraceletColor(e.target.value)));
  document.getElementById('undo').addEventListener('click',undo);
  document.getElementById('redo').addEventListener('click',redo);
  document.getElementById('clear').addEventListener('click',()=>{if(confirm('¿Vaciar pulsera?')){slots=Array(braceletSize).fill(getBaseId(braceletColor));pushState();renderBracelet();updateTotals();}});
  document.getElementById('save').addEventListener('click',saveLocal);
  document.getElementById('load').addEventListener('click',loadLocal);
  document.getElementById('download').addEventListener('click',downloadMock);
  document.getElementById('whatsapp').addEventListener('click',sendWhatsApp);
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
