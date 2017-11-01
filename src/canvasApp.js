import paper from 'paper'
import Emitter from 'component-emitter'
import {Handle} from './handle'
import {HandlesManager} from './handlesManager'
import {ButtonsManager} from './buttonsManager'
import {ReplicatorTool} from './replicatorTool'
import {Button} from './button'
import {PencilCommand} from './pencilCommand'
import {ChangeReplicatorsCommand} from './changeReplicatorsCommand'

export class CanvasApp {
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
    this.mode = null
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

  onModeChanged(callback) { this._emitter.on("modeChanged", callback) }
  setMode(mode) {
    this.mode = mode
    this._emitter.emit("modeChanged", mode)
  }

  activatePencil(color) {
    this.color = color
    this.changeReplicatorsCommand.deactivate()
    this.pencilCommand.activate()
    this.setMode('pencil')
  }

  activatePointer() {
    this.changeReplicatorsCommand.activate()
    this.pencilCommand.deactivate()
    this.setMode('pointer')
  }

  newReplicator(props) {
    props = {center: {x: 0, y: 0}, radius: 150, slices: 8, ...props}
    this.replicators.add(new ReplicatorTool(this, props))
    this.activatePointer()
  }

  removeReplicator(replicator) {
    this.replicators.delete(replicator)
    replicator.remove()
  }

  strokeColor() { return this.color }
  strokeWidth() { return 1 }
}
