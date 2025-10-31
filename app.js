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
let socialConfig={}; /* AUREN: config social global */

// AUREN: carga de header y footer
async function injectPartials(){
  const [h,f]=await Promise.all([
    fetch('/partials/header.html').then(r=>r.text()),
    fetch('/partials/footer.html').then(r=>r.text())
  ]);
  replacePartial('#site-header','site-header',h);
  replacePartial('#site-footer','site-footer',f);
}

function replacePartial(selector,id,html){
  const container=document.createElement('div');
  container.id=id;
  container.innerHTML=html;
  const target=document.querySelector(selector);
  if(target){
    target.replaceWith(container);
    activateInlineScripts(container);
  }
}

function activateInlineScripts(root){
  root.querySelectorAll('script').forEach(script=>{
    const clone=document.createElement('script');
    [...script.attributes].forEach(attr=>clone.setAttribute(attr.name,attr.value));
    clone.textContent=script.textContent;
    script.replaceWith(clone);
  });
}

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

async function loadSocialConfig(){
  try{
    const res=await fetch('/data/social.json');
    if(!res.ok) throw new Error('HTTP '+res.status);
    socialConfig=await res.json();
  }catch(err){
    console.warn('No se pudo cargar configuración social.',err);
  }
}

function getWhatsappLink(message=''){
  const num=(socialConfig.whatsapp_number_e164||'').replace(/[^0-9]/g,'');
  const base=`https://wa.me/${num}`;
  return message?`${base}?text=${encodeURIComponent(message)}`:(socialConfig.whatsapp_link||base);
}

function renderFooterSocials(container){
  if(!container) return;
  const social=socialConfig||{};
  const links=[
    social.whatsapp_link?`
    <a class="btn-whatsapp" href="${social.whatsapp_link}" target="_blank" rel="noopener noreferrer" data-cta="whatsapp" title="Escríbenos por WhatsApp" aria-label="Escríbenos por WhatsApp">
      <svg viewBox="0 0 32 32" class="icon" aria-hidden="true"><path fill="currentColor" d="M16 2.9C8.5 2.9 2.4 8.9 2.4 16.3c0 2.8.8 5.4 2.3 7.7L2 30l6.2-2.6c2.2 1.2 4.7 1.8 7.2 1.8 7.5 0 13.6-6.1 13.6-13.6S23.5 2.9 16 2.9zM16 26c-2.2 0-4.3-.6-6.1-1.7l-.4-.2-3.7 1.5.7-3.9-.3-.4c-1.3-1.9-2-4.2-2-6.6 0-6.5 5.3-11.8 11.8-11.8S27.8 9.3 27.8 15.8 22.5 26 16 26zm6.5-8.4c-.4-.2-2.2-1.1-2.5-1.2s-.6-.2-.9.2-1 1.2-1.2 1.5c-.2.2-.5.3-.9.1s-1.7-.6-3.2-2c-1.2-1.1-2-2.5-2.3-2.9-.2-.4 0-.6.2-.8s.4-.5.6-.7c.2-.2.3-.4.5-.6.2-.2.1-.5 0-.7s-.9-2.1-1.3-2.9c-.3-.7-.7-.6-1-.6h-.9c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 3.9c.2.2 2.7 4.1 6.6 5.7.9.4 1.6.6 2.2.8.9.2 1.7.1 2.3.1.7-.1 2.2-.9 2.5-1.7.3-.8.3-1.5.2-1.7-.2-.4-.4-.5-.8-.6z"/></svg>
      <span>Escríbenos por WhatsApp</span>
    </a>`:'',
    social.instagram?`
    <a class="social-btn" href="${social.instagram}" target="_blank" rel="noopener noreferrer" title="Abrir Instagram de Auren" aria-label="Abrir Instagram de Auren">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6zm4.5-3.7a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>
    </a>`:'',
    social.facebook?`
    <a class="social-btn" href="${social.facebook}" target="_blank" rel="noopener noreferrer" title="Abrir Facebook de Auren" aria-label="Abrir Facebook de Auren">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12H16l-.5 3h-2v7A10 10 0 0 0 22 12"/></svg>
    </a>`:'',
    social.twitter?`
    <a class="social-btn" href="${social.twitter}" target="_blank" rel="noopener noreferrer" title="Abrir Twitter de Auren" aria-label="Abrir Twitter de Auren">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M22 4.01c-.77.35-1.6.58-2.46.69a4.25 4.25 0 0 0 1.88-2.35 8.48 8.48 0 0 1-2.7 1.03 4.22 4.22 0 0 0-7.2 3.85A12 12 0 0 1 3 3.79a4.21 4.21 0 0 0 1.31 5.63 4.2 4.2 0 0 1-1.91-.53v.05a4.23 4.23 0 0 0 3.39 4.14 4.2 4.2 0 0 1-1.9.07 4.23 4.23 0 0 0 3.94 2.93A8.5 8.5 0 0 1 2 19.54a12 12 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.35-.02-.53A8.35 8.35 0 0 0 22 4.01z"/></svg>
    </a>`:'',
    social.tiktok?`
    <a class="social-btn" href="${social.tiktok}" target="_blank" rel="noopener noreferrer" title="Abrir TikTok de Auren" aria-label="Abrir TikTok de Auren">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M12.9 2h3.1c.2 2 1.7 3.7 3.6 4v3.2c-1.4 0-2.8-.4-4-1.1v5.9a6.9 6.9 0 11-6.9-6.9c.4 0 .8 0 1.2.1v3.4a3.5 3.5 0 103.1 3.5V2z"/></svg>
    </a>`:''
  ].filter(Boolean);
  const markup=links.map(link=>link.trim()).join('\n');
  container.innerHTML=markup;
}

function applyWhatsAppCTAs(){
  document.querySelectorAll('[data-cta="whatsapp"]').forEach(a=>{
    a.href=socialConfig.whatsapp_link;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.title='Escríbenos por WhatsApp';
    a.setAttribute('aria-label','Escríbenos por WhatsApp');
  });
}

document.addEventListener('DOMContentLoaded',async()=>{
  await Promise.all([injectPartials(),loadCharmsCatalog(),loadSocialConfig()]); /* AUREN: carga inicial */
  renderFooterSocials(document.getElementById('auren-socials'));
  applyWhatsAppCTAs();
  setupLightbox();
  initMenu();
  initSliders();
  initSocialBanner();
  const bodyCategory=document.body.dataset.category;
  if(bodyCategory) initCatalog(bodyCategory);
  if(document.getElementById('product-detail')) initProductPage();
});

function initMenu(){
  const hamburger=document.querySelector('.hamburger');
  const nav=document.querySelector('.nav-menu')||document.querySelector('.nav-links');
  if(hamburger&&nav){
    hamburger.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded',open); // AUREN: accesibilidad
    });
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


function initSocialBanner(){
  const banner=document.getElementById('promoSocialBanner');
  if(!banner) return;
  const close=document.getElementById('bannerClose');
  const storageKey='promoSocialBanner.dismissedAt';
  const dismissed=parseInt(localStorage.getItem(storageKey)||0,10);
  const now=Date.now();
  if(dismissed && now-dismissed < 7*24*60*60*1000){
    banner.remove();
    return;
  }
  function show(){
    banner.classList.add('social-banner--enter');
    banner.style.top='0';
    const height=banner.offsetHeight;
    document.body.style.setProperty('--social-banner-height',height+'px');
    document.body.classList.add('social-banner-visible');
    requestAnimationFrame(()=>{
      banner.classList.replace('social-banner--enter','social-banner--visible');
    });
  }
  function hide(){
    banner.classList.replace('social-banner--visible','social-banner--exit');
    banner.addEventListener('transitionend',e=>{
      if(e.propertyName==='opacity') banner.remove();
    },{once:true});
    document.body.classList.remove('social-banner-visible');
    localStorage.setItem(storageKey,Date.now().toString());
  }
  setTimeout(show,400);
  if(close){
    close.addEventListener('click',hide);
    close.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        hide();
      }
    });
  }
  banner.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',()=>{
      const cta=a.id==='ctaInstagram'?'instagram':a.id==='ctaFacebook'?'facebook':'howto';
      console.log('bannerSocial',{cta});
    });
  });
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
          `<a href="${getWhatsappLink('Hola Auren, me interesa: '+p.name+' a $'+p.price+' (precio con descuento).')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp">WhatsApp</a></div>`+ /* AUREN: WhatsApp desde config */
          `<button class="sr-only quick" data-id="${p.id}">Vista rápida</button></div>`;
      }else{
        card.innerHTML=`<div class="img-wrapper"><img src="${imgFront}" alt="${p.name} frontal" class="front"><img src="${imgBack}" alt="${p.name} reverso" class="back"></div>`+
          (p.badge?`<span class="badge ${p.badge==='Descuento'?'badge-descuento':''}">${p.badge}</span>`:'')+
          `<div class="card-body"><h3>${p.name}</h3>${priceHTML}`+
          `<div class="rating" aria-label="${p.rating} estrellas">${'★'.repeat(p.rating)}${'☆'.repeat(5-p.rating)}</div>`+
          `<div class="actions"><a href="producto.html?id=${p.id}" class="btn">Ver detalles</a>`+
          `<a href="${getWhatsappLink('Hola Auren, me interesa: '+p.name+' a $'+p.price+' (precio con descuento).')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp">WhatsApp</a></div>`+ /* AUREN: WhatsApp desde config */
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
        quickView.innerHTML=`<form method="dialog"><div class="card"><div class="img-wrapper"><img src="${imgFront}" alt="${p.name}"></div><h3>${p.name}</h3>${priceHTML}<a class="btn whatsapp" href="${getWhatsappLink('Hola Auren, me interesa: '+p.name+' a $'+p.price+' (precio con descuento).')}" target="_blank" rel="noopener noreferrer">WhatsApp</a><button class="btn">Cerrar</button></div></form>`; /* AUREN: WhatsApp desde config */
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
    whats.href=getWhatsappLink(message); /* AUREN: WhatsApp desde config */
    whats.target='_blank'; whats.rel='noopener noreferrer';
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

function setupLightbox(){
  const lb=document.getElementById('lightbox');
  const lbImg=document.getElementById('lightbox-img');
  const closeBtn=lb?.querySelector('.lightbox-close');
  if(!lb || !lbImg) return;

  const open=src=>{
    if(!src) return;
    lbImg.src=src;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
  };

  const close=()=>{
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    lbImg.src='';
  };

  document.addEventListener('click',e=>{
    const trigger=e.target.closest?.('[data-lightbox-src], .charm-frame');
    if(trigger){
      e.preventDefault();
      open(trigger.dataset.lightboxSrc||trigger.dataset.full||trigger.getAttribute('href'));
    }
    if(e.target===lb){
      close();
    }
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ close(); }
    if((e.key==='Enter'||e.key===' ') && document.activeElement?.hasAttribute('data-lightbox-src')){
      e.preventDefault();
      const src=document.activeElement.dataset.lightboxSrc;
      open(src);
    }
  });

  closeBtn?.addEventListener('click',close);
}
