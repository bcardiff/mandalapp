import paper from 'paper'

const STROKE_LENS_MARGIN = 8

export class PencilCommand {
  constructor(app) {
    this.tool = new Tool()
    this.app = app

    this.tool.onMouseMove = (event) => {
      const point = event.point
      if (this.shape) {
        this.shape.position = point
      } else {
        this.app.setCursor("none")
        this.app.cursorLayer.activate()
        this.shape = new Group([
          new Shape.Circle({center: point, radius: this.app.strokeWidth() + STROKE_LENS_MARGIN, strokeColor: this.app.strokeColor() }),
          this.app.buildTracePreview(point),
        ])
      }
      this.app.previewAt(point)
    }
    this.tool.onMouseDown = (event) => {
      this.app.drawingAt(event.point)
    }
    this.tool.onMouseDrag = (event) => {
      this.shape.position = event.point
      this.app.drawingAt(event.point)
    }
    this.tool.onMouseUp = (event) => {
      this.app.stopDrawing()
    }
  }

  activate() {
    this.deactivate()
    this.tool.activate()
    this.shape = null
  }

  deactivate() {
    if (this.shape) {
      this.shape.remove()
    }
  }
}
