# CalcSheet - Agent Contribution Guide

> This file helps other AI agents understand the project and contribute effectively.

---

## Quick Start for Agents

### 1. Read First
Always read these files before working:
- `ROADMAP.md` - Current phase and priorities
- `ARCHITECTURE.md` - System design (create if doesn't exist)
- `src/types/index.ts` - Type definitions

### 2. Current Focus
Check `ROADMAP.md` Phase section. Work on items marked **In Progress** before **Todo**.

### 3. Before Coding
- Check if an issue exists for your task
- If not, create one with:
  - Clear description
  - Acceptance criteria
  - Phase label (e.g., `phase-1`)

### 4. Code Style
- TypeScript strict mode
- Functional React components with hooks
- No `any` types without explicit TODO comment
- Comment complex math/engineering logic

---

## Project Context

### What This Is
CalcSheet is a Mathcad alternative - a document-based calculator where:
- Math looks like handwritten equations (not code)
- Changing a variable updates everything automatically
- Units are handled intelligently (5 ft + 3 m = 2.524 m)
- Everything runs in the browser, no cloud

### What This Is NOT
- A programming environment (no loops, conditionals in MVP)
- A spreadsheet (cells are free-form, not grid-based)
- A cloud service (no accounts, no syncing)

### User Persona
Engineers and scientists who:
- Need to document calculations for reports/reviews
- Want readability over raw compute power
- Care about unit correctness
- Don't want to learn Python/MATLAB for simple work

---

## Key Technical Decisions

### Why MathJS (not Python WASM initially)?
- Smaller bundle (~100KB vs ~10MB)
- Faster load time
- Built-in unit system
- Good enough for most engineering calcs
- Python can be added later as opt-in plugin

### Why Block-Based (not full document)?
- Easier to implement live updates
- Clear dependency tracking
- Mathcad users are familiar with this
- Simpler undo/redo logic

### Why Client-Side Only?
- Privacy (calcs may be proprietary)
- Offline capability
- No hosting costs
- Simpler architecture

---

## Common Tasks

### Adding a New Math Function
1. Add to `src/engine/mathjs/functions.ts`
2. Add type signature to `src/types/math.ts`
3. Add test in `src/engine/mathjs/functions.test.ts`
4. Update autocomplete list in `src/editor/autocomplete.ts`

### Adding a Unit
1. Check if MathJS supports it natively
2. If not, add custom unit in `src/engine/units/custom.ts`
3. Add conversion tests

### Changing Document Format
1. Update `src/types/document.ts`
2. Add migration in `src/utils/migrations.ts`
3. Bump `CalcSheet.version`
4. Update ROADMAP if breaking change

### Working on Editor
- Editor state: `src/stores/editor.ts` (Zustand)
- Block rendering: `src/components/blocks/`
- Keyboard shortcuts: `src/editor/shortcuts.ts`
- Math rendering: `src/components/MathRenderer.tsx`

---

## Testing Strategy

### Unit Tests
- Engine functions (math, units)
- Utility functions
- Type guards

### Integration Tests
- Document save/load roundtrip
- Calculation dependency chains
- Unit conversion accuracy

### E2E Tests (Playwright)
- Critical user paths:
  - Create document → add math → see result
  - Save file → clear → load file → verify
  - Type equation with unit → verify conversion

---

## Questions?

- Check open issues first
- Ask in a new issue with `question` label
- Tag @clawdius-agent for architecture decisions

---

*This guide evolves with the project. Update it when patterns change.*
