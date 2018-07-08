/**
 * @author Definitions by: thinkerer
 *
 * TypeScript Version 2.7
 */
declare module "Sketch" {
  export = Sketch;
}

/**
 * @see \`{@link https://github.com/soulwire/sketch.js/wiki/API }\`
 */
declare const Sketch: SketchI;

/**
 * declare sketch.js Global Properties
 * These are safely mixed into the window object for quick access, e.g: sin( random( TWO_PI ) ). You can prevent this happening by passing globals:false when calling create and/or add this properties to any object yourself by calling Sketch.install( context )
 */

/**
 * @function random Accepts single values, ranges and Arrays, e.g: random( 10, 20 ) or random( colours )
 * @param min values / ranges / Arrays
 * @param max values / ranges /Arrays (not required)
 */
declare function random(
  min: number | Array<number | string>,
  max?: number
): number;
/**
 * @function lerp Interpolate between min and max by the factor amount
 * @param min
 * @param max
 * @param amount
 */
declare function lerp(min: number, max: number, amount: number): number;
/**
 * @function map Map num from the range minA/maxA to the range minB/maxB
 * @param num
 * @param minA
 * @param maxA
 * @param minB
 * @param maxB
 */
declare function map(
  num: number,
  minA: number,
  maxA: number,
  minB: number,
  maxB: number
): number;

declare const PI: Sketch_Math_Constants;
declare const TWO_PI: Sketch_Math_Constants;
declare const HALF_PI: Sketch_Math_Constants;
declare const QUARTER_PI: Sketch_Math_Constants;
declare const E: Sketch_Math_Constants;
declare const LN10: Sketch_Math_Constants;
declare const LN2: Sketch_Math_Constants;
declare const LOG2E: Sketch_Math_Constants;
declare const LOG10E: Sketch_Math_Constants;
declare const SQRT1_2: Sketch_Math_Constants;
declare const SQRT2: Sketch_Math_Constants;

declare function abs(val: number): Sketch_Math_Functions_ReturnType;
declare function acos(val: number): Sketch_Math_Functions_ReturnType;
declare function asin(val: number): Sketch_Math_Functions_ReturnType;
declare function atan(val: number): Sketch_Math_Functions_ReturnType;
declare function ceil(val: number): Sketch_Math_Functions_ReturnType;
declare function cos(val: number): Sketch_Math_Functions_ReturnType;
declare function exp(val: number): Sketch_Math_Functions_ReturnType;
declare function floor(val: number): Sketch_Math_Functions_ReturnType;
declare function log(val: number): Sketch_Math_Functions_ReturnType;
declare function round(val: number): Sketch_Math_Functions_ReturnType;
declare function sin(val: number): Sketch_Math_Functions_ReturnType;
declare function sqrt(val: number): Sketch_Math_Functions_ReturnType;
declare function tan(val: number): Sketch_Math_Functions_ReturnType;
declare function atan2(val: number): Sketch_Math_Functions_ReturnType;
declare function pow(
  base: number,
  index: number
): Sketch_Math_Functions_ReturnType;
declare function max(...val: Array<number>): Sketch_Math_Functions_ReturnType;
declare function min(...val: Array<number>): Sketch_Math_Functions_ReturnType;

interface SketchInstance
  extends Sketch_Instance_Methods,
    Sketch_Instance_Properites,
    Sketch_Instance_Overridable_Methods {
  [propName: string]: any;
}

interface SketchI extends Sketch_Class_Methods, Sketch_Constants {}

type Sketch_Math_Functions_ReturnType = number;
type Sketch_Math_Constants = number;
interface Sketch_Mouse extends Sketch_HandleGesture {}
interface Sketch_Touch extends Sketch_HandleGesture {}

interface Sketch_HandleGesture {
  x: number;
  y: number;
  ox: number;
  oy: number;
  dx: number;
  dy: number;
}

interface Sketch_Instance_Properites {
  /**
   * @param mouse Contains x, y, ox, oy, dx and dy, representing the mouse or primary touch.
   *
   */
  mouse: Array<Sketch_Mouse>;
  /**
   * @param touches List of current touches with same structure as mouse. On the desktop, the 0th element represents the mouse.
   *
   */
  touches: Array<Sketch_Touch>;
  /**
   * @param dragging Whether the mouse is down / the user is dragging
   *
   */
  dragging: boolean;
  /**
   * @param running Whether the animation loop is running (modified by the start and stop methods)
   *
   */
  running: boolean;
  /**
   * @param width Current viewport width
   *
   */
  width: number;

  /**
   * @param height Current viewport height
   *
   */
  height: number;
  /**
   * @param keys A hash of booleans indicating whether each key is currently pressed, e.g sketch.keys.SPACE
   *
   */
  keys: Sketch_KeyMap;

  /**
   * @param millis The total runtime of the sketch in milliseconds
   *
   */
  millis: number;

  /**
   * @param now The current time in milliseconds
   *
   */
  now: number;
  /**
   * @param dt The delta time between the current and previous frame in milliseconds
   *
   */
  dt: number;
}

interface Sketch_Constants {
  /**
   *
   * @param CANVAS Enumeration for the Canvas type
   */
  CANVAS: Sketch_Options_type.CANVAS;

  /**
   *
   * @param WEBGL Enumeration for the WebGL type
   */

  WEBGL: Sketch_Options_type.WEBGL;
  /**
   *
   * @param WEB_GL Enumeration for the WebGL type
   */

  WEB_GL: Sketch_Options_type.WEBGL;
  /**
   *
   * @param DOM Enumeration for the DOM type
   */
  DOM: Sketch_Options_type.DOM;
  /**
   *
   * @param instances A list of all current Sketch instances
   */
  instances: Array<SketchI>;
}

declare enum Sketch_Options_type {
  CANVAS = "canvas",
  WEBGL = "webgl",
  DOM = "dom"
}

interface Sketch_Context {}
interface Sketch_Class_Methods {
  /**
   *
   * @param create Creates and returns a new sketch. Arguments: options Optional hash including any number of the above options
   */
  create(options: Sketch_Options): SketchInstance;

  /**
   * @param augment Augments an existing context, giving it sketch properties and functionality. This is called internally by create once a new context is created. Arguments: context The context to augment
   */
  augment(context: Sketch_Context): void;

  /**
   * @param install Installs sketch globals into the context provided. This is called internally by create on self unless the globals flag is set to false. Arguments: context The context to install globals into
   *
   */
  install(context: Sketch_Context): void;
}

interface Sketch_Options {
  /**
   * Passed to the Sketch.create method.
   */
  /**
   * @param ket Default: true; when false, you can pass width: 500, height: 500 to specify a size.
   */
  fullscreen?: boolean;

  /**
   * @param autostart Default: true Otherwise call start()
   */
  autostart?: boolean;

  /**
   * @param autoclear Default: true Whether to clear the context before each call to draw. Otherwise call clear()
   */
  autoclear?: boolean;

  /**
   * @param autopause Default: true Whether to pause the animation on window blur and resume on focus
   */
  autopause?: boolean;

  /**
   * @param container Default: document.body Where to put the sketch context
   */
  container?: HTMLElement | null;

  /**
   * @param interval interval Default: 1 The update / draw interval (2 will update every 2 frames, etc)
   */
  interval?: number;

  /**
   * @param globals Default: true Add global properties and methods to the window
   */
  globals?: boolean;

  /**
   * @param retina Default: false Resize for best appearance on retina displays. Can be slow due to so many pixels!
   */

  retina?: boolean | "auto";

  /**
   * @param type Default Sketch.CANVAS Possible values: Sketch.CANVAS, Sketch.WEB_GL and Sketch.DOM
   */
  type?: Sketch_Options_type;

  /**
   * @param eventTarget If you want Sketch to bind mouse events to an element other than the Sketch canvas, you can specify that element here
   */
  eventTarget?: HTMLElement;

  [propName: string]: any;
}

interface Sketch_Instance_Methods {
  /**
   * @param start
   */
  start(): void;

  /**
   * @param stop
   */
  stop(): void;

  /**
   * @param toggle
   */
  toggle(): void;

  /**
   * @param clear
   */
  clear(): void;

  /**
   * @param destroy
   */
  destroy(): void;
}
interface Sketch_Instance_Overridable_Methods {
  /**
   * Implement these methods on your sketch instance (or pass them to create inside the options hash).
   */
  setup(): any;
  update(): any;
  draw(): any;
  touchstart(): any;
  touchmove(): any;
  touchend(): any;
  mouseover(): any;
  mousedown(): any;
  mousemove(): any;
  mouseout(): any;
  mouseup(): any;
  click(): any;
  keydown(): any;
  keyup(): any;
  resize(): any;
}

declare enum Sketch_KeyMap {
  "BACKSPACE" = 8,
  "TAB" = 9,
  "ENTER" = 13,
  "SHIFT" = 16,
  "ESCAPE" = 27,
  "SPACE" = 32,
  "LEFT" = 37,
  "UP" = 38,
  "RIGHT" = 39,
  "DOWN" = 40
}
