import paper from 'paper'
import Emitter from 'component-emitter'

const BUTTON_SIZE = 20
const FONT_SIZE = BUTTON_SIZE * 0.65

const BUTTON_DEFAULT = '#ccc'
const BUTTON_HOVER = '#aaa'
const BUTTON_ACTIVE = '#666'

export class Button {
  constructor(point, text) {
    this._emitter = new Emitter()

    this.shape = new Shape.Rectangle(new Rectangle(point.subtract(new Point(BUTTON_SIZE / 2, BUTTON_SIZE / 2)), BUTTON_SIZE), new Size(4,4))
    this.shape.strokeColor = BUTTON_DEFAULT

    this.text = new PointText({
      point: point.add(new Point(0, FONT_SIZE * 0.23)),
      content: text,
      fontFamily: 'Courier New',
      fontSize: FONT_SIZE,
      fillColor: BUTTON_DEFAULT,
      justification: 'center'
    })

    this.hide()
  }

  remove() {
    this.shape.remove()
    this.text.remove()
  }

  updatePosition(point) {
    this.shape.position = point
    this.text.point = point.add(new Point(0, FONT_SIZE * 0.23))
  }

  show() {
    this.shape.visible = true
    this.text.visible = true
  }

  hide() {
    this.shape.visible = false
    this.text.visible = false
  }

  hitTest(point) {
    return this.shape.contains(point)
  }

  visibleHitTest(point) {
    return hitTest(point)
  }

  hover() {
    this.shape.strokeColor = BUTTON_HOVER
  }

  blur() {
    this.shape.strokeColor = BUTTON_DEFAULT
  }

  mouseDown() {
    this.shape.strokeColor = BUTTON_ACTIVE
  }

  mouseUp() {
    this.shape.strokeColor = BUTTON_HOVER
    this._emitter.emit("clicked")
  }

  onClick(callback) {
    this._emitter.on("clicked", callback)
  }
}
