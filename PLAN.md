# Mathcad Alternative Project

## Key Questions to Define Scope

### 1. Core Functionality
- **Live calculations** like Mathcad (change a variable, whole sheet updates)?
- **Unit handling** (ft → m, kPa → psi, etc.) - critical for engineering
- **Math display** - WYSIWYG equation editor or LaTeX/markdown style?
- **Graphing/plotting** - 2D only or 3D too?

### 2. Scope / MVP
- **MVP target**: Basic calculator with live updates, or full engineering workspace?
- **File format**: Save/load files? Export to PDF/Word?
- **Collaboration**: Multi-user editing or single-user docs?

### 3. Technical
- **Computation engine**: 
  - Pure JavaScript (mathjs) - simpler, runs client-side
  - Python WASM (pyodide + sympy/numpy) - more powerful, heavier
- **Storage**: LocalStorage, GitHub Gists, or bring-your-own-backend?
- **Offline support**: PWA/service worker?

### 4. GitHub Pages Constraints
- Static hosting only (no server-side compute)
- Can use WASM for in-browser computation
- 1GB repo size limit

## Proposed Tech Stack Options

### Option A: Lightweight (MathJS)
- React + TypeScript
- MathJS for calculations
- KaTeX for math rendering
- LocalStorage for persistence
- Export to markdown/PDF

### Option B: Python-Powered (Pyodide)
- React/Vue frontend
- Pyodide (Python in WASM) for computation
- SymPy for symbolic math
- Heavier initial load, more powerful

### Option C: Hybrid
- Start with MathJS for MVP
- Plugin architecture for Python compute later

## Next Steps
1. Define MVP scope
2. Choose tech stack
3. Create project repo structure
4. Set up GitHub Pages deployment
5. Build proof-of-concept

---

*Drafted: 2026-02-01*
