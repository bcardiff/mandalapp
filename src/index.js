import css from './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import paper from 'paper'
import {Button} from 'semantic-ui-react'
import {CanvasApp} from './canvasApp'

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cursor: null,
      mode: null,
      colors: ["#DB5461", "#7AC74F", "#FFE74C", "#2AB7CA", "#540D6E"],
      selectedColorIndex: null,
    }
  }

  componentDidMount() {
    paper.install(window)
    paper.setup(this.canvas)
    paper.view.center = [0,0]
    this.app = new CanvasApp()
    this.app.onMouseCursorChange((cursor) => {
      this.setState((prevState, props) => ({cursor: cursor}))
    })
    this.app.onModeChanged((mode) => {
      this.setState((prevState, props) => ({mode: mode}))
    })

    this.colorClicked(0)
  }

  colorClicked(index) {
    this.setState((prevState, props) => ({selectedColorIndex: index}),
      () => {
        this.app.activatePencil(this.state.colors[index]);
      })
  }

  isPointerActiver() {
    return this.state.mode == 'pointer'
  }

  isColorActive(index) {
    return this.state.mode == 'pencil' && index == this.state.selectedColorIndex
  }

  render() {
    return (<div className="root">
      <div className="canvas-container">
        <canvas id="canvas" data-paper-resize="true" className={`cursor--${this.state.cursor}`}
          ref={(d) => { this.canvas = d }}></canvas>
      </div>
      <div className="footer">
        <Button icon='mouse pointer' onClick={() => this.app.activatePointer()} />
        <Button icon='sun' onClick={() => this.app.newReplicator()} />
        {this.state.colors.map((color, i) =>
          <Button key={i}
            icon={this.isColorActive(i) ? "paint brush" : "circle outline"}
            style={{backgroundColor: color}}
            onClick={() => this.colorClicked(i)}></Button>
        )}
      </div>
    </div>)
  }
}

var div = document.createElement("div")
document.body.appendChild(div)
ReactDOM.render(<Root/>, div)
