import paper from 'paper'
import {Handle} from './handle'
import Emitter from 'component-emitter'

const TOOL_STROKE = '#c0c0c0'

class SliceCountHandle extends Handle {
  constructor(tool) {
    super(SliceCountHandle._calcHandlePosition(tool))
    this.tool = tool
    this.tool.app.handleManager.register(this)

    this.tool.onChanged(() => {
      this.updatePosition(SliceCountHandle._calcHandlePosition(this.tool))
    })
  }

  coerceCoordinate(point) {
    return point
    // return new Point(Math.round(point.x / 10) * 10, Math.round(point.y / 10) * 10)
  }

  static _calcHandlePosition(tool) {
    const {startPoint, sliceAngle, center} = tool.layoutInfo()
    return startPoint.rotate(sliceAngle, center)
  }
}

export class ReplicatorTool {
  constructor(app, props) {
    this._emitter = new Emitter()
    this.app = app
    this.props = props

    const center = new Point(props.center.x, props.center.y)
    const startPoint = new Point(center.x - this.props.radius, center.y)
    const sliceAngle = 360.0 / this.props.slices

    this.shape = new Shape.Circle(center, props.radius)
    this.shape.strokeColor = TOOL_STROKE

    this.groupedShapes = new Group([this.shape])

    for(var i = 0; i < this.props.slices; i++) {
      var line = new Path.Line({from: startPoint, to: center, strokeColor: TOOL_STROKE});
      line.rotate(i * sliceAngle, center)
      this.groupedShapes.addChild(line)
    }

    this.centerHandle = new Handle(center)
    this.app.handleManager.register(this.centerHandle)
    this.centerHandle.onMoved((p) => { this._setCenter(p) })

    this.slicesCountHandle = new SliceCountHandle(this)
  }

  _setCenter(point) {
    const center0 = new Point(this.props.center.x, this.props.center.y)
    this.props.center = {x: point.x, y: point.y}
    this.groupedShapes.translate(point.subtract(center0))
    this._emitter.emit('changed')
  }

  layoutInfo() {
    const center = new Point(this.props.center.x, this.props.center.y)
    const startPoint = new Point(center.x - this.props.radius, center.y)
    const sliceAngle = 360.0 / this.props.slices

    return {center, startPoint, sliceAngle}
  }

  onChanged(callback) {
    this._emitter.on('changed', callback)
  }
}
