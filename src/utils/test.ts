import { generateScrollyLevel } from "./levelGenerator";

// 1. Mock configurations simulating your Vue App options
const testOptions = {
  minLettersPerRow: 3,
  maxLettersPerRow: 9, // Allows up to a max length of 9 (4 decoys either side of absolute center)
  minRowSwaps: 1,
  maxRowSwaps: 3
};

const targetWord = "PLAYER";

try {
  console.log(` Generating Scrolly Level for word: "${targetWord}"...`);
  console.log(`Constraints: Max ${testOptions.maxLettersPerRow} items per row.\n`);

  // 2. Invoke the generator function
  const levelConfig = generateScrollyLevel(targetWord, testOptions);

  // 3. Print structural metadata details
  console.log("=================== LEVEL METADATA ===================");
  console.log(`Target Word:   ${levelConfig.targetWord}`);
  console.log(`Initial Moves: ${levelConfig.initialMoves} total (Horizontal + Row Swaps)`);
  console.log("======================================================\n");

  // 4. Iterate over the board arrays to log position offsets
  console.log("==================== ROW MATRIX DATA ===================");
  levelConfig.rows.forEach((row, index) => {
    const arrayMidpoint = Math.floor(row.letters.length / 2);
    
    // Calculate where your Vue UI code will drop the active player cursor at start frame:
    // startingIndex = absoluteMiddleIndex - currentShift
    const startingViewportIndex = arrayMidpoint - row.currentShift;
    
    const lettersToLeftOfStart = startingViewportIndex;
    const lettersToRightOfStart = row.letters.length - 1 - startingViewportIndex;

    console.log(`Row Index [${index}] (Original Target Row ID: ${row.id}):`);
    console.log(`  • Array Length:      ${row.letters.length} letters`);
    console.log(`  • Initial Shift:     ${row.currentShift}`);
    console.log(`  • Starting Item:     "${row.letters[startingViewportIndex]}" at Array index ${startingViewportIndex}`);
    console.log(`  • Left of viewport:  ${lettersToLeftOfStart} letters`);
    console.log(`  • Right of viewport: ${lettersToRightOfStart} letters`);
    console.log(`  • Data layout structure: [ ${row.letters.join(", ")} ]`);
    console.log("------------------------------------------------------");
  });

} catch (error) {
  console.error("❌ Level generation crashed:", error);
}