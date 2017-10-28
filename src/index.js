import css from './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import paper from 'paper'
import {Handle} from './handle'
import {HandlesManager} from './handlesManager'
import {ReplicatorTool} from './replicatorTool'

class SnapHandle extends Handle {
  coerceCoordinate(point) {
    return new Point(Math.round(point.x / 10) * 10, Math.round(point.y / 10) * 10);
  }
}

class CanvasApp {
  constructor() {
    this.handleManager = new HandlesManager(this)
    this.handleManager.register(new Handle(new Point(0,0)))
    this.handleManager.register(new Handle(new Point(15,0)))
    this.handleManager.register(new SnapHandle(new Point(15,15)))
    // this.point = new Shape.Circle(new Point(0,0), 3)
    // this.point.strokeColor = 'black';

    new ReplicatorTool(this, {center: {x: 30, y: 30}, radius: 80, slices: 8})
    new ReplicatorTool(this, {center: {x: -130, y: -50}, radius: 90, slices: 8})
  }

  onMouseCursorChange(callback) { this._onMouseCursorChange = callback }
  setCursor(cursor) { this._onMouseCursorChange(cursor) }
}

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {cursor: null}
  }

  componentDidMount() {
    paper.install(window)
    paper.setup(this.canvas)
    paper.view.center = [0,0]
    this.app = new CanvasApp()
    this.app.onMouseCursorChange((cursor) => {
      this.setState((prevState, props) => ({cursor: cursor}))
    })
  }

  render() {
    return (<div className="root">
      <div className="canvas-container">
        <h1>Almixcomi</h1>
        <canvas id="canvas" data-paper-resize="true" className={`cursor--${this.state.cursor}`}
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
