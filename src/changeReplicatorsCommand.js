
export class ChangeReplicatorsCommand {
  constructor(app) {
    this.tool = new Tool()
    this.app = app

    this.tool.onMouseMove = (event) => {
      this.app.setCursor(null)
      this.app.buttonsManager.onMouseMove(event)
      this.app.handlesManager.onMouseMove(event)
    }
    this.tool.onMouseDown = (event) => {
      this.app.buttonsManager.onMouseDown(event)
      this.app.handlesManager.onMouseDown(event)
    }
    this.tool.onMouseDrag = (event) => {
      this.app.buttonsManager.onMouseDrag(event)
      this.app.handlesManager.onMouseDrag(event)
    }
    this.tool.onMouseUp = (event) => {
      this.app.buttonsManager.onMouseUp(event)
      this.app.handlesManager.onMouseUp(event)
    }
  }

  activate() {
    this.tool.activate()
    this.app.buttonsManager.activate()
    this.app.handlesManager.activate()
  }

  deactivate() {
    this.app.buttonsManager.deactivate()
    this.app.handlesManager.deactivate()
  }
}
