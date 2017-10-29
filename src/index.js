import css from './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import paper from 'paper'
import Emitter from 'component-emitter'
import {Handle} from './handle'
import {HandlesManager} from './handlesManager'
import {ReplicatorTool} from './replicatorTool'

class SnapHandle extends Handle {
  coerceCoordinate(point) {
    return new Point(Math.round(point.x / 10) * 10, Math.round(point.y / 10) * 10);
  }
}

const STROKE_LENS_MARGIN = 8

class PencilCommand {
  constructor(app) {
    this.tool = new Tool()
    this.app = app

    this.tool.onMouseMove = (event) => {
      const point = event.point
      if (this.shape) {
        this.shape.position = point
      } else {
        this.app.setCursor("none")
        this.app.drawLayer.activate()
        this.shape = new Group([
          new Shape.Circle({center: point, radius: this.app.strokeWidth() + STROKE_LENS_MARGIN, strokeColor: this.app.strokeColor() }),
          new Shape.Circle({center: point, radius: this.app.strokeWidth(), fillColor: this.app.strokeColor() }),
        ])
      }
    }
    this.tool.onMouseDown = (event) => {
      this.app.drawLayer.activate()
      this.drawingPath = new Path()
      this.drawingPath.strokeColor = this.app.strokeColor()
      this.drawingPath.strokeWidth = this.app.strokeWidth()
      this.drawingPath.add(event.point)
    }
    this.tool.onMouseDrag = (event) => {
      this.shape.position = event.point
      this.drawingPath.add(event.point)
    }
  }

  activate() {
    this.tool.activate()
    this.shape = null;
  }

  deactivate() {
    if (this.shape) {
      this.shape.remove()
    }
  }
}

class CanvasApp {
  constructor() {
    this._emitter = new Emitter()
    this.handleManager = new HandlesManager(this)
    this.handleManager.register(new Handle(new Point(0,0)))
    this.handleManager.register(new Handle(new Point(15,0)))
    this.handleManager.register(new SnapHandle(new Point(15,15)))
    // this.point = new Shape.Circle(new Point(0,0), 3)
    // this.point.strokeColor = 'black';

    this.pencilCommand = new PencilCommand(this)

    this.guidesLayer = new Layer()
    this.drawLayer = new Layer()

    new ReplicatorTool(this, {center: {x: 30, y: 30}, radius: 80, slices: 8})
    new ReplicatorTool(this, {center: {x: -130, y: -50}, radius: 90, slices: 8})
  }

  onMouseCursorChange(callback) { this._emitter.on("changeCursor", callback) }
  setCursor(cursor) { this._emitter.emit("changeCursor", cursor) }

  activatePencil() {
    this.handleManager.deactivate()
    this.pencilCommand.activate()
  }

  activatePointer() {
    this.handleManager.activate()
    this.pencilCommand.deactivate()
  }

  newReplicator() {
    new ReplicatorTool(this, {center: {x: 0, y: 0}, radius: 150, slices: 8})
  }

  strokeColor() { return 'black' }
  strokeWidth() { return 1 }
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

    this.app.activatePencil()
  }

  render() {
    return (<div className="root">
      <div className="canvas-container">
        <h1>Almixcomi</h1>
        <canvas id="canvas" data-paper-resize="true" className={`cursor--${this.state.cursor}`}
          ref={(d) => { this.canvas = d }}></canvas>
      </div>
      <div className="footer">
        <button type="button" onClick={() => this.app.activatePointer()}>Pointer</button>
        <button type="button" onClick={() => this.app.newReplicator()}>Replicator</button>
        <button type="button" onClick={() => this.app.activatePencil()}>Pencil</button>
      </div>
    </div>)
  }
}

var div = document.createElement("div")
document.body.appendChild(div)
ReactDOM.render(<Root/>, div)
