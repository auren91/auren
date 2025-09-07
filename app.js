const products=[
  {id:'charm-inicial',name:'Charm Inicial',category:'charms',price:150,tags:['letras','nuevo'],badge:'Nuevo',images:['img/charms-01a.jpg','img/charms-01b.jpg'],rating:4,available:true},
  {id:'charm-amor',name:'Charm Amor',category:'charms',price:180,tags:['amor','top'],badge:'Top',images:['img/charms-02a.jpg','img/charms-02b.jpg'],rating:5,available:true},
  {id:'charm-estrella',name:'Charm Estrella',category:'charms',price:120,tags:['estrella'],badge:'-20%',images:['img/charms-03a.jpg','img/charms-03b.jpg'],rating:4,available:false},
  {id:'camisa-rosa',name:'Camisa Rosa',category:'ropa',price:520,tags:['camisa'],badge:'',images:['img/ropa-01a.jpg','img/ropa-01b.jpg'],rating:4,available:true},
  {id:'sueter-dorado',name:'Suéter Dorado',category:'ropa',price:650,tags:['sueter','top'],badge:'Top',images:['img/ropa-02a.jpg','img/ropa-02b.jpg'],rating:5,available:true},
  {id:'vestido-rojo',name:'Vestido Rojo',category:'ropa',price:780,tags:['vestido','nuevo'],badge:'Nuevo',images:['img/ropa-03a.jpg','img/ropa-03b.jpg'],rating:4,available:false},
  {id:'collar-corazon',name:'Collar de Corazón',category:'joyeria',price:1200,tags:['collar','amor'],badge:'',images:['img/joyeria-01a.jpg','img/joyeria-01b.jpg'],rating:5,available:true},
  {id:'anillo-minimal',name:'Anillo Minimalista',category:'joyeria',price:800,tags:['anillo'],badge:'',images:['img/joyeria-02a.jpg','img/joyeria-02b.jpg'],rating:4,available:true},
  {id:'pulsera-charms',name:'Pulsera con Charms',category:'joyeria',price:900,tags:['pulsera','top'],badge:'Top',images:['img/joyeria-03a.jpg','img/joyeria-03b.jpg'],rating:4,available:true}
];

document.addEventListener('DOMContentLoaded',()=>{
  initMenu();
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
    let items=products.filter(p=>p.category===category);
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
      card.innerHTML=`<div class="img-wrapper"><img src="${p.images[0]}" alt="${p.name} frontal" class="front"><img src="${p.images[1]}" alt="${p.name} reverso" class="back"></div>`+
        (p.badge?`<span class="badge">${p.badge}</span>`:'')+
        `<div class="card-body"><h3>${p.name}</h3><p class="price">$<span class="num">${p.price}</span></p>`+
        `<div class="rating" aria-label="${p.rating} estrellas">${'★'.repeat(p.rating)}${'☆'.repeat(5-p.rating)}</div>`+
        `<div class="actions"><a href="producto.html?id=${p.id}" class="btn">Ver detalles</a>`+
        `<a href="https://wa.me/523142836428?text=${encodeURIComponent('Hola Auren, me interesa: '+p.name)}" target="_blank" class="btn whatsapp">WhatsApp</a></div>`+
        `<button class="sr-only quick" data-id="${p.id}">Vista rápida</button></div>`;
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
        quickView.innerHTML=`<form method="dialog"><div class="card"><div class="img-wrapper"><img src="${p.images[0]}" alt="${p.name}"></div><h3>${p.name}</h3><p class="price">$${p.price}</p><a class="btn whatsapp" href="https://wa.me/523142836428?text=${encodeURIComponent('Hola Auren, me interesa: '+p.name)}" target="_blank">WhatsApp</a><button class="btn">Cerrar</button></div></form>`;
        quickView.showModal();
      }
    }
  });

  render();
}

function initProductPage(){
  const params=new URLSearchParams(location.search);
  const id=params.get('id');
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
  price.textContent='$'+product.price;
  desc.textContent='Producto exclusivo de Auren.';
  mainImg.src=product.images[0];
  mainImg.alt=product.name;
  product.images.forEach((src,i)=>{
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
    const message=`Hola Auren, me interesa: ${product.name}${variant? ' - '+variant.value:''} x${qty.value}`;
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
    a.innerHTML=`<div class="img-wrapper"><img src="${p.images[0]}" alt="${p.name}"></div><div class="card-body"><h3>${p.name}</h3><p class="price">$${p.price}</p></div>`;
    relatedContainer.appendChild(a);
  });
}
