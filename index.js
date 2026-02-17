// index.js — финальная версия с оптимизацией для мобильных

window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') {
    console.error('GSAP не загрузился. Проверьте подключение.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ======================
  // ГЛОБАЛЬНЫЕ НАСТРОЙКИ ПРОИЗВОДИТЕЛЬНОСТИ
  // ======================
  gsap.ticker.lagSmoothing(1000, 16);
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
  ScrollTrigger.normalizeScroll(true); // улучшает обработку касаний

  // ======================
  // ОТКЛЮЧАЕМ ВОССТАНОВЛЕНИЕ ПРОКРУТКИ БРАУЗЕРОМ
  // ======================
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // ======================
  // LOADING SCREEN
  // ======================
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }

  // ======================
  // ОПРЕДЕЛЯЕМ ТИП УСТРОЙСТВА
  // ======================
  const isDesktop = window.innerWidth > 992;

  // ======================
  // LENIS — ТОЛЬКО НА ДЕСКТОПЕ (НА МОБИЛЬНЫХ НЕ ИНИЦИАЛИЗИРУЕМ)
  // ======================
  let lenis;
  if (isDesktop) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value);
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed',
    });
  } else {
    // На мобильных — обычный скролл
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          window.scrollTo(0, value);
        }
        return window.pageYOffset;
      },
    });
  }

  // ======================
  // ПРИНУДИТЕЛЬНАЯ ПРОКРУТКА В НАЧАЛО
  // ======================
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, duration: 0 });
  }
  window.scrollTo(0, 0);

  // ======================
  // НАВИГАЦИЯ ПО ЯКОРЯМ
  // ======================
  document.querySelectorAll('.side-nav-link, .btn').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          if (lenis) {
            lenis.scrollTo(target, { offset: 0, duration: 1.5 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // ======================
  // АНИМАЦИИ (РАБОТАЮТ ВЕЗДЕ)
  // ======================
  gsap.from('.hero__title-line', {
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
  });
  gsap.from('.hero__subtitle', {
    y: 30,
    opacity: 0,
    delay: 0.6,
    duration: 1,
  });
  gsap.from('.btn', {
    scale: 0.8,
    opacity: 0,
    delay: 0.8,
    duration: 0.6,
    ease: 'back.out(1.7)',
  });

  gsap.utils.toArray('.rotating-card').forEach((card, i) => {
    gsap.fromTo(card,
      { rotation: i % 2 === 0 ? -10 : 10, y: 50 },
      {
        rotation: 0,
        y: 0,
        scrollTrigger: {
          trigger: '.rotating-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      }
    );
  });

  // Анимация появления проектов
  gsap.from('.project-item', {
    scrollTrigger: {
      trigger: '#projects',
      start: 'top 80%',
    },
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
  });

  // Заголовки секций
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
      },
      opacity: 0,
      y: 40,
      duration: 1,
    });
  });

  // ======================
  // ЭФФЕКТ ДЛЯ ПРОЕКТОВ (горизонтальный скролл на мобильных)
  // ======================
  const projectsGrid = document.querySelector('.projects-grid');
  const projectItems = document.querySelectorAll('.project-item');

  function updateProjectOpacity() {
    if (window.innerWidth <= 992) {
      const containerRect = projectsGrid.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      projectItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        const maxDistance = containerRect.width / 2 + itemRect.width / 2;
        let opacity = 1 - distance / maxDistance;
        opacity = Math.min(1, Math.max(0.4, opacity)); // не уходим в полную прозрачность
        gsap.set(item, { opacity });
      });
    } else {
      gsap.set(projectItems, { opacity: 1 });
    }
  }

  if (projectsGrid && projectItems.length) {
    updateProjectOpacity();
    projectsGrid.addEventListener('scroll', updateProjectOpacity);
    window.addEventListener('resize', updateProjectOpacity);
  }

  // ======================
  // ЭФФЕКТЫ НАВЕДЕНИЯ (ТОЛЬКО ДЕСКТОП)
  // ======================
  if (isDesktop) {
    projectItems.forEach(item => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(item, {
          rotationY: x * 10,
          rotationX: -y * 10,
          transformPerspective: 500,
          duration: 0.5,
          overwrite: true,
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.5,
        });
      });
    });

    const rotatingContainer = document.querySelector('.rotating-container');
    if (rotatingContainer) {
      rotatingContainer.addEventListener('mousemove', (e) => {
        const rect = rotatingContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to('.rotating-card', {
          rotationY: x * 10,
          rotationX: -y * 10,
          transformPerspective: 500,
          duration: 0.5,
          overwrite: true,
        });
      });

      rotatingContainer.addEventListener('mouseleave', () => {
        gsap.to('.rotating-card', {
          rotationY: 0,
          rotationX: 0,
          duration: 0.5,
        });
      });
    }
  }

  // ======================
  // ВЕРТИКАЛЬНЫЙ СТЕК "ПОЧЕМУ МЫ" — РАБОТАЕТ НА ВСЕХ УСТРОЙСТВАХ
  // ======================
  const whyUsSection = document.querySelector('#why-us');
  const whyContainer = document.querySelector('.why-sticky-container');
  const whyItems = gsap.utils.toArray('.why-sticky');

  if (whyUsSection && whyContainer && whyItems.length) {
    function initVerticalStack() {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.id === 'whyVertical') trigger.kill();
      });

      // Настройки для мобильных и десктопа
      const isDesktop = window.innerWidth > 992;
      const scrubValue = isDesktop ? 1 : 0.2; // на мобильных минимальная плавность
      const pinType = isDesktop ? 'fixed' : 'transform'; // transform легче

      ScrollTrigger.create({
        id: 'whyVertical',
        trigger: whyUsSection,
        pin: true,
        pinType: pinType,
        anticipatePin: 1,
        start: 'top top',
        end: () => `+=${whyContainer.offsetHeight - window.innerHeight}`,
        scrub: scrubValue,
        animation: gsap.to(whyContainer, {
          y: -(whyContainer.offsetHeight - window.innerHeight),
          ease: 'none',
          force3D: true,
        }),
        invalidateOnRefresh: true,
        fastScrollEnd: true,
      });
    }

    initVerticalStack();

    window.addEventListener('resize', () => {
      setTimeout(() => {
        initVerticalStack();
        ScrollTrigger.refresh();
      }, 200);
    });
  }

  // ======================
  // БУРГЕР-МЕНЮ
  // ======================
  const burger = document.querySelector('.burger');
  const sideMenu = document.querySelector('.side-menu');
  if (burger && sideMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      sideMenu.classList.toggle('active');
    });

    document.querySelectorAll('.side-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        sideMenu.classList.remove('active');
      });
    });
  }

  ScrollTrigger.refresh();
});