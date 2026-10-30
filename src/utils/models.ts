export interface GeneratorOptions {
    minLettersPerRow?: number;
    maxLettersPerRow?: number;
    minRowSwaps?: number; // Minimum number of individual row-swap moves to inject
    maxRowSwaps?: number; // Maximum number of individual row-swap moves to inject
}

export interface ScrollyRow {
    id: number;
    letters: string[];
    currentShift: number;
    minShift: number;
    maxShift: number;
    lockedDirection: 'horizontal' | 'vertical' | 'left' | 'right' | null;
}

export interface ScrollyLevelConfig {
    targetWord: string;
    initialMoves: number;
    rows: ScrollyRow[];
}
