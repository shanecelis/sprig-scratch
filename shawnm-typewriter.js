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

var string = `biiiiiig word huuuuuuuge even very massive`;

function textsplit(string, point){ //split text at point
  if(string[point] != `\n`){
    string = string.split('')
    string[point] = `${string[point]}\n`;
    string = string.join('');
    console.log(`${string}`)
  }
  return string;
};
function reflow(string) {
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
    string = textsplit(string, `${split}`);
    lettercount = 0
  }
}
words = string.split(" ")
addText(`${lettercount}    ${tlettercount}`, {x:1,y:1,color: color`3`})
addText(`${linecount}`, {x:4,y:1,color: color`3`})

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
  return string;
}
string = reflow(string);

console.log(`${string}`) //insert text at point
function insert(original, toInsert, index){
  return `${original.slice(0, index)}${toInsert}${original.slice(index)}`;
}
addText(`${string}`, {x:1,y:4,color: color`3`})

// https://github.com/joewalnes/jstinytest/blob/master/tinytest.js
const TinyTest = {

    run: function(tests) {
        let failures = 0;
        for (let testName in tests) {
            let testAction = tests[testName];
            try {
                testAction();
                console.log('Test:', testName, 'OK');
            } catch (e) {
                failures++;
                console.error('Test:', testName, 'FAILED', e);
                console.error(e.stack);
            }
        }
        setTimeout(function() { // Give document a chance to complete
            if (window.document && document.body) {
                document.body.style.backgroundColor = (failures == 0 ? '#99ff99' : '#ff9999');
            }
        }, 0);
    },

    fail: function(msg) {
        throw new Error('fail(): ' + msg);
    },

    assert: function(value, msg) {
        if (!value) {
            throw new Error('assert(): ' + msg);
        }
    },

    assertEquals: function(expected, actual) {
        if (expected != actual) {
            throw new Error('assertEquals() "' + expected + '" != "' + actual + '"');
        }
    },

    assertStrictEquals: function(expected, actual) {
        if (expected !== actual) {
            throw new Error('assertStrictEquals() "' + expected + '" !== "' + actual + '"');
        }
    },

};

const fail                = TinyTest.fail,
      assert              = TinyTest.assert,
      assertEquals        = TinyTest.assertEquals,
      eq                  = TinyTest.assertEquals, // alias for assertEquals
      assertStrictEquals  = TinyTest.assertStrictEquals,
      tests               = TinyTest.run;

tests({
  "identity tests": function () {
    eq(`word`, reflow(`word`));
    eq(`two words`, reflow(`two words`));
   // eq(`biiiiiig word huu`, reflow(`biiiiiig word huu`));
  },
  "test very huge": function () {
    eq(`biiiiiig word huu-
uuuuuge even very-
massive`, reflow(`biiiiiig word huuuuuuuge even very massive`));
    eq(`biiiiiig word huu-
uuuuuge even very-
massive`, reflow(`biiiiiig word huuuuuuuge even very massive`));
    eq(`biiiiiig word huu-
uuuuuge even very-
w`, reflow(`biiiiiig word huuuuuuuge even very w`));
  }
  });
