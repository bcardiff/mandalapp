import paper from 'paper'

const HANDLE_DEFAULT = '#ccc'
const HANDLE_HOVER = '#aaa'
const HANDLE_ACTIVE = '#666'

export class Handle {
  constructor(point) {
    this.shape = new Shape.Circle(point, 4)
    this.setColor(HANDLE_DEFAULT)
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
  }

  coerceCoordinate(point) {
    return point;
  }
}
