export class ButtonsManager {
  constructor(app) {
    this.app = app
    this.buttons = new Set()
  }

  register(button) {
    this.buttons.add(button)
  }

  unregister(button) {
    this.buttons.delete(button)
  }

  _displayButtonsAt(point) {
    this.buttons.forEach(b => {
      if (b.visibleHitTest(point)) {
        b.show()
      } else {
        b.hide()
      }
    })
  }

  activate() {
    this._displayButtonsAt(null)
  }

  deactivate() {
    this.buttons.forEach(b => { b.hide() })
  }

  onMouseMove(event) {
    this._displayButtonsAt(event.point)

    var exists = false
    this.buttons.forEach((b) => {
      if (!exists && b.hitTest(event.point)) {
        b.hover()
        this.app.setCursor("pointer")
        exists = true
      } else {
        b.blur()
      }
    })
  }

  onMouseDown(event) {
    var exists = false
    this.buttons.forEach((b) => {
      if (!exists && b.hitTest(event.point)) {
        this._setHoverButton(b)
        b.mouseDown()
        exists = true
      }
    })
    if (!exists) {
      this._setHoverButton(null)
    }
  }

  onMouseDrag(event) {

  }

  onMouseUp(event) {
    if (this.hoverButton && this.hoverButton.hitTest(event.point)) {
      this.hoverButton.mouseUp()
    }
    this._displayButtonsAt(event.point)
  }

  _setHoverButton(button) {
    if (this.hoverButton) {
      this.hoverButton.blur()
    }
    this.hoverButton = button
    if (this.hoverButton) {
      this.hoverButton.hover()
    }
  }
}
