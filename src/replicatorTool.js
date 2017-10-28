import paper from 'paper'
import {Handle} from './handle'
import Emitter from 'component-emitter'

const TOOL_STROKE = '#c0c0c0'

function range(start, end) {
  return new Array(end - start + 1).fill().map((d, i) => i + start)
}

class SliceCountHandle extends Handle {
  constructor(tool) {
    super(SliceCountHandle._calcHandlePosition(tool))
    this.tool = tool
    this.tool.app.handleManager.register(this)

    this.tool.onChanged(() => {
      this.updatePosition(SliceCountHandle._calcHandlePosition(this.tool))
    })
    this.onMoved((point) => this.tool.setSlices(this._nearestRection(point).slices))
  }

  coerceCoordinate(point) {
    return this._nearestRection(point).point
  }

  static _calcHandlePosition(tool) {
    const {startPoint, sliceAngle, center} = tool.layoutInfo()
    return startPoint.rotate(sliceAngle, center)
  }

  _nearestRection(point) {
    const {startPoint, sliceAngle, center} = this.tool.layoutInfo()
    return range(2, 30).filter(n => n % 2 == 0)
      .map(ns => ({slices: ns, point: startPoint.rotate(360.0 / ns, center)}))
      .reduce((res, p) => point.getDistance(res.point) < point.getDistance(p.point) ? res : p)
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

    this.groupedLines = new Group([])
    this.groupedShapes = new Group([this.shape, this.groupedLines])
    this._buildLines()

    this.centerHandle = new Handle(center)
    this.app.handleManager.register(this.centerHandle)
    this.centerHandle.onMoved((p) => { this.setCenter(p) })

    this.slicesCountHandle = new SliceCountHandle(this)
  }

  setCenter(point) {
    const center0 = new Point(this.props.center.x, this.props.center.y)
    this.props.center = {x: point.x, y: point.y}
    this.groupedShapes.translate(point.subtract(center0))
    this._emitter.emit('changed')
  }

  setSlices(count) {
    this.props.slices = count
    this.groupedLines.removeChildren()
    this._buildLines()
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

  _buildLines() {
    const {startPoint, sliceAngle, center} = this.layoutInfo()

    for(var i = 0; i < this.props.slices; i++) {
      var line = new Path.Line({from: startPoint, to: center, strokeColor: TOOL_STROKE});
      line.rotate(i * sliceAngle, center)
      this.groupedLines.addChild(line)
    }
  }
}
