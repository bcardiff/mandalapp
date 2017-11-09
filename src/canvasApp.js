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

    this.backgroundLayer = new Layer()
    this.backgroundLayer.activate()
    const background = new Path.Rectangle(paper.view.bounds)
    background.fillColor = '#ffffff'
    this.backgroundLayer.visible = false
    this.guidesLayer = new Layer()
    this.cursorLayer = new Layer()
    this.drawLayer = new Layer()

    this.replicators = new Set()

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
    this.setMode('pencil')
    this.changeReplicatorsCommand.deactivate()
    this.pencilCommand.activate()
  }

  activatePointer() {
    this.setMode('pointer')
    this.changeReplicatorsCommand.activate()
    this.pencilCommand.deactivate()
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

  showGuides(visible) {
    this.guidesLayer.visible = visible
  }

  saving(callback) {
    var showGuidesWas = this.guidesLayer.visible
    this.showGuides(false)
    this.cursorLayer.visible = false
    this.backgroundLayer.visible = true
    window.setTimeout(() => {
      callback()
      this.cursorLayer.visible = true
      this.backgroundLayer.visible = false
      this.showGuides(showGuidesWas)
    }, 100)
  }
}