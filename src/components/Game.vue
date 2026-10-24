<script setup>
import { ref, computed } from 'vue'

const TARGET_WORD = "KEY"
const TILE_WIDTH = 45
const GAP = 5
const TILE_SIZE_WITH_GAP = TILE_WIDTH + GAP // Exactly 50px
const INITIAL_MOVES = 6

const rows = ref([
  { id: 1, letters: ['K', 'E', 'D', 'B', 'A'], currentShift: 0, minShift: -2, maxShift: 2, lockedDirection: null },
  { id: 2, letters: ['O', 'M', 'E'], currentShift: 0, minShift: -1, maxShift: 1, lockedDirection: null },
  { id: 3, letters: ['X', 'Z', 'L', 'M', 'N', 'X', 'Y'], currentShift: 0, minShift: -3, maxShift: 3, lockedDirection: null }
])

const totalMovesLeft = ref(INITIAL_MOVES)

const currentCenterWord = computed(() => {
  return rows.value.map(row => {
    const absoluteMiddleIndex = Math.floor(row.letters.length / 2)
    const currentVisibleIndex = absoluteMiddleIndex - row.currentShift
    return row.letters[currentVisibleIndex]
  }).join('')
})

const isGameWon = computed(() => currentCenterWord.value === TARGET_WORD)
const isGameOver = computed(() => totalMovesLeft.value <= 0 && !isGameWon.value)

function isDirectionDisabled(row, direction) {
  if (isGameOver.value || isGameWon.value) return true
  if (row.lockedDirection !== null && row.lockedDirection !== direction) {
    return true
  }
  return false
}

function shiftRow(rowIndex, direction) {
  const row = rows.value[rowIndex]
  
  if (isGameOver.value || isGameWon.value) return
  if (isDirectionDisabled(row, direction)) return

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

function resetGame() {
  rows.value.forEach(row => {
    row.currentShift = 0
    row.lockedDirection = null
  })
  totalMovesLeft.value = INITIAL_MOVES
}
</script>

<template>
  <div class="game-container">
    <header>
      <h1>Scrolly</h1>
      <p class="rule-text">
        ⚠️ <strong>Rules:</strong> You have {{ INITIAL_MOVES }} moves total. Moving any row locks <em>that specific row</em> into continuing in that direction or staying still!
      </p>
    </header>

    <div class="status-dashboard">
      <div class="moves-badge" :class="{ 'low-moves': totalMovesLeft <= 2 }">
        Moves Remaining: <span>{{ totalMovesLeft }}</span>
      </div>
    </div>

    <!-- The Game Board Structure -->
    <div class="board-grid">
      <template v-for="(row, rowIndex) in rows" :key="row.id">
        
        <!-- Left Button Channel -->
        <div class="button-channel left-align">
          <button 
            class="arrow-btn" 
            :disabled="row.currentShift === row.minShift || isDirectionDisabled(row, 'left')"
            @click="shiftRow(rowIndex, 'left')"
          >
            ◀
          </button>
        </div>

        <!-- Track Channel -->
        <div class="track-channel">
          <div class="viewfinder-frame"></div>
          
          <div 
            class="letter-row"
            :style="{ transform: `translateX(${ -(Math.floor(row.letters.length / 2) * TILE_SIZE_WITH_GAP) + (row.currentShift * TILE_SIZE_WITH_GAP) }px)` }"
          >
            <div 
              v-for="(letter, letterIndex) in row.letters" 
              :key="letterIndex" 
              class="tile"
              :class="{ 
                'is-center-item': letterIndex === Math.floor(row.letters.length / 2) - row.currentShift,
                'is-row-locked': row.lockedDirection !== null 
              }"
            >
              {{ letter }}
            </div>
          </div>
        </div>

        <!-- Right Button Channel -->
        <div class="button-channel right-align">
          <button 
            class="arrow-btn" 
            :disabled="row.currentShift === row.maxShift || isDirectionDisabled(row, 'right')"
            @click="shiftRow(rowIndex, 'right')"
          >
            ▶
          </button>
        </div>

      </template>
    </div>

    <!-- Persistent Global Reset Button (Hidden only if a full Win/Lose screen overlay takes over) -->
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
    
    <div v-else class="current-word-display">Lined Up: <span>{{ currentCenterWord }}</span></div>
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
  padding: 20px;
  color: white;
  font-family: sans-serif;
  
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

.board-grid {
  display: grid;
  grid-template-columns: 60px 350px 60px;
  row-gap: 20px;
  background-color: #1e1e24;
  padding: 30px 20px;
  border-radius: 16px;
  border: 3px solid #2e2e38;
  align-items: center;
  overflow: hidden;
}

.button-channel {
  display: flex;
  align-items: center;
  height: 60px;
  background-color: #1e1e24;
  z-index: 10;
}
.button-channel.left-align { box-shadow: 10px 0 15px -5px #1e1e24; }
.button-channel.right-align { box-shadow: -10px 0 15px -5px #1e1e24; }

.track-channel {
  position: relative;
  display: flex;
  justify-content: center; 
  align-items: center;
  height: 60px;
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
}

.letter-row {
  display: flex;
  gap: 5px;
  position: absolute;
  left: calc(50% - 22.5px); 
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.tile {
  width: 45px;
  height: 45px;
  min-width: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.6rem;
  font-weight: bold;
  background-color: #2d2d3a;
  border: 2px solid #48485a;
  border-radius: 8px;
  user-select: none;
  transition: all 0.2s;
}

.tile.is-center-item {
  background-color: #e2b714;
  color: #1e1e24;
  border-color: #ffffff;
}

.tile.is-row-locked:not(.is-center-item) {
  border-color: #5a5a73;
  color: #888;
}

.viewfinder-frame {
  position: absolute;
  top: 5px;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 45px;
  height: 45px;
  border: 2px dashed #e2b714;
  background-color: rgba(226, 183, 20, 0.05);
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
}

.arrow-btn {
  background: #3e3e4f;
  color: white;
  border: none;
  width: 42px;
  height: 42px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, opacity 0.15s;
}

.arrow-btn:hover:not(:disabled) {
  background: #5a5a73;
}

.arrow-btn:disabled {
  opacity: 0.15;
  cursor: not-allowed;
}

/* Mid-Game Dedicated Reset Button Design */
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
