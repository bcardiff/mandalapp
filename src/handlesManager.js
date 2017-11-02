export class HandlesManager {
  constructor(app) {
    this.app = app
    this.handles = new Set()
  }

  register(handle) {
    this.handles.add(handle)
  }

  unregister(handle) {
    this.handles.delete(handle)
  }

  activate() {
    this._displayButtonsAt(null)
  }

  deactivate() {
    this.handles.forEach(h => { h.hide() })
  }

  _displayButtonsAt(point) {
    this.handles.forEach(h => {
      if (h.visibleHitTest(point)) {
        h.show()
      } else {
        h.hide()
      }
    })
  }

  onMouseMove(event) {
    this._displayButtonsAt(event.point)

    var exists = false
    this.handles.forEach((h) => {
      if (h.hitTest(event.point)) {
        this._setHoverHandle(h)
        this.app.setCursor("grab")
        exists = true
      }
    })
    if (!exists) {
      this._setHoverHandle(null)
    }
  }

  onMouseDown(event) {
    if (this.hoverHandle) {
      this.hoverHandle.beginDrag(event.point)
      this.app.setCursor("grabbing")
    }
  }

  onMouseDrag(event) {
    if (this.hoverHandle) {
      this.hoverHandle.userMovedTo(event.point)
    }
  }

  onMouseUp(event) {
    if (this.hoverHandle) {
      this.hoverHandle.endDrag(null)
      this.app.setCursor("grab")
    }
  }

  _setHoverHandle(handle) {
    if (this.hoverHandle) {
      this.hoverHandle.setDefaultColor()
    }
    this.hoverHandle = handle
    if (this.hoverHandle) {
      this.hoverHandle.setHoverColor()
    }
  }
}
