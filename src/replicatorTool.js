import paper from 'paper'
import {Handle} from './handle'

const TOOL_STROKE = '#c0c0c0'

export class ReplicatorTool {
  constructor(app, props) {
    this.app = app
    this.props = props

    const center = new Point(props.center.x, props.center.y)
    this.shape = new Shape.Circle(center, props.radius)
    this.shape.strokeColor = TOOL_STROKE

    this.groupedShapes = new Group([this.shape])

    for(var i = 0; i < this.props.slices; i++) {
      var line = new Path.Line({
        from: [center.x - this.props.radius, center.y],
        to: [center.x, center.y],
        strokeColor: TOOL_STROKE
      });
      line.rotate(i / this.props.slices * 360.0, center)

      this.groupedShapes.addChild(line)
    }

    this.centerHandle = new Handle(center)
    this.centerHandle.onMoved((p) => { this._setCenter(p) })
    this.app.handleManager.register(this.centerHandle)
  }

  _setCenter(point) {
    const center0 = new Point(this.props.center.x, this.props.center.y)
    this.props.center = {x: point.x, y: point.y}
    this.groupedShapes.translate(point.subtract(center0))
  }
}
