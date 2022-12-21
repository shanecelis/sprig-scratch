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

class Stack extends Array {
  // Give us a default value of 0 when we pop with nothing in the stack.
  pop() {
    if (this.length == 0)
      return 0;
    else
      return super.pop();
  }
}

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
    let dx = this.sprites[0].x - newX;
    for (let i = 0; x < this.sprites.length; i++) {
      this.sprites[i].x += dx;
    }
  }

  set y(newY) {
    let dy = this.sprites[0].y - newY;
    for (let i = 0; x < this.sprites.length; i++) {
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
      return;
    }
    if (this.isDigit(instruction)) {
      s.push(instruction - 0);
      return;
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
        this.inertia = [0, 1];
        break;
      case 'v':
        this.inertia = [0, -1];
        break;
      case '?':
        let index = Math.floor(Math.random() * 4);
        eval(['>', '<', '^', 'v'][index]);
        break;
      case '_':
        if (s.pop() == 0)
          eval('>');
        else
          eval('<');
        break;
      case '|':
        if (s.pop() == 0)
          eval('v');
        else
          eval('^');
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
        pc[0] += this.inertia[0];
        pc[1] += this.inertia[1];
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
      default:
        // This code is probably invalid. Ignoring.
    }
  }

  step(count) {
    let pc = this.pointer;
    for (let i = 0; i < count; i++) {
      let instruction = this.cells[pc[0]][pc[1]];
      this.eval(instruction);
      pc[0] += this.inertia[0];
      pc[1] += this.inertia[1];
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
    // Draw the stack.
    for (let i = 0; i < 5; i++) {
      addText("stack"[4 - i], { x: this.width + x, y: this.height + y - 1 - i });
    }
    for (let i = 0; i < this.stack.length; i++) {
      addText(("" + this.stack[i]).padStart(2, ' '), { x: this.width + x + 1, y: this.height + y - 1 - i });
    }
    // Draw the output.
    addText("output",    { x: x, y: this.height + y });
    addText(this.output, { x: x, y: this.height + y + 1 });
  }
}

const TEXT_WIDTH = 20;
const TEXT_HEIGHT = 16;

function addCenterText(text, y, color = 0) {
  addText(text, { x: (TEXT_WIDTH - text.length) / 2, y : y, color : color });
}

var scenes = {};
var currentScene = null;

class Scene {
  constructor(name) {
    scenes[name] = this;
  }

  onInput(char) {
  }

  draw() {
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

  onInput(char) {
    this.gotoScene("level0");
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
    this.play = false;

    let befunge = new Befunge(16, 13, ' ');
    // befunge.cells[befunge.width - 1][0] = 'l';
    // for (let i = 0; i < befunge.width; i++) {
    //   befunge.cells[i][0] = (i % 10).toString();
    // }
    // for (let j = 0; j < befunge.height; j++) {
    //   befunge.cells[0][j] = (j % 10).toString();
    // }
    befunge.read(":11+.\"a\", elllkjlkj@");
    befunge.step(1);
    this.befunge = befunge;
  }

  draw() {
    this.befunge.draw(1, 1);
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
.........b..n.......
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
clearText();

let befunge = new Befunge(16, 13, 'b');
befunge.cells[befunge.width - 1][0] = 'l';
for (let i = 0; i < befunge.width; i++) {
  befunge.cells[i][0] = (i % 10).toString();
}
for (let j = 0; j < befunge.height; j++) {
  befunge.cells[0][j] = (j % 10).toString();
}
befunge.read(":11+.\"a\", elllkjlkj@");
befunge.step(1);

// addText("output: " + befunge.output, { x: 0, y: 15});

// befunge.draw(1,1);
currentScene.draw();

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
