import { create, all } from 'mathjs';
import type { CalcSheet, Variable } from '../../types/document';

// Create a custom MathJS instance with units enabled
const math = create(all, {
  number: 'number',
  precision: 64,
});

// Configure default unit system
math.config({
  predictable: false,
});

export interface EvaluationResult {
  success: boolean;
  value?: number;
  unit?: string;
  error?: string;
}

// Common unit aliases for better UX
const unitAliases: Record<string, string> = {
  // Length
  'ft': 'ft',
  'feet': 'ft',
  'foot': 'ft',
  'm': 'm',
  'meter': 'm',
  'meters': 'm',
  'in': 'in',
  'inch': 'in',
  'inches': 'in',
  'yd': 'yd',
  'yard': 'yd',
  'yards': 'yd',
  'mi': 'mi',
  'mile': 'mi',
  'miles': 'mi',
  'km': 'km',
  'kilometer': 'km',
  'kilometers': 'km',
  'cm': 'cm',
  'centimeter': 'cm',
  'centimeters': 'cm',
  'mm': 'mm',
  'millimeter': 'mm',
  'millimeters': 'mm',
  // Area
  'sqft': 'sqft',
  'sq ft': 'sqft',
  'sqm': 'm^2',
  'sq m': 'm^2',
  // Volume
  'gal': 'gal',
  'gallon': 'gal',
  'gallons': 'gal',
  'L': 'L',
  'liter': 'L',
  'liters': 'L',
  'litre': 'L',
  // Pressure
  'psi': 'psi',
  'kPa': 'kPa',
  'kpa': 'kPa',
  'Pa': 'Pa',
  'pa': 'Pa',
  'bar': 'bar',
  'atm': 'atm',
  // Force
  'lbf': 'lbf',
  'N': 'N',
  'newton': 'N',
  'newtons': 'N',
  'kN': 'kN',
  'kn': 'kN',
  // Mass
  'lb': 'lb',
  'lbs': 'lb',
  'pound': 'lb',
  'pounds': 'lb',
  'kg': 'kg',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'g': 'g',
  'gram': 'g',
  'grams': 'g',
  // Temperature
  'degF': 'degF',
  'F': 'degF',
  'fahrenheit': 'degF',
  'degC': 'degC',
  'C': 'degC',
  'celsius': 'degC',
  'K': 'K',
  'kelvin': 'K',
  // Time
  's': 's',
  'sec': 's',
  'second': 's',
  'seconds': 's',
  'min': 'minute',
  'minute': 'minute',
  'minutes': 'minute',
  'h': 'h',
  'hr': 'h',
  'hour': 'h',
  'hours': 'h',
  'day': 'day',
  'days': 'day',
  // Power
  'W': 'W',
  'watt': 'W',
  'watts': 'W',
  'kW': 'kW',
  'kw': 'kW',
  'hp': 'hp',
  'horsepower': 'hp',
  // Energy
  'J': 'J',
  'joule': 'J',
  'joules': 'J',
  'kJ': 'kJ',
  'kj': 'kJ',
  'BTU': 'BTU',
  'btu': 'BTU',
  // Velocity
  'mph': 'mph',
  'kph': 'kph',
  'km/h': 'km/h',
};

// Normalize unit string
export function normalizeUnit(unit: string): string {
  return unitAliases[unit] || unit;
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
    let exprWithoutAssignment = removeAssignment(cleanExpr);
    
    // Handle "to" syntax for unit conversion: "5 ft to m" or "pressure to kPa"
    const toMatch = exprWithoutAssignment.match(/\s+to\s+([a-zA-Z_°\/]+)$/i);
    let targetUnit: string | null = null;
    if (toMatch) {
      targetUnit = normalizeUnit(toMatch[1]);
      exprWithoutAssignment = exprWithoutAssignment.replace(/\s+to\s+[a-zA-Z_°\/]+$/i, '');
    }
    
    // Create scope with current variables (include units)
    const scope: Record<string, math.MathType> = {};
    Object.entries(variables).forEach(([name, variable]) => {
      if (variable.unit) {
        // Recreate the unit value for calculations
        try {
          scope[name] = math.unit(variable.value, variable.unit);
        } catch {
          // Fallback to raw number if unit parsing fails
          scope[name] = variable.value;
        }
      } else {
        scope[name] = variable.value;
      }
    });

    // Evaluate with MathJS
    let result = math.evaluate(exprWithoutAssignment, scope);
    
    // Apply unit conversion if "to" was specified
    if (targetUnit && result && typeof result === 'object' && 'to' in result) {
      try {
        result = (result as math.Unit).to(targetUnit);
      } catch (e) {
        return {
          success: false,
          error: `Cannot convert to ${targetUnit}: ${e instanceof Error ? e.message : 'unknown error'}`,
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
    
    // Handle unit objects from MathJS
    if (result && typeof result === 'object' && 'toNumber' in result) {
      const unitObj = result as math.Unit;
      return {
        success: true,
        value: unitObj.toNumber(),
        unit: unitObj.formatUnits ? unitObj.formatUnits() : '',
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

// Convert a value from one unit to another
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): EvaluationResult {
  try {
    const normalizedFrom = normalizeUnit(fromUnit);
    const normalizedTo = normalizeUnit(toUnit);
    
    const unitValue = math.unit(value, normalizedFrom);
    const converted = unitValue.to(normalizedTo);
    
    return {
      success: true,
      value: converted.toNumber(),
      unit: normalizedTo,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
}

// Parse expression to extract value and unit
export function parseValueWithUnit(expression: string): { value: number; unit: string } | null {
  // Match patterns like "5 m", "10.5 ft", "100 psi", etc.
  const match = expression.match(/^\s*([\d.]+)\s*([a-zA-Z_/^°]+)\s*$/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = normalizeUnit(match[2]);
    return { value, unit };
  }
  return null;
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

// Default empty document - moved from stores/editor.ts
export const createEmptyDocument = (): CalcSheet => ({
  version: "1.0",
  blocks: [
    { id: "block-1", type: "text", content: "# CalcSheet - Engineering Calculator" },
    { id: "block-2", type: "text", content: "## Unit Support Examples" },
    { id: "block-3", type: "math", expression: "length = 5 ft", variableName: "length" },
    { id: "block-4", type: "math", expression: "width = 2 m", variableName: "width" },
    { id: "block-5", type: "math", expression: "area = length * width", variableName: "area" },
    { id: "block-6", type: "text", content: "## Pressure & Force" },
    { id: "block-7", type: "math", expression: "pressure = 100 psi", variableName: "pressure" },
    { id: "block-8", type: "math", expression: "pressure_kPa = pressure to kPa", variableName: "pressure_kPa" },
  ],
  variables: {},
  settings: {
    defaultUnitSystem: "SI",
    decimalPlaces: 4,
    angleUnit: "rad",
  },
});

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
