import { useEffect } from 'react';
import { useEditorStore } from './stores/editor';
import { Toolbar } from './components/ui/Toolbar';
import { TextBlockComponent } from './components/blocks/TextBlock';
import { MathBlockComponent } from './components/blocks/MathBlock';
import { createWorkingDocument } from './engine/mathjs/engine';
import type { Block } from './types/document';

function BlockRenderer({ block, isSelected, error }: { 
  block: Block; 
  isSelected: boolean; 
  error?: { message: string; type: string }; 
}) {
  switch (block.type) {
    case 'text':
      return <TextBlockComponent block={block} isSelected={isSelected} />;
    case 'math':
      return (
        <MathBlockComponent 
          block={block} 
          isSelected={isSelected} 
          error={error?.message}
          errorType={error?.type}
        />
      );
    case 'result':
      // Results are rendered inline with their parent math block
      return null;
    default:
      return null;
  }
}

function App() {
  const { document, selectedBlockId, selectBlock, setDocument, recalculate } = useEditorStore();

  // Initialize with working document on first load
  useEffect(() => {
    if (document.blocks.length <= 1) {
      setDocument(createWorkingDocument());
    }
  }, []);

  // Recalculate when document changes
  useEffect(() => {
    recalculate();
  }, [document.blocks]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Toolbar />
      
      <main 
        className="max-w-4xl mx-auto p-8 min-h-screen bg-white shadow-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            selectBlock(null);
          }
        }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CalcSheet</h1>
          <p className="text-gray-600">Engineering calculator with unit support - runs entirely in your browser</p>
        </div>

        <div className="space-y-4">
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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Variables</h3>
            {Object.keys(document.variables).length === 0 ? (
              <p className="text-gray-500 text-sm">No variables defined yet. Create math blocks to define variables.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(document.variables).map(([name, variable]) => (
                  <div key={name} className="font-mono text-sm">
                    <span className="text-blue-700 font-semibold">{name}</span>
                    <span className="text-gray-500"> = </span>
                    <span className="text-green-700 font-semibold">
                      {variable.value.toFixed(document.settings.decimalPlaces)}
                    </span>
                    {variable.unit && (
                      <span className="text-gray-500 ml-1">{variable.unit}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Unit Reference</h3>
            <div className="space-y-1 text-xs text-blue-700">
              <div><span className="font-mono">ft, m, in, cm, mm</span> - Length</div>
              <div><span className="font-mono">psi, kPa, bar, atm</span> - Pressure</div>
              <div><span className="font-mono">lb, kg, g</span> - Mass</div>
              <div><span className="font-mono">lbf, N, kN</span> - Force</div>
              <div><span className="font-mono">W, kW, hp</span> - Power</div>
              <div className="mt-2 text-blue-600 italic">
                Tip: Use "to unit" for conversions, e.g., "5 ft to m"
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Getting Started</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Click anywhere to add a new block</li>
            <li>• Type math expressions like <code className="bg-yellow-100 px-1 rounded">x = 5</code> or <code className="bg-yellow-100 px-1 rounded">area = length * width</code></li>
            <li>• Use units: <code className="bg-yellow-100 px-1 rounded">length = 10 ft</code></li>
            <li>• Convert units: <code className="bg-yellow-100 px-1 rounded">length_m = length to m</code></li>
            <li>• Variables can reference other variables (dependencies are automatically resolved)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;