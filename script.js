// probably gonna rework all of this
const colors = {
  "plant": "#22C55E",
  "wall": "#EF4444",
  "blank": "#E5E7EB",
}

const tailwindColors = {
  "plant": "bg-green-500",
  "wall": "bg-red-500",
  "blank": "bg-gray-200"
}

const offsets = [-1, 0, 1];

function createEmptyGrid(size) {
  let grid = [];

  for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
          row.push("blank");
      }
      grid.push(row);
  }

  return grid;
}

document.addEventListener("DOMContentLoaded", () => {
  const generateClearBtn = document.getElementById("generateClearBtn");
  const simulateBtn = document.getElementById("simulate");
  const saveBtn = document.getElementById("save");
  const loadBtn = document.getElementById("load");

  const gridContainer = document.getElementById("grid");

  const plantButton = document.getElementById("plant");
  const wallButton = document.getElementById("wall");
  const blankButton = document.getElementById("blank");

  let currentTool = "blank";

  let gridDimensions = 0;
  let gridSize = 0;
  let grid = [];

  function renderGrid() {
    gridContainer.innerHTML = "";

    gridContainer.style.display = "grid";
    gridContainer.style.gridTemplateColumns = `repeat(${gridDimensions}, 1fr)`;
    gridContainer.style.gridGap = "5px";

    for (let row = 0; row < gridDimensions; row++) {
      for (let col = 0; col < gridDimensions; col++) {
        const button = document.createElement("button");
        button.classList.add(`p-${gridSize}`, "border", "border-gray-400", tailwindColors[grid[row][col]], "hover:bg-gray-400");

        button.addEventListener("click", () => {
          button.style.backgroundColor = colors[currentTool];
          grid[row][col] = currentTool; 
        });

        gridContainer.appendChild(button);
      }
    }
  }
  
  plantButton.addEventListener("click", () => {
    currentTool = "plant"

    plantButton.classList.add("border-blue-600");
    wallButton.classList.remove("border-blue-600"); blankButton.classList.remove("border-blue-600"); 
  });

  wallButton.addEventListener("click", () => {
    currentTool = "wall"

    wallButton.classList.add("border-blue-600");
    plantButton.classList.remove("border-blue-600"); blankButton.classList.remove("border-blue-600"); 
  });

  blankButton.addEventListener("click", () => {
    currentTool = "blank"

    blankButton.classList.add("border-blue-600");
    wallButton.classList.remove("border-blue-600"); plantButton.classList.remove("border-blue-600"); 
  });

  generateClearBtn.addEventListener("click", () => {

    const userGridDimensions = parseInt(document.getElementById("griddim").value);
    const userGridSize = parseInt(document.getElementById("gridsize").value);

    if (isNaN(userGridSize) || userGridSize <= 0) {alert("Please enter a valid grid size greater than 0"); return;}
    if (isNaN(userGridDimensions) || userGridDimensions <= 1) {alert("Please enter valid grid dimensions greater than 1"); return;}

    gridSize = userGridSize;
    gridDimensions = userGridDimensions;
    grid = createEmptyGrid(gridDimensions);

    renderGrid();
  });

  function getNeighbors(row, col) {
    const neighbors = [];

    for (let i = 0; i < offsets.length; i++) {
      for (let j = 0; j < offsets.length; j++) {
        const newRow = row + offsets[i];
        const newCol = col + offsets[j];

        if (newRow >= 0 && newRow < gridDimensions 
          && newCol >= 0 
          && newCol < gridDimensions
          && !(newCol == col && newRow == row)) {
            neighbors.push(grid[newRow][newCol]);
        }
      }
    }

    return neighbors;
  }

  function simulate() {
    for (let row = 0; row < gridDimensions; row++) {
      for (let col = 0; col < gridDimensions; col++) {
        const neighbors = getNeighbors(row, col);
        const plants = neighbors.filter(x => x == "plant").length;
        const cell = grid[row][col];

        if (cell == "blank" && plants == 1) {
          grid[row][col] = "plant";
        }
      }
    }
    console.log(grid);
    renderGrid(gridSize, gridDimensions);
  }

  simulateBtn.addEventListener("click", () => {
    simulate();
  });

  saveBtn.addEventListener("click", () => {
    const data = {
      grid: grid,
      gridDimensions: gridDimensions,
      gridSize: gridSize
    };

    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "grid.json";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  });

  loadBtn.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;
    const reader = new FileReader();

    reader.onload = function(event) {
      const text = event.target.result;
      try {
        const data = JSON.parse(text);
        grid = data.grid;
        gridDimensions = data.gridDimensions;
        gridSize = data.gridSize;
        renderGrid();
      } catch (error) {
        alert("Invalid file format!");
        console.error(error);
      }
    };

    reader.readAsText(file);
  });
});