import paper from 'paper'

export class TraceBuilder {
  constructor(app) {
    this.app = app
    this.app.drawLayer.activate()
    this.path = new Path()
    this.path.strokeColor = this.app.strokeColor()
    this.path.strokeWidth = this.app.strokeWidth()
  }

  append(point) {
    this.path.add(point)
  }
}
