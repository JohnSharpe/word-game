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
  
    const config = {
      minLettersPerRow: options.minLettersPerRow ?? 5,
      maxLettersPerRow: options.maxLettersPerRow ?? 7,
    };
  
    const rows: ScrollyRow[] = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    // Track the minimum moves absolutely required to solve the layout
    let requiredMovesToSolve = 0;
  
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
  
      // Randomise the initial layout displacement position
      const currentShift: number = Math.floor(Math.random() * (maxShift - minShift + 1)) + minShift;
  
      // Accumulate the number of steps required to return this row's shift count back to 0
      requiredMovesToSolve += Math.abs(currentShift);
  
      // Place the target letter exactly at the center index point
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
  
    const initialMoves = requiredMovesToSolve;
  
    return {
      targetWord: word,
      initialMoves,
      rows
    };
  }
  