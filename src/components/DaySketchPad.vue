<template>
  <div class="sketch-overlay" :class="{ 'sketch-overlay--active': isEnabled }">
    <div v-if="isEnabled" class="sketch-toolbar">
      <v-btn-toggle
        v-model="toolMode"
        class="sketch-tool-toggle"
        density="compact"
        mandatory
        variant="outlined"
      >
        <v-btn size="small" value="draw">Кисть</v-btn>
        <v-btn size="small" value="erase">Ластик</v-btn>
        <v-btn size="small" value="pan">Скролл</v-btn>
      </v-btn-toggle>
      <v-switch
        v-model="autoEnhanceEnabled"
        class="sketch-auto-switch"
        color="primary"
        density="compact"
        hide-details
        inset
        label="AI авто"
      />
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
      :class="{ 'sketch-canvas--pan': toolMode === 'pan' && isEnabled }"
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
      topOffset: {
        type: Number,
        default: 0,
      },
    },
    data () {
      return {
        strokeColor: '#263238',
        strokeWidth: 3,
        toolMode: 'draw',
        colorOptions: [
          { title: 'Графит', value: '#263238' },
          { title: 'Синий', value: '#1565C0' },
          { title: 'Зелёный', value: '#2E7D32' },
          { title: 'Фиолетовый', value: '#6A1B9A' },
          { title: 'Красный', value: '#C62828' },
        ],
        drawing: false,
        panning: false,
        ctx: null,
        drawingsByDay: {},
        previousPoint: null,
        currentStroke: [],
        panStart: null,
        scrollStart: null,
        autoEnhanceEnabled: true,
        scrollElement: null,
        canvasSize: {
          width: 0,
          height: 0,
        },
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
          marginTop: `${Math.max(0, this.topOffset)}px`,
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
      this.scrollElement = this.resolveScrollElement()
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

        this.canvasSize = { width, height }

        canvas.width = width * ratio
        canvas.height = height * ratio

        this.ctx = canvas.getContext('2d')
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
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
          y: event.clientY - rect.top,
        }
      },
      startDrawing (event) {
        if (!this.isEnabled || !this.ctx) return

        if (this.toolMode === 'pan') {
          this.panning = true
          this.panStart = { x: event.clientX, y: event.clientY }
          this.scrollStart = {
            left: this.scrollElement?.scrollLeft || 0,
            top: this.scrollElement?.scrollTop || 0,
          }
          event.target.setPointerCapture(event.pointerId)
          return
        }

        const point = this.canvasPosition(event)
        this.ctx.beginPath()
        this.ctx.moveTo(point.x, point.y)
        this.ctx.lineWidth = this.strokeWidth

        if (this.toolMode === 'erase') {
          this.ctx.globalCompositeOperation = 'destination-out'
          this.ctx.strokeStyle = 'rgba(0,0,0,1)'
          this.ctx.shadowBlur = 0
        } else {
          this.ctx.globalCompositeOperation = 'source-over'
          this.ctx.strokeStyle = this.strokeColor
          this.ctx.shadowColor = `${this.strokeColor}66`
          this.ctx.shadowBlur = Math.max(1, this.strokeWidth * 0.7)
        }

        this.previousPoint = point
        this.currentStroke = [point]
        this.drawing = true
        event.target.setPointerCapture(event.pointerId)
      },
      draw (event) {
        if (!this.isEnabled || !this.ctx) return

        if (this.panning && this.scrollElement && this.panStart && this.scrollStart) {
          const deltaX = event.clientX - this.panStart.x
          const deltaY = event.clientY - this.panStart.y
          this.scrollElement.scrollTo({
            left: this.scrollStart.left - deltaX,
            top: this.scrollStart.top - deltaY,
            behavior: 'auto',
          })
          return
        }

        if (!this.drawing) return

        const point = this.canvasPosition(event)
        const prev = this.previousPoint || point
        const controlX = (prev.x + point.x) / 2
        const controlY = (prev.y + point.y) / 2

        this.ctx.quadraticCurveTo(prev.x, prev.y, controlX, controlY)
        this.ctx.stroke()

        this.previousPoint = point
        this.currentStroke.push(point)
      },
      stopDrawing (event) {
        if (this.panning) {
          this.panning = false
          this.panStart = null
          this.scrollStart = null
          if (event?.target?.hasPointerCapture?.(event.pointerId)) {
            event.target.releasePointerCapture(event.pointerId)
          }
          return
        }

        if (!this.drawing || !this.ctx) return

        this.drawing = false
        this.previousPoint = null
        this.ctx.closePath()
        this.ctx.shadowBlur = 0
        this.ctx.globalCompositeOperation = 'source-over'
        if (event?.target?.hasPointerCapture?.(event.pointerId)) {
          event.target.releasePointerCapture(event.pointerId)
        }

        if (this.autoEnhanceEnabled && this.toolMode === 'draw') {
          this.applySmartEnhancement(this.currentStroke)
        }

        this.currentStroke = []
        this.saveCurrentSketch()
      },
      applySmartEnhancement (stroke) {
        if (!Array.isArray(stroke) || stroke.length < 8 || !this.ctx) return

        const bounds = this.getStrokeBounds(stroke)
        const circle = this.detectCircle(stroke, bounds)
        if (circle) {
          this.clearBounds(bounds, 8)
          this.ctx.beginPath()
          this.ctx.lineWidth = this.strokeWidth
          this.ctx.strokeStyle = this.strokeColor
          this.ctx.arc(circle.cx, circle.cy, circle.radius, 0, Math.PI * 2)
          this.ctx.stroke()
          this.ctx.closePath()
          return
        }

        const symbol = this.detectSymbol(stroke, bounds)
        if (!symbol) return

        this.clearBounds(bounds, 10)
        const fontSize = Math.max(18, Math.min(72, bounds.height * 1.2, bounds.width * 1.2))
        this.ctx.globalCompositeOperation = 'source-over'
        this.ctx.fillStyle = this.strokeColor
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.font = `600 ${fontSize}px "Segoe Script", "Comic Sans MS", cursive`
        this.ctx.fillText(symbol, bounds.cx, bounds.cy)
      },
      detectCircle (stroke, bounds) {
        const widthHeightRatio = Math.abs(bounds.width - bounds.height) / Math.max(1, Math.max(bounds.width, bounds.height))
        const first = stroke[0]
        const last = stroke.at(-1)
        const closure = Math.hypot(last.x - first.x, last.y - first.y)

        const cx = bounds.cx
        const cy = bounds.cy
        const radii = stroke.map(point => Math.hypot(point.x - cx, point.y - cy))
        const mean = radii.reduce((sum, radius) => sum + radius, 0) / radii.length
        const variance = radii.reduce((sum, radius) => sum + Math.abs(radius - mean), 0) / radii.length
        const normalizedVariance = variance / Math.max(1, mean)

        if (widthHeightRatio < 0.35 && closure < mean * 0.65 && normalizedVariance < 0.35) {
          return {
            cx,
            cy,
            radius: mean,
          }
        }

        return null
      },
      detectSymbol (stroke, bounds) {
        const isClosed = Math.hypot(
          stroke[0].x - stroke.at(-1).x,
          stroke[0].y - stroke.at(-1).y,
        ) < Math.max(bounds.width, bounds.height) * 0.35
        const aspect = bounds.width / Math.max(1, bounds.height)

        if (isClosed && aspect > 0.65 && aspect < 1.35) return 'O'
        if (!isClosed && aspect < 0.45) return '1'
        if (!isClosed && aspect > 1.4) return '-'
        if (!isClosed && aspect > 0.45 && aspect < 0.75) return 'J'
        if (!isClosed && aspect >= 0.75 && aspect <= 1.4) return 'A'

        return null
      },
      getStrokeBounds (stroke) {
        const xs = stroke.map(point => point.x)
        const ys = stroke.map(point => point.y)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)

        return {
          minX,
          maxX,
          minY,
          maxY,
          width: Math.max(1, maxX - minX),
          height: Math.max(1, maxY - minY),
          cx: (minX + maxX) / 2,
          cy: (minY + maxY) / 2,
        }
      },
      clearBounds (bounds, padding = 6) {
        this.ctx.clearRect(
          bounds.minX - padding,
          bounds.minY - padding,
          bounds.width + padding * 2,
          bounds.height + padding * 2,
        )
      },
      resolveScrollElement () {
        const stage = this.$el?.closest?.('.day-events-stage')
        if (!stage) return null

        const selectors = [
          '.v-calendar-daily__scroll-area',
          '.v-calendar-daily__body',
          '.v-calendar-weekly__scroll-area',
        ]

        for (const selector of selectors) {
          const node = stage.querySelector(selector)
          if (node && node.scrollHeight > node.clientHeight) return node
        }

        return Array.from(stage.querySelectorAll('div')).find(
          node => node.scrollHeight > node.clientHeight + 5,
        ) || null
      },
      saveCurrentSketch () {
        const canvas = this.$refs.canvasRef
        if (!canvas) return

        this.drawingsByDay[this.dayKey] = {
          image: canvas.toDataURL('image/png'),
          width: this.canvasSize.width,
          height: this.canvasSize.height,
        }
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

        this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)
        const sketch = this.drawingsByDay[this.dayKey]
        if (!sketch) return

        const imageSource = typeof sketch === 'string' ? sketch : sketch.image
        if (!imageSource) return

        const sourceWidth = typeof sketch === 'string' ? this.canvasSize.width : sketch.width
        const sourceHeight = typeof sketch === 'string' ? this.canvasSize.height : sketch.height

        const image = new Image()
        image.addEventListener('load', () => {
          const widthRatio = this.canvasSize.width / Math.max(1, sourceWidth)
          const heightRatio = this.canvasSize.height / Math.max(1, sourceHeight)
          const ratio = Math.min(widthRatio, heightRatio)
          const targetWidth = sourceWidth * ratio
          const targetHeight = sourceHeight * ratio

          this.ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
        })
        image.src = imageSource
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
  z-index: 450;
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
  z-index: 700;
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

.sketch-tool-toggle {
  max-width: 180px;
}

.sketch-auto-switch {
  min-width: 120px;
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

.sketch-overlay--active .sketch-canvas {
  cursor: crosshair;
}

.sketch-canvas--pan {
  cursor: grab;
}
</style>
