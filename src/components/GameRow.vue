<script setup>
import { computed } from 'vue'

const props = defineProps({
  row: { type: Object, required: true },
  rowIndex: { type: Number, required: true },
  isGameOver: { type: Boolean, required: true },
  isGameWon: { type: Boolean, required: true },
  isSelectedForSwap: { type: Boolean, required: true },
  swappedRowIds: { type: Array, required: true }
})

const emit = defineEmits(['shift', 'swap-select'])

const TILE_WIDTH = 45
const GAP = 5
const TILE_SIZE_WITH_GAP = TILE_WIDTH + GAP // 50px

// Find the native middle array item index
const absoluteMiddleIndex = computed(() => Math.floor(props.row.letters.length / 2))
const currentVisibleIndex = computed(() => absoluteMiddleIndex.value - props.row.currentShift)
const hasBeenSwapped = computed(() => props.swappedRowIds.includes(props.row.id))
const isSwapDisabled = computed(() => hasBeenSwapped.value || props.isGameOver || props.isGameWon)

const trackTransformStyle = computed(() => {
  const baseOffset = props.row.currentShift * TILE_SIZE_WITH_GAP
  const isEvenLength = props.row.letters.length % 2 === 0
  
  // Half of TILE_SIZE_WITH_GAP (50px / 2 = 25px)
  const evenOffsetAdjustment = isEvenLength ? TILE_SIZE_WITH_GAP / 2 : 0
  
  const totalOffset = baseOffset - evenOffsetAdjustment

  return { transform: `translateX(${totalOffset}px)` }
})

function isDirectionDisabled(direction) {
  if (props.isGameOver || props.isGameWon) return true
  if (props.row.lockedDirection !== null && props.row.lockedDirection !== direction) {
    return true
  }
  return false
}
</script>

<template>
  <div class="board-row-container">
    <!-- Swap Control Channel -->
    <div class="button-channel swap-align">
      <button 
        class="arrow-btn swap-btn" 
        :class="{ 
          'is-selected-for-swap': isSelectedForSwap,
          'has-been-swapped': hasBeenSwapped
        }"
        :disabled="isSwapDisabled"
        @click="emit('swap-select', rowIndex)"
        :title="hasBeenSwapped ? 'Row already swapped' : 'Click to select / pair for swap'"
      >
        ⇅
      </button>
    </div>
    
    <!-- Left Button Channel -->
    <div class="button-channel left-align">
  <button 
    class="arrow-btn" 
    :disabled="row.currentShift === row.minShift || isDirectionDisabled('left')"
    @click="emit('shift', { rowIndex, direction: 'left' })"
  >
    <!-- If locked to the right, show a padlock, otherwise show the arrow -->
    <span v-if="row.lockedDirection === 'right'" class="lock-icon">🔒</span>
    <span v-else>◀</span>
  </button>
</div>

    <!-- Track Channel -->
    <div class="track-channel">
      <div class="viewfinder-frame"></div>
      
      <div class="letter-row" :style="trackTransformStyle">
        <div 
          v-for="(letter, letterIndex) in row.letters" 
          :key="letterIndex" 
          class="tile"
          :class="{ 
            'is-center-item': letterIndex === currentVisibleIndex
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
    :disabled="row.currentShift === row.maxShift || isDirectionDisabled('right')"
    @click="emit('shift', { rowIndex, direction: 'right' })"
  >
    <!-- If locked to the left, show a padlock, otherwise show the arrow -->
    <span v-if="row.lockedDirection === 'left'" class="lock-icon">🔒</span>
    <span v-else>▶</span>
  </button>
</div>
  </div>
</template>

<style scoped>
.board-row-container {
  display: grid;
  grid-template-columns: 60px 60px 460px 60px;
  align-items: center;
  width: 100%;
}

.button-channel {
  display: flex;
  align-items: center;
  height: 60px;
  background-color: #1e1e24; /* Blocks trailing letters underneath */
  z-index: 10;
}

.button-channel.swap-align { box-shadow: 10px 0 15px -5px #1e1e24; }
.button-channel.left-align { box-shadow: 10px 0 15px -5px #1e1e24; }
.button-channel.right-align { box-shadow: -10px 0 15px -5px #1e1e24; }

.swap-btn {
  background: #252530;
  color: #e2b714;
  border: 1px dashed #e2b714;
  transition: all 0.2s ease;
}
.swap-btn:hover:not(:disabled) {
  background: #3e3e4f;
}
.swap-btn.is-selected-for-swap {
  background: #e2b714;
  color: #1e1e24;
  border-style: solid;
  animation: pulse 1.5s infinite alternate;
}
.swap-btn.has-been-swapped {
  opacity: 0.15;
  cursor: not-allowed;
  border-color: #555;
  color: #555;
}

@keyframes pulse {
  from { box-shadow: 0 0 4px #e2b714; }
  to { box-shadow: 0 0 12px #e2b714; }
}

.track-channel {
  position: relative;
  display: flex;
  justify-content: center; 
  align-items: center;    
  height: 60px;
  width: 460px;
}

.letter-row {
  display: flex;
  gap: 5px; 
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.tile {
  width: 45px !important;
  height: 45px !important;
  min-width: 45px !important;
  max-width: 45px !important;
  
  /* FORCE border-box locally so the 2px borders are included inside the 45px */
  box-sizing: border-box; 
  
  /* Prevent flex-basis from modifying the layout size */
  flex-shrink: 0; 
  flex-grow: 0;
  
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
  /* Using standard layouts inside the parent flex container block */
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
</style>
