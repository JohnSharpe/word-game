export interface GeneratorOptions {
    minLettersPerRow?: number;
    maxLettersPerRow?: number;
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