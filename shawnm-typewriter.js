/*
@title: Typewriter
@author: ShawnM
*/

const a = "a";
const b = "b";
var tileA = (bitmap`
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111`)
setLegend(
  [a, tileA],
);

var level = map`
aaaaa
aaaaa
aaaaa
aaaaa`
setMap(level);

var string = `biiiiiig word huuuuuuuge even very massive`
var lettercount = 0
var tlettercount = 0
var linecount = 0
var split = 0
var words = []
var word = ""
var char
var eline

for (let i = 0; i < string.length; i++) { //record letter count for hyphen loop
  lettercount+=1;
  tlettercount+=1;
  if(lettercount > 16){
    linecount +=1;
    lettercount = 0
  }
}
for (let i = 1; i < linecount+1; i++){ //add hyphens
  eline = 18*i
  if (string[eline] != "\n" || string[eline] != " " || string[eline] !="" || string[eline] !="undefined"){
  string = string.split("")
 string[eline-1] = insert(string[eline-1],"-",(string[eline]))
  string = string.join("")
  }
}
lettercount = 0 //reset lettercount for linebreak loop
tlettercount = 0
linecount = 0
for (let i = 0; i < string.length; i++) { //add linebreaks
  lettercount+=1;
  tlettercount+=1;
  if(lettercount > 16){
    linecount +=1;
    console.log(`${lettercount}`)
    split = (17* linecount)
    for (let i = 1; linecount > i ; i++){
      split +=2;
    }
    console.log(`${split}`)
    textsplit(`${split}`)
    lettercount = 0
  }
}
words = string.split(" ")
addText(`${lettercount}    ${tlettercount}`, {x:1,y:1,color: color`3`})
addText(`${linecount}`, {x:4,y:1,color: color`3`})
function textsplit(point){ //split text at point
  if(string[point] != `\n`){
    string = string.split('')
    string[point] = `${string[point]}\n`;
    string = string.join('');
    console.log(`${string}`)
  }
}
  for (let i = 0; i < tlettercount; i++){
    console.log(`${tlettercount}`)
  string = string.split('')
    if (string[i] ==[" "] && string[i-1] == "\n"){
    string[i] = ""
    console.log("hi")
  }
  string = string.join('')
  }
while(string.includes("undefined")==true){
string = string.replace("undefined", "");
}

console.log(`${string}`) //insert text at point
function insert(original, toInsert, index){
  return `${original.slice(0, index)}${toInsert}${original.slice(index)}`;
}
addText(`${string}`, {x:1,y:4,color: color`3`})
