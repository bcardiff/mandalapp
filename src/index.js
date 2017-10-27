import css from './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import paper from 'paper'

const HANDLE_DEFAULT = '#ccc'
const HANDLE_HOVER = '#aaa'
const HANDLE_ACTIVE = '#666'

class Handle {
  constructor(point) {
    this.shape = new Shape.Circle(point, 4)
    this.setColor(HANDLE_DEFAULT)
  }

  setColor(color) {
    this.shape.strokeColor = color
  }

  hitTest(point) {
    return this.shape.contains(point)
  }

  beginDrag(point) {
    this.userInteractionDelta = new Matrix().translate(this.shape.position.x - point.x, this.shape.position.y - point.y)
  }

  endDrag() {
    this.userInteractionDelta = null;
  }

  userMovedTo(point) {
    this.shape.position = this.coerceCoordinate(this.userInteractionDelta.transform(point))
  }

  coerceCoordinate(point) {
    return point;
  }
}

class SnapHandle extends Handle {
  coerceCoordinate(point) {
    return new Point(Math.round(point.x / 10) * 10, Math.round(point.y / 10) * 10);
  }
}

class HandlesManager {
  constructor() {
    this.handles = new Set()
    this.movePointsTool = new Tool()
    this.movePointsTool.onMouseMove = (event) => {
      var exists = false
      this.handles.forEach((h) => {
        if (h.hitTest(event.point)) {
          this._setHoverHandle(h)
          exists = true
        }
      })
      if (!exists) {
        this._setHoverHandle(null)
      }
    }
    this.movePointsTool.onMouseDown = (event) => {
      if (this.hoverHandle) {
        this.hoverHandle.setColor(HANDLE_ACTIVE)
        this.hoverHandle.beginDrag(event.point)
      }
    }
    this.movePointsTool.onMouseDrag = (event) => {
      if (this.hoverHandle) {
        this.hoverHandle.userMovedTo(event.point)
      }
    }
    this.movePointsTool.onMouseUp = (event) => {
      if (this.hoverHandle) {
        this.hoverHandle.setColor(HANDLE_HOVER)
        this.hoverHandle.endDrag(null)
      }
    }
  }

  _setHoverHandle(handle) {
    if (this.hoverHandle) {
      this.hoverHandle.setColor(HANDLE_DEFAULT)
    }
    this.hoverHandle = handle
    if (this.hoverHandle) {
      this.hoverHandle.setColor(HANDLE_HOVER)
    }
  }

  register(handle) {
    this.handles.add(handle)
  }

  enableUserInteraction() {
    this.movePointsTool.activate()
  }
}

class CanvasApp {
  constructor() {
    this.handleManager = new HandlesManager()
    this.handleManager.register(new Handle(new Point(0,0)))
    this.handleManager.register(new Handle(new Point(15,0)))
    this.handleManager.register(new SnapHandle(new Point(15,15)))
    // this.point = new Shape.Circle(new Point(0,0), 3)
    // this.point.strokeColor = 'black';


  }
}

class Root extends React.Component {
  componentDidMount() {
    paper.install(window)
    paper.setup(this.canvas)
    paper.view.center = [0,0]
    this.app = new CanvasApp()
  }

  render() {
    return (<div className="root">
      <div className="canvas-container">
        <h1>Almixcomi</h1>
        <canvas id="canvas" data-paper-resize="true"
          ref={(d) => { this.canvas = d }}></canvas>
      </div>
      <div className="footer">
      </div>
    </div>)
  }
}

var div = document.createElement("div")
document.body.appendChild(div)
ReactDOM.render(<Root/>, div)
