# The RSI Book

An open book on how self-improving AI agents actually work, paired with deep-dive reading notes on the research behind them. Plain static HTML, no build step: open `index.html` in a browser.

## Structure

```
ebook/
  index.html              Chapter 01 — The State of Recursive Self-Improvement (homepage)
  chapters/
    ch02.html             Chapter 02 — Build your first agent improvement loop
  papers/
    index.html            Research Papers — the card list
    <slug>.html           one deep-dive note per paper (e.g. sia.html, harnessx.html)
  code/                   the Python files Chapter 02 builds, step by step
  ADDING-PAPERS.md        how to add a new paper page (conventions + checklist)
  README.md               this file
```

Every page shares one design: light/dark theme toggle, a hideable sidebar, copy buttons and Python syntax highlighting on code blocks, and Mermaid flow diagrams (loaded from a CDN, so diagrams need an internet connection).

## The papers

The Research Papers section collects reading notes on the work behind recursive self-improvement, sorted oldest-first by arXiv date. Each note follows the same shape (problem, method with diagrams, results, mechanism, prior work, limitations, learnings) so the papers are comparable to each other. To add one, follow `ADDING-PAPERS.md`.
