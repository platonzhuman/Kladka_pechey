window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') {
    console.error('GSAP не загрузился. Проверьте подключение.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(1000, 16);
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
  const isDesktop = window.innerWidth > 992;
  const isMobile = window.innerWidth <= 992;

  let lenis;
  if (isDesktop && typeof Lenis !== 'undefined') {
    try {
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
    } catch (e) {
      console.error('Ошибка инициализации Lenis:', e);
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          if (arguments.length) window.scrollTo(0, value);
          return window.pageYOffset;
        },
      });
    }
  } else {
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) window.scrollTo(0, value);
        return window.pageYOffset;
      },
    });
  }

  if (lenis) {
    lenis.scrollTo(0, { immediate: true, duration: 0 });
  }
  window.scrollTo(0, 0);

document.querySelectorAll('.side-nav-link, .btn').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();

      let target;
      if (href === '#projects') {
        const desktopProjects = document.querySelector('#projects');
        const mobileProjects = document.querySelector('#projects-mobile');
        if (desktopProjects && window.getComputedStyle(desktopProjects).display !== 'none') {
          target = desktopProjects;
        } else if (mobileProjects && window.getComputedStyle(mobileProjects).display !== 'none') {
          target = mobileProjects;
        } else {
          target = desktopProjects || mobileProjects; // fallback
        }
      } else {
        target = document.querySelector(href);
      }

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
  if (document.querySelector('.hero__title-line')) {
    gsap.from('.hero__title-line', {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
    });
  }

  if (document.querySelector('.hero__subtitle')) {
    gsap.from('.hero__subtitle', {
      y: 30,
      opacity: 0,
      delay: 0.6,
      duration: 1,
    });
  }

  if (document.querySelector('.btn')) {
    gsap.from('.btn', {
      scale: 0.8,
      opacity: 0,
      delay: 0.8,
      duration: 0.6,
      ease: 'back.out(1.7)',
    });
  }

  const rotatingCards = gsap.utils.toArray('.rotating-card');
  if (rotatingCards.length) {
    rotatingCards.forEach((card, i) => {
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
  }

  const projectItems = document.querySelectorAll('.projects-desktop .project-item');
  if (projectItems.length) {
    gsap.from(projectItems, {
      scrollTrigger: {
        trigger: '#projects',
        start: 'top 80%',
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
    });
  }

  const sectionTitles = gsap.utils.toArray('.section-title');
  if (sectionTitles.length) {
    sectionTitles.forEach(title => {
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
  }

  if (isDesktop) {
    const desktopProjectItems = document.querySelectorAll('.projects-desktop .project-item');
    desktopProjectItems.forEach(item => {
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

  const whyUsSection = document.querySelector('#why-us');
  const whyContainer = document.querySelector('.why-sticky-container');
  const whyItems = gsap.utils.toArray('.why-sticky');

  if (whyUsSection && whyContainer && whyItems.length) {
    if (isDesktop) {
      ScrollTrigger.create({
        id: 'whyVertical',
        trigger: whyUsSection,
        pin: true,
        pinType: 'fixed',
        anticipatePin: 1,
        start: 'top top',
        end: () => `+=${whyContainer.offsetHeight - window.innerHeight}`,
        scrub: 1,
        animation: gsap.to(whyContainer, {
          y: -(whyContainer.offsetHeight - window.innerHeight),
          ease: 'none',
          force3D: true,
        }),
        invalidateOnRefresh: true,
        fastScrollEnd: true,
      });
    } else {
      whyItems.forEach((item, index) => {
        gsap.fromTo(item,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              end: 'top 30%',
              scrub: 0.5,
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }
  }

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

  setTimeout(() => {
    const projectElements = document.querySelectorAll('.projects-desktop .project-item');
    console.log(`[Fallback] Найдено проектов: ${projectElements.length}`);
    let needShow = false;
    projectElements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const opacity = parseFloat(style.opacity);
      console.log(`[Fallback] Элемент ${index}: opacity=${style.opacity}, transform=${style.transform}, display=${style.display}`);
      if (opacity < 0.1 || style.display === 'none') {
        needShow = true;
      }
    });
    if (needShow) {
      console.warn('[Fallback] Анимация проектов не сработала — принудительный показ');
      gsap.set('.projects-desktop .project-item', { 
        opacity: 1, 
        y: 0, 
        clearProps: 'transform' 
      });
      document.querySelectorAll('.projects-desktop .project-item').forEach(el => {
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
      });
    } else {
      console.log('[Fallback] Все проекты уже видимы.');
    }
  }, 2000);

  setTimeout(() => {
    const projectElements = document.querySelectorAll('.projects-desktop .project-item');
    console.log(`[Fallback2] Найдено проектов: ${projectElements.length}`);
    projectElements.forEach((el, index) => {
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
      el.classList.add('project-item-visible');
      console.log(`[Fallback2] Элемент ${index} принудительно показан`);
    });
    const style = document.createElement('style');
    style.innerHTML = `
      .projects-desktop .project-item {
        opacity: 1 !important;
        transform: none !important;
        visibility: visible !important;
      }
    `;
    document.head.appendChild(style);
  }, 2500);

  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 500);

  ScrollTrigger.refresh();
});