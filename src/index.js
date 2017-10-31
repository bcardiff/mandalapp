import css from './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import paper from 'paper'
import Emitter from 'component-emitter'
import {Handle} from './handle'
import {HandlesManager} from './handlesManager'
import {ButtonsManager} from './buttonsManager'
import {ReplicatorTool} from './replicatorTool'
import {Button} from './button'
import {PencilCommand} from './pencilCommand'
import {ChangeReplicatorsCommand} from './changeReplicatorsCommand'

class CanvasApp {
  constructor() {
    this._emitter = new Emitter()
    this.handlesManager = new HandlesManager(this)
    this.buttonsManager = new ButtonsManager(this)

    this.pencilCommand = new PencilCommand(this)
    this.changeReplicatorsCommand = new ChangeReplicatorsCommand(this)

    this.guidesLayer = new Layer()
    this.drawLayer = new Layer()

    this.replicators = new Set()

    this.newReplicator({center: {x: 0, y: 0}, radius: 150, slices: 10})
    this.newReplicator({center: {x: -200, y: 150}, radius: 90, slices: 8})
  }

  buildTracePreview(point) {
    return new Shape.Circle({center: point, radius: this.strokeWidth(), fillColor: this.strokeColor() })
  }

  previewAt(point) {
    this.replicators.forEach(r => r.previewAt(point))
  }

  drawingAt(point) {
    this.replicators.forEach(r => r.drawingAt(point))
  }

  stopDrawing() {
    this.replicators.forEach(r => r.stopDrawing())
  }

  onMouseCursorChange(callback) { this._emitter.on("changeCursor", callback) }
  setCursor(cursor) { this._emitter.emit("changeCursor", cursor) }

  activatePencil() {
    this.changeReplicatorsCommand.deactivate()
    this.pencilCommand.activate()
  }

  activatePointer() {
    this.changeReplicatorsCommand.activate()
    this.pencilCommand.deactivate()
  }

  newReplicator(props) {
    props = {center: {x: 0, y: 0}, radius: 150, slices: 8, ...props}
    this.replicators.add(new ReplicatorTool(this, props))
  }

  removeReplicator(replicator) {
    this.replicators.delete(replicator)
    replicator.remove()
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
