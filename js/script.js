/* ==========================================
   MITRA KREASI - JavaScript (v4 Light Theme)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // === Particle Effect for Hero ===
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 12 + 6;
            const delay = Math.random() * 6;
            const colors = ['rgba(249, 115, 22, ', 'rgba(30, 64, 175, '];
            const color = colors[Math.floor(Math.random() * colors.length)];

            Object.assign(particle.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                background: `${color}${Math.random() * 0.3 + 0.1})`,
                borderRadius: '50%',
                left: `${x}%`,
                top: `${y}%`,
                animation: `particleFloat ${duration}s ease-in-out ${delay}s infinite`,
                pointerEvents: 'none',
                boxShadow: `0 0 ${size * 2}px ${color}0.2)`
            });

            particlesContainer.appendChild(particle);
        }
    }

    // === Magnetic Button Effect ===
    const magneticBtns = document.querySelectorAll('.btn-accent, .btn-outline-light');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // === Unified Scroll Handler (navbar + parallax + back-to-top) ===
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroOrbs = document.querySelectorAll('.hero-orb');
    const heroGrid = document.querySelector('.hero-grid');
    const backToTop = document.querySelector('.back-to-top');

    function handleScroll() {
        const scrolled = window.scrollY;

        // Navbar scroll effect + active link
        if (scrolled > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (scrolled >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Parallax on hero orbs
        if (scrolled < window.innerHeight) {
            heroOrbs.forEach((orb, i) => {
                const speed = (i + 1) * 0.15;
                orb.style.transform = `translateY(${scrolled * speed}px)`;
            });
            if (heroGrid) {
                heroGrid.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        }

        // Back to top visibility
        if (backToTop) {
            if (scrolled > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // === Mobile Menu Toggle ===
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
            document.body.style.overflow = navLinksContainer.classList.contains('active') ? 'hidden' : '';
        });

        navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksContainer.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // === Counter Animation with Easing ===
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCounters() {
        if (countersAnimated) return;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            if (!target) return;
            const duration = 2500;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutExpo(progress);
                const current = Math.ceil(easedProgress * target);

                stat.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            }

            requestAnimationFrame(updateCounter);
        });

        countersAnimated = true;
    }

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(statsSection);
    }

    // === Portfolio Filter ===
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            portfolioItems.forEach((item, index) => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                    item.style.animation = `fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.08}s forwards`;
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // === Portfolio Modal ===
    const modal = document.getElementById('portfolioModal');
    const modalClose = document.getElementById('modalClose');
    const modalImage = document.getElementById('modalImage');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalClient = document.getElementById('modalClient');

    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('.portfolio-image img');
            const category = item.querySelector('.portfolio-category')?.textContent || '';
            const title = item.querySelector('.portfolio-title')?.textContent || '';
            const client = item.querySelector('.portfolio-client')?.textContent || '';

            if (img) {
                modalImage.style.backgroundImage = `url(${img.src})`;
            }
            modalImage.style.height = '320px';
            modalCategory.textContent = category;
            modalTitle.textContent = title;
            modalClient.textContent = client;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeModal();
        }
    });

    // === Scroll Reveal Animation ===
    const revealElements = document.querySelectorAll(
        '.section-header, .stat-card, .about-grid, .service-card, .process-step, ' +
        '.portfolio-item, .testimonial-card, .why-us-grid, .faq-item, ' +
        '.contact-grid, .cta-content, .map-wrapper'
    );

    revealElements.forEach((el, index) => {
        el.classList.add('reveal-hidden');
        const delayClass = `delay-${(index % 5) + 1}`;
        el.classList.add(delayClass);
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal-hidden').forEach(el => {
        revealObserver.observe(el);
    });

    // === Interactive Tilt on Service Cards ===
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;

            const shine = card.querySelector('.card-shine') || (() => {
                const s = document.createElement('div');
                s.className = 'card-shine';
                s.style.cssText = `
                    position: absolute; inset: 0; z-index: 10; pointer-events: none;
                    background: radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 50%);
                    border-radius: inherit;
                `;
                card.appendChild(s);
                return s;
            })();
            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 50%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            const shine = card.querySelector('.card-shine');
            if (shine) shine.remove();
        });
    });

    // === Interactive Tilt on Process Steps ===
    const processSteps = document.querySelectorAll('.process-step');

    processSteps.forEach(step => {
        step.addEventListener('mousemove', (e) => {
            const rect = step.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            step.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        step.addEventListener('mouseleave', () => {
            step.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // === Contact Form Handling ===
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const service = formData.get('service');
            const message = formData.get('message');

            if (!name || !email || !service || !message) {
                showNotification('Mohon lengkapi semua field yang diperlukan.', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Format email tidak valid.', 'error');
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Mengirim...</span>';
            submitBtn.disabled = true;

            setTimeout(() => {
                showNotification('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // === Notification System ===
    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '&#10003;' : '&#9888;'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'notifSlideOut 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }

    // === Smooth Scroll ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === Lazy Load Images ===
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '150px' });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // === Back to Top Button ===
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // === Preloader ===
    window.addEventListener('load', () => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.remove();
                    const heroContent = document.querySelector('.hero-content');
                    if (heroContent) {
                        heroContent.style.opacity = '1';
                        heroContent.style.transform = 'translateY(0)';
                    }
                }, 600);
            }, 400);
        }
    });

    // === FAQ Accordion ===
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
            });

            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // === Cookie Consent ===
    const cookieConsent = document.getElementById('cookieConsent');
    const cookieAccept = document.getElementById('cookieAccept');
    const cookieDecline = document.getElementById('cookieDecline');

    if (cookieConsent && !localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            cookieConsent.classList.add('show');
        }, 3000);
    }

    if (cookieAccept) {
        cookieAccept.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieConsent.classList.remove('show');
        });
    }

    if (cookieDecline) {
        cookieDecline.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            cookieConsent.classList.remove('show');
        });
    }

    // === Newsletter Form ===
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                showNotification('Terima kasih telah berlangganan newsletter kami!', 'success');
                newsletterForm.reset();
            }
        });
    }

    // === Floating Decorative Shapes ===
    const decorativeContainer = document.createElement('div');
    decorativeContainer.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;';
    document.body.appendChild(decorativeContainer);

    const shapes = [
        { size: 100, x: '5%', y: '20%', color: 'rgba(249, 115, 22, 0.02)', delay: 0 },
        { size: 80, x: '90%', y: '30%', color: 'rgba(30, 64, 175, 0.02)', delay: 2 },
    ];

    shapes.forEach(shape => {
        const el = document.createElement('div');
        el.style.cssText = `
            position: absolute; width: ${shape.size}px; height: ${shape.size}px;
            left: ${shape.x}; top: ${shape.y};
            background: ${shape.color}; border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            animation: floatShape ${15 + shape.delay * 2}s ease-in-out ${shape.delay}s infinite;
            filter: blur(40px);
        `;
        decorativeContainer.appendChild(el);
    });

});
