<template>
  <div class="sketch-overlay" :class="{ 'sketch-overlay--active': isEnabled }">
    <div v-if="isEnabled" class="sketch-toolbar">
      <v-select
        v-model="strokeColor"
        class="sketch-control"
        density="compact"
        hide-details
        item-title="title"
        item-value="value"
        :items="colorOptions"
        label="Цвет"
      />
      <v-slider
        v-model="strokeWidth"
        class="sketch-slider"
        density="compact"
        hide-details
        max="12"
        min="1"
        step="1"
      />
      <v-btn color="error" size="small" variant="tonal" @click="clearSketch">Очистить</v-btn>
    </div>
    <canvas
      ref="canvasRef"
      class="sketch-canvas"
      :style="canvasStyle"
      @pointerdown="startDrawing"
      @pointerleave="stopDrawing"
      @pointermove="draw"
      @pointerup="stopDrawing"
    />
  </div>
</template>

<script>
  const STORAGE_KEY = 'day-sketches'

  export default {
    name: 'DaySketchPad',
    props: {
      selectedDate: {
        type: [String, Date],
        default: () => new Date(),
      },
      isEnabled: {
        type: Boolean,
        default: false,
      },
      scrollTop: {
        type: Number,
        default: 0,
      },
      contentHeight: {
        type: Number,
        default: 700,
      },
    },
    data () {
      return {
        strokeColor: '#263238',
        strokeWidth: 3,
        colorOptions: [
          { title: 'Графит', value: '#263238' },
          { title: 'Синий', value: '#1565C0' },
          { title: 'Зелёный', value: '#2E7D32' },
          { title: 'Фиолетовый', value: '#6A1B9A' },
          { title: 'Красный', value: '#C62828' },
        ],
        drawing: false,
        ctx: null,
        drawingsByDay: {},
        previousPoint: null,
      }
    },
    computed: {
      dayKey () {
        const date = new Date(this.selectedDate)
        if (Number.isNaN(date.getTime())) {
          return new Date().toISOString().slice(0, 10)
        }
        return date.toISOString().slice(0, 10)
      },
      canvasStyle () {
        return {
          height: `${Math.max(this.contentHeight, 700)}px`,
          transform: `translateY(${-this.scrollTop}px)`,
        }
      },
    },
    watch: {
      selectedDate () {
        this.$nextTick(() => this.loadSketchForDay())
      },
      contentHeight () {
        this.$nextTick(() => this.setupCanvas())
      },
    },
    mounted () {
      this.drawingsByDay = this.readStorage()
      this.setupCanvas()
      window.addEventListener('resize', this.setupCanvas)
    },
    beforeUnmount () {
      window.removeEventListener('resize', this.setupCanvas)
    },
    methods: {
      setupCanvas () {
        const canvas = this.$refs.canvasRef
        if (!canvas) return

        const ratio = window.devicePixelRatio || 1
        const width = canvas.clientWidth
        const height = Math.max(this.contentHeight, 700)

        canvas.width = width * ratio
        canvas.height = height * ratio

        this.ctx = canvas.getContext('2d')
        this.ctx.scale(ratio, ratio)
        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'
        this.ctx.globalCompositeOperation = 'source-over'
        this.ctx.imageSmoothingEnabled = true

        this.loadSketchForDay()
      },
      canvasPosition (event) {
        const rect = this.$refs.canvasRef.getBoundingClientRect()
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top + this.scrollTop,
        }
      },
      startDrawing (event) {
        if (!this.isEnabled || !this.ctx) return

        const point = this.canvasPosition(event)
        this.ctx.beginPath()
        this.ctx.moveTo(point.x, point.y)
        this.ctx.strokeStyle = this.strokeColor
        this.ctx.lineWidth = this.strokeWidth
        this.ctx.shadowColor = `${this.strokeColor}66`
        this.ctx.shadowBlur = Math.max(1, this.strokeWidth * 0.7)
        this.previousPoint = point
        this.drawing = true
        event.target.setPointerCapture(event.pointerId)
      },
      draw (event) {
        if (!this.isEnabled || !this.drawing || !this.ctx) return

        const point = this.canvasPosition(event)
        const prev = this.previousPoint || point
        const controlX = (prev.x + point.x) / 2
        const controlY = (prev.y + point.y) / 2

        this.ctx.quadraticCurveTo(prev.x, prev.y, controlX, controlY)
        this.ctx.stroke()

        this.previousPoint = point
      },
      stopDrawing (event) {
        if (!this.drawing || !this.ctx) return

        this.drawing = false
        this.previousPoint = null
        this.ctx.closePath()
        this.ctx.shadowBlur = 0
        if (event?.target?.hasPointerCapture?.(event.pointerId)) {
          event.target.releasePointerCapture(event.pointerId)
        }
        this.saveCurrentSketch()
      },
      saveCurrentSketch () {
        const canvas = this.$refs.canvasRef
        if (!canvas) return

        this.drawingsByDay[this.dayKey] = canvas.toDataURL('image/png')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.drawingsByDay))
      },
      clearSketch () {
        const canvas = this.$refs.canvasRef
        if (!canvas || !this.ctx) return

        this.ctx.clearRect(0, 0, canvas.width, canvas.height)
        delete this.drawingsByDay[this.dayKey]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.drawingsByDay))
      },
      loadSketchForDay () {
        const canvas = this.$refs.canvasRef
        if (!canvas || !this.ctx) return

        this.ctx.clearRect(0, 0, canvas.width, canvas.height)
        const sketch = this.drawingsByDay[this.dayKey]
        if (!sketch) return

        const image = new Image()
        image.addEventListener('load', () => {
          this.ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        })
        image.src = sketch
      },
      readStorage () {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (!raw) return {}

          const parsed = JSON.parse(raw)
          return parsed && typeof parsed === 'object' ? parsed : {}
        } catch {
          return {}
        }
      },
    },
  }
</script>

<style scoped>
.sketch-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow: hidden;
  pointer-events: none;
}

.sketch-overlay--active {
  pointer-events: auto;
}

.sketch-toolbar {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 6;
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(var(--v-theme-surface), 0.92);
  border-radius: 12px;
  padding: 6px 8px;
}

.sketch-control {
  width: 130px;
}

.sketch-slider {
  width: 120px;
}

.sketch-canvas {
  width: 100%;
  display: block;
  touch-action: none;
  cursor: crosshair;
}
</style>
