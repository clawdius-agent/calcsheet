# CalcSheet - Product Roadmap

> A web-based Mathcad alternative that runs entirely in your browser.
> All computation is local. Your data never leaves your machine.

---

## 🎯 Vision

Engineers and scientists need a tool that combines the readability of handwritten calculations with the power of live computation—without vendor lock-in or cloud dependencies.

CalcSheet documents are:
- **Live**: Change a variable, see results update instantly
- **Readable**: Math looks like math, not code
- **Portable**: Save as `.calcsheet` files, open anywhere
- **Private**: Everything stays on your machine

---

## 📋 Current Status

**Phase**: Planning  
**Target MVP**: Q1 2026  
**Repo**: TBD

---

## 🛣️ Roadmap

### Phase 0: Foundation (Week 1-2) ✅ COMPLETE
**Goal**: Project setup, tech decisions, proof-of-concept

- [x] Create GitHub repo with GitHub Pages auto-deploy
- [x] Set up React + TypeScript + Vite project structure
- [x] Choose and integrate math engine (MathJS evaluation)
- [x] Basic WYSIWYG editor prototype (block-based, not full equations yet)
- [x] Decision: Equation rendering library (KaTeX vs MathJax vs custom)

**Deliverable**: ✅ Repo with live demo on GitHub Pages showing basic calculation blocks

**Live Demo**: https://clawdius-agent.github.io/calcsheet/
**Date Completed**: 2026-02-01

---

### Phase 1: MVP - Core Engine (Week 3-6)
**Goal**: Working calculation engine with live updates

- [ ] Block-based document structure (text, math, result blocks)
- [ ] Live variable evaluation with dependency tracking
- [ ] Basic unit support (SI + common imperial units)
- [ ] Unit conversion in expressions (`5 ft + 3 m` → result in chosen units)
- [ ] Save/load `.calcsheet` files to local disk
- [ ] Error handling (undefined vars, unit mismatches, division by zero)

**Deliverable**: Users can create a document, do calculations with units, save/load files

---

### Phase 2: Math Editor (Week 7-10)
**Goal**: WYSIWYG equation editing that feels like Mathcad

- [ ] Visual equation builder with cursor/selection
- [ ] Keyboard shortcuts for common symbols:
  - `Ctrl+Shift+P` → π
  - `Ctrl+Shift+S` → Σ (summation)
  - `Ctrl+Shift+R` → √ (square root)
  - `Ctrl+Shift+I` → ∫ (integral)
  - Typing `sqrt(` auto-converts to √
  - Typing `pi` auto-converts to π
- [ ] Fractions, exponents, subscripts visually editable
- [ ] Matrix editor (2D grid input)
- [ ] Function autocomplete (sin, cos, log, etc.)

**Deliverable**: Users can type math naturally with visual feedback

---

### Phase 3: Plotting (Week 11-13)
**Goal**: 2D plotting capabilities

- [ ] XY line plots from data or functions
- [ ] Multiple series per plot
- [ ] Configurable axes (linear/log, limits, labels)
- [ ] Plot styling (colors, markers, lines)
- [ ] Interactivity: zoom, pan, hover for values
- [ ] Export plots as PNG/SVG

**Deliverable**: Users can visualize data and functions

---

### Phase 4: Polish & Advanced Features (Week 14-18)
**Goal**: Professional-grade tool

- [ ] Undo/redo history
- [ ] Copy/paste blocks between documents
- [ ] Document templates (engineering standards)
- [ ] Export to PDF with proper formatting
- [ ] Print stylesheets
- [ ] Dark mode
- [ ] Mobile-responsive layout (viewing at minimum)
- [ ] Keyboard navigation throughout

**Deliverable**: Tool is usable for real engineering work

---

### Phase 5: Extensibility (Future)
**Goal**: Power user features

- [ ] Custom function definitions
- [ ] User-defined units
- [ ] Plugin system for computation backends (Python WASM opt-in)
- [ ] Collaboration features (Git-based versioning?)
- [ ] Standard library of engineering calculations

---

## 🏗️ Technical Architecture

### Core Principles
1. **Privacy First**: No data sent to servers
2. **Performance**: 60fps interactions, <2s initial load
3. **Compatibility**: Works in modern browsers, no install required
4. **Portability**: Documents are JSON, easy to parse/transform

### Tech Stack (Proposed)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React + TypeScript | Familiar, typed, good ecosystem |
| **Build** | Vite | Fast dev, easy GH Pages deploy |
| **Math Engine** | MathJS (initial) | Pure JS, fast, good unit support |
| **Equation Render** | KaTeX | Fast, supports most math notation |
| **State Management** | Zustand | Simple, no boilerplate |
| **Styling** | Tailwind CSS | Utility-first, fast iteration |
| **Plots** | Plotly.js or Chart.js | Interactive, well-documented |

### Computation Engine Details

**MathJS** (Phase 0-4):
- Built-in unit system
- Customizable parser
- Good enough for 90% of engineering calcs
- Limitations: No symbolic math (solving, simplifying)

**Future Python Option** (Phase 5+):
- Pyodide (Python WASM) for SymPy integration
- Opt-in per document (heavy ~10MB load)
- Enables: symbolic solving, advanced stats, custom libraries

### Document Format

```typescript
interface CalcSheet {
  version: "1.0";
  blocks: Block[];
  variables: Record<string, { value: number; unit: string }>;
  settings: {
    defaultUnitSystem: "SI" | "imperial" | "mixed";
    decimalPlaces: number;
  };
}

type Block = 
  | { type: "text"; content: string }
  | { type: "math"; expression: string; id: string }
  | { type: "result"; forBlock: string; value: number; unit: string }
  | { type: "plot"; data: PlotData };
```

---

## 👥 For Contributors (Agent-Friendly)

### How to Pick Up Work

1. **Check the roadmap** above for current phase
2. **Look for open issues** labeled by phase
3. **Comment on an issue** to claim it
4. **Create a PR** with:
   - Clear description of changes
   - Screenshots/GIFs for UI changes
   - Test coverage for logic

### Key Files

```
/src
  /components       # React components
  /engine           # Calculation engine
    /mathjs         # MathJS integration
    /units          # Unit handling
  /editor           # WYSIWYG editor
  /types            # TypeScript definitions
  /utils            # Helpers
/public
  /templates        # Document templates
```

### Development Setup

```bash
git clone <repo>
cd calcsheet
npm install
npm run dev     # Local dev server
npm run build   # Production build (to dist/)
npm run deploy  # Push to gh-pages branch
```

---

## 🎨 Design Guidelines

- **Whitespace**: Generous padding, breathable layout
- **Typography**: Math uses serif (Latin Modern Math), UI uses sans-serif
- **Colors**: Subtle grays for UI, black for math, blue for interactive elements
- **Feedback**: Live updates should feel instant, loading states for heavy compute

---

## 🔒 Security & Privacy

- No external API calls for calculations
- No analytics without explicit opt-in
- CSP headers to prevent XSS
- No eval() of user input (use parser)

---

## 📜 License

MIT - Open source, free to use, contributions welcome.

---

*Last updated: 2026-02-01*
*Next review: After Phase 0 completion*
