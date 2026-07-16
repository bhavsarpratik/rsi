/*
 * Shared sidebar navigation.
 *
 * Add, remove, or rename chapters and research notes here. Every page mounts
 * this file into its [data-sidebar] element, so navigation stays in sync.
 */
(function () {
  const script = document.currentScript;
  const mount = document.querySelector('[data-sidebar]');
  if (!script || !mount) return;

  const siteRoot = new URL('../', script.src);
  const sections = [
    {
      title: 'Chapters',
      items: [
        { number: '01', label: 'The State of Recursive Self-Improvement', path: 'index.html' },
        { number: '02', label: 'Build your first agent improvement loop', path: 'chapters/ch02.html' },
        { number: '03', label: 'Anatomy of a Recursive Self-Improvement System', path: 'chapters/ch03.html' },
      ],
    },
    {
      title: 'Research',
      items: [
        { number: '01', label: 'autoresearch', path: 'papers/autoresearch.html' },
        { number: '02', label: 'ReasoningBank', path: 'papers/reasoningbank.html' },
        { number: '03', label: 'Agent0', path: 'papers/agent0.html' },
        { number: '04', label: 'ALMA: Meta-learned Memory', path: 'papers/alma.html' },
        { number: '05', label: 'PostTrainBench', path: 'papers/posttrainbench.html' },
        { number: '06', label: 'Bilevel Autoresearch', path: 'papers/bilevel-autoresearch.html' },
        { number: '07', label: 'Agentic Harness Engineering', path: 'papers/agentic-harness-engineering.html' },
        { number: '08', label: 'LIFE-HARNESS', path: 'papers/life-harness.html' },
        { number: '09', label: 'SkillOpt', path: 'papers/skillopt.html' },
        { number: '10', label: 'SIA: Harness & Weight Updates', path: 'papers/sia.html' },
        { number: '11', label: 'FluxMem: Evolving Memory', path: 'papers/fluxmem.html' },
        { number: '12', label: 'Scaling Laws for Harnesses', path: 'papers/scaling-laws-harnesses.html' },
        { number: '13', label: 'Meta-Agent Challenge', path: 'papers/meta-agent-challenge.html' },
        { number: '14', label: 'Continual Learning Bench', path: 'papers/cl-bench.html' },
        { number: '15', label: 'Self-Harness', path: 'papers/self-harness.html' },
        { number: '16', label: 'HarnessX: Harness Foundry', path: 'papers/harnessx.html' },
        { number: '17', label: 'AIDE²: Net-positive RSI', path: 'papers/aide2.html' },
      ],
    },
  ];

  function canonicalPath(value) {
    const url = new URL(value, window.location.href);
    const withoutIndex = decodeURIComponent(url.pathname).replace(/\/index\.html$/, '/');
    return withoutIndex.replace(/\/+$/, '') || '/';
  }

  function numberedLabel(item) {
    const number = document.createElement('span');
    number.className = 'num';
    number.textContent = item.number;
    return number;
  }

  function navigationItem(item, currentPath) {
    const listItem = document.createElement('li');

    if (item.soon) {
      const label = document.createElement('span');
      label.className = 'soon';
      label.append(numberedLabel(item), item.label);

      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = 'Soon';
      label.append(pill);
      listItem.append(label);
      return listItem;
    }

    const target = new URL(item.path, siteRoot);
    const link = document.createElement('a');
    link.href = target.href;
    link.append(numberedLabel(item), item.label);

    if (canonicalPath(target.href) === currentPath) {
      link.className = 'active';
      link.setAttribute('aria-current', 'page');
    }

    listItem.append(link);
    return listItem;
  }

  const currentPath = canonicalPath(window.location.href);
  const fragment = document.createDocumentFragment();

  sections.forEach(function (section, index) {
    const heading = document.createElement('h3');
    if (index > 0) heading.className = 'section-gap';
    heading.textContent = section.title;

    const list = document.createElement('ol');
    section.items.forEach(function (item) {
      list.append(navigationItem(item, currentPath));
    });

    fragment.append(heading, list);
  });

  mount.replaceChildren(fragment);

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function headingId(heading, index) {
    if (heading.id) return heading.id;

    const base = heading.textContent
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `section-${index + 1}`;

    let id = base;
    let suffix = 2;
    while (document.getElementById(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }

    heading.id = id;
    return id;
  }

  function setupPageNavigation() {
    const article = document.querySelector('article');
    if (!article) return;

    const headings = Array.from(article.querySelectorAll('h2'));
    if (!headings.length) return;

    const nav = document.createElement('nav');
    nav.className = 'page-nav';
    nav.setAttribute('aria-label', 'On this page');

    const header = document.createElement('div');
    header.className = 'page-nav__header';

    const title = document.createElement('span');
    title.textContent = 'On this page';

    const progress = document.createElement('span');
    progress.className = 'page-nav__progress';
    progress.textContent = '0%';
    progress.setAttribute('aria-label', 'Reading progress');

    header.append(title, progress);

    const list = document.createElement('ol');
    const links = headings.map(function (heading, index) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const id = headingId(heading, index);
      link.href = `#${id}`;
      link.textContent = heading.textContent.trim();
      link.title = heading.textContent.trim();
      item.append(link);
      list.append(item);
      return link;
    });

    nav.append(header, list);
    document.body.append(nav);

    let scheduled = false;
    function update() {
      scheduled = false;
      const topbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-height')) || 71;
      const marker = topbar + Math.min(window.innerHeight * 0.24, 180);
      let activeIndex = 0;

      headings.forEach(function (heading, index) {
        if (heading.getBoundingClientRect().top <= marker) activeIndex = index;
      });

      links.forEach(function (link, index) {
        const active = index === activeIndex;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100))) : 100;
      progress.textContent = `${percent}%`;
    }

    function scheduleUpdate() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    links.forEach(function (link) {
      link.addEventListener('click', scheduleUpdate);
    });
    update();
  }

  function setupSidebarControlLabels() {
    const shell = document.querySelector('.shell');
    const toc = document.getElementById('toc');
    const desktopButton = document.getElementById('sidebar-toggle');
    if (!shell || !toc || !desktopButton) return;

    function update() {
      const expanded = window.matchMedia('(max-width: 980px)').matches
        ? toc.classList.contains('open')
        : !shell.classList.contains('toc-hidden');
      const action = expanded ? 'Hide contents' : 'Show contents';
      desktopButton.setAttribute('aria-controls', 'toc');
      desktopButton.setAttribute('aria-expanded', String(expanded));
      desktopButton.setAttribute('aria-label', action);
      desktopButton.title = action;
    }

    const observer = new MutationObserver(update);
    observer.observe(shell, { attributes: true, attributeFilter: ['class'] });
    observer.observe(toc, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', update);
    update();
  }

  onReady(function () {
    setupPageNavigation();
    setupSidebarControlLabels();
  });

  function closeMobileDrawer() {
    const toc = document.getElementById('toc');
    const button = document.getElementById('toc-toggle');
    const scrim = document.querySelector('.toc-scrim');

    if (toc) toc.classList.remove('open');
    if (scrim) scrim.classList.remove('show');
    document.body.classList.remove('drawer-open');
    if (button) {
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'Contents';
    }
  }

  const desktop = window.matchMedia('(min-width: 981px)');
  const handleViewportChange = function (event) {
    if (event.matches) closeMobileDrawer();
  };

  if (desktop.addEventListener) desktop.addEventListener('change', handleViewportChange);
  else desktop.addListener(handleViewportChange);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMobileDrawer();
  });
})();
