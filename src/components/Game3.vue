<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ScrollyRow } from "../utils/models";
import GameRow from './GameRow.vue';
import { generateScrollyLevel } from '../utils/levelGenerator'

// Would likely come from the server instead
const targetWordConfig = "PLAYER" 
const initialConfig = generateScrollyLevel(targetWordConfig, {
  minLettersPerRow: 3,
  maxLettersPerRow: 8
})

const TARGET_WORD = ref<string>(initialConfig.targetWord)
const INITIAL_MOVES = ref<number>(initialConfig.initialMoves)
const totalMovesLeft = ref<number>(initialConfig.initialMoves)

const cachedInitialRows = JSON.parse(JSON.stringify(initialConfig.rows))
const rows = ref<ScrollyRow[]>(initialConfig.rows)

//const TARGET_WORD = "OAKS"
//const INITIAL_MOVES = 7

//const rows = ref([
//  { id: 1, letters: ['K', 'E', 'D', 'B', 'A'], currentShift: 0, minShift: -2, maxShift: 2, lockedDirection: null },
//  { id: 2, letters: ['O', 'M', 'E'], currentShift: 0, minShift: -1, maxShift: 1, lockedDirection: null },
//  { id: 3, letters: ['X', 'Z', 'L', 'M', 'N', 'K', 'Y'], currentShift: 0, minShift: -3, maxShift: 3, lockedDirection: null },
//  { id: 4, letters: ['P', 'T', 'D', 'S', 'B'], currentShift: 1, minShift: -2, maxShift: 2, lockedDirection: null }
//])

//const totalMovesLeft = ref(INITIAL_MOVES)

const selectedRowIndexForSwap = ref(null)
const swappedRowIds = ref([])

const currentCenterWord = computed(() => {
  return rows.value.map(row => {
    const absoluteMiddleIndex = Math.floor(row.letters.length / 2)
    const currentVisibleIndex = absoluteMiddleIndex - row.currentShift
    return row.letters[currentVisibleIndex]
  }).join('')
})

const isGameWon = computed(() => totalMovesLeft.value <= 0 && currentCenterWord.value === TARGET_WORD.value)
const isGameOver = computed(() => totalMovesLeft.value <= 0 && !isGameWon.value)

function handleShift({ rowIndex, direction }) {
  const row = rows.value[rowIndex]

  if (direction === 'right') {
    if (row.currentShift >= row.maxShift) return
    row.currentShift++
  } else if (direction === 'left') {
    if (row.currentShift <= row.minShift) return
    row.currentShift--
  }

  totalMovesLeft.value--

  if (row.lockedDirection === null) {
    row.lockedDirection = direction
  }
}

function handleSwapSelection(rowIndex) {
  const rowId = rows.value[rowIndex].id
  
  if (selectedRowIndexForSwap.value === null) {
    selectedRowIndexForSwap.value = rowIndex
    return
  }

  if (selectedRowIndexForSwap.value === rowIndex) {
    selectedRowIndexForSwap.value = null
    return
  }

  const firstIndex = selectedRowIndexForSwap.value
  const secondIndex = rowIndex

  const firstRow = rows.value[firstIndex]
  const secondRow = rows.value[secondIndex]

  rows.value[firstIndex] = secondRow
  rows.value[secondIndex] = firstRow

  swappedRowIds.value.push(firstRow.id, secondRow.id)

  totalMovesLeft.value--
  selectedRowIndexForSwap.value = null
}

function resetGame() {
  rows.value = JSON.parse(JSON.stringify(cachedInitialRows))
  totalMovesLeft.value = INITIAL_MOVES.value
  selectedRowIndexForSwap.value = null
  swappedRowIds.value = []
}
</script>

<template>
  <div class="game-container">
    <header>
      <h1>Scrolly</h1>
      <p class="rule-text">
        ⚠️ <strong>Rules:</strong> You have {{ INITIAL_MOVES }} moves total. Moving any row locks <em>that row</em> into continuing in that direction. You can swap any two rows together for 1 move, but each row can only be swapped once!
      </p>
    </header>

    <div class="status-dashboard">
      <div class="moves-badge" :class="{ 'low-moves': totalMovesLeft <= 2 }">
        Moves Remaining: <span>{{ totalMovesLeft }}</span>
      </div>
    </div>

    <!-- The Game Board Structure -->
    <div class="board-grid">
      <GameRow
        v-for="(row, rowIndex) in rows"
        :key="row.id"
        :row="row"
        :rowIndex="rowIndex"
        :isGameOver="isGameOver"
        :isGameWon="isGameWon"
        :isSelectedForSwap="selectedRowIndexForSwap === rowIndex"
        :swappedRowIds="swappedRowIds"
        @shift="handleShift"
        @swap-select="handleSwapSelection"
      />
    </div>

    <div v-if="!isGameWon && !isGameOver" class="current-word-display">
      <span>{{ currentCenterWord }}</span>
    </div>

    <!-- Persistent Global Reset Button -->
    <button 
      v-if="!isGameWon && !isGameOver" 
      class="control-reset-btn" 
      @click="resetGame"
    >
      🔄 Reset Level
    </button>

    <!-- Endgame Modals / Status Indicators -->
    <div v-if="isGameWon" class="banner win-banner">
      🎉 Solved in {{ INITIAL_MOVES - totalMovesLeft }} moves! Word Is: {{ currentCenterWord }}
      <button class="modal-reset-btn" @click="resetGame">Play Again</button>
    </div>
    
    <div v-else-if="isGameOver" class="banner lose-banner">
      💥 Game Over! Out of moves. 
      <button class="modal-reset-btn" @click="resetGame">Try Again</button>
    </div>

  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 800px;
  
  /* Clear out the padding/margin layout defaults */
  padding: 40px 20px;
  margin: 0 auto;
  
  color: white;
  font-family: sans-serif;
  
  /* USE THIS TO CENTER ON TALLER VIEWPORTS INSTEAD: */
  min-height: 100vh;
  justify-content: center;
}

.rule-text {
  background-color: rgba(161, 122, 2, 0.95);
  border-left: 4px solid #e2b714;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 0.9rem;
  max-width: 500px;
  line-height: 1.4;
}

.status-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.moves-badge {
  background-color: #2d2d3a;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 1.1rem;
  border: 1px solid #48485a;
}
.moves-badge span {
  font-weight: bold;
  color: #4caf50;
}
.moves-badge.low-moves span {
  color: #f44336;
}

/* Changed layout setup to stack individual grid rows perfectly */
.board-grid {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  background-color: #1e1e24;
  padding: 30px 20px;
  border-radius: 16px;
  border: 3px solid #2e2e38;
  align-items: center;
  overflow: hidden;
  width: 680px;
}

.control-reset-btn {
  background-color: #2d2d3a;
  color: #e2b714;
  border: 1px solid #e2b714;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}
.control-reset-btn:hover {
  background-color: #e2b714;
  color: #1e1e24;
  transform: translateY(-1px);
}
.control-reset-btn:active {
  transform: translateY(1px);
}
.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px 40px;
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
}
.win-banner { background-color: #4caf50; }
.lose-banner { background-color: #f44336; }
.modal-reset-btn {
  background-color: white;
  color: black;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.15s;
}
.modal-reset-btn:hover {
  opacity: 0.9;
}
.current-word-display span {
  color: #e2b714;
  font-weight: bold;
  font-size: 1.4rem;
  letter-spacing: 4px;
}
</style>
