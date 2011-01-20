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
 * Tween Class
 *
 * Tweening library inspired by TweenLite.
 * Credits to Robert Penner for the easing equations! http://www.robertpenner.com
 *
 * @author D Lawson <webmaster@altovista.nl>
 */
canvaslib.Tween = {
  _tweens: [],
  _initTime: new Date().getTime(),

  /**
   * Tweens an object to the given location, alpha or whatever
   */
  to: function(obj, duration, toParams, options) {
    // create new tween
    var tween = new canvaslib.TweenCommand(obj, toParams);

    // set all options
    tween.duration = duration;

    if(options) {
      tween.onComplete = options.onComplete ? options.onComplete : null;
      tween.delay = options.delay ? options.delay : 0;
      tween.ease = options.ease ? options.ease : canvaslib.EaseDefault;
    }

    tween.finished = false;

    // push to tween stack
    this._tweens.push(tween);
  },

  /**
   * Kills animation of given object
   */
  kill: function(obj) {
    var i = 0;

    for(i = 0; i < this._tweens.length; i++) {
      if(this._tweens[i].obj == obj) {
        this._tweens[i] = null;
        this._tweens.splice(i, 1);
        i = -1;
      }
    }
  },

  /**
   * Updates all tweens
   */
  update: function() {
    if(this._tweens.length > 0) {
      var i;
      var time;
      var cleanup = false;

      // determine current time
      time = new Date().getTime();

      // loop all tweens
      for(i = 0; i < this._tweens.length; i++) {
        this._tweens[i].update(time);

        if(this._tweens[i].finished) {
          cleanup = true;
          this._tweens[i] = null;
        }
      }

      // remove all finished tweens from mem
      if(cleanup) this._cleanup();
    }
  },

  /**
   * Cleans up array of tweens
   */
  _cleanup: function() {
    var i;

    for(i = 0; i < this._tweens.length; i++) {
      if(!this._tweens[i]) {
        this._tweens.splice(i, 1);
        i = -1;
      }
    }
  }
};

// an individual animation
canvaslib.TweenCommand = function(obj, params) {
  var property;

  this.obj = obj;
  this.startTime = new Date().getTime();
  this.duration = 0;
  this.toParams = params;
  this.delay = 0;
  this.ease = canvaslib.EaseDefault;
  this.finished = false;
  this.onComplete = null;
  this.startValues = {};

  for(property in params) {
    if(obj.hasOwnProperty(property)) {
      // get start value of object
      this.startValues[property] = obj[property];

      // calc diff between two values
      this.toParams[property] = this.toParams[property] - obj[property];
    }
  }
};

canvaslib.TweenCommand.prototype = {
  update: function(updateTime) {
    var time = updateTime - this.startTime;
    var factor;
    var property;

    // are we done?
    if(time >= this.duration) {
      factor = 1;
      this.finished = true;

    } else {
      this.finished = false;
      factor = this.ease(time, 0, 1, this.duration);

    }

    // apply factor to tween values
    for(property in this.toParams) {
      this.obj[property] = this.startValues[property] + (factor * this.toParams[property]);
    }
  }
};

// easing
canvaslib.EaseDefault = function(t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b;
};

canvaslib.ElasticIn = function(t, b, c, d, a, p) {
  if(t == 0)
    return b;

  if((t/=d) == 1)
    return b+c;

  if (!p)
    p = d * .3;

  if(!a || a < Math.abs(c)) {
    a=c;
    var s=p/4;
  } else {
    var s = p/(2*Math.PI) * Math.asin (c/a);
  }

  return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
};

canvaslib.ElasticOut = function(t, b, c, d, a, p) {
  if(t == 0)
    return b;

  if((t/=d) == 1)
    return b+c;

  if(!p)
    p=d*.3;

  if(!a || a < Math.abs(c)) {
    a=c;
    var s=p/4;
  } else {
    var s = p/(2*Math.PI) * Math.asin (c/a);
  }

  return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
};

canvaslib.ElasticInOut = function(t, b, c, d, a, p) {
  if(t == 0)
    return b;

  if ((t/=d/2) == 2)
    return b+c;

  if(!p)
    p=d*(.3*1.5);

  if(!a || a < Math.abs(c)) {
    a=c;
    var s=p/4;
  } else {
    var s = p/(2*Math.PI) * Math.asin (c/a);
  }

  if(t < 1)
    return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;

  return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
};