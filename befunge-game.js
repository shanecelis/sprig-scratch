/*
  @title: Befungoban
  @author: Shane Celis @shanecelis

  https://esolangs.org/wiki/Befunge
  http://qiao.github.io/javascript-playground/visual-befunge93-interpreter/
*/

const player = "p";
const selection = "b";
const blockSE = "e";
const blockW = "w";
const blockN = "n";
const blockNW = "s";

const mobile = "m";

class Stack extends Array {
  // Give us a default value of 0 when we pop with nothing in the stack.
  pop() {
    if (this.length == 0)
      return 0;
    else
      return super.pop();
  }

  peek() {
    return this[this.length - 1];
  }
}

/* Keep a set of sprites together as though they're one sprite. */
class CompositeSprite {
  constructor(sprites) {
    this.sprites = sprites;
  }

  get x() {
    return this.sprites[0].x;
  }

  get y() {
    return this.sprites[0].y;
  }

  set x(newX) {
    let dx = newX - this.sprites[0].x;
    for (let i = 0; i < this.sprites.length; i++) {
      this.sprites[i].x += dx;
    }
  }

  set y(newY) {
    let dy = newY - this.sprites[0].y;
    for (let i = 0; i < this.sprites.length; i++) {
      this.sprites[i].y += dy;
    }
  }
}

/** Keep a character cell in sync with a sprite. */
class CellSprite {
  constructor(i, j, sprite) {
    this.i = i;
    this.j = j;
    this.sprite = sprite;
    this.x = sprite.x;
    this.y = sprite.y;
  }

  get changed() {
    return this.x != this.sprite.x || this.y != this.sprite.y;
  }

  update() {
    let dx = this.sprite.x - this.x;
    let dy = this.sprite.y - this.y;
    this.i -= dx;
    this.j -= dy;
    this.x -= dx;
    this.y -= dy;
  }
}

class Befunge {

  constructor(width, height, char = ' ') {
    this.width = width;
    this.height = height;
    // Cells are a 2d array of characters.
    this.cells = Array(width).fill(null).map(i => Array(height).fill(char));
    this.pointer = [0, 0];
    this.inertia = [1, 0];
    this.stack = new Stack(); // Just integers, please.
    this.output = "";
    this.error = null;
    this.stringMode = false;
    this.terminated = false;
  }

  isDigit(c) {
    return c >= '0' && c <= '9';
  }

  /** Accept a character. */
  eval(instruction) {
    let s = this.stack;
    if (this.stringMode) {
      if (instruction == '"')
        this.stringMode = false;
      else
        s.push(instruction.codePointAt());
      return true;
    }
    if (this.isDigit(instruction)) {
      s.push(instruction - 0);
      return true;
    }
    switch(instruction) {
      case ' ':
        break;
      case '+':
        s.push(s.pop() + s.pop());
        break;
      case '-':
        s.push(s.pop() - s.pop());
        break;
      case '*':
        s.push(s.pop() * s.pop());
        break;
      case '/':
        s.push(s.pop() / s.pop());
        break;
      case '%':
        s.push(s.pop() % s.pop());
        break;
      case '!':
        s.push(s.pop() == 0 ? 1 : 0);
        break;
      case '`':
        s.push(s.pop() > s.pop() ? 1 : 0);
        break;
      case '>':
        this.inertia = [1, 0];
        break;
      case '<':
        this.inertia = [-1, 0];
        break;
      case '^':
        this.inertia = [0, -1];
        break;
      case 'v':
        this.inertia = [0, 1];
        break;
      case '?':
        let index = Math.floor(Math.random() * 4);
        return this.eval(['>', '<', '^', 'v'][index]);
        break;
      case '_':
        if (s.pop() == 0)
          return this.eval('>');
        else
          return this.eval('<');
        break;
      case '|':
        if (s.pop() == 0)
          return this.eval('v');
        else
          return this.eval('^');
        break;
      case '"':
        this.stringMode = true;
        break;
      case ':':
        let item = s.pop();
        s.push(item);
        s.push(item);
        break;
      case '\\':
        let a = s.pop();
        let b = s.pop();
        s.push(a);
        s.push(b);
        break;
      case '$':
        s.pop();
        break;
      case '.':
        // Output as integer.
        this.output += s.pop();
        break;
      case ',':
        // Output as character.
        this.output += String.fromCodePoint(s.pop());
        break;
      case '#':
        let pc = this.pointer;
        pc[0] = (pc[0] + this.inertia[0]) % this.width;
        pc[1] = (pc[1] + this.inertia[1]) % this.height;
        break;
      case 'g':
      {
        let y = s.pop();
        let x = s.pop();
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
          s.push(0);
        else
          s.push(this.cells[x][y].codePointAt());
        break;
      }
      case 'p':
        let y = s.pop();
        let x = s.pop();
        let v = s.pop();
        this.cells[x][y] = String.fromCodePoint(v)[0];
        break;
      case '&':
        // Get integer from user and push it.
        break;
      case '~':
        // Get character from user and push it.
        break;
      case '@':
        // End program.
        this.terminated = true;
        this.inertia[0] = 0;
        this.inertia[1] = 0;
        break;
      default:
        // This code is probably invalid. Ignoring.
        this.error = "No instruction '" + instruction +"'";
        return false;
    }
    return true;
  }

  step(count) {
    let pc = this.pointer;
    for (let i = 0; i < count; i++) {
      let instruction = this.cells[pc[0]][pc[1]];
      if (this.eval(instruction)) {
        pc[0] = (pc[0] + this.inertia[0]) % this.width;
        pc[1] = (pc[1] + this.inertia[1]) % this.height;
      }
    }
  }

  read(input) {
    for (let i = 0, j = 0, k = 0; k < input.length; k++) {
      let c = input.charAt(k);
      if (c == '\n') {
        j++;
        i = 0;
        continue;
      }
      if (i >= this.width) {
        j++;
        i = 0;
      }
      this.cells[i][j] = c;
      i++;
    }
  }

  swapCells(i, j, ii, jj) {
    let tmp = this.cells[i][j];
    this.cells[i][j] = this.cells[ii][jj];
    this.cells[ii][jj] = tmp;
  }

  draw(x = 0, y = 0) {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        addText(this.cells[i][j], { x: i + x, y: j + y});
      }
    }
  }
}

const TEXT_WIDTH = 20;
const TEXT_HEIGHT = 16;

/** Center a string or an array of strings horizontally. */
function addCenterText(text, y, color = 0, chooseLength = null) {
  if (typeof text == 'string') {
    addText(text.slice(0, TEXT_WIDTH - 1), { x: Math.max(0, Math.floor((TEXT_WIDTH - text.length) / 2)), y : y, color : color });
  } else {
    // Handle an array of lines.
    let lines = text;
    // let begin = Math.max(0, Math.floor(TEXT_HEIGHT / 2 - lines.length / 2));
    let textLength = (chooseLength != null) ? chooseLength(...lines.map(l => l.length)) : null;

    for (let i = 0; i < lines.length; i++) {
      addText(lines[i].slice(0, TEXT_WIDTH - 1),
              { x: Math.max(0, Math.floor((TEXT_WIDTH - (textLength == null ? lines[i].length : textLength)) / 2)),
                y : y + i,
                color : color });
      // addCenterText(lines[i], begin + i);
    }
  }
}

var scenes = {};
var currentScene = null;
var sceneStack = new Stack();
var block = new CompositeSprite([]);
const defaultIntervalFrequency = 100;

function currentTick() {
  currentScene.tick();
}

class Scene {
  constructor(name = null) {
    if (name != null)
      scenes[name] = this;
    this.intervalFrequency = null;
    this.intervalId = -1;
  }

  get tickFrequency() {
    return this.intervalFrequency;
  }

  /** Set the tick frequency in milliseconds or null for no ticks (default). */
  set tickFrequency(newF) {
    if (this.intervalFrequency != newF) {
      if (this.intervalId >= 0)
        clearInterval(this.intervalId);
      this.intervalFrequency = newF;
      if (this.intervalFrequency == null)
        return;
      // Lower bound of 10 milliseconds.
      this.intervalFrequency = Math.max(10, this.intervalFrequency);
      this.intervalId = setInterval(() => this.tick(), this.intervalFrequency);
    }
  }

  onInput(char) { }

  afterInput() { }

  draw() { }

  tick() { }

  enter() {
    this.draw();
  }

  exit() {
    clearText();
    this.tickFrequency = null;
  }

  gotoScene(scene) {
    currentScene.exit();
    if (typeof scene == "string")
      currentScene = scenes[scene];
    else
      currentScene = scene;
    currentScene.enter();
  }

  pushScene(scene) {
    sceneStack.push(currentScene);
    this.gotoScene(scene);
  }

  popScene() {
    this.gotoScene(sceneStack.pop());
  }
}

class HelpScene extends Scene {
  constructor(name, text) {
    super(name);
    this.text = text;
    this.chooseLength = null;
  }

  onInput(c) {
    this.popScene();
  }

  draw() {
    let lines = this.text.split(/\r?\n/);
    let begin = Math.max(0, Math.floor(TEXT_HEIGHT / 2 - lines.length / 2));
    addCenterText(lines, begin, 0, this.chooseLength);
  }
}

class TitleScene extends Scene {

  onInput(c) {
    this.gotoScene("level0");
    this.pushScene(new HelpScene("help0", `HELP

Hit 'i' for help`));
  }

  draw() {
    let y = TEXT_HEIGHT / 2;
    addCenterText("Befungoban", y - 2);
    addCenterText("By Shane Celis", y);
    addCenterText("   @shanecelis", y + 2);
  }
}

let befungePlayHelp = new HelpScene("befunge-play-help", `CONTROLS

w -
a - slower
s -
d - faster

i - help
j - reset
k - play/pause
l - next level
`);
befungePlayHelp.chooseLength = Math.max;

let befungePauseHelp = new HelpScene("befunge-pause-help", `CONTROLS

w - up
a - left
s - down
d - right

i - help
j - reset
k - play/pause
l - next level
`);
befungePauseHelp.chooseLength = Math.max;

class BefungeScene extends Scene {

  constructor(name, input, setup = null) {
    super(name);
    this.input = input;
    this.reset();
    this.cellSprites = [];
    this.setup = setup;
  }

  reset() {
    this.befunge = new Befunge(15, 13, ' ');
    this.befunge.read(this.input);
    this.play = false;
  }

  tick() {
    if (this.play) {
      this.befunge.step(1);
      this.draw();
    }
  }

  enter() {
    super.enter();
    if (this.setup != null) {
      this.setup(this);
      this.setup = null;
    }
    this.tickFrequency = defaultIntervalFrequency;
  }

  draw() {
    clearText();
    let x = 1;
    let y = 1;
    this.befunge.draw(x, y);

    if (this.befunge.terminated) {
      addText("Completed! Hit l", { x: 1, y: 0 });
    } else if (! this.play) {
      addText("Paused. Hit k", { x: 1, y: 0 });
    }

    // Draw the stack.
    for (let i = 0; i < 5; i++) {
      addText("stack"[4 - i], { x: this.befunge.width + x, y: this.befunge.height + y - 1 - i });
    }
    for (let i = 0; i < this.befunge.stack.length; i++) {
      addText(("" + this.befunge.stack[i]).padStart(2, ' '), { x: this.befunge.width + x + 1, y: this.befunge.height + y - 1 - i });
    }
    // Draw the output.
    if (this.befunge.error == null) {
      addText("output",            { x: x, y: this.befunge.height + y });
      addText(this.befunge.output, { x: x, y: this.befunge.height + y + 1 });
    } else {
      this.play = false;
      addText("error ",            { x: x, y: this.befunge.height + y });
      addText(this.befunge.error, { x: x, y: this.befunge.height + y + 1 });
    }
    block.x = this.befunge.pointer[0] + x;
    block.y = this.befunge.pointer[1] + y;
  }


  onInput(c) {
    if (! this.play) {
      let p = getFirst(player);
      switch (c) {
        case 'w':
          p.y -= 1;
          break;
        case 'a':
          p.x -= 1;
          break;
        case 's':
          p.y += 1;
          break;
        case 'd':
          p.x += 1;
          break;
      }
    } else {

      switch (c) {
        case 'w':
          break;
        case 'a':
          this.tickFrequency += 20;
          break;
        case 's':
          break;
        case 'd':
          this.tickFrequency -= 20;
          break;
      }
    }
    switch (c) {
      case 'j':
        this.reset();
        this.draw();
        break;
      case 'k':
        this.play = ! this.play;
        break;
      case 'l':
        if (this.befunge.terminated)
          this.popScene();
        else
          addText("Not complete.", { x: 1, y: 0 });
        break;
      case 'i':
        this.pushScene(this.play ? befungePlayHelp : befungePauseHelp);
        break;
    }
  }

  afterInput() {
    for (let i = 0; i < this.cellSprites.length; i++) {
      if (this.cellSprites[i].changed) {
        let c = this.cellSprites[i];
        let i = c.i;
        let j = c.j;
        c.update();
        let ii = c.i;
        let jj = c.j;
        this.befunge.swapCells(i, j, ii, jj);
      }
    }
  }
}

let titleScene = new TitleScene("titleScene");
// let level0 = new Level0();
let level0 = new BefungeScene("level0", `"!dlroW"v
v       <
>",olleH">:v
         |,<
         @`);

let level1 = new BefungeScene("level1", `v
>        v

        @`,
scene => {
  // let sprite = addSprite(1, 1, mobile);
  // addSprite(1, 1, mobile);
  // let sprite = getTile(1,1)[0];
  let sprite = getFirst(mobile);
  sprite.x = 1;
  sprite.y = 1;
  scene.cellSprites.push(new CellSprite(0, 0, sprite));
});

sceneStack.push(level1);
currentScene = titleScene;


setLegend(
  [ player, bitmap`
................
................
.......000......
.......0.0......
......0..0......
......0...0.0...
....0003.30.0...
....0.0...000...
....0.05550.....
......0...0.....
.....0....0.....
.....0...0......
......000.......
......0.0.......
.....00.00......
................`],
   [ selection, bitmap`
FFFFFFFFFFFFFFFF
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
F99999999999999F
FFFFFFFFFFFFFFFF`],
  [ blockSE, bitmap`
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999`],
  [ blockN, bitmap`
................
................
................
................
................
................
................
................
................
................
................
................
................
................
9999999999999999
9999999999999999`],
  [ blockW, bitmap`
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99
..............99`],
  [ blockNW, bitmap`
................
................
................
................
................
................
................
................
................
................
................
................
................
................
..............99
..............99`],
  [ mobile, bitmap`
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD`],
);

setSolids([player, mobile]);

let level = 0;
// 20 x 16
const levels = [
  map`
....................
p...................
....................
....................
....................
....................
....................
...........sn.......
......m....we.......
....................
....................
....................
....................
....................
....................
....................`,
];
setMap(levels[level]);

block.sprites = [getFirst(blockSE), getFirst(blockN), getFirst(blockW), getFirst(blockNW)];
// cell.sprites = [getFirst(blockSE), getFirst(blockN), getFirst(blockW), getFirst(blockNW)];
clearText();

currentScene.enter();

setPushables({
  [player]: [mobile]
});

onInput("w", () => currentScene.onInput('w'));
onInput("a", () => currentScene.onInput('a'));
onInput("s", () => currentScene.onInput('s'));
onInput("d", () => currentScene.onInput('d'));

onInput("i", () => currentScene.onInput('i'));
onInput("j", () => currentScene.onInput('j'));
onInput("k", () => currentScene.onInput('k'));
onInput("l", () => currentScene.onInput('l'));

afterInput(() => currentScene.afterInput());
