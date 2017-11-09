import paper from 'paper'
import Emitter from 'component-emitter'
import {Handle} from './handle'
import {TraceBuilder} from './traceBuilder'
import {Button} from './button'

const TOOL_STROKE = '#c0c0c0'
const MIN_RADIUS = 10

function range(start, end) {
  return new Array(end - start + 1).fill().map((d, i) => i + start)
}

class CenterHandle extends Handle {
  constructor(tool) {
    super(CenterHandle._calcHandlePosition(tool), "c")
    this.tool = tool
    this.tool.app.handlesManager.register(this)

    this.tool.onChanged(() => {
      this.updatePosition(CenterHandle._calcHandlePosition(this.tool))
    })
    this.onMoved((point) => this.tool.setCenter(point))
  }

  visibleHitTest(point) { return this.tool.displayControls(point) }

  static _calcHandlePosition(tool) {
    return tool.layoutInfo().center
  }

  remove() {
    super.remove()
    this.tool.app.handlesManager.unregister(this)
  }
}

class RadiusHandle extends Handle {
  constructor(tool) {
    super(RadiusHandle._calcHandlePosition(tool), "r")
    this.tool = tool
    this.tool.app.handlesManager.register(this)

    this.tool.onChanged(() => {
      this.updatePosition(RadiusHandle._calcHandlePosition(this.tool))
    })
    this.onMoved((point) => this.tool.setRadius(this._nearestRection(point).radius))
  }

  visibleHitTest(point) { return this.tool.displayControls(point) }

  coerceCoordinate(point) {
    return this._nearestRection(point).point
  }

  static _calcHandlePosition(tool) {
    return tool.layoutInfo().startPoint
  }

  _nearestRection(point) {
    // TODO use startPoint--center angle
    const {center} = this.tool.layoutInfo()
    const radius = Math.max(center.x - point.x, MIN_RADIUS)
    return {radius, point: new Point(center.x - radius, center.y)}
  }

  remove() {
    super.remove()
    this.tool.app.handlesManager.unregister(this)
  }
}

class SliceCountHandle extends Handle {
  constructor(tool) {
    super(SliceCountHandle._calcHandlePosition(tool), "#")
    this.tool = tool
    this.tool.app.handlesManager.register(this)

    this.tool.onChanged(() => {
      this.updatePosition(SliceCountHandle._calcHandlePosition(this.tool))
    })
    this.onMoved((point) => this.tool.setSlices(this._nearestRection(point).slices))
  }

  visibleHitTest(point) { return this.tool.displayControls(point) }

  coerceCoordinate(point) {
    return this._nearestRection(point).point
  }

  static _calcHandlePosition(tool) {
    const {startPoint, sliceAngle, center} = tool.layoutInfo()
    return startPoint.rotate(sliceAngle, center)
  }

  _nearestRection(point) {
    const {startPoint, sliceAngle, center} = this.tool.layoutInfo()
    return range(2, 50).filter(n => n % 2 == 0)
      .map(ns => ({slices: ns, point: startPoint.rotate(360.0 / ns, center)}))
      .reduce((res, p) => point.getDistance(res.point) < point.getDistance(p.point) ? res : p)
  }

  remove() {
    super.remove()
    this.tool.app.handlesManager.unregister(this)
  }
}

class RemoveButton extends Button {
  constructor(tool) {
    super(RemoveButton._calcHandlePosition(tool), "x")
    this.tool = tool
    this.tool.app.buttonsManager.register(this)

    this.tool.onChanged(() => {
      this.updatePosition(RemoveButton._calcHandlePosition(this.tool))
    })

    this.onClick(() => {
      tool.app.removeReplicator(tool)
    })
  }

  static _calcHandlePosition(tool) {
    return tool.layoutInfo().startPoint.add(new Point(-30, 0))
  }

  visibleHitTest(point) { return this.tool.displayControls(point) }

  remove() {
    super.remove()
    this.tool.app.buttonsManager.unregister(this)
  }
}

class ModeButton extends Button {
  constructor(tool, mode, label, deg) {
    super(ModeButton._calcHandlePosition(tool, deg), label)
    this.tool = tool
    this.tool.app.buttonsManager.register(this)
    this.mode = mode

    this.tool.onChanged(() => {
      this.updatePosition(ModeButton._calcHandlePosition(this.tool, deg))
    })

    this.onClick(() => {
      this.tool.setMode(this.mode)
    })
  }

  static _calcHandlePosition(tool, deg) {
    const {startPoint, center} = tool.layoutInfo()
    return startPoint.add(new Point(-30, 0)).rotate(deg, center)
  }

  visibleHitTest(point) { return this.tool.props.mode != this.mode && this.tool.displayControls(point) }

  remove() {
    super.remove()
    this.tool.app.buttonsManager.unregister(this)
  }
}

export class ReplicatorTool {
  constructor(app, props) {
    this._emitter = new Emitter()
    this.app = app
    this.props = props

    this.app.guidesLayer.activate()

    const center = new Point(props.center.x, props.center.y)
    const startPoint = new Point(center.x - this.props.radius, center.y)
    const sliceAngle = 360.0 / this.props.slices

    this.shape = new Shape.Circle(center, props.radius)
    this.shape.strokeColor = TOOL_STROKE

    this.groupedLines = new Group([])
    this.groupedShapes = new Group([this.shape, this.groupedLines])
    this._buildLines()

    this.centerHandle = new CenterHandle(this)
    this.slicesCountHandle = new SliceCountHandle(this)
    this.radiusHandle = new RadiusHandle(this)

    this.removeButton = new RemoveButton(this)
    this.cloneButton = new ModeButton(this, 'clone', '//', 10)
    this.mirrorButton = new ModeButton(this, 'mirror', '/\\', 20)
  }

  setCenter(point) {
    const center0 = new Point(this.props.center.x, this.props.center.y)
    this.props.center = {x: point.x, y: point.y}
    this.groupedShapes.translate(point.subtract(center0))
    this._emitter.emit('changed')
  }

  setRadius(radius) {
    radius = Math.max(radius, MIN_RADIUS)
    this.props.radius = radius
    this.shape.radius = radius
    this._buildLines()
    this._emitter.emit('changed')
  }

  setMode(mode) {
    this.props.mode = mode
    this._emitter.emit('changed')
  }

  setSlices(count) {
    this.props.slices = count
    this._buildLines()
    this._emitter.emit('changed')
  }

  _pointForSlice(point, sliceIndex, layoutInfo) {
    const {sliceAngle, center, startPoint} = layoutInfo
    const clonedPoint = point.rotate(sliceIndex * sliceAngle, center)
    if (this.props.mode == 'mirror' && sliceIndex % 2 == 1) {
      const sliceStart = startPoint.rotate(sliceIndex * sliceAngle, center)
      const mirror = sliceStart.subtract(center).getDirectedAngle(clonedPoint.subtract(center))
      return clonedPoint.rotate(- sliceAngle - 2 * mirror, center)
    } else {
      return clonedPoint
    }
  }

  previewAt(point) {
    if (this.shape.contains(point)) {
      const layoutInfo = this.layoutInfo()
      if (this.previews == null) {
        this.previews = range(0, this.props.slices - 1)
          .map(s => this.app.buildTracePreview(this._pointForSlice(point, s, layoutInfo)))
      } else {
        this.previews.forEach((p, s) => p.position = this._pointForSlice(point, s, layoutInfo))
      }
    } else {
      if (this.previews != null) {
        this.previews.forEach(p => p.remove())
        this.previews = null
      }
    }
  }

  drawingAt(point) {
    if (this.shape.contains(point)) {
      const layoutInfo = this.layoutInfo()
      if (this.traces == null) {
        // this.originalSliceIndex = this.getSliceIndex(point)
        this.traces = range(0, this.props.slices - 1)
          .map(s => new TraceBuilder(this.app))
      }
      this.traces.forEach((t, s) => t.append(this._pointForSlice(point, s, layoutInfo)))
    } else {
      this.traces = null
    }
  }

  stopDrawing() {
    this.traces = null
  }

  // getSliceIndex(point) {
  //   const {center, startPoint, sliceAngle} = this.layoutInfo()
  //   const sliceIndex = (Math.floor(startPoint.subtract(center).getDirectedAngle(point.subtract(center)) / sliceAngle) + this.props.slices) % this.props.slices
  //   return sliceIndex
  // }

  layoutInfo() {
    const center = new Point(this.props.center.x, this.props.center.y)
    const startPoint = new Point(center.x - this.props.radius, center.y)
    const sliceAngle = 360.0 / this.props.slices

    return {center, startPoint, sliceAngle}
  }

  isNear(point) {
    return point.getDistance(this.layoutInfo().center) < this.props.radius + 40
  }

  displayControls(point) {
    return this.app.mode == 'pointer'
  }

  onChanged(callback) {
    this._emitter.on('changed', callback)
  }

  remove() {
    this.groupedShapes.remove()

    this.centerHandle.remove()
    this.slicesCountHandle.remove()
    this.radiusHandle.remove()
    this.removeButton.remove()
    this.cloneButton.remove()
    this.mirrorButton.remove()
  }

  _buildLines() {
    const {startPoint, sliceAngle, center} = this.layoutInfo()

    this.groupedLines.removeChildren()
    for(var i = 0; i < this.props.slices; i++) {
      var line = new Path.Line({from: startPoint, to: center, strokeColor: TOOL_STROKE});
      line.rotate(i * sliceAngle, center)
      this.groupedLines.addChild(line)
    }
  }
}
