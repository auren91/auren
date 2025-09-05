// Mostrar mensaje en consola
console.log("Sitio Auren cargado correctamente 💖");

// Efecto fade-in al hacer scroll
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px"
};


const appearOnScroll = new IntersectionObserver(function(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('appear');
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(fader => {
  appearOnScroll.observe(fader);
});

let posicionHombre = 0;
let posicionMujer = 0;

function moverCarrusel(tipo, direccion) {
  const carrusel = document.querySelector(`#carrusel-${tipo} .carrusel-items`);
  const cantidad = carrusel.children.length;
  const tamaño = carrusel.children[0].offsetWidth + 20;

  if (tipo === "hombre") {
    posicionHombre = Math.max(0, Math.min(posicionHombre + direccion, cantidad - 1));
    carrusel.style.transform = `translateX(${-posicionHombre * tamaño}px)`;
  } else {
    posicionMujer = Math.max(0, Math.min(posicionMujer + direccion, cantidad - 1));
    carrusel.style.transform = `translateX(${-posicionMujer * tamaño}px)`;
  }
}

// --- Buscador de productos ---
document.addEventListener("DOMContentLoaded", function () {
  const buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("input", function () {
      const texto = this.value.toLowerCase();
      const productos = document.querySelectorAll(".producto-card");

      productos.forEach(producto => {
        const titulo = producto.querySelector(".producto-titulo").textContent.toLowerCase();
        const desc = producto.querySelector(".producto-desc").textContent.toLowerCase();

        if (titulo.includes(texto) || desc.includes(texto)) {
          producto.classList.remove("oculto");
        } else {
          producto.classList.add("oculto");
        }
      });

      // Ahora sí, después del filtrado, cuenta los visibles
      const visibles = Array.from(productos).filter(p => !p.classList.contains("oculto"));
      document.getElementById("no-resultados").style.display = visibles.length === 0 ? "block" : "none";
    });
  }
});