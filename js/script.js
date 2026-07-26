document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Hero Slideshow
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 5000);
    }

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 150;
            if (scrollY >= top) current = section.getAttribute('id');
        });

        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Load dynamic images from admin uploads
    loadDynamicImages();
});

async function loadDynamicImages() {
    try {
        const res = await fetch('/api/images');
        const data = await res.json();

        // Hero
        if (data.hero && data.hero.length > 0) {
            const container = document.querySelector('.hero-slideshow');
            if (container) {
                container.innerHTML = '';
                const max = Math.min(data.hero.length, 3);
                for (let i = 0; i < max; i++) {
                    const img = document.createElement('img');
                    img.className = 'hero-slide' + (i === 0 ? ' active' : '');
                    img.src = data.hero[i];
                    img.alt = 'Mitra Kreasi Indonesia';
                    img.width = 1600;
                    img.height = 900;
                    if (i > 0) img.loading = 'lazy';
                    if (i === 0) img.fetchPriority = 'high';
                    container.appendChild(img);
                }
                if (max > 1) {
                    let current = 0;
                    setInterval(() => {
                        const allSlides = container.querySelectorAll('.hero-slide');
                        allSlides[current].classList.remove('active');
                        current = (current + 1) % allSlides.length;
                        allSlides[current].classList.add('active');
                    }, 5000);
                }
            }
        }

        // Portfolio
        if (data.portfolio && data.portfolio.length > 0) {
            const grid = document.querySelector('.portfolio-grid');
            if (grid) {
                const categories = ['Booth Pameran', 'Counter Display', 'Outdoor Signage', 'Modular Booth', 'POP Display', 'Neon Box', 'Proyek'];
                grid.innerHTML = '';
                data.portfolio.forEach((url, i) => {
                    const item = document.createElement('div');
                    item.className = 'portfolio-item';
                    item.innerHTML = '<img src="' + url + '" alt="' + (categories[i % categories.length]) + '" width="600" height="400" loading="lazy"><div class="portfolio-overlay"><span>' + (categories[i % categories.length]) + '</span></div>';
                    grid.appendChild(item);
                });
            }
        }

        // Blog
        if (data.blog && data.blog.length > 0) {
            const grid = document.querySelector('.blog-grid');
            if (grid) {
                const categories = ['Tips', 'Material', 'Tren', 'Proyek', 'Berita'];
                grid.innerHTML = '';
                data.blog.forEach((url, i) => {
                    const article = document.createElement('article');
                    article.className = 'blog-card';
                    article.innerHTML = '<div class="blog-image"><img src="' + url + '" alt="Artikel blog" width="600" height="400" loading="lazy"><span class="blog-category">' + (categories[i % categories.length]) + '</span></div><div class="blog-content"><h3>Artikel Terbaru</h3><p>Klik untuk membaca selengkapnya.</p></div>';
                    grid.appendChild(article);
                });
            }
        }
    } catch(e) {
        // Silently fail - keep placeholder images
    }
}