// DOM references
const canvas = document.querySelector("canvas");
const body = document.querySelector("body");
const ctx = canvas.getContext("2d");

// CONSTANTS
const RESOLUTION = 10;
const HEIGHT = 800;
const WIDHT = 800;
const COLS = WIDHT / RESOLUTION;
const ROWS = HEIGHT / RESOLUTION;
const MAX_CELL_HEAT = 30;
const BG_COLOR = "#111";

// Game rules
const rules = {
  1: {
    condition: (cell, neighborsCount) => cell.state === 1 && neighborsCount < 2,
    transition: (grid, x, y, previousCell) =>
      (grid[x][y] = new Cell(0, previousCell.heat - 1)),
  },

  2: {
    condition: (cell, neighborsCount) => cell.state === 1 && neighborsCount > 3,
    transition: (grid, x, y, previousCell) =>
      (grid[x][y] = new Cell(0, previousCell.heat - 1)),
  },

  3: {
    condition: (cell, neighborsCount) =>
      cell.state === 0 && neighborsCount === 3,
    transition: (grid, x, y) => (grid[x][y] = new Cell(1, MAX_CELL_HEAT)),
  },
  default: {
    transition: (grid, x, y, previousCell) =>
      (grid[x][y] = new Cell(previousCell.state, previousCell.heat - 1)),
  },
};

// Initialize env
canvas.height = HEIGHT;
canvas.width = WIDHT;
body.style.backgroundColor = BG_COLOR;
ctx.fillStyle = BG_COLOR;
ctx.fillRect(0, 0, canvas.width, canvas.height);

class Cell {
  constructor(newState, heat = 0) {
    this.state =
      newState !== undefined ? newState : Math.floor(Math.random() * 2);
    this.heat = heat < 0 ? 0 : heat < MAX_CELL_HEAT ? heat : MAX_CELL_HEAT;
  }
}

function generateGrid(cols, rows) {
  return new Array(cols)
    .fill(null)
    .map(() => new Array(rows).fill(null).map(() => new Cell()));
}

function computeNewGridCellState(
  newGridRef,
  currentCell,
  x,
  y,
  currentCellLiveNeighborsCount
) {
  if (rules[1].condition(currentCell, currentCellLiveNeighborsCount)) {
    rules[1].transition(newGridRef, x, y, currentCell);
  } else if (rules[2].condition(currentCell, currentCellLiveNeighborsCount)) {
    rules[2].transition(newGridRef, x, y, currentCell);
  } else if (rules[3].condition(currentCell, currentCellLiveNeighborsCount)) {
    rules[3].transition(newGridRef, x, y, currentCell);
  } else {
    rules["default"].transition(newGridRef, x, y, currentCell);
  }
}

function nextGen(currentGrid) {
  const newGrid = [];

  for (let x = 0; x < currentGrid.length; x++) {
    newGrid[x] = new Array(currentGrid.length).fill(null);
    for (let y = 0; y < currentGrid[x].length; y++) {
      let neighborsCount = 0;
      const cell = currentGrid[x][y];

      render(cell, x, y);

      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i === 0 && j === 0) {
            continue;
          }

          const xNeighborCellCoords = x + i;
          const yNeighborCellCoords = y + j;

          if (
            xNeighborCellCoords >= 0 &&
            yNeighborCellCoords >= 0 &&
            xNeighborCellCoords < COLS &&
            yNeighborCellCoords < ROWS
          ) {
            const currentNeighbor =
              currentGrid[xNeighborCellCoords][yNeighborCellCoords].state;

            neighborsCount += currentNeighbor;
          }
        }
      }

      computeNewGridCellState(newGrid, cell, x, y, neighborsCount);
    }
  }
  return newGrid;
}

function render(cell, x, y) {
  ctx.beginPath();
  ctx.arc(x * RESOLUTION + 5, y * RESOLUTION + 5, 4, 0, 360);

  ctx.fillStyle =
    cell.state === 0 && cell.heat === 0
      ? BG_COLOR
      : `hsl(${
          cell.state === 1 ? 30 : 240 * (1.0 - cell.heat / MAX_CELL_HEAT) + 30
        }, 100%, 50%)`;

  ctx.fill();
}

// Initialize grid
let grid = generateGrid(COLS, ROWS);

// Start the loop
setInterval(() => {
  grid = nextGen(grid);
}, 50);
