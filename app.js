let charmsCatalog=[];
const otherProducts=[
  {id:'camisa-rosa',name:'Camisa Rosa',category:'ropa',price:520,tags:['camisa'],badge:'',images:['img/ropa/ropa-01.jpg','img/ropa/ropa-02.jpg'],rating:4,available:true},
  {id:'sueter-dorado',name:'Suéter Dorado',category:'ropa',price:650,tags:['sueter','top'],badge:'Top',images:['img/ropa/ropa-03.jpg','img/ropa/ropa-04.jpg'],rating:5,available:true},
  {id:'vestido-rojo',name:'Vestido Rojo',category:'ropa',price:780,tags:['vestido','nuevo'],badge:'Nuevo',images:['img/ropa/ropa-05.jpg','img/ropa/ropa-06.jpg'],rating:4,available:false},
  {id:'collar-corazon',name:'Collar de Corazón',category:'joyeria',price:1200,tags:['collar','amor'],badge:'',images:['img/joyeria/joya-01.jpg','img/joyeria/joya-02.jpg'],rating:5,available:true},
  {id:'anillo-minimal',name:'Anillo Minimalista',category:'joyeria',price:800,tags:['anillo'],badge:'',images:['img/joyeria/joya-03.jpg','img/joyeria/joya-04.jpg'],rating:4,available:true},
  {id:'pulsera-charms',name:'Pulsera con Charms',category:'joyeria',price:900,tags:['pulsera','top'],badge:'Top',images:['img/joyeria/joya-05.jpg','img/joyeria/joya-06.jpg'],rating:4,available:true}
];

let products=[];
let braceletColor = localStorage.getItem('auren.braceletColor') || 'plata';

async function loadCharmsCatalog(){
  try{
    const res=await fetch('data/charms.json');
    if(!res.ok) throw new Error('HTTP '+res.status);
    charmsCatalog=await res.json();
  }catch(err){
    console.warn('No se pudo cargar catálogo de charms, usando fallback.',err);
    charmsCatalog=[
      {id:'charm-01',name:'Charm 01',category:'Charms',tags:[],color:'Multicolor',material:'Esmalte',imgFront:'img/charms/charm-01.png',imgBack:'img/charms/charm-01.png',stock:12,badge:'Descuento',discountPercent:15,price:79,priceOriginal:93},
      {id:'charm-02',name:'Charm 02',category:'Charms',tags:[],color:'Multicolor',material:'Esmalte',imgFront:'img/charms/charm-02.png',imgBack:'img/charms/charm-02.png',stock:10,badge:'Descuento',discountPercent:20,price:70,priceOriginal:88},
      {id:'charm-03',name:'Charm 03',category:'Charms',tags:[],color:'Multicolor',material:'Esmalte',imgFront:'img/charms/charm-03.png',imgBack:'img/charms/charm-03.png',stock:8,badge:'Descuento',discountPercent:25,price:65,priceOriginal:87}
    ];
  }
  products=[...charmsCatalog,...otherProducts];
}

document.addEventListener('DOMContentLoaded',async()=>{
  await loadCharmsCatalog();
  initMenu();
  initSliders();
  initPromoBar();
  const bodyCategory=document.body.dataset.category;
  if(bodyCategory) initCatalog(bodyCategory);
  if(document.getElementById('product-detail')) initProductPage();
});

function initMenu(){
  const hamburger=document.querySelector('.hamburger');
  const nav=document.querySelector('.nav-links');
  if(hamburger&&nav){
    hamburger.addEventListener('click',()=>nav.classList.toggle('open'));
  }
}

function initSliders(){
  document.querySelectorAll('.slider').forEach(slider=>{
    const track=slider.querySelector('.slider-track');
    const prev=slider.querySelector('.prev');
    const next=slider.querySelector('.next');
    if(prev&&track){
      prev.addEventListener('click',()=>track.scrollBy({left:-track.clientWidth,behavior:'smooth'}));
    }
    if(next&&track){
      next.addEventListener('click',()=>track.scrollBy({left:track.clientWidth,behavior:'smooth'}));
    }
  });
}

function initPromoBar(){
  const bar=document.getElementById('promoBar');
  if(!bar) return;
  const close=bar.querySelector('.promo-bar__close');
  let timer;

  function show(){
    bar.classList.remove('promo-bar--hidden');
    bar.classList.add('promo-bar--entering');
    const height=bar.offsetHeight;
    document.body.style.setProperty('--promo-bar-height',height+'px');
    document.body.classList.add('promo-bar-visible');
    requestAnimationFrame(()=>{
      bar.classList.replace('promo-bar--entering','promo-bar--visible');
    });
    timer=setTimeout(hide,20000);
  }

  function hide(){
    clearTimeout(timer);
    if(!bar.classList.contains('promo-bar--visible')) return;
    bar.classList.replace('promo-bar--visible','promo-bar--hiding');
    bar.addEventListener('transitionend',handleEnd);
  }

  function handleEnd(e){
    if(e.propertyName!=='opacity') return;
    bar.classList.remove('promo-bar--hiding');
    bar.classList.add('promo-bar--hidden');
    document.body.classList.remove('promo-bar-visible');
    bar.removeEventListener('transitionend',handleEnd);
  }

  if(close){
    close.addEventListener('click',hide);
    close.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        hide();
      }
    });
  }

  show();
}

function initCatalog(category){
  const grid=document.getElementById('product-grid');
  const search=document.getElementById('search');
  const sort=document.getElementById('sort');
  const price=document.getElementById('price');
  const priceValue=document.getElementById('price-value');
  const available=document.getElementById('available');
    const tagChips=document.querySelectorAll('#tag-filter .chip');
    const count=document.getElementById('count');
    const viewButtons=document.querySelectorAll('.view [data-view]');
    const quickView=document.getElementById('quick-view');
    const colorField=document.querySelector('.bracelet-color');
    if(colorField){
      const radios=colorField.querySelectorAll('input[name="braceletColor"]');
      const saved=localStorage.getItem('auren.braceletColor');
      braceletColor=saved||braceletColor;
      const active=colorField.querySelector(`input[value="${braceletColor}"]`);
      if(active) active.checked=true;
      radios.forEach(r=>r.addEventListener('change',e=>{
        braceletColor=e.target.value;
        localStorage.setItem('auren.braceletColor',braceletColor);
        document.querySelectorAll('.bracelet-preview').forEach(div=>div.dataset.color=braceletColor);
      }));
    }

  const params=new URLSearchParams(location.search);
  const state={
    q:params.get('q')||'',
    sort:params.get('sort')||'',
    max:parseInt(params.get('max')||price.value),
    tags:params.get('tags')?params.get('tags').split(','):[],
    available:params.get('stock')==='1',
    view:parseInt(params.get('view')||3)
  };
  search.value=state.q;
  price.value=state.max;
  priceValue.textContent=state.max;
  if(state.available) available.checked=true;
  tagChips.forEach(ch=>{if(state.tags.includes(ch.dataset.tag)) ch.classList.add('active');});
  viewButtons.forEach(btn=>{if(parseInt(btn.dataset.view)===state.view) btn.classList.add('active');});

  function updateQuery(){
    const p=new URLSearchParams();
    if(state.q) p.set('q',state.q);
    if(state.sort) p.set('sort',state.sort);
    if(state.max) p.set('max',state.max);
    if(state.tags.length) p.set('tags',state.tags.join(','));
    if(state.available) p.set('stock','1');
    if(state.view!==3) p.set('view',state.view);
    history.replaceState(null,'','?'+p.toString());
  }

  function render(){
    let items=category==='charms'?[...charmsCatalog]:otherProducts.filter(p=>p.category===category);
    if(state.q) items=items.filter(p=>p.name.toLowerCase().includes(state.q.toLowerCase()));
    if(state.tags.length) items=items.filter(p=>state.tags.every(t=>p.tags.includes(t)));
    if(state.available) items=items.filter(p=>p.available);
    items=items.filter(p=>p.price<=state.max);
    switch(state.sort){
      case 'price-asc': items.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': items.sort((a,b)=>b.price-a.price); break;
      case 'new': items.sort((a,b)=>b.tags.includes('nuevo')-a.tags.includes('nuevo')); break;
      case 'top': items.sort((a,b)=>b.tags.includes('top')-a.tags.includes('top')); break;
    }
    grid.className=state.view===4?'grid-4':'grid-3';
    grid.innerHTML='';
    items.forEach(p=>{
      const card=document.createElement('div');
      card.className='card glass';
      const imgFront=p.imgFront||(p.images?p.images[0]:'');
      const imgBack=p.imgBack||(p.images?p.images[1]:'');
      const priceHTML=p.priceOriginal?`<div class="price"><span class="price-old">$${p.priceOriginal}</span><span class="price-new">$${p.price}</span></div>`:`<div class="price"><span class="price-new">$${p.price}</span></div>`;
      if(category==='charms'){
        card.innerHTML=`<div class="bracelet-preview" data-color="${braceletColor}"><img class="charm-img" src="${imgFront}" alt="${p.name}"></div>`+
          (p.badge?`<span class="badge ${p.badge==='Descuento'?'badge-descuento':''}">${p.badge}</span>`:'')+
          `<div class="card-body"><h3>${p.name}</h3>${priceHTML}`+
          `<div class="rating" aria-label="${p.rating} estrellas">${'★'.repeat(p.rating)}${'☆'.repeat(5-p.rating)}</div>`+
          `<div class="actions"><a href="producto.html?id=${p.id}&color=${braceletColor}" class="btn">Ver detalles</a>`+
          `<a href="https://wa.me/523142836428?text=${encodeURIComponent('Hola Auren, me interesa: '+p.name+' a $'+p.price+' (precio con descuento).')}" target="_blank" class="btn whatsapp">WhatsApp</a></div>`+
          `<button class="sr-only quick" data-id="${p.id}">Vista rápida</button></div>`;
      }else{
        card.innerHTML=`<div class="img-wrapper"><img src="${imgFront}" alt="${p.name} frontal" class="front"><img src="${imgBack}" alt="${p.name} reverso" class="back"></div>`+
          (p.badge?`<span class="badge ${p.badge==='Descuento'?'badge-descuento':''}">${p.badge}</span>`:'')+
          `<div class="card-body"><h3>${p.name}</h3>${priceHTML}`+
          `<div class="rating" aria-label="${p.rating} estrellas">${'★'.repeat(p.rating)}${'☆'.repeat(5-p.rating)}</div>`+
          `<div class="actions"><a href="producto.html?id=${p.id}" class="btn">Ver detalles</a>`+
          `<a href="https://wa.me/523142836428?text=${encodeURIComponent('Hola Auren, me interesa: '+p.name+' a $'+p.price+' (precio con descuento).')}" target="_blank" class="btn whatsapp">WhatsApp</a></div>`+
          `<button class="sr-only quick" data-id="${p.id}">Vista rápida</button></div>`;
      }
      grid.appendChild(card);
    });
    count.textContent=items.length;
    updateQuery();
  }

  search.addEventListener('input',()=>{state.q=search.value;render();});
  sort.addEventListener('change',()=>{state.sort=sort.value;render();});
  price.addEventListener('input',()=>{state.max=parseInt(price.value);priceValue.textContent=price.value;render();});
  available.addEventListener('change',()=>{state.available=available.checked;render();});
  tagChips.forEach(ch=>ch.addEventListener('click',()=>{
    ch.classList.toggle('active');
    if(ch.classList.contains('active')) state.tags.push(ch.dataset.tag);
    else state.tags=state.tags.filter(t=>t!==ch.dataset.tag);
    render();
  }));
  viewButtons.forEach(btn=>btn.addEventListener('click',()=>{
    viewButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.view=parseInt(btn.dataset.view);
    render();
  }));

  grid.addEventListener('click',e=>{
    const btn=e.target.closest('.quick');
    if(btn){
      const p=products.find(pr=>pr.id===btn.dataset.id);
      if(p){
        const imgFront=p.imgFront||(p.images?p.images[0]:'');
        const priceHTML=p.priceOriginal?`<div class="price"><span class="price-old">$${p.priceOriginal}</span><span class="price-new">$${p.price}</span></div>`:`<div class="price"><span class="price-new">$${p.price}</span></div>`;
        quickView.innerHTML=`<form method="dialog"><div class="card"><div class="img-wrapper"><img src="${imgFront}" alt="${p.name}"></div><h3>${p.name}</h3>${priceHTML}<a class="btn whatsapp" href="https://wa.me/523142836428?text=${encodeURIComponent('Hola Auren, me interesa: '+p.name+' a $'+p.price+' (precio con descuento).')}" target="_blank">WhatsApp</a><button class="btn">Cerrar</button></div></form>`;
        quickView.showModal();
      }
    }
  });

  render();
}

function initProductPage(){
  const params=new URLSearchParams(location.search);
  const id=params.get('id');
  const color=params.get('color');
  if(color) localStorage.setItem('auren.braceletColor',color);
  const product=products.find(p=>p.id===id);
  if(!product) return;
  const mainImg=document.getElementById('main-image');
  const thumbs=document.getElementById('thumbs');
  const title=document.getElementById('product-title');
  const sku=document.getElementById('product-sku');
  const price=document.getElementById('product-price');
  const desc=document.getElementById('product-desc');
  const variants=document.getElementById('variants');
  const qty=document.getElementById('qty');
  const whats=document.getElementById('product-whatsapp');
  const relatedContainer=document.getElementById('related');

  title.textContent=product.name;
  sku.textContent='SKU: '+product.id;
  price.innerHTML=product.priceOriginal?`<div class="price"><span class="price-old">$${product.priceOriginal}</span><span class="price-new">$${product.price}</span></div>`:`<div class="price"><span class="price-new">$${product.price}</span></div>`;
  desc.textContent='Producto exclusivo de Auren.';
  const images=product.imgFront?[product.imgFront,product.imgBack]:product.images;
  mainImg.src=images[0];
  mainImg.alt=product.name;
  images.forEach((src,i)=>{
    const img=document.createElement('img');
    img.src=src; img.alt=product.name+' '+(i+1);
    if(i===0) img.classList.add('active');
    img.addEventListener('click',()=>{
      mainImg.src=src;
      thumbs.querySelectorAll('img').forEach(t=>t.classList.remove('active'));
      img.classList.add('active');
    });
    thumbs.appendChild(img);
  });

  ['Oro','Plata'].forEach((v,i)=>{
    const idv='var'+i;
    const label=document.createElement('label');
    label.className='chip';
    label.innerHTML=`<input class="sr-only" type="radio" name="variant" value="${v}" id="${idv}"><span>${v}</span>`;
    variants.appendChild(label);
  });

  function updateWhats(){
    const variant=document.querySelector('input[name="variant"]:checked');
    const message=`Hola Auren, me interesa: ${product.name}${variant? ' - '+variant.value:''} x${qty.value} a $${product.price}`;
    whats.href=`https://wa.me/523142836428?text=${encodeURIComponent(message)}`;
  }
  qty.addEventListener('input',updateWhats);
  variants.addEventListener('change',updateWhats);
  updateWhats();

  document.getElementById('share').addEventListener('click',async()=>{
    try{await navigator.share({title:product.name,url:location.href});}
    catch(e){navigator.clipboard.writeText(location.href);}
  });

  const related=products.filter(p=>p.category===product.category&&p.id!==product.id).slice(0,4);
  related.forEach(p=>{
    const a=document.createElement('a');
    a.href=`producto.html?id=${p.id}`;
    a.className='card glass';
    const imgFront=p.imgFront||(p.images?p.images[0]:'');
    const priceHTML=p.priceOriginal?`<div class="price"><span class="price-old">$${p.priceOriginal}</span><span class="price-new">$${p.price}</span></div>`:`<div class="price"><span class="price-new">$${p.price}</span></div>`;
    a.innerHTML=`<div class="img-wrapper"><img src="${imgFront}" alt="${p.name}"></div><div class="card-body"><h3>${p.name}</h3>${priceHTML}</div>`;
    relatedContainer.appendChild(a);
  });
}
