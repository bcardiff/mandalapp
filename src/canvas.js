import './canvas.css';

window.onload = function() {
  var paper = require('paper');

  var editor = document.getElementById('editor');
  var center = [0, 0];
  var calcRadius = function() {
    return Math.min(editor.clientWidth / 2, editor.clientHeight / 2) * 0.85;
  }
  var radius = calcRadius();
  var initialSize = { width: editor.clientWidth, height: editor.clientHeight };
  paper.install(window);

  var canvas = document.getElementById('main');
  paper.setup(canvas);
  view.center = [0,0];
  var originViewport = view.matrix.clone();

  var guides = new Layer();
  var circle = new Path.Circle({
    center: center,
    radius: radius,
    strokeColor: '#c0c0c0',
  });

  var n_lines = 10;
  for(var i = 0; i < n_lines; i++) {
    var line = new Path.Line({
      from: [center[0] - radius, center[1]],
      to: [center[0], center[1]],
      strokeColor: '#c0c0c0'
    });
    line.rotate(i / n_lines * 360.0, center);
  }

  var draw = new Layer();
  var preview = new Layer();

  var drawingPath;
  var singleDrawer = {
    preview: function(event) {
      new Path.Circle({
        center: [event.point.x, event.point.y],
        radius: 1,
        fillColor: 'black',
      });
    },
    onMouseDown: function(event) {
      drawingPath = new Path();
      drawingPath.strokeColor = 'black';
      drawingPath.add(event.point);
    },
    onMouseDrag: function(event) {
      drawingPath.add(event.point);
    }
  };

  var drawingPaths;
  var useDuplicate = true;
  var getClonedPoints = function(point) {
    var copy = new Matrix(1,0,0,1,0,0);
    var symm = copy.clone().scale(1,-1);
    symm.rotate(360.0 / n_lines, center);

    var res = [];
    for(var i = 0; i < n_lines; i++) {
      if (useDuplicate || i % 2 == 0) {
        res.push(copy.transform(point));
      } else {
        res.push(symm.transform(point));
      }
      copy.rotate(360.0 / n_lines, center);
      symm.rotate(360.0 / n_lines, center);
    }
    return res;
  }

  var cloneDrawer = {
    preview: function(event) {
      var points = getClonedPoints(event.point);
      var copy = new Matrix(1,0,0,1,0,0);
      for(var i = 0; i < n_lines; i++) {
        new Path.Circle({
          center: points[i],
          radius: 1,
          fillColor: (i == 0 ? 'black' : '#999'),
        });
      }
    },
    onMouseDown: function(event) {
      var points = getClonedPoints(event.point);
      drawingPaths = [];
      for(var i = 0; i < n_lines; i++) {
        var drawingPath = new Path();
        drawingPath.strokeColor = 'black';
        drawingPath.add(points[i]);
        drawingPaths.push(drawingPath);
      }
    },
    onMouseDrag: function(event) {
      var points = getClonedPoints(event.point);
      for(var i = 0; i < n_lines; i++) {
        drawingPaths[i].add(points[i]);
      }
    }
  };

  var drawer = singleDrawer;
  var drawer = cloneDrawer;

  var pencil = new Tool();
  pencil.onMouseMove = function(event) {
    preview.removeChildren();
    if(circle.contains(event.point)) {
      canvas.classList.add('nocursor');
      preview.activate();
      drawer.preview(event);
    } else {
      canvas.classList.remove('nocursor');
    }
  };
  pencil.onMouseDown = function(event) {
    draw.activate();
    drawer.onMouseDown(event);
  };
  pencil.onMouseDrag = function(event) {
    drawer.onMouseDrag(event);
  };

  var nop = new Tool();
  nop.activate();

  function activatePencil(kind) {
    var buttons = document.getElementsByTagName("button");
    for(var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active');
    }
    if (kind == 'single') {
      drawer = singleDrawer;
      pencil.activate();
      document.getElementById("single").classList.add('active');
    } else if (kind == 'duplicate') {
      drawer = cloneDrawer;
      useDuplicate = true;
      pencil.activate();
      document.getElementById("duplicate").classList.add('active');
    } else if (kind == 'symmetry') {
      drawer = cloneDrawer;
      useDuplicate = false;
      pencil.activate();
      document.getElementById("symmetry").classList.add('active');
    } else if (kind == 'none') {
      nop.activate();
    }
  }

  var buttonIds = ['single', 'duplicate', 'symmetry'];
  for (var i = 0; i < buttonIds.length; i++) {
    (function(buttonId){
      document.getElementById(buttonId).onclick = function() {
        if (this.classList.contains("active")) {
          activatePencil('none');
        } else {
          activatePencil(buttonId);
        }
      };
    })(buttonIds[i]);
  }

  activatePencil('duplicate');
  // window.setInterval(function(){ guides.rotate(1, center); draw.rotate(1, center); }, 30);

  window.onresize = function() {
    var factor = calcRadius() / radius;

    view.matrix = originViewport.clone()
      .translate((1.0 - factor) * (initialSize.width - editor.clientWidth),
        (1.0 - factor) * (initialSize.height - editor.clientHeight)
        )
      .scale(factor);
  };
}
