/*
  @title: Befunge
  @author: Shane Celis @shanecelis
*/

const player = "p";
const selection = "b";

class Befunge {

  constructor(width, height, char = ' ') {
    this.width = width;
    this.height = height;
    this.cells = Array(width).fill(null).map(i => Array(height).fill(char));
    this.pointer = [0, 0];
    this.inertia = [1, 0];
    this.stack = [];
    this.output = "";
    this.stringMode = false;
  }

  isDigit(c) {
    return c >= '0' && c <= '9';
  }

  eval(instruction) {
    let s = this.stack;
    if (this.stringMode) {
      if (instruction == '"')
        this.stringMode = false;
      else
        s.push(instruction);
      return;
    }
    if (this.isDigit(instruction)) {
      s.push(instruction);
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
      case '.':
        // Output as integer.
        //let e = s.pop();
        this.output += s.pop();
        break;
      case ',':
        // Output as character.
        this.output += s.pop();
        break;
      case '"':
        this.stringMode = true;
        break;
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
  }
}

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
6666666666666666
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6555555555555556
6666666666666666`]
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
.........b..........
....................
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

let befunge = new Befunge(18, 14, 'b');
befunge.cells[befunge.width - 1][0] = 'l';
for (let i = 0; i < befunge.width; i++) {
  befunge.cells[i][0] = (i % 10).toString();
}
for (let j = 0; j < befunge.height; j++) {
  befunge.cells[0][j] = (j % 10).toString();
}
 befunge.read("11+.\"a\". elllkjlkj@");
// befunge.step(8);

// addText("output: " + befunge.output, { x: 0, y: 15});





befunge.draw(1,1);

setPushables({
  [player]: []
});

//addText("hello", { x: 0, y: 0, color: color`5` });
addText("hello", { x: 12, y: 5, color: color`5` });

onInput("s", () => {
  getFirst(selection).y += 1
});

onInput("w", () => {
  getFirst(selection).y -= 1
});

onInput("a", () => {
  getFirst(selection).x -= 1
});

onInput("d", () => {
  getFirst(selection).x += 1
});

afterInput(() => {

});
