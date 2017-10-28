export class HandlesManager {
  constructor(app) {
    this.app = app
    this.handles = new Set()
    this.movePointsTool = new Tool()
    this.movePointsTool.onMouseMove = (event) => {
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
        this.app.setCursor(null)
      }
    }
    this.movePointsTool.onMouseDown = (event) => {
      if (this.hoverHandle) {
        this.hoverHandle.beginDrag(event.point)
        this.app.setCursor("grabbing")
      }
    }
    this.movePointsTool.onMouseDrag = (event) => {
      if (this.hoverHandle) {
        this.hoverHandle.userMovedTo(event.point)
      }
    }
    this.movePointsTool.onMouseUp = (event) => {
      if (this.hoverHandle) {
        this.hoverHandle.endDrag(null)
        this.app.setCursor("grab")
      }
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

  register(handle) {
    this.handles.add(handle)
  }

  enableUserInteraction() {
    this.movePointsTool.activate()
  }
}
