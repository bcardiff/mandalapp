import css from './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import paper from 'paper'
import {Button} from 'semantic-ui-react'
import {CanvasApp} from './canvasApp'

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
        <canvas id="canvas" data-paper-resize="true" className={`cursor--${this.state.cursor}`}
          ref={(d) => { this.canvas = d }}></canvas>
      </div>
      <div className="footer">
        <Button circular icon='mouse pointer' onClick={() => this.app.activatePointer()} />
        <Button circular icon='sun' onClick={() => this.app.newReplicator()} />
        <Button circular color='black' onClick={() => this.app.activatePencil()}>&nbsp;</Button>
      </div>
    </div>)
  }
}

var div = document.createElement("div")
document.body.appendChild(div)
ReactDOM.render(<Root/>, div)
