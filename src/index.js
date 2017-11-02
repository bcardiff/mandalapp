import css from './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import paper from 'paper'
import {Button, Modal} from 'semantic-ui-react'
import {ChromePicker} from 'react-color';
import {CanvasApp} from './canvasApp'

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cursor: null,
      mode: null,
      colors: ["#DB5461", "#7AC74F", "#FFE74C", "#2AB7CA", "#540D6E"],
      selectedColorIndex: null,
      modalOpen: false
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
      this.setState((prevState, props) => {
        const selectedColorIndex = mode == 'pointer' ? null : prevState.selectedColorIndex
        return {mode: mode, selectedColorIndex: selectedColorIndex}
      })
    })

    const radius = Math.min(window.innerWidth / 2, window.innerHeight / 2) * 0.85;
    this.app.newReplicator({center: {x: 0, y: 0}, radius: radius, slices: 10})
    this.colorClicked(0)
  }

  colorClicked(index) {
    if (this.state.selectedColorIndex != index) {
      this.setState((prevState, props) => ({selectedColorIndex: index}),
        () => {
          this.app.activatePencil(this.state.colors[index])
        })
    } else {
      this.setState((prevState, props) => ({modalOpen: !prevState.modalOpen}))
    }
  }

  isPointerActiver() {
    return this.state.mode == 'pointer'
  }

  isColorActive(index) {
    return this.state.mode == 'pencil' && index == this.state.selectedColorIndex
  }

  handleClose() {
    this.setState((prevState, props) => ({modalOpen: false}))
  }

  changeSelectedColor(color) {
    var newColors = this.state.colors.slice(0)
    const index = this.state.selectedColorIndex
    newColors[index] = color.hex
    this.setState((prevState, props) => ({colors: newColors}),
      () => {
        this.app.activatePencil(this.state.colors[index])
      })
  }

  render() {
    return (<div className="root">
      <div className="canvas-container">
        <canvas id="canvas" data-paper-resize="true" className={`cursor--${this.state.cursor}`}
          ref={(d) => { this.canvas = d }}></canvas>
      </div>
      <div className="footer">
        <Button icon='mouse pointer' color={this.isPointerActiver() ? "grey" : null} onClick={() => this.app.activatePointer()} />
        <Button icon='sun' onClick={() => this.app.newReplicator()} />
        {this.state.colors.map((color, i) =>
          <Button key={i}
            icon={this.isColorActive(i) ? "paint brush" : "circle outline"}
            style={{backgroundColor: color}}
            onClick={() => this.colorClicked(i)}></Button>
        )}
      </div>

      <Modal open={this.state.modalOpen} onClose={() => this.handleClose()} basic size="tiny" dimmer={true}>
        <Modal.Content>
          <ChromePicker color={ this.state.colors[this.state.selectedColorIndex] } onChange={ color => this.changeSelectedColor(color) } />
        </Modal.Content>
      </Modal>
    </div>)
  }
}

var div = document.createElement("div")
document.body.appendChild(div)
ReactDOM.render(<Root/>, div)
