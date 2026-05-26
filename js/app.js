class App {
    constructor() {
        this.modules = {
            'sorting-visualizer': new window.SortingVisualizer('Bubble Sort'),
            'logic-gates': new window.LogicGates(),
            'brute-force': new window.BruteForceDemo(),
            'osi-model': new window.OsiModel(),
            'settings': new window.Settings()
        };

        this.currentActiveModule = null;

        // Visual elements cached
        this.cursorDot = DOM.get('#cursor-dot');
        this.cursorRing = DOM.get('#cursor-ring');
        this.topNav = DOM.get('#top-nav');
        this.hamburgerBtn = DOM.get('#hamburger-btn');
        this.mobileMenu = DOM.get('#mobile-menu');
        this.modalOverlay = DOM.get('#app-modal');
        this.modalCloseBtn = DOM.get('#btn-modal-close');
        this.modalTitle = DOM.get('#modal-title-display');
        this.modalMount = DOM.get('#modal-content-mount');

        this.init();
    }

    init() {
        document.documentElement.classList.add('js-enabled');
        this.loadDynamicFonts();
        this.initCursor();
        this.initMagneticEffect();
        this.initScrollEffects();
        this.initRevealAnimations();
        this.initMobileMenu();
        this.initModalListeners();
        this.initHeroAnimation();
        this.initNavClickHandlers();

        // Initialize AI Assistant Chatbot
        if (typeof window.AiAssistant === 'function') {
            this.aiAssistant = new window.AiAssistant();
        }
    }

    loadDynamicFonts() {
        const loadFonts = () => {
            const link = document.createElement('link');
            link.href = 'https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        };
        
        if (document.readyState === 'complete') {
            loadFonts();
        } else {
            window.addEventListener('load', loadFonts);
        }
    }

    /* --- 1. CUSTOM CURSOR WITH LERP LAG --- */
    initCursor() {
        // Exit early on touch-only devices to avoid irritation
        if (window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
            if (this.cursorDot) this.cursorDot.style.display = 'none';
            if (this.cursorRing) this.cursorRing.style.display = 'none';
            return;
        }

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instantly position and show the dot
            if (this.cursorDot) {
                this.cursorDot.style.left = `${mouseX}px`;
                this.cursorDot.style.top = `${mouseY}px`;
                this.cursorDot.style.opacity = '1';
            }
            if (this.cursorRing) {
                this.cursorRing.style.opacity = '1';
            }
        });

        // Tick loop to lerp the trailing ring
        const tick = () => {
            if (this.cursorRing) {
                ringX += (mouseX - ringX) * 0.15;
                ringY += (mouseY - ringY) * 0.15;
                this.cursorRing.style.left = `${ringX}px`;
                this.cursorRing.style.top = `${ringY}px`;
            }
            requestAnimationFrame(tick);
        };
        tick();

        // Expand cursor on hovering interactive elements
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            if (target.closest('a') || 
                target.closest('button') || 
                target.closest('.work-card') || 
                target.closest('.service-row') || 
                target.closest('.magnetic') ||
                target.closest('input[type="range"]') ||
                target.closest('input[type="color"]') ||
                target.closest('input[type="text"]')) {
                
                if (this.cursorRing) this.cursorRing.classList.add('hov');
                if (this.cursorDot) this.cursorDot.classList.add('hov');
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target;
            if (target.closest('a') || 
                target.closest('button') || 
                target.closest('.work-card') || 
                target.closest('.service-row') || 
                target.closest('.magnetic') ||
                target.closest('input[type="range"]') ||
                target.closest('input[type="color"]') ||
                target.closest('input[type="text"]')) {
                
                if (this.cursorRing) this.cursorRing.classList.remove('hov');
                if (this.cursorDot) this.cursorDot.classList.remove('hov');
            }
        });
    }

    /* --- 2. ADVANCED JS MAGNETIC EFFECT --- */
    initMagneticEffect() {
        const magneticElements = document.querySelectorAll('.magnetic');

        magneticElements.forEach(el => {
            let rect = null;

            el.addEventListener('mouseenter', () => {
                rect = el.getBoundingClientRect();
            });

            el.addEventListener('mousemove', (e) => {
                if (!rect) {
                    rect = el.getBoundingClientRect();
                }
                const mx = e.clientX;
                const my = e.clientY;
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = mx - cx;
                const dy = my - cy;
                const dist = Math.hypot(dx, dy);

                if (dist < 80) {
                    const strength = 0.25; // scaling factor
                    const tx = dx * strength;
                    const ty = dy * strength;

                    // Limit translation to max 15px toward mouse
                    const angle = Math.atan2(dy, dx);
                    const limitTx = Math.cos(angle) * Math.min(15, Math.abs(tx));
                    const limitTy = Math.sin(angle) * Math.min(15, Math.abs(ty));

                    el.style.transform = `translate(${limitTx}px, ${limitTy}px)`;
                    el.style.transition = 'transform 0.1s ease-out';
                } else {
                    el.style.transform = 'translate(0px, 0px)';
                    el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                }
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0px, 0px)';
                el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                rect = null;
            });
        });
    }

    /* --- 3. SCROLL EFFECTS & STICKY HEADER --- */
    initScrollEffects() {
        // Sticky Header scroll classes
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                if (this.topNav) this.topNav.classList.add('scrolled');
            } else {
                if (this.topNav) this.topNav.classList.remove('scrolled');
            }
            this.updateActiveNavOnScroll();
        });

        // Back to Top button
        const btnBackToTop = DOM.get('#btn-back-to-top');
        if (btnBackToTop) {
            btnBackToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-item-link');
        
        let currentSectionId = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const height = section.offsetHeight;
            if (window.scrollY >= top && window.scrollY < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    /* --- 4. SCROLL REVEAL VIA INTERSECTION OBSERVER --- */
    initRevealAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
    }

    /* --- 5. MOBILE NAVIGATION MENU --- */
    initMobileMenu() {
        if (!this.hamburgerBtn || !this.mobileMenu) return;

        this.hamburgerBtn.addEventListener('click', () => {
            const isOpen = this.mobileMenu.classList.toggle('open');
            
            // Toggle hamburger icon animation
            const spans = this.hamburgerBtn.querySelectorAll('span');
            if (isOpen) {
                spans[0].style.transform = 'translateY(7.5px) rotate(45deg)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'translateY(-7.5px) rotate(-45deg)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu when clicking nav links
        const mobileLinks = this.mobileMenu.querySelectorAll('.mobile-menu-links a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // If it's Let's Talk link, handles custom scrolling or launch
                this.mobileMenu.classList.remove('open');
                const spans = this.hamburgerBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    /* --- 6. LINE-MASK HERO HEADING REVEAL --- */
    initHeroAnimation() {
        setTimeout(() => {
            const mask1 = DOM.get('#hero-mask-1');
            const mask2 = DOM.get('#hero-mask-2');
            if (mask1) mask1.style.transform = 'translateY(0)';
            setTimeout(() => {
                if (mask2) mask2.style.transform = 'translateY(0)';
            }, 150);
        }, 100);
    }

    /* --- 7. NAVIGATION CLICK SMOOTH SCROLLS --- */
    initNavClickHandlers() {
        // Let's Talk scroll to footer contact section
        const btnTalk = DOM.get('#btn-letstalk-nav');
        if (btnTalk) {
            btnTalk.addEventListener('click', () => {
                const contactSec = DOM.get('#contact');
                if (contactSec) {
                    contactSec.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Hero SVG badge action button scrolls to portfolio
        const btnHeroBadge = DOM.get('#badge-action-btn');
        if (btnHeroBadge) {
            btnHeroBadge.addEventListener('click', () => {
                const portSec = DOM.get('#portfolio');
                if (portSec) {
                    portSec.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    /* --- 8. INTERACTIVE MODALS AND MODULE INTEGRATIONS --- */
    initModalListeners() {
        if (!this.modalOverlay || !this.modalCloseBtn) return;

        // Close modal button
        this.modalCloseBtn.addEventListener('click', () => this.closeModal());

        // Close modal when clicking background overlay
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalOverlay.classList.contains('open')) {
                this.closeModal();
            }
        });

        // Hook up Selected Work Grid items to open modals
        const cardSorting = DOM.get('#card-sorting-visualizer');
        const cardLogic = DOM.get('#card-logic-gates');
        const cardBrute = DOM.get('#card-brute-force');
        const cardOsi = DOM.get('#card-osi-model');
        const cards = document.querySelectorAll('.work-grid .work-card');

        if (cardSorting) {
            cardSorting.addEventListener('click', () => this.openModuleModal('sorting-visualizer', 'Sorting Visualizer'));
        }
        if (cardLogic) {
            cardLogic.addEventListener('click', () => this.openModuleModal('logic-gates', 'Logic Gate Simulator'));
        }
        if (cardBrute) {
            cardBrute.addEventListener('click', () => this.openModuleModal('brute-force', 'Brute Force Attack Simulation'));
        }
        if (cardOsi) {
            cardOsi.addEventListener('click', () => this.openModuleModal('osi-model', 'OSI Model Encapsulation Lab'));
        }

        // Static Work Project Modals (JusticeGPT and D5BU Shield)
        cards.forEach(card => {
            if (card !== cardSorting && card !== cardLogic && card !== cardBrute) {
                card.addEventListener('click', () => {
                    const title = card.querySelector('.work-card-title').textContent;
                    this.openProjectDetailsModal(title);
                });
            }
        });

        // Settings modal link
        const footerNav = DOM.get('#contact');
        if (footerNav) {
            // Find or inject settings link in navigation links list
            const footerLinksList = footerNav.querySelector('.footer-links');
            if (footerLinksList) {
                const settingsLink = document.createElement('a');
                settingsLink.href = '#settings';
                settingsLink.className = 'underline-link magnetic';
                settingsLink.textContent = 'Settings & Themes';
                settingsLink.style.cursor = 'pointer';
                settingsLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModuleModal('settings', 'Settings & Themes');
                });
                footerLinksList.appendChild(settingsLink);
            }
        }
        
        // Add settings link to mobile menu too
        if (this.mobileMenu) {
            const mobileLinksList = this.mobileMenu.querySelector('.mobile-menu-links');
            if (mobileLinksList) {
                const mobileSettingsLink = document.createElement('a');
                mobileSettingsLink.href = '#settings';
                mobileSettingsLink.className = 'magnetic';
                mobileSettingsLink.textContent = 'Settings';
                mobileSettingsLink.style.transitionDelay = '0.6s';
                mobileSettingsLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.mobileMenu.classList.remove('open');
                    // Reset hamburger spans
                    const spans = this.hamburgerBtn.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                    
                    this.openModuleModal('settings', 'Settings & Themes');
                });
                mobileLinksList.appendChild(mobileSettingsLink);
            }
        }
    }

    openModuleModal(moduleId, title) {
        const module = this.modules[moduleId];
        if (!module) return;

        this.currentActiveModule = module;
        this.modalTitle.textContent = title;
        
        // Mount simulator rendering
        DOM.mount(this.modalMount, module.render());

        // Initialize simulator logic
        if (typeof module.init === 'function') {
            module.init();
        }

        // Open modal
        this.modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // lock background scrolling
    }

    openProjectDetailsModal(projectTitle) {
        this.currentActiveModule = null;
        this.modalTitle.textContent = projectTitle;

        let contentHtml = '';
        if (projectTitle === 'JusticeGPT') {
            contentHtml = `
                <div class="panel" style="display:flex; flex-direction:column; gap:20px; text-align:left;">
                    <div class="badge-tag" style="width:fit-content; border-color:var(--accent-coral); color:var(--accent-coral);">AI / Natural Language Processing</div>
                    <p style="font-size:1.1rem; line-height:1.7; color:var(--text-primary);">
                        <strong>JusticeGPT</strong> is an advanced legal assistant system powered by retrieval-augmented generation methodologies to construct precise, hallucination-free legal responses.
                    </p>
                    <h3 style="text-transform:uppercase; font-size:16px; color:var(--accent-taupe); border-bottom:1px solid var(--border-low-opacity); padding-bottom:8px; margin-top:10px;">Key Engineering Implementations</h3>
                    <ul style="list-style:disc; padding-left:20px; color:var(--text-secondary); display:flex; flex-direction:column; gap:12px; font-size:14px; line-height:1.6;">
                        <li><strong>Deep NLP Queries:</strong> Engineered query parsing mechanics to dissect legal jargon and identify primary clauses, matching questions to accurate precedent citations.</li>
                        <li><strong>Zero-Hallucination Guardrails:</strong> Configured retrieval threshold constraints and customized context structures to prevent LLMs from generating speculative legal advice.</li>
                        <li><strong>Structured Database Backend:</strong> Established database indexing pipelines to search legal documents rapidly, ensuring instant and accurate referencing.</li>
                    </ul>
                    <div style="margin-top:15px; display:flex; justify-content:flex-start;">
                        <a href="https://github.com/D5BU/JusticeGPT" target="_blank" rel="noopener noreferrer" class="btn-pill" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            <span>View on GitHub</span>
                        </a>
                    </div>
                </div>
            `;
        } else if (projectTitle === 'D5BU Shield') {
            contentHtml = `
                <div class="panel" style="display:flex; flex-direction:column; gap:20px; text-align:left;">
                    <div class="badge-tag" style="width:fit-content; border-color:var(--accent-coral); color:var(--accent-coral);">Cybersecurity / Networking</div>
                    <p style="font-size:1.1rem; line-height:1.7; color:var(--text-primary);">
                        <strong>D5BU Shield</strong> is a comprehensive cybersecurity command dashboard built to demonstrate active host discovery, information gathering, and forensic analysis techniques.
                    </p>
                    <h3 style="text-transform:uppercase; font-size:16px; color:var(--accent-taupe); border-bottom:1px solid var(--border-low-opacity); padding-bottom:8px; margin-top:10px;">Security Tools & Modules</h3>
                    <ul style="list-style:disc; padding-left:20px; color:var(--text-secondary); display:flex; flex-direction:column; gap:12px; font-size:14px; line-height:1.6;">
                        <li><strong>Network Scanner:</strong> Integrated standard system scanning scripts (inspired by Nmap discovery) to parse active local hosts, detect open port services, and map internal subnets.</li>
                        <li><strong>Steganography Laboratory:</strong> Programmed a pixel modification system (LSB) to demonstrate steganographic concealment of text data within PNG and BMP image matrices.</li>
                        <li><strong>System Vulnerability Monitor:</strong> Designed clean visual graphs monitoring system loads, active network adapters, and security logging outputs directly inside a Linux host.</li>
                    </ul>
                    <div style="margin-top:15px; display:flex; justify-content:flex-start;">
                        <a href="https://github.com/D5BU/D5BU-Shield" target="_blank" rel="noopener noreferrer" class="btn-pill" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            <span>View on GitHub</span>
                        </a>
                    </div>
                </div>
            `;
        }

        DOM.mount(this.modalMount, DOM.create(contentHtml));

        // Open modal
        this.modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        // Abort running routines inside SortingVisualizer if it is currently executing
        if (this.currentActiveModule) {
            if (this.currentActiveModule.isRunning) {
                this.currentActiveModule.isAborted = true;
            }
            // Clear running timers or intervals inside Brute Force or Gates if necessary
            if (typeof this.currentActiveModule.destroy === 'function') {
                this.currentActiveModule.destroy();
            }
            this.currentActiveModule = null;
        }

        // Close overlay
        this.modalOverlay.classList.remove('open');
        document.body.style.overflow = ''; // restore scrolling

        // Delay clearing mount container so modal transition finishes smoothly
        setTimeout(() => {
            if (!this.modalOverlay.classList.contains('open')) {
                this.modalMount.innerHTML = '';
            }
        }, 500);
    }
}

// Start application immediately
window.app = new App();
