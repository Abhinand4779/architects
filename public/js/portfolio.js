/* ═══════════════════════════════════════════
   PORTFOLIO PAGE JS — Cinematic Animations
   ═══════════════════════════════════════════ */

let allProjects = [];

window.addEventListener('DOMContentLoaded', () => {
  // Load admin projects from localStorage
  const stored = getProjects();

  // If user has projects saved in localStorage, they may include an older image
  // for `proj-1`. Override it here so the new asset is used immediately.
  const storedFixed = (stored || []).map(p => {
    if (p && p.id === 'proj-1') {
      return { ...p, image: './assets/WhatsApp Image 2026-05-30 at 10.42.42 PM.jpeg' };
    }
    return p;
  });

  // Include recent works placed in /assets (added by user) as high-visibility featured items.
  // This list includes newly added phone images and photoX files. Filenames that
  // match common AI/generated patterns are automatically excluded.
  const rawAssetImages = [
    './assets/photo7.jpeg',
    './assets/photo6.jpeg',
    './assets/photo5.jpeg',
    './assets/photo4.jpeg',
    './assets/photo3.jpeg',
    './assets/photo2.jpeg',
    './assets/photo1.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.31 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.32 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.33 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.34 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.35 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.36 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.37 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.38 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.39 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.40 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.43 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.44 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.45 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.46 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.47 PM.jpeg',
    './assets/WhatsApp Image 2026-05-30 at 10.42.48 PM.jpeg'
  ];

  // Filter out likely AI/generated files by filename patterns (case-insensitive)
  const aiPatterns = ['ai', 'generated', 'image.png'];
  const assetImages = rawAssetImages.filter(p => {
    const name = p.split('/').pop().toLowerCase();
    // exclude logo and known single-file placeholders
    if (name.includes('logo') || name.includes('removebg') || name === 'image.png') return false;
    return !aiPatterns.some(pat => name.includes(pat));
  });

  const assetProjects = assetImages.map((src, idx) => ({
    id: `asset-${idx}`,
    title: 'Recent Work',
    category: 'exterior',
    description: 'Showcase of our recent work',
    image: src,
    location: 'Ernakulam',
    year: new Date().getFullYear(),
    order: idx + 1
  }));

  // Merge assets first so they display prominently, then admin projects
  allProjects = [...assetProjects, ...storedFixed];

  // Remove specific displayed items by their visible order numbers (1-based).
  // This lets you quickly hide items shown as "24,25,26,27,28,29" in the UI.
  const excludedOrders = [24, 25, 26, 27, 28, 29];
  if (Array.isArray(excludedOrders) && excludedOrders.length) {
    allProjects = allProjects.filter((p, idx) => {
      const displayOrder = p.order || (idx + 1);
      return !excludedOrders.includes(displayOrder);
    });
  }

  // Render a featured carousel for top recent works, then the full grid
  renderCarousel(allProjects.slice(0, 4));
  renderPortfolio(allProjects);
  initFilters();
  initCarousel();
});

function renderCarousel(items) {
  const grid = document.querySelector('.portfolio-grid');
  if (!grid) return;

  let carousel = document.querySelector('.portfolio-carousel');
  if (!carousel) {
    carousel = document.createElement('section');
    carousel.className = 'portfolio-carousel';
    grid.parentNode.insertBefore(carousel, grid);
  }

  carousel.innerHTML = `
    <div class="carousel-track">
      ${items.map(p => `
        <div class="carousel-slide" data-id="${p.id}">
          <img src="${p.image}" alt="${p.title}">
          <div class="carousel-caption">
            <h3>${p.title} <span class="carousel-order">#${p.order || ''}</span></h3>
            <div class="carousel-meta">${p.location}, ${p.year}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <button class="carousel-prev" aria-label="Previous">&#10094;</button>
    <button class="carousel-next" aria-label="Next">&#10095;</button>
    <div class="carousel-indicators">
      ${items.map((_,i) => `<button class="indicator ${i===0? 'active':''}" data-index="${i}"></button>`).join('')}
    </div>
  `;

  // open lightbox when clicking a slide
  carousel.querySelectorAll('.carousel-slide').forEach(s => s.addEventListener('click', () => openLightbox(s.dataset.id)));
}

function initCarousel() {
  const carousel = document.querySelector('.portfolio-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const indicators = Array.from(carousel.querySelectorAll('.indicator'));

  let index = 0;
  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${ -index * 100 }%)`;
    indicators.forEach((b,bi) => b.classList.toggle('active', bi === index));
  }

  prev.addEventListener('click', () => { goTo(index - 1); resetAutoplay(); });
  next.addEventListener('click', () => { goTo(index + 1); resetAutoplay(); });
  indicators.forEach(btn => btn.addEventListener('click', () => { goTo(Number(btn.dataset.index)); resetAutoplay(); }));

  track.style.transition = 'transform .55s ease';
  let autoplay = setInterval(() => goTo(index + 1), 4000);
  function resetAutoplay() { clearInterval(autoplay); autoplay = setInterval(() => goTo(index + 1), 4000); }

  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  carousel.addEventListener('mouseleave', () => resetAutoplay());

  // initialize
  goTo(0);
}

window.addEventListener('loaderFinished', () => {
  if (typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined") {
    initPortfolioGsap();
  }
});

function renderPortfolio(projectsToRender) {
  const container = document.getElementById('portfolioGrid');
  if (!container) return;
  
  if (projectsToRender.length === 0) {
    container.innerHTML = '<p style="color:rgba(23,21,18,.6);grid-column:1/-1;padding:40px 0;">No projects found in this category.</p>';
    return;
  }

  container.innerHTML = projectsToRender.map((p, i) => `
    <article class="portfolio-item ${i < 4 ? 'featured' : ''}" onclick="openLightbox('${p.id}')">
      <img src="${p.image}" alt="${p.title}">
      <div class="portfolio-item__order">${p.order || (i + 1)}</div>
      <div class="portfolio-item__overlay">
        <div class="portfolio-item__category">${formatCategory(p.category)}</div>
        <h3 class="portfolio-item__title">${p.title}</h3>
        <div class="portfolio-item__desc">${p.location}, ${p.year}</div>
      </div>
    </article>
  `).join('');

  // ── Cinematic Scroll Reveal ──
  if (window.gsap && window.ScrollTrigger) {
    const items = document.querySelectorAll(".portfolio-item");
    items.forEach((item, index) => {
      gsap.set(item, { opacity: 0, y: 60 });
      gsap.to(item, {
        opacity: 1, y: 0,
        duration: 0.8,
        delay: index * 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 95%",
          toggleActions: "play none none none"
        },
        onComplete: () => {
          if (index === items.length - 1) initPortfolioItemHover();
        }
      });
    });

    // Safety fallback: if items are still hidden after 3s, force show them
    setTimeout(() => {
      document.querySelectorAll(".portfolio-item").forEach(el => {
        if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    }, 3000);
  } else {
    // No GSAP — show everything immediately
    document.querySelectorAll(".portfolio-item").forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
}

function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      const filtered = filterValue === 'all' 
        ? allProjects 
        : allProjects.filter(p => p.category === filterValue);
      
      // Animate old items out before rendering new ones
      if (window.gsap) {
        gsap.to(".portfolio-item", {
          opacity: 0, y: -20, duration: 0.4, stagger: 0.03, ease: "power2.in",
          onComplete: () => {
            renderPortfolio(filtered);
          }
        });
      } else {
        renderPortfolio(filtered);
      }
    });
  });
}

function initPortfolioGsap() {
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  
  tl.from(".page-hero__bg img", { scale: 1.25, duration: 2.5, ease: "power3.inOut" }, 0)
    .from(".page-hero__kicker", { opacity: 0, x: -30, duration: 1 }, 0.3)
    .from(".page-hero__title .split-line > span", { 
      yPercent: 120, rotationZ: 3, opacity: 0, 
      duration: 1.5, stagger: 0.05 
    }, 0.5)
    .from(".page-hero__subtitle", { opacity: 0, y: 20, duration: 1 }, 1.1)
    .from(".portfolio-filters", { opacity: 0, y: 20, duration: 1 }, 1.3);
}

// ── 3D Magnetic Interactive Hover ──
function initPortfolioItemHover() {
  if (window.innerWidth <= 768) return;
  
  gsap.utils.toArray(".portfolio-item").forEach(item => {
    item.addEventListener("mousemove", (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      gsap.to(item, {
        rotateY: x * 12, rotateX: y * -12,
        scale: 1.02,
        transformPerspective: 1000,
        duration: 0.4, ease: "power2.out"
      });
      
      gsap.to(item.querySelector("img"), {
        scale: 1.15,
        x: x * -10, y: y * -10,
        duration: 0.5, ease: "power2.out"
      });
    });
    
    item.addEventListener("mouseleave", () => {
      gsap.to(item, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: "power3.out" });
      gsap.to(item.querySelector("img"), { scale: 1, x: 0, y: 0, duration: 0.6, ease: "power3.out" });
    });
  });
}

// ── Premium Cinematic Lightbox ──
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDesc = document.getElementById('lightboxDesc');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(id) {
  const proj = allProjects.find(p => p.id === id);
  if (!proj || !lightbox) return;
  
  lightboxImg.src = proj.image;
  lightboxTitle.textContent = proj.title;
  lightboxDesc.textContent = proj.description;
  
  // Open with GSAP cinematic animation
  lightbox.style.display = 'grid';
  document.body.style.overflow = 'hidden';
  
  gsap.killTweensOf([lightbox, ".lightbox__content", ".lightbox__close"]);
  
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.6 })
    .fromTo(".lightbox__content", { scale: 0.8, y: 60, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.8 }, 0.1)
    .fromTo(".lightbox__close", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, 0.3);
}

function closeLightbox() {
  if (!lightbox) return;
  
  gsap.killTweensOf([lightbox, ".lightbox__content", ".lightbox__close"]);
  
  gsap.timeline({ 
    defaults: { ease: "power3.inOut" },
    onComplete: () => {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  })
    .to(".lightbox__content", { scale: 0.85, y: 40, opacity: 0, duration: 0.4 })
    .to(".lightbox__close", { scale: 0.5, opacity: 0, duration: 0.3 }, 0)
    .to(lightbox, { opacity: 0, duration: 0.5 }, 0.1);
}

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}
