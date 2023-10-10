import "./style.css";

const canvas = document.querySelector("canvas");
const context = canvas?.getContext("2d");

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;
const PIECES = [
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
] as number[][][];

if (canvas) {
  canvas.width = BLOCK_SIZE * BOARD_WIDTH;
  canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
}

context?.scale(BLOCK_SIZE, BLOCK_SIZE);

const board = Array.from({ length: 30 }, () =>
  Array.from({ length: 14 }).fill(0)
) as number[][];

const piece = {
  position: { x: 5, y: 5 },
  matrix: [
    [1, 1],
    [1, 1],
  ],
};

let score = 0;
let lastTime = 0;
let dropCounter = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;

  if (dropCounter > 1000) {
    piece.position.y += 1;

    if (collide(board, piece)) {
      piece.position.y -= 1;
      solidifyPiece();
      removeRow(board);
    }

    dropCounter = 0;
  }

  draw();
  window.requestAnimationFrame(update);
}

function draw() {
  if (context && canvas) {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas?.width, canvas?.height);

    board.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value > 0) {
          context.fillStyle = "red";
          context.fillRect(x, y, 1, 1);
        }
      });
    });

    piece.matrix.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value > 0) {
          context.fillStyle = "blue";
          context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
        }
      });
    });

    updateScore();
  }
}

function collide(board: number[][], piece: any) {
  const [m, o] = [piece.matrix, piece.position];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function solidifyPiece() {
  piece.matrix.forEach((row: number[], y: number) => {
    row.forEach((value: number, x: number) => {
      if (value > 0) {
        board[y + piece.position.y][x + piece.position.x] = value;
      }
    });
  });

  piece.position.y = 0;
  piece.position.x = Math.floor((Math.random() * BOARD_WIDTH) / 2);
  piece.matrix = PIECES[Math.floor(Math.random() * PIECES.length)];

  if (checkGameOver()) {
    window.alert("Game Over!");
    board.forEach((row: number[]) => row.fill(0));
  }
}

function removeRow(board: number[][]) {
  let rowCount = 1;

  outer: for (let y = board.length - 1; y > 0; --y) {
    for (let x = 0; x < board[y].length; ++x) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }

    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    ++y;

    rowCount *= 2;
    score += 10;
  }

  return rowCount;
}

function checkGameOver() {
  return board[0].some((cell: number) => cell > 0);
}

function rotatePiece() {
  const rotated = [] as number[][];

  for (let y = 0; y < piece.matrix[0].length; ++y) {
    const row = [] as number[];

    for (let x = piece.matrix.length - 1; x >= 0; --x) {
      row.push(piece.matrix[x][y]);
    }

    rotated.push(row);
  }

  const previousShape = piece.matrix;
  piece.matrix = rotated;

  if (collide(board, piece)) {
    piece.matrix = previousShape;
  }
}

function updateScore() {
  const scoreElement = document.querySelector("#score") as HTMLSpanElement;

  scoreElement.innerText = score.toString();
}

document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "ArrowUp") {
    rotatePiece();
  } else if (event.key === "ArrowLeft") {
    piece.position.x -= 1;

    if (collide(board, piece)) {
      piece.position.x += 1;
    }
  } else if (event.key === "ArrowRight") {
    piece.position.x += 1;

    if (collide(board, piece)) {
      piece.position.x -= 1;
    }
  } else if (event.key === "ArrowDown") {
    piece.position.y += 1;

    if (collide(board, piece)) {
      piece.position.y -= 1;
      solidifyPiece();
      removeRow(board);
    }
  } else if (event.key === " ") {
    while (!collide(board, piece)) {
      piece.position.y += 1;
    }

    piece.position.y -= 1;
    solidifyPiece();
    removeRow(board);
  }
});

const startButton = document.querySelector("#start") as HTMLButtonElement;

startButton.addEventListener("click", () => {
  startButton.style.display = "none";
  board.forEach((row: number[]) => row.fill(0));
  score = 0;
  update();
});
