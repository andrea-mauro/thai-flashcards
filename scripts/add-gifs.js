#!/usr/bin/env node
// Run: node scripts/add-gifs.js
// Adds gif URLs to flashcards by matching English word to Giphy media IDs.

const fs = require('fs');
const path = require('path');

// Map of english word (lowercase) → Giphy ID
const gifMap = {
  // Batch 1
  "bad": "yLUDES1hibWNiwBCNs",
  "bag": "9KeOUp3sIqL6w",
  "big": "PkAZ1JzOu4QH6",
  "good": "J8FZIm9VoBU6Q",
  "new": "ZuMBFs7D3HOl70inpD",
  "news": "j6ymVVEawon1Kuqchm",
  "no": "fXnRObM8Q0RkOmR5nf",
  "okay": "L3X9GvVhP1nY23Ah6u",
  "player": "l0MYBXYZ2nlA4cdMc",
  "please": "zZbf6UpZslp3nvFjIR",
  // Batch 2
  "small": "7mEBt4A9FnTs8Y2v5t",
  "umbrella": "lhLoViLakxgFq",
  "yes": "89x4osEodHEoo",
  "bathrobe": "IN86hXl2ur9vV0UICb",
  "bathtub": "tdVggwqvncYbZGND4t",
  "comb": "wP6bnrz9sxQys",
  "conditioner": "rNwnlgSlMKhfyN1tj0",
  "dipper": "3uetGLYgad1OE",
  "faucet": "UmexBhIQpsqLf3L1gL",
  "hairbrush": "noG98sNEsYggqRA0Zd",
  // Batch 3 - bathroom
  "mirror": "5nkIn9AEfUQ6JtXL43",
  "soap": "de8psxCl8O3DO",
  "toothbrush": "Lv4YGuoPaL1pC",
  "shampoo": "10uVasOeFs6U92",
  "towel": "l0HlGEICWt0wCRAxW",
  "razor": "vNqgL8Rv3Qta5rFB9s",
  // Batch 3 - clothing
  "dress": "CVMo4eDVQ8bOo",
  "hat": "EdTueEhc6hdgWwxxxc",
  "jacket": "jwnI8yNCioacg",
  "shoes": "26TM88tPoYX5QNGESP",
  "socks": "xfZOShRy1eushwpTC5",
  // Batch 3 - food & drink
  "coffee": "AZQGMIiEK8yDfGEn55",
  "egg": "lPSFI3zCXujgHt37De",
  "bread": "L33ULKVsqBQt0y9OO3",
  "water": "148x4ezZxvpIeA",
  // Batch 3 - family
  "baby": "14kqI3Y4urS3rG",
  // Batch 3 - feelings
  "sleepy": "YNxvJmicapfWgQUOhi",
  "tired": "eBCnpuRGBhQGY",
  "hungry": "vdbrUjzrUEGly",
  // Batch 3 - greetings
  "hello": "qGvmdlfJ0FtBSwxqA3",
  "goodbye": "VgC5dVK3KzQCm1TdPI",
  "thank you": "IcGkqdUmYLFGE",
  // Batch 3 - nature
  "dog": "EhmaX4Jw19SEMhvRgY",
  "rain": "hWvk9iUU4uBBeyBq0k",
  "sun": "3ROGCp62zakRW",
  "moon": "aN9GqoR7OD3nq",
  "flower": "6kqtoA6DHgHLy",
  // Batch 3 - verbs
  "run": "CUbiYQbsKSGAM",
  "sleep": "gH9mmqt8VKfe0",
  "walk": "R1WSlTDjU71wk",
  "read": "8dYmJ6Buo3lYY",
  // Batch 4 - food & drink
  "rice": "VOI8swgXSaeLom8nrR",
  "milk": "14imqvQBv9EVqw",
  "tea": "3o85xGocUH8RYoDKKs",
  "soup": "LvbGu8SSW2oj6hVzc2",
  "meat": "JSHQhCbHSUyeAUPskX",
  // Batch 4 - clothing
  "coat": "PpBfyIUsxnsju",
  "pants": "LPPFDnKdb7zUc",
  "shirt": "kDlqs21c5OQTRfQVS9",
  "skirt": "72uEpBPzh4vYI",
  // Batch 4 - nature
  "fish": "lPuW5AlR9AeWzSsIqi",
  "horse": "l9mASFqtemeKk",
  "mountain": "ST4XJrqX7JyZa",
  "star": "LT1Pq74cXuNQxyUmLk",
  "tree": "kxMQXnH7ucS9q",
  "cloud": "qq5gwamAHVofm",
  // Batch 4 - verbs
  "write": "nGtOFccLzujug",
  "talk": "b1zAlqFj2fBi6pmzUJ",
  "listen": "ku5EcFe4PNGWA",
  // Batch 4 - weather
  "cold": "s4Bi420mMDRBK",
  "hot": "ToMjGppLes0ENI5osCc",
  // Batch 4 - family
  "mother": "JfpBjRpzE7nFV4XcRq",
  "father": "y5Z6KYqDvQN1TeM2hC",
  "friend": "VduFvPwm3gfGO8duNN",
  // Batch 4 - bathroom
  "toilet": "3ohs4qw8hkPShGeanS",
  "slippers": "MaNsJGV8p2Yuqyqtfc",
  // Batch 5 - colors
  "black": "3o6UBedJJfaxXHvZyU",
  "blue": "5kFbMBOEdWjg1nItoG",
  "red": "xT0GqimU9dTwmE5lra",
  "green": "tj5v01sQumzCg",
  "yellow": "Qh6aPCssL8J8I",
  "pink": "abt3O3BEwR6wg",
  "purple": "hTBdZxUHG2r0XwLFSL",
  "orange": "t2aAdTgnU9Ie6jvG0W",
  "white": "l0HlA96OHn6pgUaQw",
  "brown": "vq7SF5Z1YyRmPV1V90",
  // Batch 5 - furniture/home
  "bed": "mkhMTALnrYRLnuoe5P",
  "chair": "AmP2x5TJhLOPrw93pg",
  "door": "3o7TKswXkG2qVFIop2",
  "window": "l0Exrmj1AVJUbBuSI",
  "table": "xT9IgjnrmEsKNUmEKc",
  "pillow": "ytoLPrA5GcdOdWDnFY",
  "blanket": "J4pw8s5aCnpS2yigw1",
  "house": "f6PvtI3nkIQrTTzbSd",
  "kitchen": "Fm1C6NodcvsdM4khwE",
  "fan": "SJibYG9yd91Jk3fdXv",
  // Batch 5 - family
  "sister": "lRQTVaje6kCzK",
  "brother": "PkWtM2kZ0B76VV2g0W",
  "family": "xT1R9N52rNfI3dX0oo",
  // Batch 5 - food & drink
  "juice": "2ZhzdKCkDWpDfZhXX2",
  "sugar": "44p2SkY2gC9yg",
  "salt": "hQuoq2FMIKfWoBETkS",
  "food": "d2ItDZZumUI6Y",
  "to eat": "d2ItDZZumUI6Y",
  "to drink": "PcnUjSEMBlpgk",
  // Batch 5 - feelings
  "not feeling well / sick": "13oAIJjaKPhf3y",
  "hurt / in pain": "13w5HmyiuaZ224",
  "full (after eating)": "QHjUiL2bCCQGQ",
  // Batch 5 - greetings
  "good morning": "DMnQAyk56tfX0O436G",
  "good night / sweet dreams": "K9XgVa8ohCfeGNXwJ0",
  // Batch 5 - kitchen tools
  "blender": "3oz8xHfVJDV6qYbBCg",
  "knife": "iFyhAdgFB8kuzDN9gY",
  "spoon": "sVeBIxBqBUhacB8eGj",
  "fork": "Kf5bPeufoDJl21uYRJ",
  "microwave": "l0ErEg1TytkUVXxWU",
  "refrigerator": "3oz8xRTwtQl2gKBAju",
  "pot": "tGwotuRRJNlECHyjnG",
  // Batch 5 - verbs
  "work": "1kkxWqT5nvLXupUTwK",
  "sit": "ZikV03WchqO64",
  "stand": "S8OGIu8A1mvRUBkRik",
  "play": "Pm08ZLlxa1mWttBOgt",
  // Batch 5 - nature
  "river": "2csuIJj6TmuKA",
  // Batch 6 - bathroom
  "hair dryer": "ynP5PL0zrjgCtNzHdU",
  "toothpaste": "xHDG1qIplWVrO",
  // Batch 6 - weather/feelings
  "warm": "Hj7mksbFWIOdO",
  // Batch 6 - family
  "son": "6szc6D1swXJJF1xl2I",
  "daughter": "GgVyLSSbIx58WjS9sq",
  // Batch 6 - kitchen tools
  "rice cooker": "3ohzdJIPPRxinpPbUI",
  "kettle": "Q73ty51WxaXoCdxJ6D",
  "oven": "Z0lWsgfBeuv60",
  "frying pan": "vXJLWypoYt0wE",
  "chopsticks": "5n5CPcCgv8dkByKoxN",
  "plate": "jldF2NqkaD9pxk60eu",
  // Batch 6 - school
  "book": "Q5RjtPsU4Ds5ByAVI9",
  "pencil": "lSOsYF2W66t8YPx0Zn",
  "pen": "kHsNGykRSXwhPw4Q7M",
  // Batch 6 - nature
  "sky": "u01ioCe6G8URG",
  // Batch 6 - food & drink
  "coconut water": "JUYp3DdiyoD58q4WAe",
  "watermelon juice": "Ikxbpk4vNF22yiFPzZ",
  "pad thai": "WmcvJmoK2I9R0MFsDj",
  // Batch 7 - kitchen & school
  "cup": "xT8peoAs2FyXGFRf5C",
  "bowl": "LcXNZ2Ugg76LpQBSbB",
  "apron": "l1TJTwU3VfPHU4FCbx",
  "teacher": "vVKqa0NMZzFyE",
};

const filePath = path.join(__dirname, '../src/data/flashcards.ts');
let content = fs.readFileSync(filePath, 'utf8');

let updatedCount = 0;
for (const [english, gifId] of Object.entries(gifMap)) {
  const gifUrl = `https://media.giphy.com/media/${gifId}/giphy.gif`;
  // Match lines with this exact english value (case-insensitive check, exact value match)
  const regex = new RegExp(
    `("english":"${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")(?!.*"gif":)`,
    'gi'
  );
  const before = content;
  content = content.replace(regex, (match, p1) => {
    // Insert gif field before the closing of the object on the same line
    return `${p1},"gif":"${gifUrl}"`;
  });
  if (content !== before) {
    updatedCount++;
    console.log(`✓ ${english} → ${gifId}`);
  } else {
    console.log(`⚠ No match or already set: ${english}`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone. Updated ${updatedCount} flashcards.`);
