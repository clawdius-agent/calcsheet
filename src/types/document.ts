// CalcSheet Document Types

export interface CalcSheet {
  version: "1.0";
  blocks: Block[];
  variables: Record<string, Variable>;
  settings: DocumentSettings;
}

export interface Variable {
  value: number;
  unit: string;
  blockId: string;
}

export interface DocumentSettings {
  defaultUnitSystem: "SI" | "imperial" | "mixed";
  decimalPlaces: number;
  angleUnit: "rad" | "deg";
}

export type Block = 
  | TextBlock
  | MathBlock
  | ResultBlock;

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export type BlockType = "text" | "math" | "result";

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
}

export interface MathBlock extends BaseBlock {
  type: "math";
  expression: string;
  variableName?: string;
}

export interface ResultBlock extends BaseBlock {
  type: "result";
  forBlockId: string;
  value: number;
  unit: string;
  formatted: string;
}

// Default empty document
export const createEmptyDocument = (): CalcSheet => ({
  version: "1.0",
  blocks: [
    { id: "block-1", type: "text", content: "# CalcSheet Demo" },
    { id: "block-2", type: "math", expression: "x = 5", variableName: "x" },
    { id: "block-3", type: "math", expression: "y = x * 2 + 3", variableName: "y" },
  ],
  variables: {},
  settings: {
    defaultUnitSystem: "SI",
    decimalPlaces: 4,
    angleUnit: "rad",
  },
});
