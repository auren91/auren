const WA_NUMBER = '523142836428';
const WHATSAPP_BASE = `https://wa.me/${WA_NUMBER}`;

const BASE_PRICES = {
  plata: 100,
  dorada: 150,
  negra: 150
};

const COLOR_OPTIONS = [
  { value: 'rojo', label: 'Rojo', swatch: '#ff0000' },
  { value: 'rosa', label: 'Rosa', swatch: '#ffc0cb' },
  { value: 'morado', label: 'Morado', swatch: '#800080' },
  { value: 'azul', label: 'Azul', swatch: '#0000ff' },
  { value: 'turquesa', label: 'Turquesa', swatch: '#40e0d0' },
  { value: 'verde', label: 'Verde', swatch: '#008000' },
  { value: 'amarillo', label: 'Amarillo', swatch: '#ffff00' },
  { value: 'naranja', label: 'Naranja', swatch: '#ffa500' },
  { value: 'negro', label: 'Negro', swatch: '#000000' },
  { value: 'blanco', label: 'Blanco', swatch: '#ffffff' },
  { value: 'gris', label: 'Gris', swatch: '#808080' },
  { value: 'plata grabada', label: 'Plata grabada', swatch: '#c0c0c0' }
];

const LOTE_IMAGES = [
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

const STORAGE_KEY = 'aurenCharms.v2';

document.addEventListener('DOMContentLoaded', () => {
  const eslabonesInput = document.getElementById('eslabones');
  const tipoSelect = document.getElementById('tipoPulsera');
  const colorSelect = document.getElementById('colorPulsera');
  const colorPreview = document.getElementById('colorPreview');

  const lotesGrid = document.getElementById('lotesGrid');
  const resumenDetalle = document.getElementById('resumenDetalle');
  const resPulsera = document.getElementById('resPulsera');
  const resCharms = document.getElementById('resCharms');
  const resSubCharms = document.getElementById('resSubCharms');
  const resTotal = document.getElementById('resTotal');

  const btnVaciar = document.getElementById('btnVaciar');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCargar = document.getElementById('btnCargar');
  const btnPDF = document.getElementById('btnPDF');
  const btnWA = document.getElementById('btnWA');

  if (!eslabonesInput || !tipoSelect || !colorSelect) {
    return;
  }

  const lotes = LOTE_IMAGES.map((file, index) => ({
    id: `lote-${index}`,
    image: file,
    price: parseInt((file.match(/\d+/) || ['0'])[0], 10),
    qty: 0
  }));

  function formatMXN(value) {
    return Number(value || 0).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  }

  function initColorOptions() {
    colorSelect.innerHTML = '';
    COLOR_OPTIONS.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      colorSelect.appendChild(opt);
    });
    colorSelect.value = COLOR_OPTIONS[0].value;
    updateColorPreview();
  }

  function updateColorPreview() {
    const selected = COLOR_OPTIONS.find(opt => opt.value === colorSelect.value);
    if (colorPreview) {
      colorPreview.style.background = selected ? selected.swatch : '#ffffff';
    }
  }

  function renderLotes() {
    lotesGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    lotes.forEach(lote => {
      const card = document.createElement('article');
      card.className = 'lote-card';
      card.innerHTML = `
        <img src="img/charms/${lote.image}" alt="Lote de charms ${formatMXN(lote.price)}" loading="lazy" decoding="async">
        <div class="lote-body">
          <h4>Lote ${formatMXN(lote.price)}</h4>
          <p>Define cuántos paquetes necesitas</p>
          <div class="stepper">
            <button type="button" data-step="dec" aria-label="Restar">−</button>
            <input type="number" min="0" max="99" value="${lote.qty}" aria-label="Cantidad lote ${lote.price}">
            <button type="button" data-step="inc" aria-label="Sumar">+</button>
          </div>
        </div>
      `;

      const input = card.querySelector('input');
      const [decBtn, incBtn] = card.querySelectorAll('button');

      const syncValue = (value) => {
        const safeValue = Math.max(0, Math.min(99, value));
        lote.qty = safeValue;
        input.value = safeValue;
        updateResumen();
      };

      decBtn.addEventListener('click', () => {
        syncValue((lote.qty || 0) - 1);
      });

      incBtn.addEventListener('click', () => {
        syncValue((lote.qty || 0) + 1);
      });

      input.addEventListener('input', () => {
        const value = parseInt(input.value, 10);
        syncValue(Number.isNaN(value) ? 0 : value);
      });

      fragment.appendChild(card);
    });

    lotesGrid.appendChild(fragment);
  }

  function calcularSubtotalCharms() {
    return lotes.reduce((sum, lote) => sum + (lote.qty * lote.price), 0);
  }

  function obtenerCantidadCharms() {
    return lotes.reduce((sum, lote) => sum + lote.qty, 0);
  }

  function buildWhatsAppLink(message) {
    if (typeof getWhatsappLink === 'function') {
      return getWhatsappLink(message);
    }
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
  }

  function updateResumen() {
    const tipoValue = tipoSelect.value;
    const colorValue = colorSelect.value;
    const eslabonesValue = eslabonesInput.value || '';

    const precioPulsera = BASE_PRICES[tipoValue] ?? 0;
    const subtotalCharms = calcularSubtotalCharms();
    const total = precioPulsera + subtotalCharms;

    resPulsera.textContent = formatMXN(precioPulsera);
    resCharms.textContent = formatMXN(subtotalCharms);
    resSubCharms.textContent = formatMXN(subtotalCharms);
    resTotal.textContent = formatMXN(total);

    const detalleActivos = lotes.filter(l => l.qty > 0);
    resumenDetalle.innerHTML = '';

    if (detalleActivos.length) {
      detalleActivos.forEach(lote => {
        const row = document.createElement('div');
        row.className = 'resume-detail-row';

        const label = document.createElement('span');
        label.textContent = `Lote ${formatMXN(lote.price)}`;

        const qty = document.createElement('strong');
        qty.textContent = `${lote.qty} pzas`;

        row.append(label, qty);
        resumenDetalle.appendChild(row);
      });
    } else {
      const empty = document.createElement('p');
      empty.textContent = 'Aún no has agregado charms. Usa los lotes para sumar piezas.';
      resumenDetalle.appendChild(empty);
    }

    const colorLabel = COLOR_OPTIONS.find(opt => opt.value === colorValue)?.label || colorValue;
    const tipoLabel = tipoSelect.options[tipoSelect.selectedIndex]?.textContent || tipoValue;

    const mensaje = [
      `Hola Auren, quiero una pulsera (${tipoLabel}, ${eslabonesValue} eslabones, color ${colorLabel}).`,
      `Charms seleccionados: ${obtenerCantidadCharms()} paquetes.`,
      detalleActivos.map(lote => `- Lote ${formatMXN(lote.price)} · ${lote.qty} pzas`).join('\n'),
      `Total: ${formatMXN(total)}`
    ].filter(Boolean).join('\n');

    if (btnWA) {
      btnWA.href = buildWhatsAppLink(mensaje);
    }
  }

  function saveState() {
    const state = {
      eslabones: eslabonesInput.value,
      tipo: tipoSelect.value,
      color: colorSelect.value,
      lotes: lotes.map(l => l.qty)
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('AUREN charms: no se pudo guardar el estado', error);
    }
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }
      const state = JSON.parse(stored);
      eslabonesInput.value = state.eslabones ?? eslabonesInput.value;
      tipoSelect.value = state.tipo ?? tipoSelect.value;
      colorSelect.value = state.color ?? colorSelect.value;
      updateColorPreview();
      (state.lotes || []).forEach((qty, index) => {
        if (typeof qty === 'number' && lotes[index]) {
          lotes[index].qty = qty;
        }
      });
    } catch (error) {
      console.warn('AUREN charms: estado inválido', error);
    }
  }

  function hydrateStepperValues() {
    lotesGrid.querySelectorAll('.lote-card').forEach((card, index) => {
      const input = card.querySelector('input[type="number"]');
      if (input && lotes[index]) {
        input.value = lotes[index].qty;
      }
    });
  }

  function clearAll() {
    eslabonesInput.value = 18;
    tipoSelect.value = 'plata';
    colorSelect.value = COLOR_OPTIONS[0].value;
    updateColorPreview();
    lotes.forEach(lote => { lote.qty = 0; });
    hydrateStepperValues();
    updateResumen();
  }

  function generatePDF() {
    try {
      if (window.jspdf) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let cursor = 10;

        doc.text('Pedido Auren', 10, cursor);
        cursor += 10;
        doc.text(`Pulsera: ${tipoSelect.value} - ${colorSelect.value} (${eslabonesInput.value} eslabones)`, 10, cursor);
        cursor += 10;

        lotes.filter(l => l.qty > 0).forEach(lote => {
          doc.text(`Lote ${formatMXN(lote.price)}: ${lote.qty} piezas`, 10, cursor);
          cursor += 7;
        });

        doc.text(`Total: ${resTotal.textContent}`, 10, cursor);
        doc.save('cotizacion-auren.pdf');
      } else {
        window.print();
      }
    } catch (error) {
      console.error('AUREN charms: no se pudo generar el PDF', error);
    }
  }

  initColorOptions();
  renderLotes();
  loadState();
  hydrateStepperValues();
  updateResumen();

  colorSelect.addEventListener('change', () => {
    updateColorPreview();
    updateResumen();
  });

  eslabonesInput.addEventListener('input', updateResumen);
  tipoSelect.addEventListener('change', updateResumen);

  btnVaciar?.addEventListener('click', () => {
    clearAll();
    saveState();
  });

  btnGuardar?.addEventListener('click', saveState);
  btnCargar?.addEventListener('click', () => {
    loadState();
    hydrateStepperValues();
    updateResumen();
  });

  btnPDF?.addEventListener('click', generatePDF);

  window.addEventListener('beforeunload', saveState);
});
