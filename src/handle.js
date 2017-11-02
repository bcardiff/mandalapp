import paper from 'paper'
import Emitter from 'component-emitter'

const HANDLE_DEFAULT = '#ccc'
const HANDLE_HOVER = '#aaa'
const HANDLE_ACTIVE = '#666'
const HANDLE_SIZE = 24

const FONT_SIZE = HANDLE_SIZE * 0.65

export class Handle {
  constructor(point, text) {
    this._emitter = new Emitter()
    this.shape = new Shape.Circle(point, HANDLE_SIZE / 2)
    this.shape.fillColor = "#fff"

    this.text = new PointText({
      point: point.add(new Point(0, FONT_SIZE * 0.23)),
      content: text,
      fontFamily: 'Courier New',
      fontSize: FONT_SIZE,
      fillColor: HANDLE_DEFAULT,
      justification: 'center'
    })

    this.setColor(HANDLE_DEFAULT)
    this.hide()
  }

  remove() {
    this.shape.remove()
    this.text.remove()
  }

  show() {
    this.shape.visible = true
    this.text.visible = true
  }

  hide() {
    this.shape.visible = false
    this.text.visible = false
  }

  setColor(color) {
    this.shape.strokeColor = color
  }

  setDefaultColor() { this.setColor(HANDLE_DEFAULT) }
  setHoverColor() { this.setColor(HANDLE_HOVER) }

  hitTest(point) {
    return this.shape.contains(point)
  }

  visibleHitTest(point) {
    return this.hitTest(point)
  }

  beginDrag(point) {
    this.setColor(HANDLE_ACTIVE)
    this.userInteractionDelta = new Matrix().translate(this.shape.position.x - point.x, this.shape.position.y - point.y)
  }

  endDrag() {
    this.setColor(HANDLE_HOVER)
    this.userInteractionDelta = null
  }

  userMovedTo(point) {
    const newPosition = this.coerceCoordinate(this.userInteractionDelta.transform(point))
    this.shape.position = newPosition
    this.text.position = newPosition
    this._emitter.emit('moved', this.shape.position)
  }

  updatePosition(point) {
    this.shape.position = point
    this.text.position = point
  }

  coerceCoordinate(point) {
    return point
  }

  onMoved(callback) {
    this._emitter.on('moved', callback)
  }
}
