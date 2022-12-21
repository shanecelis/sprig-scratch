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
const blockNW = "N";

class Stack extends Array {
  // Give us a default value of 0 when we pop with nothing in the stack.
  pop() {
    if (this.length == 0)
      return 0;
    else
      return super.pop();
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

function addCenterText(text, y, color = 0) {
  addText(text, { x: (TEXT_WIDTH - text.length) / 2, y : y, color : color });
}

var scenes = {};
var currentScene = null;
var block = new CompositeSprite([]);

class Scene {
  constructor(name) {
    scenes[name] = this;
  }

  onInput(char) {
  }

  draw() {
  }

  tick() {
  }

  gotoScene(scene) {
    clearText();
    if (typeof scene == "string")
      currentScene = scenes[scene];
    else
      currentScene = scene;
    currentScene.draw();
  }
}

class TitleScene extends Scene {

  onInput(c) {
    this.gotoScene("level0");
    switch (c) {
      case 'w':
        block.y -= 1;
        break;
      case 'a':
        block.x -= 1;
        break;
      case 's':
        block.y += 1;
        break;
      case 'd':
        block.x += 1;
        break;
    }
  }

  draw() {
    let y = TEXT_HEIGHT / 2;
    addCenterText("Befungoban", y - 2);
    addCenterText("By Shane Celis", y);
    addCenterText("   @shanecelis", y + 2);
  }
}

class BefungeScene extends Scene {

  constructor(name) {
    super(name);
    this.play = true;
    this.befunge = new Befunge(16, 13, ' ');
  }

  tick() {
    if (this.play) {
      this.befunge.step(1);
      this.draw();
    }
  }

  draw() {
    let x = 1;
    let y = 1;
    this.befunge.draw(x, y);

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
    switch (c) {
      case 'w':
        getFirst(selection).y -= 1;
        break;
      case 'a':
        getFirst(selection).x -= 1;
        break;
      case 's':
        getFirst(selection).y += 1;
        break;
      case 'd':
        getFirst(selection).x += 1;
        break;
    }
  }
}

let titleScene = new TitleScene("titleScene");
// let level0 = new Level0();
let level0 = new BefungeScene("level0");
level0.befunge.read(`"!dlroW"v
v       <
>",olleH">:v
         |,<
         @`);
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
..............99`]
);

setSolids([]);

let level = 0;
// 20 x 16
const levels = [
  map`
.p..................
....................
....................
....................
....................
....................
....................
.........b.Nn.......
...........we.......
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
clearText();

currentScene.draw();
setInterval(() => currentScene.tick(), 100);

setPushables({
  [player]: []
});

onInput("w", () => {
  currentScene.onInput('w');
});

onInput("a", () => {
  currentScene.onInput('a');
});

onInput("s", () => {
  currentScene.onInput('s');
});

onInput("d", () => {
  currentScene.onInput('d');
});

afterInput(() => {

});
