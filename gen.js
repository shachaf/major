// Load cmudict and generate major lookup file.

"use strict";

const fs = require("fs");

const phonemeMap = new Map([
  ["AA", null], ["AA", null], ["AE", null], ["AH", null], ["AO", null],
  ["AW", null], ["AY", null], ["EH", null], ["ER", null], ["EY", null],
  ["IH", null], ["IY", null], ["OW", null], ["OY", null], ["UH", null],
  ["UW", null], ["W", null], ["Y", null],
  ["HH", null],

  ["S", "0"], ["Z", "0"],
  ["D", "1"], ["DH", "1"], ["T", "1"], ["TH", "1"],
  ["N", "2"], ["NG", "2"], // ?
  ["M", "3"],
  ["R", "4"],
  ["L", "5"],
  ["CH", "6"], ["JH", "6"], ["SH", "6"], ["ZH", "6"],
  ["G", "7"], ["K", "7"],
  ["F", "8"], ["V", "8"],
  ["B", "9"], ["P", "9"],
]);

function parseCmudict(cmudictRaw) {
  let cmudict = new Map();

  const lines = cmudictRaw.split(/\n/);
  for (const line of lines) {
    if (line[0] === ";" || line === "") continue;
    const m = line.match(/^([A-Z\-!"#%&'\(\)+,\.\/0-9:\?_ÉÀ{}]+) (( [A-Z0-9]+)+)$/);
    const word = m[1];
    const phonemes = m[2].split(' ').slice(1);
    if (cmudict.has(word)) throw "repeated word"; // TODO: Handle WORD(1) etc.
    cmudict.set(word, phonemes);
  }

  return cmudict;
}

function phonemesToMajor(phonemes) {
  return phonemes.map(p => phonemeMap.get(p.replace(/[0-9]+/, ""))).filter(p => p !== null).join("");
}

function makeMajorDict(cmudict) {
  let majorDict = new Map();

  for (const [word, phonemes] of cmudict.entries()) {
    let major = phonemesToMajor(phonemes);
    if (!majorDict.has(major))
      majorDict.set(major, []);
    majorDict.get(major).push(word.toLowerCase());
  }

  return majorDict;
}

function serializeMajorDict(majorDict) {
  return JSON.stringify([...majorDict]);
}

function main() {
  const cmudictRaw = fs.readFileSync("cmudict-0.7b", "latin1");
  const cmudict = parseCmudict(cmudictRaw);
  const majorDict = makeMajorDict(cmudict);
  fs.writeFileSync("majordict.json", serializeMajorDict(majorDict), "utf8");
}

main();
