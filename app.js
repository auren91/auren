// Smooth scroll for internal links
// This is also handled via CSS scroll-behavior but included per requirement
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({behavior: 'smooth'});
    }
  });
});

// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if(hamburger && navLinks){
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Catalog search
document.querySelectorAll('.search-input').forEach(input => {
  input.addEventListener('input', function(){
    const query = this.value.toLowerCase();
    const cards = this.closest('.catalog').querySelectorAll('.card');
    cards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      card.style.display = name.includes(query) ? '' : 'none';
    });
  });
});

// Carousel functionality
const carousel = document.querySelector('.carousel');
if(carousel){
  const slides = carousel.querySelector('.slides');
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  let index = 0;
  const total = slides.children.length;

  function showSlide(i){
    slides.style.transform = `translateX(-${i*100}%)`;
  }

  next.addEventListener('click', () => {
    index = (index + 1) % total;
    showSlide(index);
  });

  prev.addEventListener('click', () => {
    index = (index - 1 + total) % total;
    showSlide(index);
  });

  setInterval(() => {
    index = (index + 1) % total;
    showSlide(index);
  }, 5000);
}
