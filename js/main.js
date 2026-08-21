/**
 * HIBARI AI Workshop 2026
 * 雲雀丘学園 第2回生成AI活用研修
 * Main JavaScript - Page Transitions, Theme, Drawer, Tabs, Accordions, Carousel, CountUp, FAB
 */

(function() {
  'use strict';

  // ----------------------------------------
  // Page Transition System
  // ----------------------------------------
  const PageTransition = {
    overlay: null,
    transitionText: null,
    isTransitioning: false,

    init() {
      this.createOverlay();
      this.bindEvents();

      if (document.readyState === 'complete') {
        setTimeout(() => this.reveal(), 100);
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => this.reveal(), 100);
        });
      }

      window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
          this.reveal();
        }
      });
    },

    createOverlay() {
      const existingOverlay = document.querySelector('.page-transition-overlay');
      if (existingOverlay) {
        this.overlay = existingOverlay;
        this.transitionText = existingOverlay.querySelector('.transition-text');
        return;
      }

      this.overlay = document.createElement('div');
      this.overlay.className = 'page-transition-overlay';

      this.transitionText = document.createElement('span');
      this.transitionText.className = 'transition-text';
      this.transitionText.textContent = 'HIBARI AI';

      this.overlay.appendChild(this.transitionText);
      document.body.appendChild(this.overlay);
    },

    reveal() {
      this.overlay.classList.remove('exiting');
      this.overlay.classList.add('loaded');
      this.isTransitioning = false;
      document.body.classList.remove('no-scroll');
    },

    cover(url) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;

      document.body.classList.add('no-scroll');
      this.overlay.classList.remove('loaded');
      this.overlay.classList.add('exiting');

      setTimeout(() => {
        window.location.href = url;
      }, 600);
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');

        if (!href ||
            href.startsWith('#') ||
            href.startsWith('http') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            link.hasAttribute('target') ||
            link.hasAttribute('download')) {
          return;
        }

        e.preventDefault();
        this.cover(href);
      });
    }
  };

  // ----------------------------------------
  // Theme Management
  // ----------------------------------------
  const ThemeManager = {
    storageKey: 'gapps-studio-theme',

    init() {
      const savedTheme = localStorage.getItem(this.storageKey);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');

      this.setTheme(theme, false);
      this.bindEvents();
    },

    setTheme(theme, save = true) {
      document.documentElement.setAttribute('data-theme', theme);
      if (save) {
        localStorage.setItem(this.storageKey, theme);
      }
    },

    toggle() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    },

    bindEvents() {
      const toggle = document.getElementById('themeToggle');
      if (toggle) {
        toggle.addEventListener('click', () => this.toggle());
      }

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.storageKey)) {
          this.setTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }
  };

  // ----------------------------------------
  // Navigation
  // ----------------------------------------
  const Navigation = {
    nav: null,
    scrollThreshold: 50,

    init() {
      this.nav = document.getElementById('nav');
      if (!this.nav) return;

      this.bindEvents();
      this.handleScroll();
    },

    handleScroll() {
      const scrolled = window.scrollY > this.scrollThreshold;
      this.nav.classList.toggle('scrolled', scrolled);
    },

    bindEvents() {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  };

  // ----------------------------------------
  // Drawer Menu
  // ----------------------------------------
  const DrawerMenu = {
    drawer: null,
    backdrop: null,
    toggle: null,
    closeBtn: null,
    isOpen: false,

    init() {
      this.drawer = document.getElementById('drawer');
      this.backdrop = document.getElementById('drawerBackdrop');
      this.toggle = document.getElementById('navToggle');
      this.closeBtn = document.getElementById('drawerClose');

      if (!this.drawer || !this.toggle) return;

      this.bindEvents();
    },

    open() {
      this.isOpen = true;
      this.drawer.classList.add('open');
      this.backdrop.classList.add('show');
      document.body.classList.add('no-scroll');
    },

    close() {
      this.isOpen = false;
      this.drawer.classList.remove('open');
      this.backdrop.classList.remove('show');
      document.body.classList.remove('no-scroll');
    },

    bindEvents() {
      this.toggle.addEventListener('click', () => this.open());

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => this.close());
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      this.drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          setTimeout(() => this.close(), 100);
        });
      });
    }
  };

  // ----------------------------------------
  // Scroll Animations
  // ----------------------------------------
  const ScrollAnimations = {
    init() {
      const elements = document.querySelectorAll('[data-animate]');
      if (elements.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
      });

      elements.forEach(el => observer.observe(el));

      // Also support .fade-in-up class
      const fadeElements = document.querySelectorAll('.fade-in-up');
      if (fadeElements.length === 0) return;

      const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      fadeElements.forEach(el => fadeObserver.observe(el));
    }
  };

  // ----------------------------------------
  // Tabs
  // ----------------------------------------
  const Tabs = {
    init() {
      const tabContainers = document.querySelectorAll('.tabs');

      tabContainers.forEach(container => {
        const buttons = container.querySelectorAll('.tab-btn');
        const panels = container.querySelectorAll('.tab-panel');

        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            buttons.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = container.querySelector(`#${target}`);
            if (targetPanel) {
              targetPanel.classList.add('active');
            }
          });
        });
      });
    }
  };

  // ----------------------------------------
  // Accordions
  // ----------------------------------------
  const Accordions = {
    init() {
      const accordions = document.querySelectorAll('.accordion');

      accordions.forEach(accordion => {
        const items = accordion.querySelectorAll('.accordion-item');

        items.forEach(item => {
          const header = item.querySelector('.accordion-header, .accordion-trigger');
          if (!header) return;

          header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            if (isActive) {
              item.classList.remove('active');
              header.setAttribute('aria-expanded', 'false');
            } else {
              item.classList.add('active');
              header.setAttribute('aria-expanded', 'true');
            }
          });

          if (item.classList.contains('active') || header.getAttribute('aria-expanded') === 'true') {
            item.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
          }
        });
      });
    }
  };

  // ----------------------------------------
  // Carousels
  // ----------------------------------------
  const Carousels = {
    init() {
      const carousels = document.querySelectorAll('.carousel');

      carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-nav.prev');
        const nextBtn = carousel.querySelector('.carousel-nav.next');
        const dotsContainer = carousel.querySelector('.carousel-dots');

        if (!track || slides.length === 0) return;

        let currentIndex = 0;
        const totalSlides = slides.length;

        if (dotsContainer) {
          slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
          });
        }

        const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];

        function updateCarousel() {
          track.style.transform = `translateX(-${currentIndex * 100}%)`;
          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
          });
        }

        function goToSlide(index) {
          currentIndex = index;
          if (currentIndex < 0) currentIndex = totalSlides - 1;
          if (currentIndex >= totalSlides) currentIndex = 0;
          updateCarousel();
        }

        if (prevBtn) {
          prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
        }

        let autoPlayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);

        carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carousel.addEventListener('mouseleave', () => {
          autoPlayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
        });
      });
    }
  };

  // ----------------------------------------
  // Count Up Animation
  // ----------------------------------------
  const CountUp = {
    init() {
      const countElements = document.querySelectorAll('.count-up');
      if (!countElements.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseFloat(el.getAttribute('data-target'));
            const duration = parseInt(el.getAttribute('data-duration')) || 2000;
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';
            const decimals = parseInt(el.getAttribute('data-decimals')) || 0;

            this.animate(el, target, duration, prefix, suffix, decimals);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      countElements.forEach(el => observer.observe(el));
    },

    animate(el, target, duration, prefix, suffix, decimals) {
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = target * easeOut;

        el.textContent = prefix + current.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.classList.add('counted');
        }
      }

      requestAnimationFrame(update);
    }
  };

  // ----------------------------------------
  // Progress Bars
  // ----------------------------------------
  const ProgressBars = {
    init() {
      const progressBars = document.querySelectorAll('.progress-bar');
      if (!progressBars.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const fill = entry.target.querySelector('.progress-fill');
            if (fill) {
              const width = fill.getAttribute('data-width') || '100%';
              fill.style.width = width;
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      progressBars.forEach(bar => observer.observe(bar));
    }
  };

  // ----------------------------------------
  // FAB (Floating Action Button)
  // ----------------------------------------
  const FAB = {
    init() {
      const fab = document.querySelector('.fab');
      const fabMenu = document.querySelector('.fab-menu');

      if (!fab || !fabMenu) return;

      fab.addEventListener('click', () => {
        fabMenu.classList.toggle('active');
        fab.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!fab.contains(e.target) && !fabMenu.contains(e.target)) {
          fabMenu.classList.remove('active');
          fab.classList.remove('active');
        }
      });
    }
  };

  // ----------------------------------------
  // Toast Notification
  // ----------------------------------------
  const Toast = {
    show(message, type = 'success', duration = 2500) {
      let toast = document.getElementById('toast');

      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
      }

      const icon = type === 'success' ? 'check_circle' :
                   type === 'error' ? 'error' : 'info';

      toast.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        ${message}
      `;

      toast.classList.add('show');

      setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }
  };

  // ----------------------------------------
  // Copy Functions
  // ----------------------------------------
  window.copyPromptBox = function(element) {
    const content = element.querySelector('.prompt-content');
    if (!content) return;

    const text = content.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
      element.classList.add('copied');
      Toast.show('Copied');
      setTimeout(() => {
        element.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      Toast.show('Copy failed', 'error');
    });
  };

  window.copyToClipboard = function(element) {
    const text = element.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
      element.classList.add('copied');
      Toast.show('Copied');
      setTimeout(() => {
        element.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      Toast.show('Copy failed', 'error');
    });
  };

  // ----------------------------------------
  // TocScrollspy — ページ内目次（.page-toc）の
  // スクロール連動アクティブ化＋スムーススクロール
  // 必須DOM: .page-toc-nav > a[href^="#"]、対応する [id] 要素
  // ----------------------------------------
  const TocScrollspy = {
    links: [],
    sections: [],
    observer: null,

    init() {
      const nav = document.querySelector('.page-toc-nav');
      if (!nav) return;

      this.links = Array.from(nav.querySelectorAll('a[href^="#"]'));
      if (!this.links.length) return;

      this.sections = this.links
        .map((a) => {
          const id = a.getAttribute('href').slice(1);
          const el = document.getElementById(id);
          return el ? { el, link: a } : null;
        })
        .filter(Boolean);

      // スムーススクロール（固定ナビ分のオフセット込み）
      this.links.forEach((a) => {
        a.addEventListener('click', (e) => {
          const href = a.getAttribute('href');
          if (!href || href.charAt(0) !== '#') return;
          const target = document.getElementById(href.slice(1));
          if (!target) return;
          e.preventDefault();
          // モバイルは先に折りたたんでから目標位置を測る（畳んだ分のズレを防ぐ）
          this.collapseOnMobile();
          // 目標が data-animate の translateY で未表示だと getBoundingClientRect が
          // ずれるため、transform に影響されない offsetTop で実レイアウト位置を測る
          let y = 0;
          for (let el = target; el; el = el.offsetParent) y += el.offsetTop;
          const top = y - 84;
          window.scrollTo({ top, behavior: 'smooth' });
          history.replaceState(null, '', href);
        });
      });

      // スクロールスパイ
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) this.setActive(entry.target.id);
            });
          },
          { rootMargin: '-80px 0px -65% 0px', threshold: 0 }
        );
        this.sections.forEach((s) => this.observer.observe(s.el));
      }

      this.setupMobileToggle();
    },

    setActive(id) {
      this.links.forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    },

    setupMobileToggle() {
      const toc = document.querySelector('.page-toc');
      const toggle = document.querySelector('.page-toc-mobile-toggle');
      if (!toc || !toggle) return;
      // 1024px 以下では初期状態を折りたたみに
      if (window.matchMedia('(max-width: 1024px)').matches) {
        toc.classList.add('collapsed');
      }
      toggle.addEventListener('click', () => toc.classList.toggle('collapsed'));
    },

    collapseOnMobile() {
      const toc = document.querySelector('.page-toc');
      if (toc && window.matchMedia('(max-width: 1024px)').matches) {
        toc.classList.add('collapsed');
      }
    }
  };

  // ----------------------------------------
  // PromptCollapse — 長いプロンプトを自動検出して折りたたむ
  // .prompt-content の描画高が閾値超のとき is-collapsible collapsed を付与し、
  // 直後にトグルボタンを挿入。クリックコピーとは stopPropagation で共存
  // ----------------------------------------
  const PromptCollapse = {
    THRESHOLD: 300,

    init() {
      const boxes = document.querySelectorAll('.prompt-box');
      boxes.forEach((box) => {
        const content = box.querySelector('.prompt-content');
        if (!content || box.classList.contains('is-collapsible')) return;
        // 折りたたむ前に全体の描画高を測る
        if (content.scrollHeight <= this.THRESHOLD) return;

        box.classList.add('is-collapsible', 'collapsed');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'prompt-expand-toggle';
        btn.setAttribute('aria-expanded', 'false');
        this.setLabel(btn, false);

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const collapsed = box.classList.toggle('collapsed');
          btn.setAttribute('aria-expanded', String(!collapsed));
          this.setLabel(btn, !collapsed);
        });

        content.insertAdjacentElement('afterend', btn);
      });
    },

    setLabel(btn, expanded) {
      btn.innerHTML = expanded
        ? '<span class="material-symbols-outlined">expand_less</span>たたむ'
        : '<span class="material-symbols-outlined">expand_more</span>全文を表示';
    }
  };

  // ----------------------------------------
  // Lightbox — .screenshot img をタップで全画面表示
  // オーバーレイ内の画像タップで 画面フィット ↔ 実寸（スクロール閲覧）をトグル。
  // ページごとのピンチズーム（表示ずれ）を起こさずに画像内の文字を読めるようにする
  // ----------------------------------------
  const Lightbox = {
    overlay: null,

    init() {
      if (!document.querySelector('.screenshot img')) return;

      this.overlay = document.createElement('div');
      this.overlay.className = 'lightbox';
      this.overlay.hidden = true;
      this.overlay.setAttribute('role', 'dialog');
      this.overlay.setAttribute('aria-label', '画像の拡大表示');
      this.overlay.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="閉じる">×</button>' +
        '<img alt="">';
      document.body.appendChild(this.overlay);

      document.addEventListener('click', (e) => {
        const img = e.target.closest('.screenshot img');
        if (img) this.open(img);
      });

      this.overlay.addEventListener('click', (e) => {
        if (e.target.closest('.lightbox-close')) {
          this.close();
        } else if (e.target.tagName === 'IMG') {
          this.overlay.classList.toggle('is-actual');
        } else {
          this.close();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.overlay.hidden) this.close();
      });
    },

    open(img) {
      const view = this.overlay.querySelector('img');
      view.src = img.currentSrc || img.src;
      view.alt = img.alt || '';
      this.overlay.classList.remove('is-actual');
      this.overlay.hidden = false;
      document.body.classList.add('no-scroll');
    },

    close() {
      this.overlay.hidden = true;
      document.body.classList.remove('no-scroll');
    }
  };

  // ----------------------------------------
  // Initialize
  // ----------------------------------------
  function init() {
    PageTransition.init();
    ThemeManager.init();
    Navigation.init();
    DrawerMenu.init();
    ScrollAnimations.init();
    Tabs.init();
    Accordions.init();
    Carousels.init();
    CountUp.init();
    ProgressBars.init();
    FAB.init();
    TocScrollspy.init();
    PromptCollapse.init();
    Lightbox.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose utilities
  window.HibariWorkshop = {
    Toast,
    ThemeManager
  };

})();
