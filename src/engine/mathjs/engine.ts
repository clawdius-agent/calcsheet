import { create, all } from 'mathjs';
import type { CalcSheet, Variable, MathBlock } from '../types/document';

// Create a custom MathJS instance with units enabled
const math = create(all, {
  number: 'number',
  precision: 64,
});

export interface EvaluationResult {
  success: boolean;
  value?: number;
  unit?: string;
  error?: string;
}

// Extract variable name from expression like "x = 5" or "x: 5"
export function extractVariableName(expression: string): string | null {
  const match = expression.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[=:]\s*/);
  return match ? match[1] : null;
}

// Remove variable assignment from expression
export function removeAssignment(expression: string): string {
  return expression.replace(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[=:]\s*/, '');
}

// Evaluate a math expression with current variable scope
export function evaluateExpression(
  expression: string,
  variables: Record<string, Variable>
): EvaluationResult {
  try {
    // Clean up the expression
    const cleanExpr = expression.trim();
    
    // Handle empty expression
    if (!cleanExpr) {
      return { success: false, error: 'Empty expression' };
    }

    // Get the expression without variable assignment
    const exprWithoutAssignment = removeAssignment(cleanExpr);
    
    // Create scope with current variables
    const scope: Record<string, number> = {};
    Object.entries(variables).forEach(([name, variable]) => {
      scope[name] = variable.value;
    });

    // Evaluate with MathJS
    const result = math.evaluate(exprWithoutAssignment, scope);
    
    // Handle different result types
    if (typeof result === 'number') {
      return {
        success: true,
        value: result,
        unit: '',
      };
    }
    
    // Handle unit objects from MathJS
    if (result && typeof result === 'object' && 'toNumber' in result) {
      return {
        success: true,
        value: result.toNumber(),
        unit: result.formatUnits ? result.formatUnits() : '',
      };
    }

    return {
      success: false,
      error: `Unsupported result type: ${typeof result}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Recalculate all blocks in dependency order
export function recalculateDocument(sheet: CalcSheet): CalcSheet {
  const newVariables: Record<string, Variable> = {};
  const newBlocks = sheet.blocks.map((block) => {
    if (block.type === 'math') {
      const result = evaluateExpression(block.expression, newVariables);
      
      if (result.success && block.variableName) {
        newVariables[block.variableName] = {
          value: result.value!,
          unit: result.unit || '',
          blockId: block.id,
        };
        
        // Return a result block for display
        return {
          id: `result-${block.id}`,
          type: 'result' as const,
          forBlockId: block.id,
          value: result.value!,
          unit: result.unit || '',
          formatted: formatNumber(result.value!, sheet.settings.decimalPlaces),
        };
      }
    }
    return block;
  });

  return {
    ...sheet,
    blocks: newBlocks,
    variables: newVariables,
  };
}

// Format a number with specified decimal places
export function formatNumber(value: number, decimalPlaces: number): string {
  if (!isFinite(value)) return 'Error';
  if (Math.abs(value) < 1e-10) return '0';
  
  // Use scientific notation for very large/small numbers
  if (Math.abs(value) > 1e6 || (Math.abs(value) < 1e-4 && value !== 0)) {
    return value.toExponential(Math.max(0, decimalPlaces - 1));
  }
  
  return value.toFixed(decimalPlaces).replace(/\.?0+$/, '');
}

// Parse unit from expression (e.g., "5 m" or "10 ft")
export function parseUnit(expression: string): string | null {
  const unitMatch = expression.match(/\s+([a-zA-Z]+)$/);
  return unitMatch ? unitMatch[1] : null;
}
