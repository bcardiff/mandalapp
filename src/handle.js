import paper from 'paper'
import Emitter from 'component-emitter'

const HANDLE_DEFAULT = '#ccc'
const HANDLE_HOVER = '#aaa'
const HANDLE_ACTIVE = '#666'
const HANDLE_SIZE = 12

export class Handle {
  constructor(point) {
    this._emitter = new Emitter()
    this.shape = new Shape.Circle(point, HANDLE_SIZE / 2)
    this.setColor(HANDLE_DEFAULT)
  }

  getShape() {
    return this.shape
  }

  setColor(color) {
    this.shape.strokeColor = color
  }

  setDefaultColor() { this.setColor(HANDLE_DEFAULT) }
  setHoverColor() { this.setColor(HANDLE_HOVER) }

  hitTest(point) {
    return this.shape.contains(point)
  }

  beginDrag(point) {
    this.setColor(HANDLE_ACTIVE)
    this.userInteractionDelta = new Matrix().translate(this.shape.position.x - point.x, this.shape.position.y - point.y)
  }

  endDrag() {
    this.setColor(HANDLE_HOVER)
    this.userInteractionDelta = null;
  }

  userMovedTo(point) {
    this.shape.position = this.coerceCoordinate(this.userInteractionDelta.transform(point))
    this._emitter.emit('moved', this.shape.position)
  }

  updatePosition(point) {
    this.shape.position = point
  }

  coerceCoordinate(point) {
    return point
  }

  onMoved(callback) {
    this._emitter.on('moved', callback)
  }
}
