import { create, all } from 'mathjs';
import type { CalcSheet, Variable, MathBlock } from '../../types/document';

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
  errorType?: 'syntax' | 'undefined-variable' | 'circular-reference' | 'unit-mismatch' | 'math-error';
}

export interface ParsedExpression {
  variableName?: string;
  expression: string;
  referencedVariables: string[];
  hasUnitConversion: boolean;
  targetUnit?: string;
}

// Comprehensive unit aliases
const unitAliases: Record<string, string> = {
  // Length
  'ft': 'ft', 'feet': 'ft', 'foot': 'ft', 'feets': 'ft',
  'm': 'm', 'meter': 'm', 'meters': 'm', 'metre': 'm', 'metres': 'm',
  'in': 'in', 'inch': 'in', 'inches': 'in',
  'yd': 'yd', 'yard': 'yd', 'yards': 'yd',
  'mi': 'mi', 'mile': 'mi', 'miles': 'mi',
  'km': 'km', 'kilometer': 'km', 'kilometers': 'km', 'kilometre': 'km', 'kilometres': 'km',
  'cm': 'cm', 'centimeter': 'cm', 'centimeters': 'cm', 'centimetre': 'cm', 'centimetres': 'cm',
  'mm': 'mm', 'millimeter': 'mm', 'millimeters': 'mm', 'millimetre': 'mm', 'millimetres': 'mm',
  
  // Area
  'sqft': 'sqft', 'sq ft': 'sqft', 'ft2': 'sqft', 'ft²': 'sqft',
  'sqm': 'm^2', 'sq m': 'm^2', 'm2': 'm^2', 'm²': 'm^2',
  
  // Volume  
  'gal': 'gal', 'gallon': 'gal', 'gallons': 'gal',
  'L': 'L', 'liter': 'L', 'liters': 'L', 'litre': 'L', 'litres': 'L',
  'mL': 'mL', 'milliliter': 'mL', 'milliliters': 'mL', 'millilitre': 'mL', 'millilitres': 'mL',
  
  // Pressure
  'psi': 'psi', 'kPa': 'kPa', 'kpa': 'kPa', 'Pa': 'Pa', 'pa': 'Pa',
  'bar': 'bar', 'atm': 'atm', 'mbar': 'mbar', 'torr': 'torr',
  
  // Force
  'lbf': 'lbf', 'N': 'N', 'newton': 'N', 'newtons': 'N', 'kN': 'kN', 'kn': 'kN',
  
  // Mass
  'lb': 'lb', 'lbs': 'lb', 'pound': 'lb', 'pounds': 'lb',
  'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg', 'g': 'g', 'gram': 'g', 'grams': 'g',
  
  // Temperature
  'degF': 'degF', 'F': 'degF', 'fahrenheit': 'degF', '°F': 'degF',
  'degC': 'degC', 'C': 'degC', 'celsius': 'degC', '°C': 'degC',
  'K': 'K', 'kelvin': 'K',
  
  // Time
  's': 's', 'sec': 's', 'second': 's', 'seconds': 's',
  'min': 'minute', 'minute': 'minute', 'minutes': 'minute',
  'h': 'h', 'hr': 'h', 'hour': 'h', 'hours': 'h',
  'day': 'day', 'days': 'day', 'week': 'week', 'weeks': 'week',
  
  // Power
  'W': 'W', 'watt': 'W', 'watts': 'W', 'kW': 'kW', 'kw': 'kW',
  'hp': 'hp', 'horsepower': 'hp',
  
  // Energy
  'J': 'J', 'joule': 'J', 'joules': 'J', 'kJ': 'kJ', 'kj': 'kJ',
  'BTU': 'BTU', 'btu': 'BTU', 'cal': 'cal', 'Cal': 'Cal',
  
  // Velocity
  'mph': 'mph', 'kph': 'kph', 'km/h': 'km/h', 'm/s': 'm/s', 'ft/s': 'ft/s',
};

export function normalizeUnit(unit: string): string {
  return unitAliases[unit.toLowerCase()] || unit;
}

// Robust variable assignment parsing
export function parseVariableAssignment(expression: string): { name: string; expression: string } | null {
  const trimmed = expression.trim();
  
  // Pattern 1: "variable = expression" or "variable: expression"
  const assignmentMatch = trimmed.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]\s*(.+)$/);
  if (assignmentMatch) {
    return {
      name: assignmentMatch[1],
      expression: assignmentMatch[2].trim()
    };
  }
  
  // Pattern 2: Just expression (no assignment)
  return null;
}

// Find all variable references in an expression
export function findVariableReferences(expression: string): string[] {
  const references: string[] = [];
  const variablePattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  let match;
  
  while ((match = variablePattern.exec(expression)) !== null) {
    // Skip if it's part of a unit (e.g., "kPa", "ft")
    if (!unitAliases[match[1].toLowerCase()]) {
      references.push(match[1]);
    }
  }
  
  return [...new Set(references)]; // Remove duplicates
}

// Parse expression for unit conversion
export function parseExpression(expression: string): ParsedExpression {
  let workingExpression = expression.trim();
  let variableName: string | undefined;
  let hasUnitConversion = false;
  let targetUnit: string | undefined;
  
  // Check for variable assignment
  const assignment = parseVariableAssignment(workingExpression);
  if (assignment) {
    variableName = assignment.name;
    workingExpression = assignment.expression;
  }
  
  // Check for unit conversion "to" syntax
  const toMatch = workingExpression.match(/\s+to\s+([a-zA-Z_°\/\^\d]+)$/i);
  if (toMatch) {
    hasUnitConversion = true;
    targetUnit = normalizeUnit(toMatch[1]);
    workingExpression = workingExpression.replace(/\s+to\s+[a-zA-Z_°\/\^\d]+$/i, '').trim();
  }
  
  const referencedVariables = findVariableReferences(workingExpression);
  
  return {
    variableName,
    expression: workingExpression,
    referencedVariables,
    hasUnitConversion,
    targetUnit
  };
}

// Build dependency graph
export function buildDependencyGraph(mathBlocks: MathBlock[]): Map<string, string[]> {
  const dependencies = new Map<string, string[]>();
  
  for (const block of mathBlocks) {
    const parsed = parseExpression(block.expression);
    dependencies.set(block.id, parsed.referencedVariables);
  }
  
  return dependencies;
}

// Topological sort to resolve dependencies
export function topologicalSort(mathBlocks: MathBlock[]): MathBlock[] {
  const dependencies = buildDependencyGraph(mathBlocks);
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: MathBlock[] = [];
  
  function visit(blockId: string): void {
    if (visiting.has(blockId)) {
      throw new Error(`Circular dependency detected involving block: ${blockId}`);
    }
    if (visited.has(blockId)) return;
    
    visiting.add(blockId);
    
    const deps = dependencies.get(blockId) || [];
    for (const depName of deps) {
      // Find the block that defines this variable
      const depBlock = mathBlocks.find(b => {
        const parsed = parseExpression(b.expression);
        return parsed.variableName === depName;
      });
      
      if (depBlock) {
        visit(depBlock.id);
      }
    }
    
    visiting.delete(blockId);
    visited.add(blockId);
    
    const block = mathBlocks.find(b => b.id === blockId);
    if (block) {
      result.push(block);
    }
  }
  
  // Visit all blocks
  for (const block of mathBlocks) {
    if (!visited.has(block.id)) {
      visit(block.id);
    }
  }
  
  return result;
}

// Enhanced expression evaluation
export function evaluateExpression(
  expression: string,
  variables: Record<string, Variable>
): EvaluationResult {
  try {
    const parsed = parseExpression(expression);
    
    // Check for undefined variables
    const undefinedVars = parsed.referencedVariables.filter(varName => !(varName in variables));
    if (undefinedVars.length > 0) {
      return {
        success: false,
        error: `Undefined variables: ${undefinedVars.join(', ')}`,
        errorType: 'undefined-variable'
      };
    }
    
    // Create scope with current variables (include units)
    const scope: Record<string, any> = {};
    
    for (const [name, variable] of Object.entries(variables)) {
      if (variable.unit) {
        try {
          scope[name] = math.unit(variable.value, variable.unit);
        } catch {
          scope[name] = variable.value;
        }
      } else {
        scope[name] = variable.value;
      }
    }
    
    // Evaluate with MathJS
    let result = math.evaluate(parsed.expression, scope);
    
    // Handle numeric results - check for Infinity and NaN
    let numericValue: number | null = null;
    
    if (typeof result === 'number') {
      numericValue = result;
    } else if (result && typeof result === 'object' && 'toNumber' in result) {
      numericValue = (result as math.Unit).toNumber();
    }
    
    if (numericValue !== null) {
      if (Number.isNaN(numericValue)) {
        return {
          success: false,
          error: 'Result is not a number (NaN)',
          errorType: 'math-error'
        };
      }
      
      if (!Number.isFinite(numericValue)) {
        const errorMsg = numericValue > 0 
          ? 'Division by zero (result is Infinity)' 
          : 'Division by zero (result is -Infinity)';
        return {
          success: false,
          error: errorMsg,
          errorType: 'math-error'
        };
      }
    }
    
    // Apply unit conversion if needed
    if (parsed.hasUnitConversion && parsed.targetUnit) {
      if (result && typeof result === 'object' && 'to' in result) {
        try {
          result = (result as math.Unit).to(parsed.targetUnit);
        } catch (e) {
          return {
            success: false,
            error: `Cannot convert to ${parsed.targetUnit}: ${e instanceof Error ? e.message : 'unknown error'}`,
            errorType: 'unit-mismatch'
          };
        }
      } else {
        return {
          success: false,
          error: `Cannot convert "${parsed.expression}" to ${parsed.targetUnit}: not a unit value`,
          errorType: 'unit-mismatch'
        };
      }
    }
    
    // Handle different result types
    if (typeof result === 'number') {
      return {
        success: true,
        value: result,
        unit: '',
      };
    }
    
    if (result && typeof result === 'object' && 'toNumber' in result) {
      const unitObj = result as math.Unit;
      const rawUnit = unitObj.formatUnits ? unitObj.formatUnits() : '';
      return {
        success: true,
        value: unitObj.toNumber(),
        unit: formatUnit(rawUnit),
      };
    }
    
    return {
      success: false,
      error: `Unsupported result type: ${typeof result}`,
      errorType: 'math-error'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: 'syntax'
    };
  }
}

// Enhanced document recalculation with dependency resolution
export function recalculateDocument(sheet: CalcSheet): CalcSheet {
  try {
    const mathBlocks = sheet.blocks.filter(b => b.type === 'math') as MathBlock[];
    const sortedBlocks = topologicalSort(mathBlocks);
    
    const newVariables: Record<string, Variable> = {};
    const newBlocks = [...sheet.blocks];
    
    // Process blocks in dependency order
    for (const block of sortedBlocks) {
      const parsed = parseExpression(block.expression);
      
      if (parsed.variableName) {
        const result = evaluateExpression(block.expression, newVariables);
        
        if (result.success) {
          newVariables[parsed.variableName] = {
            value: result.value!,
            unit: result.unit || '',
            blockId: block.id,
          };
          
          // Add result block
          const resultBlock = {
            id: `result-${block.id}`,
            type: 'result' as const,
            forBlockId: block.id,
            value: result.value!,
            unit: result.unit || '',
            formatted: formatNumber(result.value!, sheet.settings.decimalPlaces),
          };
          
          // Replace or add result block
          const existingIndex = newBlocks.findIndex(b => b.type === 'result' && 'forBlockId' in b && b.forBlockId === block.id);
          if (existingIndex >= 0) {
            newBlocks[existingIndex] = resultBlock;
          } else {
            // Insert result block after the math block
            const blockIndex = newBlocks.findIndex(b => b.id === block.id);
            if (blockIndex >= 0) {
              newBlocks.splice(blockIndex + 1, 0, resultBlock);
            }
          }
        }
      }
    }
    
    return {
      ...sheet,
      blocks: newBlocks,
      variables: newVariables,
    };
    
  } catch (error) {
    console.error('Document recalculation failed:', error);
    return {
      ...sheet,
      variables: {},
      blocks: sheet.blocks.filter(b => b.type !== 'result'),
    };
  }
}

// Format units in engineering notation (in in -> in², ft ft -> ft²)
export function formatUnit(unitStr: string): string {
  if (!unitStr) return '';
  
  // Remove parentheses
  let cleaned = unitStr.replace(/^\(|\)$/g, '');
  
  // Split into individual units
  const units = cleaned.split(/\s+/).filter(u => u);
  
  // Count occurrences of each base unit
  const unitCounts = new Map<string, number>();
  
  for (const unit of units) {
    // Check if it already has a power like m^2 or in^3
    const powerMatch = unit.match(/^([a-zA-Z°]+)\^?(\d+)$/);
    if (powerMatch) {
      const base = powerMatch[1];
      const power = parseInt(powerMatch[2], 10);
      unitCounts.set(base, (unitCounts.get(base) || 0) + power);
    } else {
      unitCounts.set(unit, (unitCounts.get(unit) || 0) + 1);
    }
  }
  
  // Build formatted string with superscripts
  const parts: string[] = [];
  for (const [unit, count] of unitCounts) {
    if (count === 1) {
      parts.push(unit);
    } else if (count === 2) {
      parts.push(`${unit}²`);
    } else if (count === 3) {
      parts.push(`${unit}³`);
    } else {
      parts.push(`${unit}^${count}`);
    }
  }
  
  return parts.join(' ');
}

// Enhanced number formatting
export function formatNumber(value: number, decimalPlaces: number): string {
  if (!isFinite(value)) return 'Error';
  if (Math.abs(value) < 1e-10) return '0';
  
  // Use scientific notation for very large/small numbers
  if (Math.abs(value) > 1e6 || (Math.abs(value) < 1e-4 && value !== 0)) {
    return value.toExponential(Math.max(0, decimalPlaces - 1));
  }
  
  return value.toFixed(decimalPlaces).replace(/\.?0+$/, '');
}

// Create a better default document with working examples
export const createWorkingDocument = (): CalcSheet => ({
  version: "1.0",
  blocks: [
    { id: "block-1", type: "text" as const, content: "# CalcSheet - Engineering Calculator" },
    { id: "block-2", type: "text" as const, content: "## Basic Variables" },
    { id: "block-3", type: "math" as const, expression: "x = 5" },
    { id: "block-4", type: "math" as const, expression: "y = x + 3" },
    { id: "block-5", type: "text" as const, content: "## Unit Examples" },
    { id: "block-6", type: "math" as const, expression: "length = 10 ft" },
    { id: "block-7", type: "math" as const, expression: "width = 2 m" },
    { id: "block-8", type: "math" as const, expression: "area = length * width" },
    { id: "block-9", type: "math" as const, expression: "area_sqft = area to sqft" },
    { id: "block-10", type: "text" as const, content: "## Pressure & Force" },
    { id: "block-11", type: "math" as const, expression: "pressure = 100 psi" },
    { id: "block-12", type: "math" as const, expression: "force = pressure * area" },
  ],
  variables: {},
  settings: {
    defaultUnitSystem: "mixed",
    decimalPlaces: 4,
    angleUnit: "rad",
  },
});