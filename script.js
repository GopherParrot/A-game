// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// --- Object Image Links ---
let emptyBed = 'https://i.ibb.co/Y4Kg8rgF/Drawing-2.png';
let occupiedBed = 'https://i.ibb.co/SDtnXg1p/Drawing-2-2.png';

// --- Placed Objects ---
const placedObjects = []; // Array to store objects {x, y, image, collisionWidth, collisionHeight}

// --- Game Constants ---
const TARGET_FPS = 60;
const MS_PER_FRAME = 1000 / TARGET_FPS;
let lastFrameTime = 0;

// Map dimensions and tile size
const TILE_SIZE = 64; // Increased from 32 to 64 (2x)
const NUM_ROWS = 21;
const NUM_COLS = 38;
const MAP_WIDTH = NUM_COLS * TILE_SIZE; // Total width of the entire map
const MAP_HEIGHT = NUM_ROWS * TILE_SIZE; // Total height of the entire map

// Tile types
const TILE_WALL = 0;
const TILE_CARPET = 1;

let parsedMap = []; // This will hold the 2D array representation of the map

// --- Tile Images ---
const tileImages = {
    [TILE_WALL]: null,
    [TILE_CARPET]: null
};
let tileImagesLoadedCount = 0;
const totalTileImagesToLoad = 2; // wall and carpet tiles

// --- Player Object ---
const player = {
    x: 0,
    y: 0,
    width: 96,
    height: 90, // original 64
    collisionWidth: 24, // 48
    collisionHeight: 50, // 64
    offsetX: (96 - 25) / 2, // (96-48)/2
    offsetY: (90 - 60), // (64-64)
    speed: 5,
    direction: 'idle',
    images: { 
        idle: 'https://i.ibb.co/hJ1YZG4m/Drawing-1-1.png',
        right1: 'https://i.ibb.co/N2kxy9ZC/Drawing-1-5.png',
        right2: 'https://i.ibb.co/hR7c02FN/Drawing-1-4.png',
        left1: 'https://i.ibb.co/LDn7xxF6/Drawing-1-3.png',
        left2: 'https://i.ibb.co/1YpfD5th/Drawing-1-2.png'
    },
    currentImage: null,
    imageLoadedCount: 0,
    totalImagesToLoad: 0,
    spriteCounter: 0,
    spriteNum: 1,
    animationFrameRate: 15
};

// --- Dialogue Object ---
const dialogue = {
    active: false,
    pages: [
        "Hello, welcome to the game!",
        "This game is still a demo, so there might still have some bugs. Anyways, Enjoy!"
    ],
    currentPage: 0,
    currentText: "",
    textIndex: 0,
    charsPerSecond: 20,
    msPerChar: 1000 / 20,
    lastCharTime: 0,
    startDelay: 500,
    showTime: 0,
    fontLoaded: false,
    nextButtonImage: null,
    nextButtonLoaded: false,
    nextButtonSize: 32,
    nextButtonX: 0,
    nextButtonY: 0,
    wrappedLines: [],
    isConversation: false, // Flag for conversation vs. intro dialogue
    conversation: null, // Current conversation object
    convoIndex: 0, // Index of current conversation line
    speaker: null // Current speaker ('player' or 'old')
};

// --- Camera Object ---
const camera = {
    x: 0,
    y: 0
};

// --- Conversation Image Links ---
let playerImage = 'https://i.ibb.co/hR3sK32B/Drawing-3.png'; // Replace with your player dialogue image URL
let oldImage = 'https://i.ibb.co/CCMxh09/Drawing-3-2.png'; // Replace with your old programmer image URL

// --- Conversations ---
const conversations = [
    {
        player: "Hi!",
        old: "Hello young programmer!"
    }
];

// --- Interaction Button ---
const interactionButton = {
    image: null,
    loaded: false,
    size: 32,
    x: 0,
    y: 0,
    visible: false,
    activeObject: null // Object the player is colliding with
};

// Function to load tile images and other assets
function loadAssets(callback) {
    const tileImageURLs = {
        [TILE_WALL]: 'https://i.ibb.co/zVZrDvq1/Drawing-5.png',    // Placeholder for wall tile
        [TILE_CARPET]: 'https://i.ibb.co/dsRNRLWy/Drawing-4.png' // Placeholder for carpet tile
    };
    const nextButtonURL = 'https://i.ibb.co/MknPpxq0/Drawing-6.png'; // Placeholder for next button
    const interactionButtonURL = 'https://placehold.co/32x32/FFFF00/000000?text=!'; // Placeholder for interaction button
    const conversationImageURLs = {
        player: playerImage,
        old: oldImage
    };

    let assetsLoadedCount = 0;
    const totalAssetsToLoad = totalTileImagesToLoad + 1 + 2; // Tiles + next button + interaction button + 2 convo images

    // Load tile images
    for (const type in tileImageURLs) {
        const img = new Image();
        img.src = tileImageURLs[type];
        img.onload = () => {
            tileImages[type] = img;
            tileImagesLoadedCount++;
            console.log(`Loaded tile image for type ${type}: ${tileImageURLs[type]}`);
            if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded && interactionButton.loaded && conversationImages.player && conversationImages.old) {
                //console.log("All assets loaded.");
                callback();
            }
        };
        img.onerror = () => {
            //console.error(`Failed to load tile image for type ${type}: ${tileImageURLs[type]}`);
            tileImages[type] = null;
            tileImagesLoadedCount++;
            if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded && interactionButton.loaded && conversationImages.player && conversationImages.old) {
                //console.log("All assets loaded (with errors).");
                callback();
            }
        };
    }

    // Load next button image
    dialogue.nextButtonImage = new Image();
    dialogue.nextButtonImage.src = nextButtonURL;
    dialogue.nextButtonImage.onload = () => {
        dialogue.nextButtonLoaded = true;
        assetsLoadedCount++;
        //console.log(`Loaded next button image: ${nextButtonURL}`);
        if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded && interactionButton.loaded && conversationImages.player && conversationImages.old) {
            //console.log("All assets loaded.");
            callback();
        }
    };
    dialogue.nextButtonImage.onerror = () => {
        //console.warn(`Failed to load next button image: ${nextButtonURL}. Using fallback.`);
        dialogue.nextButtonLoaded = true;
        assetsLoadedCount++;
        if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded && interactionButton.loaded && conversationImages.player && conversationImages.old) {
            //console.log("All assets loaded (with errors).");
            callback();
        }
    };

    // Load interaction button image
    interactionButton.image = new Image();
    interactionButton.image.src = interactionButtonURL;
    interactionButton.image.onload = () => {
        interactionButton.loaded = true;
        assetsLoadedCount++;
        //console.log(`Loaded interaction button image: ${interactionButtonURL}`);
        if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded && interactionButton.loaded && conversationImages.player && conversationImages.old) {
            //console.log("All assets loaded.");
            callback();
        }
    };
    interactionButton.image.onerror = () => {
        //console.warn(`Failed to load interaction button image: ${interactionButtonURL}. Using fallback.`);
        interactionButton.loaded = true;
        assetsLoadedCount++;
        if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded && interactionButton.loaded && conversationImages.player && conversationImages.old) {
            //console.log("All assets loaded (with errors).");
            callback();
        }
    };

    // Load conversation images
    const conversationImages = {};
    for (const type in conversationImageURLs) {
        const img = new Image();
        img.src = conversationImageURLs[type];
        img.onload = () => {
            conversationImages[type] = img;
            assetsLoadedCount++;
            //console.log(`Loaded conversation image for ${type}: ${conversationImageURLs[type]}`);
            if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded && interactionButton.loaded && conversationImages.player && conversationImages.old) {
                //console.log("All assets loaded.");
                callback();
            }
        };
        img.onerror = () => {
            //console.error(`Failed to load conversation image for ${type}: ${conversationImageURLs[type]}`);
            conversationImages[type] = null;
            assetsLoadedCount++;
            if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded && interactionButton.loaded && conversationImages.player && conversationImages.old) {
               // console.log("All assets loaded (with errors).");
                callback();
            }
        };
    }

    // Skip font loading
    dialogue.fontLoaded = false;
    //console.log("Skipping font loading, using Arial fallback.");
}

// --- Dialogue Input Handling ---
canvas.addEventListener('click', handleDialogueClick);

function handleDialogueClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check interaction button click
    if (interactionButton.visible && !dialogue.active) {
        const buttonScreenX = interactionButton.x - camera.x;
        const buttonScreenY = interactionButton.y - camera.y;
        if (clickX >= buttonScreenX &&
            clickX <= buttonScreenX + interactionButton.size &&
            clickY >= buttonScreenY &&
            clickY <= buttonScreenY + interactionButton.size) {
            // Start random conversation
            const randomConvo = conversations[Math.floor(Math.random() * conversations.length)];
            dialogue.conversation = randomConvo;
            dialogue.convoIndex = 0;
            dialogue.pages = [randomConvo.player, randomConvo.old];
            dialogue.speaker = 'player';
            dialogue.isConversation = true;
            dialogue.active = true;
            dialogue.showTime = performance.now();
            dialogue.currentPage = 0;
            dialogue.currentText = "";
            dialogue.textIndex = 0;
            dialogue.lastCharTime = 0;
            return;
        }
    }

    // Handle dialogue clicks
    if (!dialogue.active || dialogue.currentPage >= dialogue.pages.length) return;

    if (dialogue.textIndex < dialogue.pages[dialogue.currentPage].length) {
        dialogue.currentText = dialogue.pages[dialogue.currentPage];
        dialogue.textIndex = dialogue.currentText.length;
        const boxWidth = canvas.width * 0.75;
        const textWidth = boxWidth - 40 - (dialogue.isConversation ? 64 + 10 : 0);
        dialogue.wrappedLines = wrapText(ctx, dialogue.currentText, textWidth);
        return;
    }

    if (clickX >= dialogue.nextButtonX &&
        clickX <= dialogue.nextButtonX + dialogue.nextButtonSize &&
        clickY >= dialogue.nextButtonY &&
        clickY <= dialogue.nextButtonY + dialogue.nextButtonSize) {
        dialogue.currentPage++;
        if (dialogue.isConversation && dialogue.currentPage < dialogue.pages.length) {
            dialogue.speaker = dialogue.currentPage === 0 ? 'player' : 'old';
        }
        if (dialogue.currentPage < dialogue.pages.length) {
            dialogue.currentText = "";
            dialogue.textIndex = 0;
            dialogue.showTime = performance.now();
        } else {
            dialogue.active = false;
            dialogue.isConversation = false;
            dialogue.conversation = null;
            dialogue.speaker = null;
        }
    }
}

placing(12, 16, emptyBed, 96, 96);

// Function to place an object at tile coordinates (x, y) with an image URL and size
function placing(tileX, tileY, imageURL, width = TILE_SIZE, height = TILE_SIZE) {
    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
        //console.log(`Loaded object image: ${imageURL} at tile (${tileX}, ${tileY}) with size ${width}x${height}`);
        placedObjects.push({
            x: tileX * TILE_SIZE, // Pixel position (top-left of tile)
            y: tileY * TILE_SIZE,
            image: img,
            width: width, // Rendering width
            height: height, // Rendering height
            collisionWidth: 30, // Fixed 10x10 hitbox (or use width/2, height/2 for proportional)
            collisionHeight: 30,
            collisionX: tileX * TILE_SIZE + (TILE_SIZE - 10) / 2, // Center hitbox
            collisionY: tileY * TILE_SIZE + (TILE_SIZE - 10) / 2
        });
    };
    img.onerror = () => {
       // console.error(`Failed to load object image: ${imageURL}`);
    };
}

// --- Joystick Elements ---
const joystickBase = document.getElementById('joystickBase');
const joystickHandle = document.getElementById('joystickHandle');

// --- Joystick State ---
const joystick = {
    handleX: 0,
    handleY: 0,
    maxDistance: 40, // Max distance handle can move from base
    active: false
};

// --- Dialogue Input Handling ---
canvas.addEventListener('click', handleDialogueClick);

function handleDialogueClick(event) {
    if (!dialogue.active || dialogue.currentPage >= dialogue.pages.length) return;

    // Check if text is fully displayed
    if (dialogue.textIndex < dialogue.pages[dialogue.currentPage].length) {
        // Skip typing animation
        dialogue.currentText = dialogue.pages[dialogue.currentPage];
        dialogue.textIndex = dialogue.currentText.length;
        return;
    }

    // Get click coordinates
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if click is within next button bounds
    if (dialogue.nextButtonLoaded &&
        clickX >= dialogue.nextButtonX &&
        clickX <= dialogue.nextButtonX + dialogue.nextButtonSize &&
        clickY >= dialogue.nextButtonY &&
        clickY <= dialogue.nextButtonY + dialogue.nextButtonSize) {
        dialogue.currentPage++;
        if (dialogue.currentPage < dialogue.pages.length) {
            // Start next page
            dialogue.currentText = "";
            dialogue.textIndex = 0;
            dialogue.showTime = performance.now();
        } else {
            // End dialogue
            dialogue.active = false;
        }
    }
}

// --- Canvas Resizing (to fit viewport, for camera effect) ---
// The canvas size now represents the "viewport" or screen size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // When resizing the window (and thus the canvas), re-center the camera
    centerCameraOnPlayer();
}
resizeCanvas(); // Set initial canvas size to window dimensions
window.addEventListener('resize', resizeCanvas); // Adjust canvas on window resize

// --- Camera Centering Function ---
function centerCameraOnPlayer() {
    // Calculate desired camera position to center player
    camera.x = player.x + (player.width / 2) - (canvas.width / 2);
    camera.y = player.y + (player.height / 2) - (canvas.height / 2);

    // Clamp camera within map boundaries (don't show outside the map)
    camera.x = Math.max(0, Math.min(MAP_WIDTH - canvas.width, camera.x));
    camera.y = Math.max(0, Math.min(MAP_HEIGHT - canvas.height, camera.y));
    
    // Handle cases where the map is smaller than the viewport
    if (MAP_WIDTH < canvas.width) {
        camera.x = (MAP_WIDTH - canvas.width) / 2; // Center map if it's narrower than screen
    }
    if (MAP_HEIGHT < canvas.height) {
        camera.y = (MAP_HEIGHT - canvas.height) / 2; // Center map if it's shorter than screen
    }
}


// --- Functions to parse map and load assets ---

// Function to parse the map string into a 2D array
function parseMap(mapText) {
    const lines = mapText.trim().split('\n').filter(line => line.length > 0); 
    parsedMap = lines.map(line => line.split('').map(char => parseInt(char, 10)));

    if (parsedMap.length !== NUM_ROWS) {
        //console.warn(`Map has ${parsedMap.length} rows, expected ${NUM_ROWS}.`);
    }
    if (parsedMap[0] && parsedMap[0].length !== NUM_COLS) {
        //console.warn(`Map has ${parsedMap[0].length} columns, expected ${NUM_COLS}.`);
    }
}

// Function to load player images
function loadPlayerImages(callback) {
    const imageURLs = player.images;

    player.totalImagesToLoad = Object.keys(imageURLs).length;
    if (player.totalImagesToLoad === 0) {
        callback(); // No images to load, proceed
        return;
    }

    for (const key in imageURLs) {
        const img = new Image();
        img.src = imageURLs[key];
        img.onload = () => {
            player.images[key] = img;
            player.imageLoadedCount++;
            if (player.imageLoadedCount === player.totalImagesToLoad) {
                player.currentImage = player.images.idle; // Set initial image
                callback(); // All player images loaded
            }
        };
        img.onerror = () => {
            //console.error(`Failed to load player image for ${key}: ${imageURLs[key]}`);
            player.images[key] = null; // Mark as failed
            player.imageLoadedCount++;
            if (player.imageLoadedCount === player.totalImagesToLoad) {
                callback();
            }
        };
    }
}
/*
// Function to load tile images and other assets
function loadAssets(callback) {
    const tileImageURLs = {
        [TILE_WALL]: 'https://i.ibb.co/zVZrDvq1/Drawing-5.png',    // Placeholder for wall tile
        [TILE_CARPET]: 'https://i.ibb.co/dsRNRLWy/Drawing-4.png' // Placeholder for carpet tile
    };
    const nextButtonURL = 'https://i.ibb.co/MknPpxq0/Drawing-6.png'; // Placeholder for next button

    let assetsLoadedCount = 0;
    const totalAssetsToLoad = totalTileImagesToLoad + 1; // Tiles + next button

    // Load tile images
    for (const type in tileImageURLs) {
        const img = new Image();
        img.src = tileImageURLs[type];
        img.onload = () => {
            tileImages[type] = img;
            tileImagesLoadedCount++;
            //console.log(`Loaded tile image for type ${type}: ${tileImageURLs[type]}`);
            if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded) {
               // console.log("All tile images and next button loaded.");
                callback();
            }
        };
        img.onerror = () => {
            //console.error(`Failed to load tile image for type ${type}: ${tileImageURLs[type]}`);
            tileImages[type] = null; // Mark as failed
            tileImagesLoadedCount++;
            if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded) {
               // console.log("All tile images and next button loaded (with errors).");
                callback();
            }
        };
    }

    // Load next button image
    dialogue.nextButtonImage = new Image();
    dialogue.nextButtonImage.src = nextButtonURL;
    dialogue.nextButtonImage.onload = () => {
        dialogue.nextButtonLoaded = true;
        assetsLoadedCount++;
        //console.log(`Loaded next button image: ${nextButtonURL}`);
        if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded) {
            //console.log("All tile images and next button loaded.");
            callback();
        }
    };
    dialogue.nextButtonImage.onerror = () => {
        //console.warn(`Failed to load next button image: ${nextButtonURL}. Using fallback.`);
        dialogue.nextButtonLoaded = true;
        assetsLoadedCount++;
        if (tileImagesLoadedCount === totalTileImagesToLoad && dialogue.nextButtonLoaded) {
          //  console.log("All tile images and next button loaded (with errors).");
            callback();
        }
    };

    // Skip font loading for now (use Arial fallback)
    dialogue.fontLoaded = false;
   // console.log("Skipping font loading, using Arial fallback.");
}*/

// Function to wrap text within a maximum width
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width < maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
}

// --- Collision Detection ---
// AABB (Axis-Aligned Bounding Box) collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// --- Joystick Event Handlers ---
joystickHandle.addEventListener('mousedown', startJoystick);
joystickHandle.addEventListener('touchstart', startJoystick);
document.addEventListener('mousemove', moveJoystick);
document.addEventListener('touchmove', moveJoystick);
document.addEventListener('mouseup', stopJoystick);
document.addEventListener('touchend', stopJoystick);

function startJoystick(e) {
    e.preventDefault();
    joystick.active = true;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = joystickBase.getBoundingClientRect();
    const baseCenterX = rect.left + rect.width / 2;
    const baseCenterY = rect.top + rect.height / 2;
    
    joystick.handleX = clientX - baseCenterX;
    joystick.handleY = clientY - baseCenterY;
    
    limitJoystickHandle();
    updateJoystickPosition();
}

function moveJoystick(e) {
    if (!joystick.active) return;
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const rect = joystickBase.getBoundingClientRect();
    const baseCenterX = rect.left + rect.width / 2;
    const baseCenterY = rect.top + rect.height / 2;
    
    joystick.handleX = clientX - baseCenterX;
    joystick.handleY = clientY - baseCenterY;
    
    limitJoystickHandle();
    updateJoystickPosition();
}

function stopJoystick() {
    joystick.active = false;
    joystick.handleX = 0;
    joystick.handleY = 0;
    player.direction = 'idle'; 
    player.currentImage = player.images.idle; 
    player.spriteNum = 1;
    player.spriteCounter = 0;
    updateJoystickPosition();
}

function limitJoystickHandle() {
    const distance = Math.sqrt(joystick.handleX * joystick.handleX + joystick.handleY * joystick.handleY);
    if (distance > joystick.maxDistance) {
        const ratio = joystick.maxDistance / distance;
        joystick.handleX *= ratio;
        joystick.handleY *= ratio;
    }
}

function updateJoystickPosition() {
    joystickHandle.style.transform = `translate(${joystick.handleX}px, ${joystick.handleY}px)`;
}

// --- Game Logic Update ---
function updateGame(currentTime) {
    player.spriteCounter++;
    if (player.spriteCounter >= player.animationFrameRate) {
        player.spriteNum = player.spriteNum === 1 ? 2 : 1;
        player.spriteCounter = 0;
    }

    let deltaX = 0;
    let deltaY = 0;

    if (joystick.active) {
        const directionX = joystick.handleX / joystick.maxDistance;
        const directionY = joystick.handleY / joystick.maxDistance;
        deltaX = directionX * player.speed;
        deltaY = directionY * player.speed;

        const movementThreshold = 0.1;
        if (directionX > movementThreshold) {
            player.direction = `right${player.spriteNum}`;
        } else if (directionX < -movementThreshold) {
            player.direction = `left${player.spriteNum}`;
        } else {
            player.direction = 'idle';
        }
        player.currentImage = player.images[player.direction] || player.images.idle;
    } else {
        player.direction = 'idle';
        player.currentImage = player.images.idle;
        player.spriteNum = 1;
        player.spriteCounter = 0;
    }

    let proposedPlayerX = player.x + deltaX;
    let proposedPlayerY = player.y + deltaY;

    // --- Collision Detection (X-axis) ---
    let playerCollisionRectX = {
        x: proposedPlayerX + player.offsetX,
        y: player.y + player.offsetY,
        width: player.collisionWidth,
        height: player.collisionHeight
    };

    let startColX = Math.max(0, Math.floor(playerCollisionRectX.x / TILE_SIZE));
    let endColX = Math.min(NUM_COLS, Math.ceil((playerCollisionRectX.x + playerCollisionRectX.width) / TILE_SIZE));
    let startRowX = Math.max(0, Math.floor(playerCollisionRectX.y / TILE_SIZE));
    let endRowX = Math.min(NUM_ROWS, Math.ceil((playerCollisionRectX.y + playerCollisionRectX.height) / TILE_SIZE));

    let collidedOnX = false;
    // Check walls
    for (let r = startRowX; r < endRowX && !collidedOnX; r++) {
        for (let c = startColX; c < endColX; c++) {
            if (parsedMap[r] && parsedMap[r][c] === TILE_WALL) {
                const wallRect = {
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                };
                if (checkCollision(playerCollisionRectX, wallRect)) {
                    if (deltaX > 0) {
                        proposedPlayerX = wallRect.x - player.collisionWidth - player.offsetX;
                    } else if (deltaX < 0) {
                        proposedPlayerX = wallRect.x + wallRect.width - player.offsetX;
                    }
                    collidedOnX = true;
                    break;
                }
            }
        }
    }
    // Check placed objects
    for (let obj of placedObjects) {
        const objRect = {
            x: obj.collisionX,
            y: obj.collisionY,
            width: obj.collisionWidth,
            height: obj.collisionHeight
        };
        if (checkCollision(playerCollisionRectX, objRect)) {
            if (deltaX > 0) {
                proposedPlayerX = objRect.x - player.collisionWidth - player.offsetX;
            } else if (deltaX < 0) {
                proposedPlayerX = objRect.x + objRect.width - player.offsetX;
            }
            collidedOnX = true;
            break;
        }
    }

    // --- Collision Detection (Y-axis) ---
    let playerCollisionRectY = {
        x: proposedPlayerX + player.offsetX,
        y: proposedPlayerY + player.offsetY,
        width: player.collisionWidth,
        height: player.collisionHeight
    };

    let startColY = Math.max(0, Math.floor(playerCollisionRectY.x / TILE_SIZE));
    let endColY = Math.min(NUM_COLS, Math.ceil((playerCollisionRectY.x + playerCollisionRectY.width) / TILE_SIZE));
    let startRowY = Math.max(0, Math.floor(playerCollisionRectY.y / TILE_SIZE));
    let endRowY = Math.min(NUM_ROWS, Math.ceil((playerCollisionRectY.y + playerCollisionRectY.height) / TILE_SIZE));

    let collidedOnY = false;
    // Check walls
    for (let r = startRowY; r < endRowY && !collidedOnY; r++) {
        for (let c = startColY; c < endColY; c++) {
            if (parsedMap[r] && parsedMap[r][c] === TILE_WALL) {
                const wallRect = {
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                };
                if (checkCollision(playerCollisionRectY, wallRect)) {
                    if (deltaY > 0) {
                        proposedPlayerY = wallRect.y - player.collisionHeight - player.offsetY;
                    } else if (deltaY < 0) {
                        proposedPlayerY = wallRect.y + wallRect.height - player.offsetY;
                    }
                    collidedOnY = true;
                    break;
                }
            }
        }
    }
    // Check placed objects
    for (let obj of placedObjects) {
        const objRect = {
            x: obj.collisionX,
            y: obj.collisionY,
            width: obj.collisionWidth,
            height: obj.collisionHeight
        };
        if (checkCollision(playerCollisionRectY, objRect)) {
            if (deltaY > 0) {
                proposedPlayerY = objRect.y - player.collisionHeight - player.offsetY;
            } else if (deltaY < 0) {
                proposedPlayerY = objRect.y + objRect.height - player.offsetY;
            }
            collidedOnY = true;
            break;
        }
    }

    // --- Interaction Button Collision Check (using current position) ---
    interactionButton.visible = false;
    const playerCurrentRect = {
        x: proposedPlayerX + player.offsetX,
        y: proposedPlayerY + player.offsetY,
        width: player.collisionWidth,
        height: player.collisionHeight
    };
    for (let obj of placedObjects) {
        const objRect = {
            x: obj.collisionX,
            y: obj.collisionY,
            width: obj.collisionWidth,
            height: obj.collisionHeight
        };
        if (checkCollision(playerCurrentRect, objRect)) {
            interactionButton.visible = true;
            interactionButton.activeObject = obj;
            interactionButton.x = obj.x + (obj.width - interactionButton.size) / 2;
            interactionButton.y = obj.y - interactionButton.size - 10; // 10px above object
            break;
        }
    }

    player.x = proposedPlayerX;
    player.y = proposedPlayerY;

    player.x = Math.max(0, Math.min(MAP_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(MAP_HEIGHT - player.height, player.y));

    // --- Update Dialogue ---
    if (dialogue.active && dialogue.currentPage < dialogue.pages.length) {
        const elapsed = currentTime - dialogue.showTime;
        if (elapsed >= dialogue.startDelay) {
            const typingTime = currentTime - dialogue.showTime - dialogue.startDelay;
            const charsToShow = Math.floor(typingTime / dialogue.msPerChar);
            if (charsToShow > dialogue.textIndex) {
                dialogue.textIndex = Math.min(charsToShow, dialogue.pages[dialogue.currentPage].length);
                dialogue.currentText = dialogue.pages[dialogue.currentPage].slice(0, dialogue.textIndex);
                ctx.font = dialogue.fontLoaded ? '20px "Press Start 2P"' : '20px Arial';
                const boxWidth = canvas.width * 0.75;
                const textWidth = boxWidth - 40 - (dialogue.isConversation ? 64 + 10 : 0);
                dialogue.wrappedLines = wrapText(ctx, dialogue.currentText, textWidth);
            }
        }
    }

    centerCameraOnPlayer();
}

// --- Game Drawing ---
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (tileImagesLoadedCount === totalTileImagesToLoad && parsedMap.length > 0) {
        const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
        const endCol = Math.min(NUM_COLS, Math.ceil((camera.x + canvas.width) / TILE_SIZE));
        const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
        const endRow = Math.min(NUM_ROWS, Math.ceil((camera.y + canvas.height) / TILE_SIZE));

        //console.log(`Drawing tiles: rows ${startRow} to ${endRow}, cols ${startCol} to ${endCol}`);
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                if (r >= 0 && r < NUM_ROWS && c >= 0 && c < NUM_COLS) {
                    const tileType = parsedMap[r][c];
                    const tileImg = tileImages[tileType];
                    if (tileImg) {
                        ctx.drawImage(tileImg, c * TILE_SIZE - camera.x, r * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
                    } else {
                        ctx.fillStyle = tileType === TILE_WALL ? '#444' : '#66B044';
                        ctx.fillRect(c * TILE_SIZE - camera.x, r * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
                        //console.warn(`No image for tile type ${tileType} at row ${r}, col ${c}, using fallback color.`);
                    }
                }
            }
        }
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading Map Tiles...', canvas.width / 2, canvas.height / 2);
        //console.warn(`Tiles not loaded: tileImagesLoadedCount=${tileImagesLoadedCount}, parsedMap.length=${parsedMap.length}`);
    }

    // --- Draw Placed Objects ---
    for (let obj of placedObjects) {
        if (obj.image) {
            ctx.drawImage(obj.image, obj.x - camera.x, obj.y - camera.y, obj.width, obj.height);
        } else {
            ctx.fillStyle = 'purple';
            ctx.fillRect(obj.x - camera.x, obj.y - camera.y, obj.width, obj.height);
            //console.warn(`No image for object at (${obj.x}, ${obj.y}), using fallback color.`);
        }
    }

    // --- Draw Interaction Button ---
    if (interactionButton.visible) {
        if (interactionButton.loaded && interactionButton.image) {
            ctx.drawImage(interactionButton.image, interactionButton.x - camera.x, interactionButton.y - camera.y, interactionButton.size, interactionButton.size);
        } else {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(interactionButton.x - camera.x, interactionButton.y - camera.y, interactionButton.size, interactionButton.size);
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('!', interactionButton.x - camera.x + interactionButton.size / 2, interactionButton.y - camera.y + interactionButton.size / 2 + 5);
        }
    }

    // --- Draw Player ---
    if (player.currentImage && player.imageLoadedCount === player.totalImagesToLoad) {
        ctx.drawImage(player.currentImage, player.x - camera.x, player.y - camera.y, player.width, player.height);
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('P Loading...', player.x + player.width / 2 - camera.x, player.y + player.height / 2 - camera.y);
    }

    // --- Draw Dialogue Box ---
    if (dialogue.active && dialogue.currentPage < dialogue.pages.length) {
        const boxWidth = canvas.width * 0.75;
        const lineHeight = 30;
        const padding = 20;
        const imageWidth = dialogue.isConversation ? 64 : 0;
        const textWidth = boxWidth - padding * 2 - imageWidth - (dialogue.isConversation ? 10 : 0);
        const boxHeight = Math.max(120, dialogue.wrappedLines.length * lineHeight + padding * 2);
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = (canvas.height - boxHeight) / 2;

        ctx.fillStyle = '#8B4513';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        if (dialogue.isConversation && dialogue.speaker && conversationImages[dialogue.speaker]) {
            ctx.drawImage(conversationImages[dialogue.speaker], boxX + padding, boxY + padding, 64, 64);
        }

        ctx.fillStyle = 'white';
        ctx.font = dialogue.fontLoaded ? '20px "Press Start 2P"' : '20px Arial';
        ctx.textAlign = 'left';
        const textX = boxX + padding + imageWidth + (dialogue.isConversation ? 10 : 0);
        const textY = boxY + padding + 20;
        dialogue.wrappedLines.forEach((line, index) => {
            ctx.fillText(line, textX, textY + index * lineHeight);
        });

        if (dialogue.textIndex >= dialogue.pages[dialogue.currentPage].length) {
            dialogue.nextButtonX = boxX + boxWidth - dialogue.nextButtonSize - padding;
            dialogue.nextButtonY = boxY + boxHeight - dialogue.nextButtonSize - padding;
            if (dialogue.nextButtonLoaded && dialogue.nextButtonImage) {
                ctx.drawImage(dialogue.nextButtonImage, dialogue.nextButtonX, dialogue.nextButtonY, dialogue.nextButtonSize, dialogue.nextButtonSize);
            } else {
                ctx.fillStyle = 'gray';
                ctx.fillRect(dialogue.nextButtonX, dialogue.nextButtonY, dialogue.nextButtonSize, dialogue.nextButtonSize);
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('>', dialogue.nextButtonX + dialogue.nextButtonSize / 2, dialogue.nextButtonY + dialogue.nextButtonSize / 2 + 5);
            }
        }
    }
}

// --- Main Game Loop ---
function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= MS_PER_FRAME) {
        lastFrameTime = currentTime - (deltaTime % MS_PER_FRAME);

        updateGame(currentTime); // Pass currentTime
        drawGame();
    }
}

// --- Start the Game ---
async function startGame() {
    try {
        const response = await fetch('map.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const mapText = await response.text();
        parseMap(mapText);
        //console.log("Parsed map:", parsedMap);
    } catch (error) {
        //console.error("Error loading map.txt:", error);
        ctx.fillStyle = 'red';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Failed to load map.txt! Check console for errors.', canvas.width / 2, canvas.height / 2);
        return;
    }

    const playerImagesPromise = new Promise(resolve => loadPlayerImages(resolve));
    const assetsPromise = new Promise(resolve => loadAssets(resolve));

    Promise.all([playerImagesPromise, assetsPromise]).then(() => {
        console.log("All assets finished loading.");

        // Set initial player position
        player.x = (NUM_COLS / 2) * TILE_SIZE - (player.width / 2);
        player.y = (NUM_ROWS / 2) * TILE_SIZE - (player.height / 2);

        centerCameraOnPlayer();

        // Start dialogue after 1 second
        setTimeout(() => {
            //console.log("Triggering dialogue display.");
            dialogue.active = true;
            dialogue.showTime = performance.now();
            dialogue.currentPage = 0;
            dialogue.currentText = "";
            dialogue.textIndex = 0;
            dialogue.lastCharTime = 0;
        }, 1000);

        requestAnimationFrame(gameLoop);
    }).catch(error => {
        //console.error("Error loading assets:", error);
        ctx.fillStyle = 'red';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading game assets! Check console for errors.', canvas.width / 2, canvas.height / 2 + 30);
    });
}

// Start the entire loading and game process
startGame();

