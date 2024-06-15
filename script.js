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

const conversions = {
  "d": "plant", // clover
  "e": "plant", // gold clover
  "$": "plant", // shriek
  "g": "wall", // elder
}

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

function gridify(index, dimension) {
  const row = Math.floor(index / dimension);
  const column = index % dimension;
  
  return [row, column];
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

  const loadGcieInput = document.getElementById("loadgcie");

  let currentTool = "blank";

  let gridDimensions = 0;
  let gridSize = 0;
  let grid = [];

  function renderGrid() {
    gridContainer.innerHTML = "";

    gridContainer.style.display = "grid";
    gridContainer.style.gridTemplateColumns = `repeat(${gridDimensions}, 1fr)`;

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
    if (!document.getElementById("griddim").value) {
      document.getElementById("griddim").value = 10;
    }

    if (!document.getElementById("gridsize").value) {
      document.getElementById("gridsize").value = 5;
    }

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

  // Gonna document this a lot because this was a pain
  // and so if anyone wants to parse GCIE again,
  // here was my attempt:
  loadGcieInput.addEventListener("paste", (event) => {
    const pastedText = event.clipboardData.getData("text");
    let array = pastedText.split(";");

    // Format is x/...;3;3, where ... are any plants that start in
    // 0,0 and onwards
    const header = array[0].split("/");
    const indicator = parseInt(header[0]);

    // Right now, dimensions[0] is not needed, but if I want to have
    // rectangle grids in the future, I'll just leave this here
    let dimensions = [0, 0];

    if (indicator % 2 === 0) {
      dimensions[0] = (indicator / 2) + 2;
      dimensions[1] = dimensions[0];
    } else {
      dimensions[0] = (Math.ceil(indicator / 2)) + 1;
      dimensions[1] = dimensions[0] + 1;
    }
    
    let gcieGrid = createEmptyGrid(dimensions[1]);
    let pre = 0;

    if (header[1]) {
      // Split by number, as we do not care about the age
      let headerSplit = header[1].split(/[0-9]+/);

      for (; pre < headerSplit.length - 1; pre++) {
        let actual = conversions[headerSplit[pre]];
        let [x, y] = gridify(pre, dimensions[1]);

        gcieGrid[x][y] = actual;
      }
    }

    array = array.slice(1);
    console.log(pre, array);

    let mod = 0;

    for (let i = pre + 1; i < array.length; i++) {
      let value = array[i];
      if (value == "3") continue;

      let valueSplit = value.substring(1).split(/[0-9]+/);
      let post = 0;
      let valLen = valueSplit.length - 1;

      for (; post < valueSplit.length - 1; post++) {
        let actual = conversions[valueSplit[post]];
        // mod += ((post == valueSplit.length - 2) && (valueSplit.length - 1 > 1) ? (valueSplit.length - 1) : 1);
        mod += (
          ((valLen > 1) && (post != 0)) ? 0 : 1
        );

        let [x, y] = gridify(post + i + pre + mod, dimensions[1]);
        gcieGrid[x][y] = actual;
      }

      mod += (valLen > 2 ? valLen - 1 : 0);
    }

    grid = gcieGrid;
    gridDimensions = dimensions[1];
    gridSize = document.getElementById("gridsize").value || 5;

    document.getElementById("griddim").value = gridDimensions;
    document.getElementById("gridsize").value = gridSize;

    renderGrid();
  });
});