const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game State
const gameState = {
    hero: { x: 50, y: 50, color: "#00ffcc", speed: 5 },
    goal: { x: 500, y: 300, color: "#ffcc00" }
};

function update() {
    // Level 3 Objective: Students will write keyboard controls here on their feature branch!
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Goal
    ctx.fillStyle = gameState.goal.color;
    ctx.fillRect(gameState.goal.x, gameState.goal.y, 40, 40);

    // Draw Hero
    ctx.fillStyle = gameState.hero.color;
    ctx.fillRect(gameState.hero.x, gameState.hero.y, 30, 30);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px monospace";
    ctx.fillText("Reach the gold box to finish the level!", 20, 30);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function checkLevelComplete() {
  if (player.reachedGoal) {
    // Trigger badge download
    downloadBadge("Alex", "Level 1: The First Clone", "7f8a9b0");
  }
}

gameLoop();