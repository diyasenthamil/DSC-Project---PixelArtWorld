/* ==========================================================================
   TINY WORLD - JAVASCRIPT (script.js)
   A pixel art doodle world for Google Student Developers Club!
   Organized into 7 clear sections so every function is easy to explain.
   ========================================================================== */

/* ==========================================================================
   SECTION 1: SETUP
   Here we grab all HTML elements and set up our initial variables.
   ========================================================================== */

// --- Tab Navigation Elements ---
const tabDrawBtn = document.getElementById("tabDraw");
const tabWorldBtn = document.getElementById("tabWorld");
const screenDraw = document.getElementById("screenDraw");
const screenWorld = document.getElementById("screenWorld");
const emptyStateDrawBtn = document.getElementById("emptyStateDrawBtn");
const worldCountBadge = document.getElementById("worldCountBadge");
const worldEmptyState = document.getElementById("worldEmptyState");

// --- Canvases and Drawing Contexts ---
// The editor canvas is where we paint pixels
const gridCanvas = document.getElementById("gridCanvas");
const gridCtx = gridCanvas.getContext("2d");

// The preview canvas shows the drawing at real tiny size
const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");

// The world canvas is where our doodles wander around
const worldCanvas = document.getElementById("worldCanvas");
const worldCtx = worldCanvas.getContext("2d");

// Turn off image smoothing on all canvases so pixels stay sharp and blocky!
gridCtx.imageSmoothingEnabled = false;
previewCtx.imageSmoothingEnabled = false;
worldCtx.imageSmoothingEnabled = false;

// --- Notification Toast Elements ---
const toastMessage = document.getElementById("toastMessage");
const toastText = document.getElementById("toastText");
let toastTimeoutId = null;

// --- Color UI Elements ---
const currentColorPreview = document.getElementById("currentColorPreview");
const currentColorHex = document.getElementById("currentColorHex");
const nativeColorInput = document.getElementById("nativeColorInput");
const paletteGrid = document.getElementById("paletteGrid");

// --- Toolbar and Action Buttons ---
const toolPencilBtn = document.getElementById("toolPencil");
const toolEraserBtn = document.getElementById("toolEraser");
const toolBucketBtn = document.getElementById("toolBucket");
const toolEyedropperBtn = document.getElementById("toolEyedropper");
const clearBtn = document.getElementById("clearBtn");
const undoBtn = document.getElementById("undoBtn");
const addToWorldBtn = document.getElementById("addToWorldBtn");
const gridSizeSelect = document.getElementById("gridSizeSelect");

// --- World Screen Buttons and Inspection Card ---
const dayNightBtn = document.getElementById("dayNightBtn");
const resetWorldBtn = document.getElementById("resetWorldBtn");
const worldStatusText = document.getElementById("worldStatusText");
const doodleCard = document.getElementById("doodleCard");
const cardDoodleName = document.getElementById("cardDoodleName");
const cardCloseBtn = document.getElementById("cardCloseBtn");
const removeDoodleBtn = document.getElementById("removeDoodleBtn");

// --- Application State Variables ---
// Current active tab ("draw" or "world")
let activeTab = "draw";

// The size of our drawing grid (8, 16, or 32 cells wide and tall)
let gridSize = 16;

// The color currently selected for drawing (starts with cute coral pink)
let currentColor = "#ff758c";

// The tool currently selected ("pencil", "eraser", "bucket", "eyedropper")
let currentTool = "pencil";

// List of all doodles living in our world
let doodles = [];

// History stack of past grid states for Undo (maximum 20 previous states)
let historyStack = [];
const MAX_HISTORY = 20;

// World theme state (false = Day, true = Night)
let isNightMode = false;

// The ID of the currently clicked/inspected doodle in the world (or null if none)
let selectedDoodleId = null;

// List of floating pixel hearts popping when two doodles meet
let activeHearts = [];

// Pre-calculated star coordinates for the nighttime sky
const NIGHT_STARS = [
  { x: 45, y: 35, size: 2, twinkleSpeed: 0.05 },
  { x: 120, y: 75, size: 3, twinkleSpeed: 0.03 },
  { x: 190, y: 40, size: 2, twinkleSpeed: 0.07 },
  { x: 275, y: 110, size: 2, twinkleSpeed: 0.04 },
  { x: 360, y: 55, size: 3, twinkleSpeed: 0.06 },
  { x: 440, y: 95, size: 2, twinkleSpeed: 0.05 },
  { x: 520, y: 30, size: 3, twinkleSpeed: 0.04 },
  { x: 600, y: 75, size: 2, twinkleSpeed: 0.06 },
  { x: 685, y: 45, size: 3, twinkleSpeed: 0.05 },
  { x: 745, y: 100, size: 2, twinkleSpeed: 0.03 },
  { x: 150, y: 140, size: 2, twinkleSpeed: 0.04 },
  { x: 310, y: 155, size: 2, twinkleSpeed: 0.05 },
  { x: 580, y: 130, size: 2, twinkleSpeed: 0.07 },
  { x: 710, y: 165, size: 2, twinkleSpeed: 0.04 }
];
let starTime = 0;

// 24 cute colors: ink, grey, white, pastels, vibrant accents, earth tones
const PALETTE_COLORS = [
  "#2c2c34", "#595970", "#9292a8", "#ffffff",
  "#ffd1dc", "#ff758c", "#ff477e", "#d90429",
  "#ffb4a2", "#ff9f43", "#fed330", "#fef160",
  "#b8e994", "#78e08f", "#38ada9", "#079992",
  "#c7ecee", "#70a1ff", "#1e90ff", "#3742fa",
  "#e0c3fc", "#a55eea", "#8b572a", "#d4a373"
];

// --- 2D Drawing Grid Data Structure ---
// This 2D array is the HEART of our pixel art editor!
// Think of it like a chessboard or spreadsheet:
// - gridData is an array of rows (Y axis, from 0 at the top to gridSize - 1 at the bottom).
// - Each row is an array of columns (X axis, from 0 at the left to gridSize - 1 at the right).
// - gridData[y][x] stores the color string of that exact cell (for example "#ff758c").
// - If a cell is empty/transparent, its value is null.
let gridData = [];

// Track if the pointer (mouse button, touch, or stylus pen) is currently pressed down
let isDrawing = false;

// Store which cell the mouse/finger is currently hovering over for the highlight outline
let hoveredCell = { x: -1, y: -1 };


/**
 * Switches the active screen between "Draw" (editor) and "World" (playground).
 * This function changes which tab button looks selected and which screen is visible.
 * @param {string} tabName - Either "draw" or "world"
 */
function switchTab(tabName) {
  activeTab = tabName;

  if (tabName === "draw") {
    // Show the draw screen and activate its button
    screenDraw.classList.add("active");
    screenWorld.classList.remove("active");
    tabDrawBtn.classList.add("active");
    tabWorldBtn.classList.remove("active");
  } else if (tabName === "world") {
    // Show the world screen and activate its button
    screenWorld.classList.add("active");
    screenDraw.classList.remove("active");
    tabWorldBtn.classList.add("active");
    tabDrawBtn.classList.remove("active");

    // Close any previous selection card
    doodleCard.classList.add("hidden");
    selectedDoodleId = null;
  }
}

/**
 * Displays a cute little pop-up message (toast) at the bottom of the screen.
 * It automatically fades away after 2.5 seconds.
 * @param {string} message - The text to show in the toast
 */
function showToast(message) {
  toastText.textContent = message;
  toastMessage.classList.add("show");

  // Clear any existing timer so the toast stays visible for the full time
  if (toastTimeoutId !== null) {
    clearTimeout(toastTimeoutId);
  }

  // Hide the toast after 2500 milliseconds (2.5 seconds)
  toastTimeoutId = setTimeout(function () {
    toastMessage.classList.remove("show");
  }, 2500);
}


/* ==========================================================================
   SECTION 2: DRAWING GRID
   Functions for initializing the 2D array, rendering cells, grid lines, and live preview.
   ========================================================================== */

/**
 * Creates a deep copy of a 2D grid array so saving or undoing doesn't modify the original.
 * @param {Array<Array<string|null>>} sourceGrid - The 2D grid to clone
 * @returns {Array<Array<string|null>>} - An identical, independent copy
 */
function cloneGrid(sourceGrid) {
  const newGrid = [];
  for (let y = 0; y < sourceGrid.length; y++) {
    // .slice() makes a clean shallow copy of each row array
    newGrid.push(sourceGrid[y].slice());
  }
  return newGrid;
}

/**
 * Saves the current state of gridData into the history stack before making changes.
 * This is what allows the Undo button to work!
 */
function saveStateToHistory() {
  historyStack.push(cloneGrid(gridData));

  // Limit history size to MAX_HISTORY (20) to keep memory lightweight
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift(); // Remove the oldest state
  }
}

/**
 * Restores the previous drawing state from the history stack (Undo).
 */
function undoLastAction() {
  if (historyStack.length === 0) {
    showToast("Nothing to undo! ↩️");
    return;
  }

  // Pop the most recent state off the stack
  gridData = historyStack.pop();

  drawGrid();
  updatePreview();
  showToast("Undone! ↩️");
}

/**
 * Initializes the 2D array based on the current gridSize.
 * Every single cell is filled with null (which represents an empty/transparent pixel).
 */
function initGridData() {
  gridData = [];
  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      row.push(null); // null means empty cell
    }
    gridData.push(row);
  }
}

/**
 * Redraws the entire editor canvas:
 * 1. Clears the canvas.
 * 2. Draws every colored cell from the gridData 2D array.
 * 3. Draws faint grid lines so the user can easily see where pixel squares begin and end.
 * 4. Draws a subtle highlight outline on whichever cell the cursor is hovering over.
 */
function drawGrid() {
  gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

  const cellSize = gridCanvas.width / gridSize;

  // 1. Draw each painted pixel from our 2D array
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cellColor = gridData[y][x];
      if (cellColor !== null) {
        gridCtx.fillStyle = cellColor;
        // Draw the colored square at row y and column x
        gridCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // 2. Draw faint grid lines to guide the artist
  gridCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  gridCtx.lineWidth = 1;

  for (let i = 0; i <= gridSize; i++) {
    // Vertical grid line
    gridCtx.beginPath();
    gridCtx.moveTo(i * cellSize, 0);
    gridCtx.lineTo(i * cellSize, gridCanvas.height);
    gridCtx.stroke();

    // Horizontal grid line
    gridCtx.beginPath();
    gridCtx.moveTo(0, i * cellSize);
    gridCtx.lineTo(gridCanvas.width, i * cellSize);
    gridCtx.stroke();
  }

  // 3. Draw a subtle highlight box over the cell under the cursor
  if (
    hoveredCell.x >= 0 &&
    hoveredCell.x < gridSize &&
    hoveredCell.y >= 0 &&
    hoveredCell.y < gridSize
  ) {
    gridCtx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    gridCtx.lineWidth = 2;
    // Offset by 1px so the stroke fits neatly inside the square
    gridCtx.strokeRect(
      hoveredCell.x * cellSize + 1,
      hoveredCell.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );
  }
}

/**
 * Redraws the small 1x preview canvas so the user can see what their doodle
 * looks like at its real tiny pixel size.
 */
function updatePreview() {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  const previewCellSize = previewCanvas.width / gridSize;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cellColor = gridData[y][x];
      if (cellColor !== null) {
        previewCtx.fillStyle = cellColor;
        previewCtx.fillRect(
          x * previewCellSize,
          y * previewCellSize,
          previewCellSize,
          previewCellSize
        );
      }
    }
  }
}

/**
 * Converts a screen pointer event (mouse, touch, or pen) into grid coordinates (cellX, cellY).
 * Handles CSS scaling so drawing stays perfectly aligned even on smaller screens!
 * @param {PointerEvent} event - The browser pointer event
 * @returns {{x: number, y: number} | null} - The cell coordinates, or null if outside
 */
function getGridCoordinates(event) {
  const rect = gridCanvas.getBoundingClientRect();

  // Calculate the scale ratio between internal canvas size (480x480) and on-screen CSS size
  const scaleX = gridCanvas.width / rect.width;
  const scaleY = gridCanvas.height / rect.height;

  // Calculate pixel coordinates inside the canvas
  const canvasX = (event.clientX - rect.left) * scaleX;
  const canvasY = (event.clientY - rect.top) * scaleY;

  const cellSize = gridCanvas.width / gridSize;

  const cellX = Math.floor(canvasX / cellSize);
  const cellY = Math.floor(canvasY / cellSize);

  // Return coordinates if they are inside our grid bounds
  if (cellX >= 0 && cellX < gridSize && cellY >= 0 && cellY < gridSize) {
    return { x: cellX, y: cellY };
  }

  return null;
}

/**
 * Handles switching the grid size between 8x8, 16x16, and 32x32.
 * Asks for confirmation if there are already pixels drawn, then resets the grid.
 */
function handleGridSizeChange() {
  const newSize = parseInt(gridSizeSelect.value, 10);
  if (newSize === gridSize) {
    return;
  }

  // Check if any pixels are painted on the current canvas
  let hasPixels = false;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (gridData[y][x] !== null) {
        hasPixels = true;
        break;
      }
    }
    if (hasPixels) break;
  }

  // Ask for confirmation before clearing current artwork
  if (hasPixels) {
    const confirmed = confirm(
      "Changing the grid size will clear your current doodle. Are you sure?"
    );
    if (!confirmed) {
      // Revert the dropdown selection back to the current size
      gridSizeSelect.value = gridSize;
      return;
    }
  }

  gridSize = newSize;
  historyStack = []; // Reset history for new grid dimensions
  initGridData();
  drawGrid();
  updatePreview();
  showToast("Grid resized to " + gridSize + "x" + gridSize + "! 📐");
}


/* ==========================================================================
   SECTION 3: TOOLS
   Functions for selecting tools, pencil, eraser, flood fill (bucket), eyedropper.
   ========================================================================== */

/**
 * Changes the active drawing tool and updates the toolbar button highlights.
 * @param {string} toolName - "pencil", "eraser", "bucket", or "eyedropper"
 */
function selectTool(toolName) {
  currentTool = toolName;

  // Remove the active class from all tool buttons
  toolPencilBtn.classList.remove("active");
  toolEraserBtn.classList.remove("active");
  toolBucketBtn.classList.remove("active");
  toolEyedropperBtn.classList.remove("active");

  // Add the active class to whichever tool was selected
  if (toolName === "pencil") {
    toolPencilBtn.classList.add("active");
  } else if (toolName === "eraser") {
    toolEraserBtn.classList.add("active");
  } else if (toolName === "bucket") {
    toolBucketBtn.classList.add("active");
  } else if (toolName === "eyedropper") {
    toolEyedropperBtn.classList.add("active");
  }
}

/**
 * Flood Fill (Paint Bucket) Algorithm!
 * Replaces a contiguous area of the same color with newColor using a simple queue.
 * This is a classic Computer Science Breadth-First Search (BFS) pattern:
 * 1. Read the color of the clicked starting cell (targetColor).
 * 2. If it is already newColor, stop.
 * 3. Paint the starting cell and put it into a queue (to-do list).
 * 4. While the queue has cells, check all 4 neighbors (Right, Left, Down, Up).
 *    If a neighbor has targetColor, color it immediately and push it to the queue!
 * @param {number} startX - Column index where the fill begins
 * @param {number} startY - Row index where the fill begins
 * @param {string} newColor - Hex color to paint with
 */
function floodFill(startX, startY, newColor) {
  const targetColor = gridData[startY][startX];

  // If the clicked cell is already the color we want to fill with, do nothing
  if (targetColor === newColor) {
    return;
  }

  // Paint the starting cell immediately
  gridData[startY][startX] = newColor;

  // A queue of cells to process (our to-do list)
  const queue = [{ x: startX, y: startY }];

  while (queue.length > 0) {
    const current = queue.pop();
    const cx = current.x;
    const cy = current.y;

    // Check all 4 adjacent neighbors (Right, Left, Down, Up)
    const neighbors = [
      { x: cx + 1, y: cy },
      { x: cx - 1, y: cy },
      { x: cx, y: cy + 1 },
      { x: cx, y: cy - 1 }
    ];

    for (let i = 0; i < neighbors.length; i++) {
      const nx = neighbors[i].x;
      const ny = neighbors[i].y;

      // Make sure neighbor is within the grid boundary
      if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
        // If neighbor has the original target color, paint it and add to queue
        if (gridData[ny][nx] === targetColor) {
          gridData[ny][nx] = newColor;
          queue.push({ x: nx, y: ny });
        }
      }
    }
  }
}

/**
 * Eyedropper (Color Picker) function:
 * Picks the color from the clicked cell and sets it as the active drawing color.
 * Automatically switches back to the Pencil tool for a smooth drawing workflow.
 * @param {number} x - Column index of clicked pixel
 * @param {number} y - Row index of clicked pixel
 */
function pickColorFromCell(x, y) {
  const pickedColor = gridData[y][x];

  if (pickedColor !== null) {
    currentColor = pickedColor;
    updateColorUI();
    showToast("Picked " + pickedColor.toUpperCase() + "! 💧");
    selectTool("pencil"); // Switch to pencil so the user can immediately paint with it
  } else {
    showToast("Cell is empty (transparent)! 💧");
  }
}

/**
 * Applies the currently selected tool to the cell at (x, y):
 * - Pencil: sets gridData[y][x] to currentColor
 * - Eraser: sets gridData[y][x] to null (erases it)
 * - Bucket: fills connected area with currentColor
 * - Eyedropper: picks color from cell
 * @param {number} x - Column index (0 to gridSize - 1)
 * @param {number} y - Row index (0 to gridSize - 1)
 */
function applyToolAction(x, y) {
  if (currentTool === "pencil") {
    gridData[y][x] = currentColor;
  } else if (currentTool === "eraser") {
    gridData[y][x] = null;
  } else if (currentTool === "bucket") {
    floodFill(x, y, currentColor);
  } else if (currentTool === "eyedropper") {
    pickColorFromCell(x, y);
    return; // Eyedropper already updates UI and switches tools
  }

  // Redraw both the editor grid and the live preview
  drawGrid();
  updatePreview();
}

/**
 * Clears the entire drawing grid back to empty (all cells set to null).
 * Saves to history first so the clear can be undone!
 * @param {boolean} isSilent - If true, avoids showing the clear toast (e.g. after adding to world)
 */
function clearGrid(isSilent = false) {
  saveStateToHistory();

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      gridData[y][x] = null;
    }
  }

  drawGrid();
  updatePreview();

  if (!isSilent) {
    showToast("Canvas cleared! 🧹");
  }
}


/* ==========================================================================
   SECTION 4: COLOR PALETTE
   Functions for creating swatches, picking colors, and updating color indicators.
   ========================================================================== */

/**
 * Updates the current color display swatch and hex label text.
 */
function updateColorUI() {
  currentColorPreview.style.backgroundColor = currentColor;
  currentColorHex.textContent = currentColor.toUpperCase();
  nativeColorInput.value = currentColor;

  // Highlight the matching swatch in the palette grid
  const swatches = document.querySelectorAll(".color-swatch");
  swatches.forEach(function (swatch) {
    if (swatch.dataset.color.toLowerCase() === currentColor.toLowerCase()) {
      swatch.classList.add("selected");
    } else {
      swatch.classList.remove("selected");
    }
  });
}

/**
 * Creates the 24 clickable color swatch boxes in the palette grid.
 * Clicking any swatch selects that color.
 */
function renderPaletteSwatches() {
  paletteGrid.innerHTML = ""; // Clear any old swatches

  for (let i = 0; i < PALETTE_COLORS.length; i++) {
    const color = PALETTE_COLORS[i];
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.title = color;

    // Highlight initial color if it matches
    if (color.toLowerCase() === currentColor.toLowerCase()) {
      swatch.classList.add("selected");
    }

    // When clicked, select this color
    swatch.addEventListener("click", function () {
      currentColor = color;
      updateColorUI();

      // If user was using the eraser or eyedropper, automatically switch to pencil!
      if (currentTool === "eraser" || currentTool === "eyedropper") {
        selectTool("pencil");
      }
    });

    paletteGrid.appendChild(swatch);
  }
}


/* ==========================================================================
   SECTION 5: SAVING DOODLES
   Packages the drawn grid into a living doodle object and saves it to the world.
   ========================================================================== */

/**
 * Packages the current drawing into a cute doodle object and adds it to our world!
 * Prompts the user for a name, generates a random starting position on the grass,
 * and saves everything persistently to localStorage.
 */
function addDoodleToWorld() {
  // First, verify that the user drew something (not completely transparent)
  let pixelCount = 0;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (gridData[y][x] !== null) {
        pixelCount++;
      }
    }
  }

  if (pixelCount === 0) {
    showToast("Canvas is empty! Draw a doodle first 🎨");
    return;
  }

  // Ask for a cute doodle name with prompt()
  const defaultName = "Doodle " + (doodles.length + 1);
  const enteredName = prompt("Name your cute creation:", defaultName);

  // If user clicked Cancel on the prompt, stop here
  if (enteredName === null) {
    return;
  }

  const doodleName = enteredName.trim() || defaultName;

  // Make a clean deep copy of the grid data
  const savedGrid = cloneGrid(gridData);

  // Calculate random position on the grass
  const grassTop = worldCanvas.height * 0.65;
  const newDoodle = {
    id: Date.now(), // Unique timestamp ID
    name: doodleName,
    gridSize: gridSize,
    grid: savedGrid,
    // Random position within the grass bounds
    x: Math.floor(Math.random() * (worldCanvas.width - 120)) + 40,
    y: Math.floor(grassTop) + Math.floor(Math.random() * 50),
    // Small slow wandering velocity in X and Y
    vx: (Math.random() - 0.5) * 1.0,
    vy: (Math.random() - 0.5) * 0.5,
    // Bobbing phase offset so doodles don't all bounce at the exact same millisecond
    bobPhase: Math.random() * Math.PI * 2,
    // Timer to periodically choose a new wander direction
    wanderTimer: 0,
    // Cooldown timer so doodles don't spam hearts continuously
    coexistCooldown: 0
  };

  // Add the doodle to our living doodles list
  doodles.push(newDoodle);

  // Save to localStorage so it persists across page reloads!
  saveDoodlesToLocalStorage();

  // Update the World tab count badge
  if (worldCountBadge) {
    worldCountBadge.textContent = doodles.length;
  }

  // Hide the empty state message overlay in the World screen
  if (worldEmptyState) {
    worldEmptyState.classList.add("hidden");
  }

  // Show a celebratory toast message
  showToast(doodleName + " joined the world! ✨");

  // Clear the drawing grid so the user can draw their next creation
  clearGrid(true); // isSilent = true
}


/* ==========================================================================
   SECTION 6: WORLD ANIMATION
   requestAnimationFrame loop, wandering physics, hearts, day/night, and rendering.
   ========================================================================== */

/**
 * Returns the crisp pixel scaling factor for a doodle so all grid sizes look balanced.
 * (8x8 doodles scale 6x, 16x16 doodles scale 4x, 32x32 doodles scale 2x)
 * @param {object} doodle - The doodle object
 * @returns {number} - Pixel scale multiplier
 */
function getDoodleScale(doodle) {
  if (doodle.gridSize === 8) return 6;
  if (doodle.gridSize === 32) return 2;
  return 4; // default 16x16 -> 4 * 16 = 64px
}

/**
 * Helper function to draw a puffy pixel cloud using simple rectangular blocks.
 * @param {number} x - Left coordinate of the cloud
 * @param {number} y - Top coordinate of the cloud
 * @param {number} scale - Size multiplier
 * @param {string} color - Cloud color
 */
function drawPixelCloud(x, y, scale, color) {
  worldCtx.fillStyle = color;
  const s = scale;
  // A cute 3-step puffy cloud shape made with simple rectangles
  worldCtx.fillRect(x + 2 * s, y, 6 * s, 2 * s);
  worldCtx.fillRect(x, y + 2 * s, 10 * s, 3 * s);
  worldCtx.fillRect(x + 1 * s, y + 5 * s, 8 * s, 1 * s);
}

/**
 * Helper function to draw a tiny cute pixel flower in the grass.
 * @param {number} x - Center X of the flower
 * @param {number} y - Center Y of the flower
 * @param {string} petalColor - Hex color for the petals
 */
function drawPixelFlower(x, y, petalColor) {
  const s = 3;
  // Green stem
  worldCtx.fillStyle = "#2ecc71";
  worldCtx.fillRect(x, y + s, s, 3 * s);

  // 4 Petals
  worldCtx.fillStyle = petalColor;
  worldCtx.fillRect(x - s, y, s, s);
  worldCtx.fillRect(x + s, y, s, s);
  worldCtx.fillRect(x, y - s, s, s);
  worldCtx.fillRect(x, y + s, s, s);

  // Center dot
  worldCtx.fillStyle = "#f1c40f";
  worldCtx.fillRect(x, y, s, s);
}

/**
 * Helper function to draw a cute crescent moon in the night sky.
 * @param {number} x - Center X
 * @param {number} y - Center Y
 */
function drawPixelMoon(x, y) {
  const s = 4;
  worldCtx.fillStyle = "#ffeaa7"; // Warm moonlight yellow
  worldCtx.fillRect(x + 2 * s, y, 3 * s, 2 * s);
  worldCtx.fillRect(x + 1 * s, y + 2 * s, 4 * s, 2 * s);
  worldCtx.fillRect(x, y + 4 * s, 4 * s, 3 * s);
  worldCtx.fillRect(x + 1 * s, y + 7 * s, 4 * s, 2 * s);
  worldCtx.fillRect(x + 2 * s, y + 9 * s, 3 * s, 2 * s);

  // Cutout with dark sky color to create the crescent curve
  worldCtx.fillStyle = "#0c1445";
  worldCtx.fillRect(x + 3 * s, y + 2 * s, 3 * s, 7 * s);
}

/**
 * Draws the peaceful world background: soft sky gradient, grass strip,
 * clouds, stars, moon, and little pixel flowers.
 * Changes colors smoothly based on isNightMode!
 */
function drawWorldBackground() {
  const width = worldCanvas.width;
  const height = worldCanvas.height;

  if (!isNightMode) {
    // --- DAY MODE SCENERY ---
    // Soft pastel day sky gradient
    const skyGrad = worldCtx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGrad.addColorStop(0, "#a0d8ef"); // Sky blue
    skyGrad.addColorStop(1, "#fcd6db"); // Soft pastel pink horizon
    worldCtx.fillStyle = skyGrad;
    worldCtx.fillRect(0, 0, width, height);

    // Soft white pixel clouds
    drawPixelCloud(60, 45, 4, "rgba(255, 255, 255, 0.85)");
    drawPixelCloud(360, 60, 5, "rgba(255, 255, 255, 0.85)");
    drawPixelCloud(620, 35, 3.5, "rgba(255, 255, 255, 0.85)");

    // Fresh green lawn at the bottom
    const grassY = height * 0.65;
    worldCtx.fillStyle = "#55efc4"; // Light bright grass highlight line
    worldCtx.fillRect(0, grassY, width, 5);
    worldCtx.fillStyle = "#00b894"; // Lush green lawn
    worldCtx.fillRect(0, grassY + 5, width, height - (grassY + 5));

    // A few cute pixel flowers on the grass
    drawPixelFlower(70, grassY + 35, "#ff7675");
    drawPixelFlower(180, grassY + 60, "#fdcb6e");
    drawPixelFlower(310, grassY + 30, "#e84393");
    drawPixelFlower(480, grassY + 70, "#a29bfe");
    drawPixelFlower(640, grassY + 40, "#fd79a8");
    drawPixelFlower(730, grassY + 75, "#ffeaa7");
  } else {
    // --- NIGHT MODE SCENERY ---
    // Deep midnight indigo to twilight purple sky
    const nightGrad = worldCtx.createLinearGradient(0, 0, 0, height * 0.65);
    nightGrad.addColorStop(0, "#0c1445"); // Deep midnight indigo
    nightGrad.addColorStop(1, "#2b1055"); // Twilight purple horizon
    worldCtx.fillStyle = nightGrad;
    worldCtx.fillRect(0, 0, width, height);

    // Crescent moon in the upper right
    drawPixelMoon(650, 40);

    // Twinkling pixel stars across the sky
    for (let i = 0; i < NIGHT_STARS.length; i++) {
      const star = NIGHT_STARS[i];
      // Subtle sine wave twinkling brightness
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(starTime * star.twinkleSpeed));
      worldCtx.fillStyle = "rgba(255, 255, 220, " + alpha + ")";
      worldCtx.fillRect(star.x, star.y, star.size, star.size);
    }

    // Translucent night clouds
    drawPixelCloud(80, 60, 4, "rgba(75, 50, 110, 0.4)");
    drawPixelCloud(380, 80, 5, "rgba(75, 50, 110, 0.4)");

    // Midnight dark-blue grass
    const grassY = height * 0.65;
    worldCtx.fillStyle = "#1e3799"; // Cool blue-tinted grass edge
    worldCtx.fillRect(0, grassY, width, 5);
    worldCtx.fillStyle = "#0a3d62"; // Deep nocturnal lawn
    worldCtx.fillRect(0, grassY + 5, width, height - (grassY + 5));

    // Little glowing night mushrooms/fireflies on the grass
    worldCtx.fillStyle = "#00d2d3";
    worldCtx.fillRect(120, grassY + 40, 4, 4);
    worldCtx.fillRect(340, grassY + 65, 4, 4);
    worldCtx.fillRect(560, grassY + 35, 4, 4);
    worldCtx.fillRect(720, grassY + 70, 4, 4);
  }
}

/**
 * Draws a cute pixel heart with an opacity fade.
 * Used by the Coexist feature when two doodles get close!
 * @param {number} x - Center X of the heart
 * @param {number} y - Center Y of the heart
 * @param {number} opacity - Float between 0 and 1
 */
function drawPixelHeart(x, y, opacity) {
  worldCtx.save();
  worldCtx.globalAlpha = Math.max(0, Math.min(1, opacity));
  worldCtx.fillStyle = "#ff4757"; // Sweet strawberry red
  const s = 3; // Heart pixel size

  // Top two lobes of the heart
  worldCtx.fillRect(x - 2 * s, y - 2 * s, 2 * s, 2 * s);
  worldCtx.fillRect(x + 1 * s, y - 2 * s, 2 * s, 2 * s);
  // Full center bar
  worldCtx.fillRect(x - 3 * s, y, 7 * s, 2 * s);
  // Tapering bottom point
  worldCtx.fillRect(x - 2 * s, y + 2 * s, 5 * s, 2 * s);
  worldCtx.fillRect(x - 1 * s, y + 4 * s, 3 * s, 2 * s);
  worldCtx.fillRect(x, y + 6 * s, 1 * s, 2 * s);

  worldCtx.restore();
}

/**
 * Checks all pairs of doodles to see if any are close to each other.
 * If two doodles meet, a cute floating pixel heart pops above them!
 */
function checkCoexistence() {
  for (let i = 0; i < doodles.length; i++) {
    for (let j = i + 1; j < doodles.length; j++) {
      const doodleA = doodles[i];
      const doodleB = doodles[j];

      const scaleA = getDoodleScale(doodleA);
      const scaleB = getDoodleScale(doodleB);
      const widthA = doodleA.gridSize * scaleA;
      const heightA = doodleA.gridSize * scaleA;
      const widthB = doodleB.gridSize * scaleB;
      const heightB = doodleB.gridSize * scaleB;

      // Find center coordinates of both doodles
      const centerAx = doodleA.x + widthA / 2;
      const centerAy = doodleA.y + heightA / 2;
      const centerBx = doodleB.x + widthB / 2;
      const centerBy = doodleB.y + heightB / 2;

      // Simple Euclidean distance check: Math.hypot(dx, dy)
      const dx = centerAx - centerBx;
      const dy = centerAy - centerBy;
      const distance = Math.hypot(dx, dy);

      // If they are closer than 65 pixels and neither is on cooldown: POP A HEART!
      if (
        distance < 65 &&
        doodleA.coexistCooldown <= 0 &&
        doodleB.coexistCooldown <= 0
      ) {
        activeHearts.push({
          x: (centerAx + centerBx) / 2,
          y: Math.min(doodleA.y, doodleB.y) - 14,
          life: 60, // 60 frames = approximately 1 second
          maxLife: 60
        });

        // Set cooldown so hearts don't spam every single frame while walking past
        doodleA.coexistCooldown = 180; // 3 second cooldown
        doodleB.coexistCooldown = 180;
      }
    }
  }
}

/**
 * Updates floating heart positions, fades them out, and draws them.
 */
function updateAndDrawHearts() {
  for (let i = 0; i < activeHearts.length; i++) {
    const heart = activeHearts[i];
    heart.y -= 0.6; // Heart floats up gently
    heart.life--;

    const opacity = heart.life / heart.maxLife;
    drawPixelHeart(heart.x, heart.y, opacity);
  }

  // Remove hearts whose timer has run out
  activeHearts = activeHearts.filter(function (h) {
    return h.life > 0;
  });
}

/**
 * Updates positions, wandering physics, bouncing, and renders every doodle on screen.
 */
function updateAndDrawDoodles() {
  const grassTop = worldCanvas.height * 0.65 - 12;
  const canvasWidth = worldCanvas.width;
  const canvasHeight = worldCanvas.height;

  for (let i = 0; i < doodles.length; i++) {
    const doodle = doodles[i];
    const scale = getDoodleScale(doodle);
    const doodleWidth = doodle.gridSize * scale;
    const doodleHeight = doodle.gridSize * scale;
    const grassBottom = canvasHeight - doodleHeight - 8;

    // 1. Bobbing animation: Math.sin creates a smooth up-and-down walking effect!
    doodle.bobPhase += 0.08;
    const bobY = Math.sin(doodle.bobPhase) * 3.5;

    // 2. Wandering: change direction randomly every ~2 to 3 seconds
    doodle.wanderTimer++;
    if (doodle.wanderTimer > 120 + Math.random() * 60) {
      doodle.vx = (Math.random() - 0.5) * 1.0;
      doodle.vy = (Math.random() - 0.5) * 0.5;
      doodle.wanderTimer = 0;
    }

    // 3. Move the doodle
    doodle.x += doodle.vx;
    doodle.y += doodle.vy;

    // 4. Boundary bouncing: doodles stay nicely inside the grass area
    if (doodle.x < 10) {
      doodle.x = 10;
      doodle.vx = Math.abs(doodle.vx); // Bounce right
    } else if (doodle.x > canvasWidth - doodleWidth - 10) {
      doodle.x = canvasWidth - doodleWidth - 10;
      doodle.vx = -Math.abs(doodle.vx); // Bounce left
    }

    if (doodle.y < grassTop) {
      doodle.y = grassTop;
      doodle.vy = Math.abs(doodle.vy); // Bounce down
    } else if (doodle.y > grassBottom) {
      doodle.y = grassBottom;
      doodle.vy = -Math.abs(doodle.vy); // Bounce up
    }

    // Decrement coexistence cooldown
    if (doodle.coexistCooldown > 0) {
      doodle.coexistCooldown--;
    }

    // 5. Draw a soft pixel shadow under the doodle
    worldCtx.fillStyle = "rgba(0, 0, 0, 0.16)";
    worldCtx.fillRect(
      doodle.x + 4,
      doodle.y + doodleHeight - 2,
      doodleWidth - 8,
      4
    );

    // 6. Draw each pixel cell of the doodle's grid
    for (let row = 0; row < doodle.gridSize; row++) {
      for (let col = 0; col < doodle.gridSize; col++) {
        const cellColor = doodle.grid[row][col];
        if (cellColor !== null) {
          worldCtx.fillStyle = cellColor;
          worldCtx.fillRect(
            doodle.x + col * scale,
            doodle.y + bobY + row * scale,
            scale,
            scale
          );
        }
      }
    }

    // 7. Draw the doodle's cute name tag floating above its head
    worldCtx.font = "8px 'Press Start 2P', monospace";
    worldCtx.textAlign = "center";
    worldCtx.fillStyle = isNightMode ? "#ffeaa7" : "#2d3436";
    worldCtx.fillText(
      doodle.name,
      doodle.x + doodleWidth / 2,
      doodle.y + bobY - 6
    );

    // 8. If this doodle is currently selected, draw a glowing selection box and bouncy arrow!
    if (doodle.id === selectedDoodleId) {
      worldCtx.strokeStyle = "#ff758c";
      worldCtx.lineWidth = 2;
      worldCtx.strokeRect(
        doodle.x - 2,
        doodle.y + bobY - 2,
        doodleWidth + 4,
        doodleHeight + 4
      );

      // Cute indicator pointer
      worldCtx.fillStyle = "#ff758c";
      worldCtx.fillText(
        "▼",
        doodle.x + doodleWidth / 2,
        doodle.y + bobY - 18
      );
    }
  }
}

/**
 * Main World Animation Loop!
 * requestAnimationFrame is the standard, high-performance way to animate in web browsers:
 * - It runs right before the browser repaints the screen (~60 frames per second).
 * - It syncs smoothly with the monitor refresh rate so animations are silky smooth.
 * - It automatically pauses when the user switches tabs, saving computer CPU and battery!
 */
function worldAnimationLoop() {
  // Only render the active world when on the World tab (saves resources)
  if (activeTab === "world") {
    // 1. Draw the scenery (sky, grass, clouds, stars)
    drawWorldBackground();

    // 2. Move and draw all doodles
    if (doodles.length > 0) {
      updateAndDrawDoodles();
      checkCoexistence();
      updateAndDrawHearts();
    }
  }

  // Increment star twinkling time
  starTime++;

  // Request the next animation frame from the browser
  requestAnimationFrame(worldAnimationLoop);
}

/**
 * Toggles Day Mode and Night Mode in the World.
 */
function toggleDayNight() {
  isNightMode = !isNightMode;

  if (isNightMode) {
    dayNightBtn.textContent = "☀️ Day Mode";
    worldStatusText.textContent = "The night sky is peaceful";
    showToast("Night fell upon Tiny World... 🌙");
  } else {
    dayNightBtn.textContent = "🌙 Night Mode";
    worldStatusText.textContent = "Your world is peaceful";
    showToast("The morning sun is shining! ☀️");
  }
}

/**
 * Handles clicks/taps on the World Canvas to "pick up" (inspect) doodles.
 * @param {PointerEvent} event - The click or touch event on worldCanvas
 */
function handleWorldCanvasClick(event) {
  const rect = worldCanvas.getBoundingClientRect();
  const scaleX = worldCanvas.width / rect.width;
  const scaleY = worldCanvas.height / rect.height;

  const clickX = (event.clientX - rect.left) * scaleX;
  const clickY = (event.clientY - rect.top) * scaleY;

  // Search backwards so the topmost rendered doodle is picked first
  let clickedDoodle = null;
  for (let i = doodles.length - 1; i >= 0; i--) {
    const doodle = doodles[i];
    const scale = getDoodleScale(doodle);
    const doodleWidth = doodle.gridSize * scale;
    const doodleHeight = doodle.gridSize * scale;

    if (
      clickX >= doodle.x &&
      clickX <= doodle.x + doodleWidth &&
      clickY >= doodle.y &&
      clickY <= doodle.y + doodleHeight
    ) {
      clickedDoodle = doodle;
      break;
    }
  }

  if (clickedDoodle !== null) {
    // Select this doodle!
    selectedDoodleId = clickedDoodle.id;
    cardDoodleName.textContent = clickedDoodle.name;
    doodleCard.classList.remove("hidden");
    showToast("Picked up " + clickedDoodle.name + "! 👋");
  } else {
    // Clicked empty grassland: deselect
    selectedDoodleId = null;
    doodleCard.classList.add("hidden");
  }
}

/**
 * Removes the currently selected doodle from the world.
 */
function removeSelectedDoodle() {
  if (selectedDoodleId === null) {
    return;
  }

  const doodleToRemove = doodles.find(function (d) {
    return d.id === selectedDoodleId;
  });
  const name = doodleToRemove ? doodleToRemove.name : "Doodle";

  // Filter out the selected doodle
  doodles = doodles.filter(function (d) {
    return d.id !== selectedDoodleId;
  });

  // Save changes to localStorage
  saveDoodlesToLocalStorage();

  // Reset selection
  selectedDoodleId = null;
  doodleCard.classList.add("hidden");

  // Update badge count
  if (worldCountBadge) {
    worldCountBadge.textContent = doodles.length;
  }

  // If world is now empty, reveal empty state overlay
  if (doodles.length === 0 && worldEmptyState) {
    worldEmptyState.classList.remove("hidden");
  }

  showToast(name + " returned to the sketchbook! 📦");
}


/* ==========================================================================
   SECTION 7: LOCAL STORAGE
   Persistent storage so doodles survive page reloads and browser restarts.
   ========================================================================== */

const STORAGE_KEY = "tiny_world_doodles_gdsc";

/**
 * Saves all doodles into the browser's localStorage as a JSON string.
 */
function saveDoodlesToLocalStorage() {
  try {
    const dataString = JSON.stringify(doodles);
    localStorage.setItem(STORAGE_KEY, dataString);
  } catch (error) {
    console.warn("Could not save doodles to localStorage:", error);
  }
}

/**
 * Loads saved doodles from localStorage when the app starts.
 * Safely handles the case where nothing is saved yet.
 */
function loadDoodlesFromLocalStorage() {
  try {
    const dataString = localStorage.getItem(STORAGE_KEY);
    if (dataString) {
      const parsedDoodles = JSON.parse(dataString);
      if (Array.isArray(parsedDoodles)) {
        doodles = parsedDoodles;

        // Ensure every doodle has required animation state
        for (let i = 0; i < doodles.length; i++) {
          if (typeof doodles[i].bobPhase !== "number") {
            doodles[i].bobPhase = Math.random() * Math.PI * 2;
          }
          if (typeof doodles[i].wanderTimer !== "number") {
            doodles[i].wanderTimer = 0;
          }
          doodles[i].coexistCooldown = 0;
        }
      }
    }
  } catch (error) {
    console.warn("Could not load doodles from localStorage:", error);
    doodles = [];
  }

  // Update badge count
  if (worldCountBadge) {
    worldCountBadge.textContent = doodles.length;
  }

  // If doodles exist, hide the empty state card
  if (doodles.length > 0 && worldEmptyState) {
    worldEmptyState.classList.add("hidden");
  }
}

/**
 * Clears all doodles and resets the world after user confirmation.
 */
function resetWorld() {
  if (doodles.length === 0) {
    showToast("World is already empty! 🌱");
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to reset your world? All doodles will be removed!"
  );
  if (!confirmed) {
    return;
  }

  doodles = [];
  selectedDoodleId = null;
  doodleCard.classList.add("hidden");
  activeHearts = [];

  saveDoodlesToLocalStorage();

  if (worldCountBadge) {
    worldCountBadge.textContent = "0";
  }

  if (worldEmptyState) {
    worldEmptyState.classList.remove("hidden");
  }

  showToast("World has been reset! 🌱");
}


/* ==========================================================================
   INITIALIZATION & EVENT LISTENERS
   Run when the page finishes loading to set up event listeners and start.
   ========================================================================== */

/**
 * Sets up all click events, pointer listeners for drawing, loads storage,
 * and starts the 60fps world animation loop.
 */
function initApp() {
  // 1. Navigation tab listeners
  tabDrawBtn.addEventListener("click", function () {
    switchTab("draw");
  });

  tabWorldBtn.addEventListener("click", function () {
    switchTab("world");
  });

  if (emptyStateDrawBtn) {
    emptyStateDrawBtn.addEventListener("click", function () {
      switchTab("draw");
    });
  }

  // 2. Tool buttons listeners
  toolPencilBtn.addEventListener("click", function () {
    selectTool("pencil");
  });

  toolEraserBtn.addEventListener("click", function () {
    selectTool("eraser");
  });

  toolBucketBtn.addEventListener("click", function () {
    selectTool("bucket");
  });

  toolEyedropperBtn.addEventListener("click", function () {
    selectTool("eyedropper");
  });

  // 3. Top bar action buttons: Undo, Clear, Grid Size, Add to World
  undoBtn.addEventListener("click", function () {
    undoLastAction();
  });

  clearBtn.addEventListener("click", function () {
    clearGrid();
  });

  gridSizeSelect.addEventListener("change", function () {
    handleGridSizeChange();
  });

  addToWorldBtn.addEventListener("click", function () {
    addDoodleToWorld();
  });

  // 4. World Screen Action Listeners
  dayNightBtn.addEventListener("click", function () {
    toggleDayNight();
  });

  resetWorldBtn.addEventListener("click", function () {
    resetWorld();
  });

  worldCanvas.addEventListener("click", function (event) {
    handleWorldCanvasClick(event);
  });

  cardCloseBtn.addEventListener("click", function () {
    selectedDoodleId = null;
    doodleCard.classList.add("hidden");
  });

  removeDoodleBtn.addEventListener("click", function () {
    removeSelectedDoodle();
  });

  // 5. Native custom color picker input listener
  nativeColorInput.addEventListener("input", function (event) {
    currentColor = event.target.value;
    updateColorUI();

    if (currentTool === "eraser" || currentTool === "eyedropper") {
      selectTool("pencil");
    }
  });

  // 6. Pointer Events on the Drawing Canvas
  // Using pointerdown/pointermove/pointerup works with mouse, touchscreens, and pens!
  gridCanvas.addEventListener("pointerdown", function (event) {
    try {
      gridCanvas.setPointerCapture(event.pointerId);
    } catch (e) {
      // Ignore
    }

    const coords = getGridCoordinates(event);
    if (coords !== null) {
      // Save current state to history before making a new stroke or fill!
      // This ensures the entire stroke can be undone with one click.
      if (currentTool !== "eyedropper") {
        saveStateToHistory();
      }

      isDrawing = true;
      hoveredCell = coords;
      applyToolAction(coords.x, coords.y);
    }
  });

  gridCanvas.addEventListener("pointermove", function (event) {
    const coords = getGridCoordinates(event);

    if (coords !== null) {
      hoveredCell = coords;

      // Continuous painting while dragging (only for pencil and eraser)
      if (isDrawing && (currentTool === "pencil" || currentTool === "eraser")) {
        applyToolAction(coords.x, coords.y);
      } else {
        // Redraw to update hover highlight box
        drawGrid();
      }
    }
  });

  gridCanvas.addEventListener("pointerup", function (event) {
    isDrawing = false;
    try {
      gridCanvas.releasePointerCapture(event.pointerId);
    } catch (e) {
      // Ignore
    }
  });

  gridCanvas.addEventListener("pointerleave", function () {
    // When pointer leaves the canvas, clear the hover highlight
    if (!isDrawing) {
      hoveredCell = { x: -1, y: -1 };
      drawGrid();
    }
  });

  // 7. Build the initial 2D array and render everything
  initGridData();
  renderPaletteSwatches();
  drawGrid();
  updatePreview();

  // Load saved doodles from localStorage (if any exist)
  loadDoodlesFromLocalStorage();

  // Start on the Draw tab with Pencil selected
  switchTab("draw");
  selectTool("pencil");

  // Welcome message toast
  showToast("Welcome to Tiny World! 🎨");

  // Start the 60fps world animation loop!
  requestAnimationFrame(worldAnimationLoop);
}

// Start the app!
initApp();
