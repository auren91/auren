// Constructor de Pulsera Italiana
// Data de ejemplo de charms
const charms = [];
for (let i = 1; i <= 30; i++) {
  charms.push({
    id: `id-${String(i).padStart(3,'0')}`,
    name: `Charm ${i}`,
    price: 100 + i * 5,
    tags: i % 2 ? ['amor'] : ['amistad'],
    imgFront: `img/charms/charm-${String(i).padStart(2,'0')}.jpg`,
    imgBack: `img/charms/charm-${String(i).padStart(2,'0')}b.jpg`,
    color: ['rosa','azul','dorado'][i%3],
    material: ['acero','oro','plata'][i%3],
    stock: 10,
    badge: i % 10 === 0 ? '-20%' : i % 5 === 0 ? 'Nuevo' : i % 7 === 0 ? 'Top' : ''
  });
}

let braceletSize = 18;
let slots = Array(braceletSize).fill(null);
let undoStack = [];
let redoStack = [];

function pushState(){
  undoStack.push(JSON.stringify(slots));
  if(undoStack.length>30) undoStack.shift();
  redoStack = [];
  updatePersist();
}

function restoreState(state){
  slots = JSON.parse(state);
  renderBracelet();
  updateTotals();
}

function firstEmptySlot(){
  return slots.indexOf(null);
}

function addCharm(id, index){
  if(index === undefined) index = firstEmptySlot();
  if(index === -1) return;
  slots[index] = id;
  pushState();
  renderBracelet();
  updateTotals();
}

function removeCharm(index){
  slots[index] = null;
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

function setBraceletSize(size){
  braceletSize = size;
  slots.length = size;
  for(let i=0;i<size;i++) if(slots[i]===undefined) slots[i]=null;
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
    const card=document.createElement('div');card.className='charm-card fade-in';card.draggable=true;card.dataset.id=c.id;
    card.style.animationDelay=`${i*50}ms`;
    card.innerHTML=`<img src="${c.imgFront}" alt="${c.name} frente" class="front"><img src="${c.imgBack}" alt="${c.name} reverso" class="back"><h4>${c.name}</h4><p class="price">$${c.price}</p>${c.badge?`<span class="badge">${c.badge}</span>`:''}<button class="add">Agregar</button>`;
    card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',c.id);});
    card.querySelector('.add').addEventListener('click',()=>addCharm(c.id));
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
      const charm=charms.find(c=>c.id===slots[i]);
      slot.classList.add('filled');
      slot.innerHTML=`<img src="${charm.imgFront}" alt="${charm.name}">`;
      const rm=document.createElement('button');rm.className='remove';rm.textContent='x';rm.addEventListener('click',()=>removeCharm(i));slot.appendChild(rm);
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
    if(slots[targetIndex] && !e.shiftKey){
      swapSlots(from,targetIndex);
      triggerSnap(targetIndex);
    }else{
      slots[targetIndex]=slots[from];
      slots[from]=null;
      pushState();
      renderBracelet();
      updateTotals();
      triggerSnap(targetIndex);
    }
  }else if(charmId){
    if(slots[targetIndex] && !e.shiftKey){
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
  const filled=slots.filter(Boolean);
  const total=filled.reduce((s,id)=>s+(charms.find(c=>c.id===id)?.price||0),0);
  document.getElementById('bracelet-total').textContent=`Total: $${total}`;
  document.getElementById('bracelet-status').textContent=`${filled.length}/${braceletSize} completos`;
}

function saveLocal(){
  localStorage.setItem('auren-bracelet',JSON.stringify({size:braceletSize,slots}));
}

function loadLocal(){
  const data=localStorage.getItem('auren-bracelet');
  if(data){
    const obj=JSON.parse(data);
    braceletSize=obj.size;slots=obj.slots;
    renderBracelet();
    updateTotals();
  }
}

function encodeDesign(){
  return btoa(JSON.stringify({size:braceletSize,slots}));
}

function decodeDesign(str){
  try { return JSON.parse(atob(str)); } catch(e){ return null; }
}

function updatePersist(){
  const url=new URL(location);
  url.searchParams.set('design',encodeDesign());
  history.replaceState(null,'',url);
  saveLocal();
}

function sendWhatsApp(){
  const filled=slots.map((id,i)=>{ if(!id) return null; const c=charms.find(ch=>ch.id===id); return `${String(i+1).padStart(2,'0')}) [${c.id}] ${c.name} – $${c.price}`;}).filter(Boolean).join('%0A');
  const total=slots.filter(Boolean).reduce((s,id)=>s+(charms.find(c=>c.id===id)?.price||0),0);
  const msg=`Hola Auren, quiero esta pulsera italiana:%0AEslabones: ${braceletSize}%0A${filled}%0ATotal: $${total}%0A¿La pueden armar y enviarme opciones de pago, por favor? ❤️`;
  window.open(`https://wa.me/523142836428?text=${msg}`,'_blank');
}

// Undo/redo
function undo(){
  if(undoStack.length){
    const state=undoStack.pop();
    redoStack.push(JSON.stringify(slots));
    restoreState(state);
  }
}
function redo(){
  if(redoStack.length){
    const state=redoStack.pop();
    undoStack.push(JSON.stringify(slots));
    restoreState(state);
  }
}

// Event bindings
window.addEventListener('DOMContentLoaded',()=>{
  renderFilters();
  renderCatalog();
  renderBracelet();
  updateTotals();
  document.getElementById('search').addEventListener('input',renderCatalog);
  document.getElementById('price-min').addEventListener('input',()=>{updatePriceDisplay();renderCatalog();});
  document.getElementById('price-max').addEventListener('input',()=>{updatePriceDisplay();renderCatalog();});
  document.getElementById('sort').addEventListener('change',renderCatalog);
  document.getElementById('compact').addEventListener('change',renderCatalog);
  document.getElementById('size').addEventListener('change',e=>setBraceletSize(parseInt(e.target.value,10)));
  document.getElementById('undo').addEventListener('click',undo);
  document.getElementById('redo').addEventListener('click',redo);
  document.getElementById('clear').addEventListener('click',()=>{if(confirm('¿Vaciar pulsera?')){slots=Array(braceletSize).fill(null);pushState();renderBracelet();updateTotals();}});
  document.getElementById('save').addEventListener('click',saveLocal);
  document.getElementById('load').addEventListener('click',loadLocal);
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
  const qs=new URLSearchParams(location.search).get('design');
  if(qs){const obj=decodeDesign(qs);if(obj){braceletSize=obj.size;slots=obj.slots;}}
  else { loadLocal(); }
  renderBracelet();
  updateTotals();
});

function updatePriceDisplay(){
  const min=document.getElementById('price-min').value;
  const max=document.getElementById('price-max').value;
  document.getElementById('price-display').textContent=`$${min} - $${max}`;
}
updatePriceDisplay();
