import { useEditorStore } from '../../stores/editor';
import { FileDown, FileUp, Plus, Calculator } from 'lucide-react';

export function Toolbar() {
  const { addBlock, exportToFile, importFromFile } = useEditorStore();

  const handleExport = () => {
    const json = exportToFile();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.calcsheet';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.calcsheet,.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          importFromFile(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center gap-2 mr-4">
        <Calculator className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-gray-800">CalcSheet</span>
      </div>
      
      <div className="h-6 w-px bg-gray-300 mx-2" />
      
      <button
        onClick={() => addBlock('math')}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Math
      </button>
      
      <button
        onClick={() => addBlock('text')}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Text
      </button>
      
      <div className="flex-1" />
      
      <button
        onClick={handleImport}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
      >
        <FileUp className="w-4 h-4" />
        Open
      </button>
      
      <button
        onClick={handleExport}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
      >
        <FileDown className="w-4 h-4" />
        Save
      </button>
    </div>
  );
}
