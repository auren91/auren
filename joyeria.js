async function loadJewels(){
  try{
    const res = await fetch('/data/jewels.json');
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(err){
    console.error('No se pudo cargar listado de joyería', err);
    return { white: [], black: [] };
  }
}

function renderCarousel(trackEl, dotsEl, files){
  trackEl.innerHTML = files.map(f=>{
    const src = `/img/joyeria/${f}`;
    const alt = f.replace('.jpeg','').replace(/-/g,' ');
    return `<figure class="card" role="listitem">
              <img class="thumb" src="${src}" alt="${alt}" loading="lazy">
            </figure>`;
  }).join('');
  setupCarousel(trackEl, dotsEl);
}

function setupCarousel(track, dots){
  let index = 0;
  const pageSize = () => {
    if (window.matchMedia('(max-width:640px)').matches) return 1;
    if (window.matchMedia('(max-width:1024px)').matches) return 2;
    return 3;
  };
  const pages = Math.ceil(track.children.length / pageSize());
  const prevBtn = track.parentElement.querySelector('.prev');
  const nextBtn = track.parentElement.querySelector('.next');

  function goTo(i){
    index = (i + pages) % pages;
    const x = index * track.clientWidth;
    track.scrollTo({ left: x, behavior: 'smooth' });
    [...dots.children].forEach((d, k)=> d.setAttribute('aria-current', k===index ? 'true' : 'false'));
  }

  dots.innerHTML = Array.from({length: pages})
    .map((_,i)=>`<button aria-label="Ir a la página ${i+1}" ${i===0?'aria-current="true"':''}></button>`).join('');
  dots.addEventListener('click', e=>{
    if (e.target.tagName==='BUTTON'){
      const i=[...dots.children].indexOf(e.target);
      goTo(i);
    }
  });

  prevBtn?.addEventListener('click', ()=>goTo(index-1));
  nextBtn?.addEventListener('click', ()=>goTo(index+1));

  track.parentElement.addEventListener('keydown', e=>{
    if (e.key==='ArrowLeft') goTo(index-1);
    if (e.key==='ArrowRight') goTo(index+1);
  });

  window.addEventListener('resize', ()=>setupCarousel(track, dots), { once:true });

  goTo(0);
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const data = await loadJewels();
  renderCarousel(document.querySelector('#carousel-white .track'), document.getElementById('dots-white'), data.white || []);
  renderCarousel(document.querySelector('#carousel-black .track'), document.getElementById('dots-black'), data.black || []);
});
