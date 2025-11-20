const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/configs/world.json');
const originalConfig = require(targetPath);

const width = 50;
const height = 20;

// Initialize map with grass
const map = Array(height).fill(null).map(() => Array(width).fill('grass'));

// Helper to draw letters
const letters = {
    I: [
        " ### ",
        "  #  ",
        "  #  ",
        "  #  ",
        " ### "
    ],
    V: [
        "#   #",
        "#   #",
        "#   #",
        " # # ",
        "  #  "
    ],
    A: [
        "  #  ",
        " # # ",
        "#####",
        "#   #",
        "#   #"
    ],
    N: [
        "#   #",
        "##  #",
        "# # #",
        "#  ##",
        "#   #",
    ],
    H: [
        "#   #",
        "#   #",
        "#####",
        "#   #",
        "#   #"
    ],
    O: [
        " ### ",
        "#   #",
        "#   #",
        "#   #",
        " ### "
    ],
    L: [
        "#    ",
        "#    ",
        "#    ",
        "#    ",
        "#####"
    ],
    K: [
        "#   #",
        "#  # ",
        "###  ",
        "#  # ",
        "#   #"
    ],
    ' ': [
        "     ",
        "     ",
        "     ",
        "     ",
        "     "
    ]
};

function drawLetter(letter, startX, startY) {
    const pattern = letters[letter.toUpperCase()] || letters[' '];
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (pattern[y][x] === '#') {
                if (startY + y < height && startX + x < width) {
                    map[startY + y][startX + x] = 'wall';
                }
            }
        }
    }
    return 6; // width + spacing
}

// Draw "IVAN" on first line
let cursorX = 4;
let cursorY = 4;

"IVAN".split('').forEach(char => {
    cursorX += drawLetter(char, cursorX, cursorY);
});

// Draw "HOLOVKO" on second line
cursorX = 2;
cursorY = 11;

"HOLOVKO".split('').forEach(char => {
    cursorX += drawLetter(char, cursorX, cursorY);
});

// Add borders
for (let y = 0; y < height; y++) {
    map[y][0] = 'wall';
    map[y][width - 1] = 'wall';
}
for (let x = 0; x < width; x++) {
    map[0][x] = 'wall';
    map[height - 1][x] = 'wall';
}

const finalMap = map.map((row, rowIndex) => {
    return row.map((cellType, colIndex) => {
        // Set spawn point in the middle-left area (safe zone)
        if (rowIndex === 2 && colIndex === 2) {
            return [["grass"], ["spawn"]];
        }
        if (cellType === 'wall') {
            return [["wall"]];
        }
        return [["grass"]];
    });
});

const newConfig = {
    ...originalConfig,
    camera: {
        height: 15,
        width: 15,
        x: 2,
        y: 2
    },
    map: finalMap
};

fs.writeFileSync(targetPath, JSON.stringify(newConfig, null, 4));
console.log('Map updated with "IVAN HOLOVKO"!');
