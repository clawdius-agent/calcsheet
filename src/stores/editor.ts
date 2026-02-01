import { create } from 'zustand';
import type { CalcSheet, Block, MathBlock, TextBlock } from '../types/document';
import { createEmptyDocument, recalculateDocument } from '../engine/mathjs/engine';

interface EditorState {
  document: CalcSheet;
  selectedBlockId: string | null;
  
  // Actions
  setDocument: (doc: CalcSheet) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  addBlock: (type: Block['type'], afterId?: string) => void;
  deleteBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  recalculate: () => void;
  
  // Import/Export
  exportToFile: () => string;
  importFromFile: (json: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  document: createEmptyDocument(),
  selectedBlockId: null,

  setDocument: (doc) => set({ document: doc }),

  updateBlock: (id, updates) => {
    set((state) => {
      const newBlocks = state.document.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } as Block : block
      );
      return {
        document: { ...state.document, blocks: newBlocks },
      };
    });
    get().recalculate();
  },

  addBlock: (type, afterId) => {
    set((state) => {
      const newId = `block-${Date.now()}`;
      let newBlock: Block;
      
      switch (type) {
        case 'text':
          newBlock = { id: newId, type: 'text', content: '' } as TextBlock;
          break;
        case 'math':
          newBlock = { id: newId, type: 'math', expression: '' } as MathBlock;
          break;
        default:
          newBlock = { id: newId, type: 'text', content: '' } as TextBlock;
      }

      const blocks = [...state.document.blocks];
      if (afterId) {
        const index = blocks.findIndex((b) => b.id === afterId);
        blocks.splice(index + 1, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }

      return {
        document: { ...state.document, blocks },
        selectedBlockId: newId,
      };
    });
  },

  deleteBlock: (id) => {
    set((state) => ({
      document: {
        ...state.document,
        blocks: state.document.blocks.filter((b) => b.id !== id),
      },
    }));
    get().recalculate();
  },

  selectBlock: (id) => set({ selectedBlockId: id }),

  recalculate: () => {
    set((state) => ({
      document: recalculateDocument(state.document),
    }));
  },

  exportToFile: () => {
    return JSON.stringify(get().document, null, 2);
  },

  importFromFile: (json) => {
    try {
      const doc = JSON.parse(json) as CalcSheet;
      set({ document: doc });
      get().recalculate();
    } catch (e) {
      console.error('Failed to import document:', e);
    }
  },
}));
