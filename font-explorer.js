/*
  @title: Font Explorer
  @author: Shane Celis
           @shanecelis
*/

const cursor = "c";

const TEXT_WIDTH = 20;
const TEXT_HEIGHT = 16;

setLegend(
  [ cursor, bitmap`
9999999999999999
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9..............9
9999999999999999`]
);

//setSolids([]);

let level = 0;
const levels = [
  map`
....................
.c..................
....................
....................
....................
....................
....................
....................
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

setPushables({
  [ cursor ]: [],
});

onInput("w", () => _onInput('w'));
onInput("a", () => _onInput('a'));
onInput("s", () => _onInput('s'));
onInput("d", () => _onInput('d'));

var begin = 0;

const rowCount = 7;
const columnCount = 10;

function _onInput(c) {
  let sprite = getFirst(cursor);
  switch (c) {
    case 'w':
      sprite.y -= 2;
      break;
    case 'a':
      if (sprite.x - 2 < 0 && begin > 0) {
        begin -= rowCount * columnCount;
        sprite.x = columnCount * 2 - 1;
      } else {
        sprite.x -= 2;
      }
      break;
    case 's':
      let j = (sprite.y - 1) / 2;
      if (j < rowCount - 1) {
        sprite.y += 2;
      }
      break;
    case 'd':
      if (sprite.x + 2 >= width() && begin < 210) {
        begin += rowCount * columnCount;
        sprite.x = 1;
      } else {
        sprite.x += 2;
      }
      break;
  }
}

function fromCodePoint(point) {
  switch (point) {
    case 10:
      // No backslash in character set.
      // return "\\n";
      return String.fromCodePoint(21) + "n";
    case 32:
      return "^Z";
    default:
      return String.fromCodePoint(point)
  }
}

function draw() {
  clearText();
  let k = begin;
  for (let i = 0; i < columnCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      addText(String.fromCodePoint(k++), { x: 2 * i + 1, y: 2 * j + 1, color: 0 });
    }
  }
  let i = (getFirst(cursor).x - 1) / 2;
  let j = (getFirst(cursor).y - 1) / 2;
  // let point = j * columnCount + i + begin;
  let point = i * rowCount + j + begin;
  addText(fromCodePoint(point) + " int " + point, { x: 1, y: 15 });
}
draw();

afterInput(draw);
