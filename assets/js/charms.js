document.addEventListener('DOMContentLoaded', () => {
  const BASE_PRICE = 150;
  const imageFiles = [
    'charms-30.jpeg',
    'charms-40.jpeg',
    'charms-50.jpeg',
    'charms-60.jpeg',
    'charms-70.jpeg',
    'charms-70b.jpeg',
    'charms-80.jpeg',
    'charms-90.jpeg',
    'charms-100.jpeg',
    'charms-110.jpeg',
    'charms-110b.jpeg'
  ];

  const charms = imageFiles.map((file, index) => ({
    id: `charm-${index}`,
    image: file,
    price: parseInt(file.match(/\d+/)[0], 10),
    qty: 0
  }));

  const eslabones = document.getElementById('eslabones');
  const tipo = document.getElementById('pulseraTipo');
  const color = document.getElementById('pulseraColor');
  const colorPreview = document.getElementById('colorPreview');

  const catalog = document.getElementById('catalog');
  const resumenPulsera = document.getElementById('resumenPulsera');
  const resumenLista = document.getElementById('resumenLista');
  const resumenCantidad = document.getElementById('resumenCantidad');
  const resumenSubtotal = document.getElementById('resumenSubtotal');
  const resumenTotal = document.getElementById('resumenTotal');

  const btnVaciar = document.getElementById('btnVaciar');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCargar = document.getElementById('btnCargar');
  const btnPDF = document.getElementById('btnPDF');
  const btnWhatsApp = document.getElementById('btnWhatsApp');

  const colorMap = {
    rojo: '#ff0000',
    rosa: '#ffc0cb',
    morado: '#800080',
    azul: '#0000ff',
    turquesa: '#40e0d0',
    verde: '#008000',
    amarillo: '#ffff00',
    naranja: '#ffa500',
    negro: '#000000',
    blanco: '#ffffff',
    gris: '#808080',
    'plata grabada': '#c0c0c0'
  };

  function renderCatalog() {
    charms.forEach(charm => {
      const card = document.createElement('div');
      card.className = 'charms-card';
      card.innerHTML = `
        <img src="img/charms/${charm.image}" alt="Charms lote ${charm.price} MXN" class="charms-card__image"> <!-- AUREN: actualizado a img/charms -->
        <div class="charms-card__title">Lote ${charm.price} MXN</div>
        <input type="number" min="0" max="99" value="0" class="charms-card__input" aria-label="Cantidad lote ${charm.price}" id="${charm.id}">
      `;
      const input = card.querySelector('input');
      input.addEventListener('input', () => {
        charm.qty = parseInt(input.value) || 0;
        updateResumen();
      });
      catalog.appendChild(card);
    });
  }

  function updateResumen() {
    const totalCharms = charms.reduce((sum, c) => sum + c.qty, 0);
    const subtotal = charms.reduce((sum, c) => sum + c.qty * c.price, 0);
    const total = BASE_PRICE + subtotal;
    resumenPulsera.textContent = `Pulsera: ${tipo.value} - ${color.value} (${eslabones.value} eslabones)`;
    resumenCantidad.textContent = totalCharms;
    resumenSubtotal.textContent = subtotal;
    resumenTotal.textContent = total;

    resumenLista.innerHTML = '';
    charms.filter(c => c.qty > 0).forEach(c => {
      const li = document.createElement('li');
      li.textContent = `Lote ${c.price}: ${c.qty} piezas`;
      resumenLista.appendChild(li);
    });
  }

  function updateColorPreview() {
    const val = color.value;
    colorPreview.style.background = colorMap[val] || '#fff';
  }

  function saveState() {
    const state = {
      eslabones: eslabones.value,
      tipo: tipo.value,
      color: color.value,
      quantities: charms.map(c => c.qty)
    };
    localStorage.setItem('aurenCharms', JSON.stringify(state));
  }

  function loadState() {
    const raw = localStorage.getItem('aurenCharms');
    if (!raw) return;
    const state = JSON.parse(raw);
    eslabones.value = state.eslabones;
    tipo.value = state.tipo;
    color.value = state.color;
    updateColorPreview();
    state.quantities.forEach((qty, i) => {
      charms[i].qty = qty;
      const input = document.getElementById(charms[i].id);
      if (input) input.value = qty;
    });
    updateResumen();
  }

  function clearAll() {
    eslabones.value = 18;
    tipo.selectedIndex = 0;
    color.selectedIndex = 0;
    updateColorPreview();
    charms.forEach(c => {
      c.qty = 0;
      const input = document.getElementById(c.id);
      if (input) input.value = 0;
    });
    updateResumen();
  }

  function generatePDF() {
    if (window.jspdf) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 10;
      doc.text('Pedido Auren', 10, y);
      y += 10;
      doc.text(`Pulsera: ${tipo.value} - ${color.value} (${eslabones.value} eslabones)`, 10, y);
      y += 10;
      charms.filter(c => c.qty > 0).forEach(c => {
        doc.text(`Lote ${c.price}: ${c.qty} piezas`, 10, y);
        y += 7;
      });
      doc.text(`Total: $${resumenTotal.textContent} MXN`, 10, y);
      doc.save('cotizacion.pdf');
    } else {
      window.print();
    }
  }

  function openWhatsApp() {
    let msg = `Pedido Auren 💕%0APulsera: ${tipo.value} ${color.value}, ${eslabones.value} eslabones%0ACharms seleccionados:%0A`;
    charms.filter(c => c.qty > 0).forEach(c => {
      msg += `- Lote ${c.price}: ${c.qty} piezas%0A`;
    });
    msg += `Total: $${resumenTotal.textContent} MXN`;
    window.open(`https://wa.me/?text=${msg}`);
  }

  renderCatalog();
  updateColorPreview();
  updateResumen();

  color.addEventListener('change', () => { updateColorPreview(); updateResumen(); });
  eslabones.addEventListener('input', updateResumen);
  tipo.addEventListener('change', updateResumen);

  btnVaciar.addEventListener('click', clearAll);
  btnGuardar.addEventListener('click', saveState);
  btnCargar.addEventListener('click', loadState);
  btnPDF.addEventListener('click', generatePDF);
  btnWhatsApp.addEventListener('click', openWhatsApp);

  loadState();
});
