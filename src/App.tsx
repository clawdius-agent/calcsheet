import { useEditorStore } from './stores/editor';
import { Toolbar } from './components/ui/Toolbar';
import { TextBlockComponent } from './components/blocks/TextBlock';
import { MathBlockComponent } from './components/blocks/MathBlock';
import type { Block } from './types/document';

function BlockRenderer({ block, isSelected }: { block: Block; isSelected: boolean }) {
  switch (block.type) {
    case 'text':
      return <TextBlockComponent block={block} isSelected={isSelected} />;
    case 'math':
      return <MathBlockComponent block={block} isSelected={isSelected} />;
    case 'result':
      // Results are rendered inline with their parent math block
      return null;
    default:
      return null;
  }
}

function App() {
  const { document, selectedBlockId, selectBlock, recalculate } = useEditorStore();

  // Recalculate on mount
  useEffect(() => {
    recalculate();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Toolbar />
      
      <main 
        className="max-w-3xl mx-auto p-8 min-h-screen bg-white shadow-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            selectBlock(null);
          }
        }}
      >
        <div className="space-y-2">
          {document.blocks
            .filter((block) => block.type !== 'result')
            .map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                isSelected={block.id === selectedBlockId}
              />
            ))}
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Variables</h3>
          {Object.entries(document.variables).length === 0 ? (
            <p className="text-gray-400">No variables defined yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(document.variables).map(([name, variable]) => (
                <div key={name} className="font-mono">
                  <span className="text-blue-700">{name}</span>
                  <span className="text-gray-500"> = </span>
                  <span className="text-green-700">{variable.value.toFixed(4)}</span>
                  {variable.unit && (
                    <span className="text-gray-500"> {variable.unit}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Import useEffect
import { useEffect } from 'react';

export default App;
