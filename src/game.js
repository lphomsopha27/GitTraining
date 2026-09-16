const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

window.gitState = {
    commits: [
        { id: "C0", parents: [], x: 80, y: 200 }
    ],
    branches: { "main": "C0" },
    head: "main",
    hasKey: false,
    gateUnlocked: false,
    won: false
};

const POSITIONS = {
    key: { x: 280, y: 100 },
    gateX: 340,
    exitX: 500
};

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const state = window.gitState;

    // 1. Draw Physical Tunnel Layout
    ctx.fillStyle = "#161b22";
    ctx.fillRect(40, 160, 520, 80);               // Main Corridor (y: 200)
    ctx.fillRect(140, 60, 200, 80);                // Side Tunnel (y: 100)
    
    // Angled Branch Connection Tunnel
    ctx.beginPath();
    ctx.lineWidth = 80;
    ctx.strokeStyle = "#161b22";
    ctx.moveTo(140, 200);
    ctx.lineTo(200, 100);
    ctx.stroke();

    // 2. Draw Key Node at (280, 100)
    if (!state.hasKey) {
        ctx.fillStyle = "#eac54f";
        ctx.beginPath();
        ctx.arc(POSITIONS.key.x, POSITIONS.key.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("🔑 KEY", POSITIONS.key.x, POSITIONS.key.y - 20);
    }

    // 3. Draw Gate at x: 340
    ctx.fillStyle = state.gateUnlocked ? "#2ea44f" : "#da3633";
    ctx.fillRect(POSITIONS.gateX - 6, 160, 12, 80);
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(state.gateUnlocked ? "OPEN" : "LOCKED GATE", POSITIONS.gateX, 145);

    // 4. Draw Exit Goal
    ctx.fillStyle = "#238636";
    ctx.fillRect(POSITIONS.exitX - 20, 180, 40, 40);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("EXIT 🏁", POSITIONS.exitX, 170);

    // 5. Draw Commit Branch Lines (Including Merges)
    state.commits.forEach(commit => {
        commit.parents.forEach(parentId => {
            const parent = state.commits.find(c => c.id === parentId);
            if (parent) {
                ctx.strokeStyle = "#58a6ff";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(parent.x, parent.y);
                ctx.lineTo(commit.x, commit.y);
                ctx.stroke();
            }
        });
    });

    // 6. Draw Commit Nodes
    state.commits.forEach(commit => {
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(commit.x - 14, commit.y - 14, 28, 28);
        ctx.strokeStyle = "#58a6ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(commit.x - 14, commit.y - 14, 28, 28);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(commit.id, commit.x, commit.y + 4);
    });

    // 7. Draw Branch Tags & Avatar Position
    Object.keys(state.branches).forEach((bName, i) => {
        const commit = state.commits.find(c => c.id === state.branches[bName]);
        if (!commit) return;

        const isHead = (bName === state.head);
        ctx.fillStyle = isHead ? "#238636" : "#30363d";
        ctx.fillRect(commit.x - 25, commit.y + 18 + (i * 16), 50, 14);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.fillText(bName, commit.x, commit.y + 28 + (i * 16));

        // Draw Player on HEAD Commit
        if (isHead) {
            ctx.fillStyle = "#58a6ff";
            ctx.beginPath();
            ctx.arc(commit.x, commit.y - 22, 9, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // 8. Victory Screen Overlay
    if (state.won) {
        ctx.fillStyle = "rgba(13, 17, 23, 0.92)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#3fb950";
        ctx.font = "bold 22px monospace";
        ctx.fillText("🎉 MAZE ESCAPED! 🎉", canvas.width / 2, 130);
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px monospace";
        ctx.fillText("You branched to get the key, merged to main, and unlocked the gate!", canvas.width / 2, 170);
    }
}

function gameLoop() {
    drawMaze();
    requestAnimationFrame(gameLoop);
}
gameLoop();