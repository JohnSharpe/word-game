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
  
    // 1. Establish structural constraints
    const maxPossibleSwapsAcrossBoard = Math.floor(numRows / 2);
    
    const config = {
      minLettersPerRow: options.minLettersPerRow ?? 5,
      maxLettersPerRow: options.maxLettersPerRow ?? 7,
      minRowSwaps: Math.max(0, options.minRowSwaps ?? 0),
      maxRowSwaps: Math.max(0, options.maxRowSwaps ?? maxPossibleSwapsAcrossBoard)
    };

    // Ensure min doesn't exceed max, and max doesn't exceed physical board capabilities
    config.maxRowSwaps = Math.min(config.maxRowSwaps, maxPossibleSwapsAcrossBoard);
    config.minRowSwaps = Math.min(config.minRowSwaps, config.maxRowSwaps);

    // Pick a deterministic target number of individual swap actions for this specific level
    const targetSwapsCount = Math.floor(
      Math.random() * (config.maxRowSwaps - config.minRowSwaps + 1)
    ) + config.minRowSwaps;
  
    const rows: ScrollyRow[] = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let requiredMovesToSolve = 0;
  
    // 2. Generate the initial rows in solved sequential order
    for (let i = 0; i < numRows; i++) {
      const targetLetter: string = word[i];
      
      let rowLength: number = Math.floor(Math.random() * (config.maxLettersPerRow - config.minLettersPerRow + 1)) + config.minLettersPerRow;
      if (rowLength % 2 === 0) {
        rowLength = Math.max(config.minLettersPerRow, rowLength - 1);
        if (rowLength % 2 === 0) rowLength += 1;
      }
  
      const absoluteMiddleIndex: number = Math.floor(rowLength / 2);
      const maxShift: number = absoluteMiddleIndex;
      const minShift: number = -absoluteMiddleIndex;
  
      const currentShift: number = Math.floor(Math.random() * (maxShift - minShift + 1)) + minShift;
      requiredMovesToSolve += Math.abs(currentShift);
  
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
        minShift: minShift,
        maxShift: maxShift,
        lockedDirection: null
      });
    }

    // 3. Directly target the requested swap range count
    let switchMovesCount = 0;
    const availableIndices = Array.from({ length: numRows }, (_, idx) => idx);

    while (switchMovesCount < targetSwapsCount && availableIndices.length >= 2) {
      const idxA_pos = Math.floor(Math.random() * availableIndices.length);
      const indexA = availableIndices.splice(idxA_pos, 1)[0];

      const idxB_pos = Math.floor(Math.random() * availableIndices.length);
      const indexB = availableIndices.splice(idxB_pos, 1)[0];

      // Execute the swap
      const temp = rows[indexA];
      rows[indexA] = rows[indexB];
      rows[indexB] = temp;

      switchMovesCount += 1;
    }
  
    // 4. Combine horizontal displacements with precise vertical layout switch counts
    const initialMoves = requiredMovesToSolve + switchMovesCount;
  
    return {
      targetWord: word,
      initialMoves,
      rows
    };
  }
