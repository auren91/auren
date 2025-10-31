(function(){
  const PAGE_SIZE = 20;
  const manifestRaw = Array.isArray(window.CHARMS_MANIFEST) ? window.CHARMS_MANIFEST : [];

  const buildCollection = (entries)=>entries
    .map((item,index)=>{
      if(typeof item === 'string'){
        return { id:index, src:item, tags:'', text:item.toLowerCase(), name:getName(item) };
      }
      if(item && typeof item === 'object'){
        const src=String(item.src || item.path || '').trim();
        if(!src) return null;
        const tags=Array.isArray(item.tags)?item.tags.join(' '):(item.tags||'');
        const combined = `${tags} ${src}`.toLowerCase();
        return { id:index, src, tags, text:combined, name:getName(src) };
      }
      return null;
    })
    .filter(Boolean);

  function getName(src){
    const clean = src.split('/').pop() || '';
    return clean.replace(/[_-]+/g,' ').replace(/\.[^.]+$/, '').trim() || 'Auren';
  }

  const allItems = buildCollection(manifestRaw);

  const init = () => {
    const grid = document.getElementById('cg-grid');
    if(!grid){
      return;
    }

    const prevBtn = document.querySelector('.cg-prev');
    const nextBtn = document.querySelector('.cg-next');
    const pageInfo = document.querySelector('.cg-pageinfo');
    const searchInput = document.getElementById('cg-search');

    const params = new URLSearchParams(location.search);
    let page = Number.parseInt(params.get('p') || '1', 10);
    if(!Number.isFinite(page) || page < 1){
      page = 1;
    }
    let queryRaw = (params.get('q') || '').trim();
    let query = queryRaw.toLowerCase();
    if(searchInput){
      searchInput.value = queryRaw;
    }

    let firstRender = true;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const img = entry.target;
          observer.unobserve(img);
          if(!img.dataset || !img.dataset.src){
            return;
          }
          const skeleton = img.previousElementSibling;
          img.src = img.dataset.src;
          if(img.complete){
            skeleton?.remove();
          }else{
            img.addEventListener('load', () => skeleton?.remove(), { once:true });
            img.addEventListener('error', () => skeleton?.classList.add('cg-skel-error'), { once:true });
          }
        }
      });
    }, { rootMargin:'200px 0px' });

    function filtered(){
      if(!query){
        return allItems;
      }
      return allItems.filter(item => item.text.includes(query));
    }

    function totalPages(totalItems){
      return Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    }

    function updateHistory(){
      const sp = new URLSearchParams();
      sp.set('p', String(page));
      if(queryRaw){
        sp.set('q', queryRaw);
      }
      const state = { p:page, q:queryRaw };
      const urlParams = sp.toString();
      const url = urlParams ? `${location.pathname}?${urlParams}` : location.pathname;
      if(firstRender){
        history.replaceState(state, '', url);
        firstRender = false;
      }else{
        history.pushState(state, '', url);
      }
    }

    function render({ skipHistory = false } = {}){
      const current = filtered();
      const totalItems = current.length;
      const total = totalPages(totalItems);
      page = Math.min(Math.max(1, page), total);

      grid.classList.add('fading');
      grid.setAttribute('aria-busy', 'true');
      observer.disconnect();
      grid.innerHTML = '';

      if(!totalItems){
        const empty = document.createElement('p');
        empty.className = 'cg-empty';
        empty.textContent = queryRaw
          ? `No encontramos charms con “${queryRaw}”.`
          : 'La galería se está cargando…';
        grid.appendChild(empty);
      }else{
        const start = (page - 1) * PAGE_SIZE;
        const items = current.slice(start, start + PAGE_SIZE);
        const fragment = document.createDocumentFragment();

        items.forEach(item => {
          const card = document.createElement('article');
          card.className = 'cg-card';
          card.tabIndex = 0;
          card.setAttribute('role', 'button');
          card.setAttribute('aria-label', `Ver charm ${item.name}`);
          card.dataset.lightboxSrc = item.src;

          const wrap = document.createElement('div');
          wrap.className = 'cg-imgwrap';

          const skeleton = document.createElement('div');
          skeleton.className = 'cg-skel';
          wrap.appendChild(skeleton);

          const img = document.createElement('img');
          img.className = 'cg-img';
          img.loading = 'lazy';
          img.decoding = 'async';
          img.alt = `Charm ${item.name}`;
          img.dataset.src = item.src;
          wrap.appendChild(img);

          card.appendChild(wrap);
          fragment.appendChild(card);

          if(img.dataset.src && img.complete){
            img.src = img.dataset.src;
            skeleton.remove();
          }else{
            observer.observe(img);
          }
        });

        grid.appendChild(fragment);
      }

      const infoText = totalItems
        ? `Página ${page} de ${total} (${totalItems} ítems)`
        : 'Sin resultados';
      if(pageInfo){
        pageInfo.textContent = infoText;
      }

      if(prevBtn){
        prevBtn.disabled = page <= 1 || totalItems === 0;
      }
      if(nextBtn){
        nextBtn.disabled = page >= total || totalItems === 0;
      }

      grid.setAttribute('aria-busy', 'false');
      setTimeout(() => grid.classList.remove('fading'), 160);

      if(!skipHistory){
        updateHistory();
      }
    }

    function changePage(delta){
      const current = filtered();
      const total = totalPages(current.length);
      const next = Math.min(Math.max(1, page + delta), total);
      if(next === page){
        return;
      }
      page = next;
      render();
    }

    prevBtn?.addEventListener('click', () => {
      changePage(-1);
    });

    nextBtn?.addEventListener('click', () => {
      changePage(1);
    });

    if(searchInput){
      let lastTimeout = 0;
      searchInput.addEventListener('input', () => {
        const value = searchInput.value.trim();
        queryRaw = value;
        query = value.toLowerCase();
        page = 1;
        window.clearTimeout(lastTimeout);
        lastTimeout = window.setTimeout(() => render(), 80);
      });
    }

    document.addEventListener('keydown', event => {
      const active = document.activeElement;
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
      if(isTyping){
        return;
      }
      if(event.key === 'ArrowLeft'){ event.preventDefault(); changePage(-1); }
      if(event.key === 'ArrowRight'){ event.preventDefault(); changePage(1); }
    });

    window.addEventListener('popstate', () => {
      const sp = new URLSearchParams(location.search);
      const nextPage = Number.parseInt(sp.get('p') || '1', 10);
      page = Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1;
      queryRaw = (sp.get('q') || '').trim();
      query = queryRaw.toLowerCase();
      if(searchInput){
        searchInput.value = queryRaw;
      }
      render({ skipHistory:true });
    });

    render();
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
