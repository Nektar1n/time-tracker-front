<template>
  <v-card class="day-sketch-pad" rounded="lg" variant="tonal">
    <v-card-text class="d-flex flex-column ga-3">
      <div class="d-flex flex-wrap align-center ga-3">
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
          class="flex-grow-1"
          density="compact"
          hide-details
          label="Толщина"
          max="12"
          min="1"
          step="1"
        />
        <v-btn color="error" variant="tonal" @click="clearSketch">
          Очистить
        </v-btn>
      </div>

      <div class="canvas-wrap" @pointerleave="stopDrawing">
        <canvas
          ref="canvasRef"
          class="sketch-canvas"
          @pointerdown="startDrawing"
          @pointermove="draw"
          @pointerup="stopDrawing"
        />
      </div>
      <div class="text-caption text-medium-emphasis">
        Режим рисования для {{ formattedDate }}. Наброски сохраняются отдельно для
        каждого дня.
      </div>
    </v-card-text>
  </v-card>
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
      formattedDate () {
        const date = new Date(this.selectedDate)
        if (Number.isNaN(date.getTime())) return 'сегодня'
        return date.toLocaleDateString('ru-RU', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      },
    },
    watch: {
      selectedDate () {
        this.$nextTick(() => this.loadSketchForDay())
      },
    },
    mounted () {
      this.drawingsByDay = this.readStorage()
      this.setupCanvas()
      this.loadSketchForDay()
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
        const height = 400

        canvas.width = width * ratio
        canvas.height = height * ratio
        canvas.style.height = `${height}px`

        this.ctx = canvas.getContext('2d')
        this.ctx.scale(ratio, ratio)
        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'

        this.loadSketchForDay()
      },
      canvasPosition (event) {
        const rect = this.$refs.canvasRef.getBoundingClientRect()
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
      },
      startDrawing (event) {
        if (!this.ctx) return

        const { x, y } = this.canvasPosition(event)
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
        this.ctx.strokeStyle = this.strokeColor
        this.ctx.lineWidth = this.strokeWidth
        this.drawing = true
        event.target.setPointerCapture(event.pointerId)
      },
      draw (event) {
        if (!this.drawing || !this.ctx) return

        const { x, y } = this.canvasPosition(event)
        this.ctx.lineTo(x, y)
        this.ctx.stroke()
      },
      stopDrawing (event) {
        if (!this.drawing || !this.ctx) return

        this.drawing = false
        this.ctx.closePath()
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

        this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
        delete this.drawingsByDay[this.dayKey]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.drawingsByDay))
      },
      loadSketchForDay () {
        const canvas = this.$refs.canvasRef
        if (!canvas || !this.ctx) return

        this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
        const sketch = this.drawingsByDay[this.dayKey]
        if (!sketch) return

        const image = new Image()
        image.addEventListener('load', () => {
          this.ctx.drawImage(image, 0, 0, canvas.clientWidth, canvas.clientHeight)
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
.day-sketch-pad {
  height: 100%;
}

.sketch-control {
  min-width: 140px;
}

.canvas-wrap {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.35);
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.85);
  padding: 8px;
}

.sketch-canvas {
  width: 100%;
  touch-action: none;
  cursor: crosshair;
  display: block;
}
</style>
