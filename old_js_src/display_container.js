/**
 * Copyright 2010-2011 Diederick Lawson. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY DIEDERICK LAWSON "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL DIEDERICK LAWSON OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Diederick Lawson.
 *
 * DisplayContainer Class
 *
 * @author D. Lawson <webmaster@altovista.nl>
 */
canvaslib.DisplayContainer = function(canvasId) {
  this.id = '';
  this.rotation = 0;
  this.x = 0;
  this.y = 0;
  this.alpha = 1;
  this.enabled = true;
  this.width = 0;
  this.height = 0;
  this.scaleX = 1;
  this.scaleY = 1;
  this.children = [];
  this.visible = true;
  this.mouseEnabled = true;
  this.useHandCursor = false;
  this.shadow = false;
  this.shadowBlur = 0;
  this.shadowColor = 0;
  this.shadowOffsetX = 0;
  this.shadowOffsetY = 0;
  this.onMouseOver = null;
  this.onMouseOut = null;
  this.onMouseDown = null;
  this.onMouseMove = null;
  this.localX = 0;
  this.localY = 0;

  this._oldX = 0;
  this._oldY = 0;
  this._oldRotation = 0;
  this._oldScaleX = 1;
  this._oldScaleY = 1;
  this._oldVisible = true;

  this._isMouseSetup = false;
  this._mouseX = 0;
  this._mouseY = 0;
  this._mouseDown = false;
  this._oldMouseX = 0;
  this._oldMouseY = 0;
  this._canvasX = 0;
  this._canvasY = 0;
  this._visible = true;
  this._rotation = 0;
  this._scaleX = 1;
  this._scaleY = 1;
  this._canvas = null;
  this._underCursor = false;
  this._lastObjectUnderCursor = null;
  this._backBufferCanvas = null;
  this._backBufferContext;
  this._hitBufferCanvas = null;
  this._hitBufferContext = null;
  this._context = null;
  this._parentDisplayContainer = null;
  this._superDisplayContainer = null;
  this._childrenChanged = false;
  this._allChildren = [];

  if(canvasId) {
    this._canvas = document.getElementById(canvasId);
    this._context = this._canvas.getContext('2d');

    this._backBufferCanvas = this._cloneCanvas();
    this._backBufferContext = this._backBufferCanvas.getContext('2d');

    this._hitBufferCanvas = this._cloneCanvas();
    this._hitBufferContext = this._hitBufferCanvas.getContext('2d');
  }

};

canvaslib.DisplayContainer.prototype = {
  /**
   * Returns the parent displaycontainer
   */
  parentDisplayContainer: function() {
    return this._parentDisplayContainer;
  },

  /**
   * Clones the current canvas
   */
  _cloneCanvas: function() {
    var canvas = document.createElement('canvas');
    canvas.width = this._canvas.width;
    canvas.height = this._canvas.height;

    return canvas;
  },
  /**
   * Find super parent object
   */
  superDisplayContainer: function() {
    // cache search of super display container
    if(this._parentDisplayContainer) {
      if(!this._superDisplayContainer)
        this._superDisplayContainer = this._findSuperDisplayContainer(this);

      return this._superDisplayContainer;

    } else {
      return this;

    }
  },

  /**
   * Tests if this object is the super
   */
  isSuperDisplayContainer: function() {
    return (this.superDisplayContainer() == this);
  },

  /**
   * Adds a given child to the displaylist of the object container
   */
  addChild: function(child) {
    this.superDisplayContainer()._childrenChanged = true;

    // is the object already a child of another display container? then remove it
    if(child._parentDisplayContainer)
      child._parentDisplayContainer.removeChild(child);

    // ok set new parent
    child._parentDisplayContainer = this;
    child._context = this.superDisplayContainer()._context;
    child._canvas = this.superDisplayContainer()._canvas;
    child._backBufferCanvas = this.superDisplayContainer()._backBufferCanvas;
    child._backBufferContext = this.superDisplayContainer()._backBufferContext;
    child._hitBufferCanvas = this.superDisplayContainer()._hitBufferCanvas;
    child._hitBufferContext = this.superDisplayContainer()._hitBufferContext;

    // add to displaylist
    this.children.push(child);

    return this;
  },

  /**
   * Sets Z-index of given child
   */
  setChildIndex: function(child, index) {

    if(this.children.indexOf(child) == -1) {
      throw "Child object not found in displaylist";

    } else {
      // @TODO implement me please!
      this.superDisplayContainer()._childrenChanged = true;
    }
  },

  /**
   * Removes the given child form the displaylist
   */
  removeChild: function(child) {
    var i;

    i = this.children.indexOf(child); // [0, 1, 2, 3, 4, 5, 6, 7]

    if(i == -1) {
      throw "Child object not found in displaylist";

    } else {
      this.superDisplayContainer()._childrenChanged = true;

      child._superDisplayContainer = null;
      child._parentDisplayContainer = null;
      child._canvas = null;
      child._context = null;
      child._hitBufferCanvas = null;
      child._hitBufferContext = null;
      child._backBufferCanvas = null;
      child._backBufferContext = null;

      this.children.splice(i, 1);

      return this;
    }
  },

  /**
   * Draws everyone
   */
  draw: function(clear) {
    if(this.isSuperDisplayContainer()) {
      // sets mouse over events if not present yet
      this._setupMouse();
      this._drawAllChildren(clear);
      this._handleMouseEventsOfAllChildren();

    } else {
      this.superDisplayContainer().draw(clear);

    }
  },

  /**
   * Tests if the object's position has been changed
   */
  positionChanged: function() {
    return (  this.x != this._oldX || this.y != this._oldY ||
              this.rotation != this._oldRotation ||
              this.scaleX != this._oldScaleX || this.scaleY != this._oldScaleY ||
              this.visible != this._oldVisible );
  },

  /**
   * Translates relative X, Y pos to canvas/world X, Y pos
   */
  _getInheritedTranslatedVars: function() {
    var translatedX = 0;
    var translatedY = 0;
    var translatedRotation = 0;
    var translatedScaleX = 1;
    var translatedScaleY = 1;
    var theParent = this;
    var visible = true;

    while(theParent != null) {
      translatedX += theParent.x;
      translatedY += theParent.y;
      translatedRotation += theParent.rotation;
      translatedScaleX *= theParent.scaleX;
      translatedScaleY *= theParent.scaleY;
      if(!theParent.visible) visible = false;

      theParent = theParent._parentDisplayContainer;
    }

    return [translatedX, translatedY, translatedRotation, translatedScaleX, translatedScaleY, visible];
  },

  /**
   * Translated relative X, Y pos to canvas/world X, Y pos
   */
  _setCanvasPosition: function() {
    var newVars;

    if(this.positionChanged()) {
      newVars = this._getInheritedTranslatedVars();

      this._oldX = this.x;
      this._oldY = this.y;
      this._oldRotation = this.rotation;
      this._oldScaleX = this.scaleX;
      this._oldScaleY = this.scaleY;

      this._canvasX = newVars[0];
      this._canvasY = newVars[1];
      this._rotation = newVars[2];
      this._scaleX = newVars[3];
      this._scaleY = newVars[4];
      this._visible = newVars[5];
    }
  },

  /**
   * Draws all objects
   */
  _drawAllChildren: function(clear) {
    var i = 0;
    var children;
    var newCanvasPos;

    if(this.isSuperDisplayContainer()) {
      // first step is to draw to the backbuffer
      //
      if(clear) this._backBufferContext.clearRect(0, 0, this._canvas.width, this._canvas.height);

      // retrieve ALL children
      if(this._childrenChanged) {
        this._allChildren = this._getAllChildren();
        this._childrenChanged = false;
      }

      // loop all children
      for(i = 0; i < this._allChildren.length; i++) {
        // translate X, Y pos
        this._allChildren[i]._setCanvasPosition();
        if(this._allChildren[i]._visible) {
          // draw on surface
          // setup context
          this._backBufferContext.save();
          this._setupContext(this._backBufferContext, this._allChildren[i]);

          // go draw!
          this._allChildren[i]._draw(this._backBufferContext);

          // restore it
          this._backBufferContext.restore();
        }
      }

      // final step is to draw to the actual screen
      //
      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._context.drawImage(this._backBufferCanvas, 0, 0);

    } else {
      this.superDisplayContainer()._drawAllChildren(clear);

    }
  },

  /**
   * Draws all objects in the hitbuffer to check which objects are hit by the mouse cursor
   */
  _getCurrentObjectUnderCursor: function() {
    var i = 0;
    var objectUnderCursor = null;
    var obj = null;

    // loop all children
    for(i = this._allChildren.length - 1; i >= 0; i--) {
      obj = this._allChildren[i];

      if(obj._visible && obj.mouseEnabled) {
        // draw on backbuffer for collision detection
        this._hitBufferContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._hitBufferContext.save();
        this._setupContext(this._hitBufferContext, obj);
        this._hitBufferContext.beginPath();

        obj._draw(this._hitBufferContext, true);

        // set local mouse X and Y
        obj.localX = this._mouseX - this._canvasX;
        obj.localY = this._mouseY - this._canvasY;

        // did the mouse hit an object?
        if(this._hitBufferContext.isPointInPath(this._mouseX, this._mouseY)) {
          this._hitBufferContext.restore();
          // yes we did, yer!
          objectUnderCursor = obj;
          break;
        }

        this._hitBufferContext.restore();
      }
    }

    return objectUnderCursor;
  },

  /**
   * Fires all appropiate mouse events for every display obj
   */
  _handleMouseEventsOfAllChildren: function() {
    if(this.isSuperDisplayContainer()) {
      var objectUnderCursor;

      // find object that is current under cursor
      objectUnderCursor = this._getCurrentObjectUnderCursor();

      // is the current object than the lost object that hit the mouse?
      if(this._lastObjectUnderCursor != objectUnderCursor) {
        // call mouseout event
        if(this._lastObjectUnderCursor) {
          if(this._lastObjectUnderCursor.onMouseOut)
            this._lastObjectUnderCursor.onMouseOut();

          // hide hand cursor
          if(this._lastObjectUnderCursor.useHandCursor)
            this._setHandCursor(false);
        }

        // ok did we find an object that is currently under the cursor?
        if(objectUnderCursor) {
          // call handler?
          if(objectUnderCursor.onMouseOver)
            objectUnderCursor.onMouseOver();

          // call down handler? or up handler?
          if(objectUnderCursor.onMouseDown && !objectUnderCursor._mouseDown) {
            objectUnderCursor._mouseDown = true;
            objectUnderCursor.onMouseDown();
          }

          // or call up handler?
          if(objectUnderCursor.onMouseUp && objectUnderCursor._mouseDown) {
            objectUnderCursor._mouseDown = false;
            objectUnderCursor.onMouseUp();
          }

          // show hand cursor?
          if(objectUnderCursor.useHandCursor)
            this._setHandCursor(true);
        }

      // do we have to fire an mouse move event?
      } else if(objectUnderCursor && (this._oldMouseX != this._mouseX || this._oldMouseY != this._mouseY) && objectUnderCursor.onMouseMove) {
        objectUnderCursor.onMouseMove();
      }

      // remember last object
      this._lastObjectUnderCursor = objectUnderCursor;

    } else {
      this.superDisplayContainer()._handleMouseEventsOfAllChildren();

    }
  },

  _setHandCursor: function(showHand) {
    if(showHand) {
      this._canvas.style.cursor = 'pointer';
    } else {
      this._canvas.style.cursor = '';
    }
  },

  /**
   * Retrieves all children in the tree
   */
  _getAllChildren: function(onlyVisibles) {
    var i = 0;
    var children = [];

    if(this.isSuperDisplayContainer()) {
      this._getChildren(this, children, onlyVisibles);
      return children;

    } else {
      return this.superDisplayContainer()._getAllChildren();

    }
  },

  /**
   * Retrieves ALL children from given parent and it's sub-children
   */
  _getChildren: function(fromParent, collectedChildren, onlyVisibles) {
    var i = 0;

    for(i = 0; i < fromParent.children.length; i++) {
      if(!onlyVisibles || (onlyVisibles && fromParent.children[i].visible))
        collectedChildren.push(fromParent.children[i]);

      if((!onlyVisibles || (onlyVisibles && fromParent.children[i].visible)) && fromParent.children[i].children && fromParent.children[i].children.length > 0)
        this._getChildren(fromParent.children[i], collectedChildren, onlyVisibles);
    }
  },

  _draw: function(context, drawHitarea) {
    // you could implement this...
  },

  // privates
  _findSuperDisplayContainer: function(parent) {
    if(parent._parentDisplayContainer) {
      return this._findSuperDisplayContainer(parent._parentDisplayContainer);

    } else {
      return parent;

    }
  },

  /**
   * Set's up global mouse event listener
   */
  _setupMouse: function() {
    if(this.isSuperDisplayContainer() && !this._isMouseSetup) {
      this._isMouseSetup = true;
      var self = this;

      this._canvas.addEventListener('mousemove', canvaslib.Utils.bind(this, this._handleCanvasMouseMove));
      this._canvas.addEventListener('mousedown', canvaslib.Utils.bind(this, this._handleCanvasMouseDown));
      this._canvas.addEventListener('mouseup', canvaslib.Utils.bind(this, this._handleCanvasMouseUp));

    } else if(!this.isSuperDisplayContainer() && !this.superDisplayContainer()._isMouseSetup) {
      this.superDisplayContainer()._setupMouse();
    }
  },

  /**
   * Sets up context for drawing
   */
  _setupContext: function(context, displayObj) {
    // sets the alpha of the image
    context.globalAlpha = displayObj.alpha;
    context.translate(parseInt(displayObj._canvasX), parseInt(displayObj._canvasY));
    context.rotate(canvaslib.Math.angleToRadians(displayObj._rotation));
    context.scale(displayObj._scaleX, displayObj._scaleY);

    // add shadow?
    if(displayObj.shadow) {
      context.shadowBlur = displayObj.shadowBlur;
      context.shadowColor = displayObj.shadowColor;
      context.shadowOffsetX = displayObj.shadowOffsetX;
      context.shadowOffsetY = displayObj.shadowOffsetY;
    }
  },

  /**
   * Catches all mouse moves
   */
  _handleCanvasMouseMove: function(event) {
    var super = this.superDisplayContainer();

    super._oldMouseX = super._oldMouseX;
    super._oldMouseX = super._oldMouseY;
    super._mouseX = event.clientX - this._canvas.offsetLeft;
    super._mouseY = event.clientY - this._canvas.offsetTop;
    super.localX = super._mouseX;
    super.localY = super._mouseY;

    if(super.onMouseMove) super.onMouseMove();
  },

  _handleCanvasMouseDown: function(event) {
    if(super.onMouseDown && !this.superDisplayContainer()._mouseDown) super.onMouseDown();
    this.superDisplayContainer()._mouseDown = true;
  },

  _handleCanvasMouseUp: function(event) {
    if(super.onMouseUp && this.superDisplayContainer()._mouseDown) super.onMouseUp();
    this.superDisplayContainer()._mouseDown = false;
  }
};