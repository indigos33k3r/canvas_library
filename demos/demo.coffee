run = ->
  # this is the screen
  stage = new CanvasLibrary.Stage('test_canvas')

  logo = null

  # create a rectangle
  someShape = new CanvasLibrary.Shape()
  someShape.id = "someShape"
  someShape.x = 0
  someShape.y = 0

  someShape.fillStyle 'rgba(0, 0, 0, 1)'
  someShape.fillRect 0, 0, 50, 50

  # create another rectangle
  otherShape = new CanvasLibrary.Shape()
  otherShape.id = "otherShape"
  otherShape.alpha = .5
  otherShape.fillStyle 'rgba(255, 0, 0, 1)'
  otherShape.fillRect 0, 0, 25, 25
  otherShape.x = 10
  otherShape.y = 10
  otherShape.scaleX = 1
  otherShape.scaleY = 1
  otherShape.mouseEnabled = true

  otherShape.onMouseOver = =>
    Tween.to otherShape, 500, { scaleX: 2, scaleY: 2 }

  otherShape.onMouseOut = =>
    Tween.to otherShape, 500, { scaleX: 1, scaleY: 1 }

  # make this shape follow the mouse
  mouseShape = new CanvasLibrary.Shape()
  mouseShape.id = "mouseShape"
  mouseShape.beginPath()
  mouseShape.fillStyle 'rgba(255, 0, 0, 1)'
  mouseShape.circle 0, 0, 10
  mouseShape.closePath()
  mouseShape.fill()

  mouseShape.x = 300
  mouseShape.y = 300

  stage.onMouseMove = =>
    mouseShape.x = stage.mouseX
    mouseShape.y = stage.mouseY

  # some text
  text = new CanvasLibrary.TextField()
  text.id = "text"
  text.mouseEnabled = true
  text.useHandCursor = true
  text.text = "canvas_library demo"
  text.x = 10
  text.y = 450

  text.onMouseOver = =>
    text.fillStyle = 'rgba(255, 0, 0, 1)'

  text.onMouseOut = =>
    text.fillStyle = 'rgba(0, 0, 0, 1)'

  stage.onMouseUp = =>
    if logo
      Tween.kill logo
      Tween.to logo, 500, { x: stage.mouseX, y: stage.mouseY }

  moreShapes = new CanvasLibrary.Sprite()
  moreShapes.x = 0
  moreShapes.y = 0

  moreShape1 = new CanvasLibrary.Shape()
  moreShape1.id = "moreShape1"
  moreShape1.fillStyle 'rgba(0, 255, 0, 1)'
  moreShape1.fillRect 0, 0, 50, 50

  moreShape2 = new CanvasLibrary.Shape()
  moreShape2.x = 10
  moreShape2.y = 10
  moreShape2.fillStyle 'rgba(0, 255, 255, 1)'
  moreShape2.fillRect 0, 0, 50, 50

  stage.addChild someShape
  stage.addChild otherShape
  stage.addChild mouseShape
  stage.addChild text
  stage.addChild moreShapes

  moreShapes.addChild moreShape1
  moreShapes.addChild moreShape2

  Tween.to moreShapes, 5000, { x: 500, y: 10, rotation: 45 }

  # load an external bitmap
  StackedLoader.add 'logo', 'bitmap', 'logo.png'

  StackedLoader.load ->
    logo = StackedLoader.get('logo')
    stage.addChild logo

    logo.alpha = 0
    Tween.to logo, 10000, { alpha: 1 }

  # setup renderer and connect it to the stage and run at 25 fps
  renderer = new CanvasLibrary.Renderer(stage, 25)
  renderer.run()

  # tween some stuff
  Tween.to someShape, 5000, { x: 100, y: 100 }
  Tween.to otherShape, 20000, { rotation: 180, x: 320, y: 200, alpha: 1, scaleX: 1, scaleY: 1 }

window.onload = run
