import { useState, useEffect } from 'react';
import type { MathBlock } from '../../types/document';
import { useEditorStore } from '../../stores/editor';
import { parseExpression } from '../../engine/mathjs/engine';
import 'katex/dist/katex.min.css';

interface MathBlockProps {
  block: MathBlock;
  isSelected: boolean;
  error?: string;
  errorType?: string;
}

export function MathBlockComponent({ block, isSelected, error, errorType }: MathBlockProps) {
  const { updateBlock, selectBlock, document } = useEditorStore();
  const [localExpression, setLocalExpression] = useState(block.expression);
  const [showError, setShowError] = useState(false);

  // Update local state when block changes from outside
  useEffect(() => {
    setLocalExpression(block.expression);
  }, [block.expression, block.id]);

  // Show error temporarily when it changes
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleBlur = () => {
    const trimmed = localExpression.trim();
    
    if (trimmed !== block.expression) {
      const parsed = parseExpression(trimmed);
      updateBlock(block.id, { 
        expression: trimmed,
        variableName: parsed.variableName,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalExpression(block.expression);
      selectBlock(null);
    }
  };

  // Find the result block for this math block
  const resultBlock = document.blocks.find(
    (b) => b.type === 'result' && 'forBlockId' in b && b.forBlockId === block.id
  );

  const getErrorColor = () => {
    switch (errorType) {
      case 'undefined-variable': return 'text-orange-600';
      case 'circular-reference': return 'text-red-600';
      case 'unit-mismatch': return 'text-purple-600';
      case 'syntax': return 'text-red-600';
      default: return 'text-red-600';
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'undefined-variable': return '⚠️';
      case 'circular-reference': return '🔄';
      case 'unit-mismatch': return '⚖️';
      case 'syntax': return '❌';
      default: return '❌';
    }
  };

  const displayExpression = () => {
    if (!block.expression) {
      return <span className="text-gray-400 italic">Click to add equation...</span>;
    }
    
    const parsed = parseExpression(block.expression);
    const varName = parsed.variableName;
    
    return (
      <div className="flex items-center gap-4 flex-wrap">
        {varName && (
          <span className="font-mono text-blue-700 font-semibold">{varName} =</span>
        )}
        <span className="font-mono text-gray-800">{parsed.expression}</span>
        {parsed.hasUnitConversion && parsed.targetUnit && (
          <span className="text-purple-600 text-sm">to {parsed.targetUnit}</span>
        )}
        {resultBlock && 'value' in resultBlock && (
          <span className="font-mono text-green-700 font-semibold">
            = {resultBlock.formatted}
            {resultBlock.unit && <span className="text-gray-500 ml-1">{resultBlock.unit}</span>}
          </span>
        )}
        {error && showError && (
          <div className={`text-sm ${getErrorColor()} bg-red-50 px-2 py-1 rounded flex items-center gap-1`}>
            <span>{getErrorIcon()}</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`py-3 px-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-50 ring-2 ring-blue-200 shadow-sm' 
          : error 
            ? 'bg-red-50 hover:bg-red-100' 
            : 'hover:bg-gray-50'
      }`}
      onClick={() => selectBlock(block.id)}
    >
      {isSelected ? (
        <div className="space-y-2">
          <input
            type="text"
            className={`w-full bg-transparent outline-none font-mono text-gray-800 ${
              error ? 'text-red-600' : ''
            }`}
            value={localExpression}
            onChange={(e) => setLocalExpression(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="e.g., x = 5, y = x + 2, area = length * width"
            autoFocus
          />
          {error && (
            <div className={`text-xs ${getErrorColor()} flex items-center gap-1`}>
              <span>{getErrorIcon()}</span>
              <span>{error}</span>
            </div>
          )}
          <div className="text-xs text-gray-500">
            Tips: Use "=" or ":" for assignment, "to unit" for conversions
          </div>
        </div>
      ) : (
        displayExpression()
      )}
    </div>
  );
}