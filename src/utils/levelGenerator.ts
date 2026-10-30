import type { GeneratorOptions, ScrollyLevelConfig, ScrollyRow } from "./models";

export function generateScrollyLevel(
    targetWord: string, 
    options: GeneratorOptions = {}
  ): ScrollyLevelConfig {
    if (!targetWord || typeof targetWord !== 'string') {
      throw new Error("Target word must be a valid non-empty string.");
    }
  
    const word: string = targetWord.toUpperCase();
    const numRows: number = word.length;
  
    const maxPossibleSwapsAcrossBoard = Math.floor(numRows / 2);
    
    const config = {
      minLettersPerRow: options.minLettersPerRow ?? 3,
      maxLettersPerRow: options.maxLettersPerRow ?? 8,
      minRowSwaps: Math.max(0, options.minRowSwaps ?? 0),
      maxRowSwaps: Math.max(0, options.maxRowSwaps ?? maxPossibleSwapsAcrossBoard)
    };

    config.maxRowSwaps = Math.min(config.maxRowSwaps, maxPossibleSwapsAcrossBoard);
    config.minRowSwaps = Math.min(config.minRowSwaps, config.maxRowSwaps);

    const targetSwapsCount = Math.floor(
      Math.random() * (config.maxRowSwaps - config.minRowSwaps + 1)
    ) + config.minRowSwaps;
  
    const rows: ScrollyRow[] = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let requiredMovesToSolve = 0;
  
    for (let i = 0; i < numRows; i++) {
      const targetLetter: string = word[i];
      
      let rowLength: number = Math.floor(Math.random() * (config.maxLettersPerRow - config.minLettersPerRow + 1)) + config.minLettersPerRow;
  
      // Hard ceiling clamp (Odd caps at 9, Even caps at 8)
      if (rowLength > 9) rowLength = 9;
  
      // FIX: Your Vue layout calculates its middle frame index using Math.floor(rowLength / 2).
      // For even numbers, this floor division moves the reference point rightward.
      const absoluteMiddleIndex: number = Math.floor(rowLength / 2);
  
      // Calculate layout shift boundaries based on your "Max 4 letters on either side" rule
      const maxAllowedShift = absoluteMiddleIndex - Math.max(0, (rowLength - 1) - 4);
      const minAllowedShift = absoluteMiddleIndex - 4;

      const finalMinShift = Math.max(-absoluteMiddleIndex, minAllowedShift);
      const finalMaxShift = Math.min(absoluteMiddleIndex, maxAllowedShift);
  
      const currentShift: number = Math.floor(Math.random() * (finalMaxShift - finalMinShift + 1)) + finalMinShift;
      requiredMovesToSolve += Math.abs(currentShift);
  
      // Fixes even row placement misalignment cleanly inside the generator
      const targetPositionInArray: number = absoluteMiddleIndex;
  
      const letters: string[] = [];
      for (let l = 0; l < rowLength; l++) {
        if (l === targetPositionInArray) {
          letters.push(targetLetter);
        } else {
          let randomDecoy: string;
          do {
            randomDecoy = alphabet[Math.floor(Math.random() * alphabet.length)];
          } while (randomDecoy === targetLetter && Math.random() > 0.2);
          
          letters.push(randomDecoy);
        }
      }
  
      rows.push({
        id: i + 1,
        letters: letters,
        currentShift: currentShift,
        minShift: -absoluteMiddleIndex,
        maxShift: absoluteMiddleIndex,
        lockedDirection: null
      });
    }

    // Process row position swaps
    let switchMovesCount = 0;
    const availableIndices = Array.from({ length: numRows }, (_, idx) => idx);

    while (switchMovesCount < targetSwapsCount && availableIndices.length >= 2) {
      const idxA_pos = Math.floor(Math.random() * availableIndices.length);
      const indexA = availableIndices.splice(idxA_pos, 1);

      const idxB_pos = Math.floor(Math.random() * availableIndices.length);
      const indexB = availableIndices.splice(idxB_pos, 1);

      const temp = rows[indexA];
      rows[indexA] = rows[indexB];
      rows[indexB] = temp;

      switchMovesCount += 1;
    }
  
    const initialMoves = requiredMovesToSolve + switchMovesCount;
  
    return {
      targetWord: word,
      initialMoves,
      rows
    };
  }
