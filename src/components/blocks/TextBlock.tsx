import type { TextBlock } from '../../types/document';
import { useEditorStore } from '../../stores/editor';

interface TextBlockProps {
  block: TextBlock;
  isSelected: boolean;
}

export function TextBlockComponent({ block, isSelected }: TextBlockProps) {
  const { updateBlock, selectBlock } = useEditorStore();

  return (
    <div
      className={`py-2 px-4 rounded-lg transition-colors ${
        isSelected ? 'bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-gray-50'
      }`}
      onClick={() => selectBlock(block.id)}
    >
      {isSelected ? (
        <textarea
          className="w-full bg-transparent resize-none outline-none text-gray-700"
          value={block.content}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
          placeholder="Type text here..."
          autoFocus
          rows={Math.max(1, block.content.split('\n').length)}
        />
      ) : (
        <div className="text-gray-700 whitespace-pre-wrap">
          {block.content || <span className="text-gray-400 italic">Click to add text...</span>}
        </div>
      )}
    </div>
  );
}
