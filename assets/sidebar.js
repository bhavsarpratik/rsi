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
        { number: '03', label: 'Coming soon', soon: true },
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
})();
