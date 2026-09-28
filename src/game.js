const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

window.adminUnlocked = false;
window.showCoordinates = false;
window.currentLevelKey = "Sandbox";

// Helper to retrieve active level object dynamically
function getActiveLevelObj(key) {
    if (key === "Sandbox") return window.sandbox_level;
    if (key === "Level1") return window.Level1;
    if (key === "Level2") return window.Level2;
    return window.SandboxLevel;
}

// Generate a fresh state object for level resets
function getFreshLevelState(levelKey) {
    if (levelKey === "Sandbox") {
        return {
            commits: [{ id: "C0", parents: [], x: 80, y: 200 }],
            branches: { "main": "C0" },
            head: "main",
            branchYMap: { "main": 200 },
            won: false
        };
    } else if (levelKey === "Level1") {
        return {
            commits: [{ id: "C0", parents: [], x: 80, y: 200 }],
            branches: { "main": "C0" },
            head: "main",
            hasKey: false,
            gateUnlocked: false,
            won: false
        };
    } else if (levelKey === "Level2") {
        return {
            commits: [{ id: "C0", parents: [], x: 80, y: 200 }],
            branches: { "main": "C0" },
            head: "main",
            hasKeyA: false,
            hasKeyB: false,
            gateUnlocked: false,
            won: false
        };
    }
}

function switchLevel(levelKey) {
    const levelObj = getActiveLevelObj(levelKey);
    if (!levelObj) return;

    window.currentLevelKey = levelKey;
    window.currentLevel = levelObj;
    window.currentLevel.gitState = getFreshLevelState(levelKey);

    // Refresh Terminal History Header
    const history = document.getElementById("terminal-history");
    if (history) {
        history.innerHTML = "";
        if (window.currentLevel.title) writeOutput(window.currentLevel.title);
        if (window.currentLevel.instructions) writeOutput(window.currentLevel.instructions);
        writeOutput("Type 'help' to see available git commands.");
    }
}

function toggleAdminCoords(checkbox) {
    if (checkbox.checked) {
        if (window.adminUnlocked) {
            window.showCoordinates = true;
            return;
        }

        const passcode = prompt("🔐 Enter Admin Passcode:");
        if (passcode === "LP") {
            window.adminUnlocked = true;
            window.showCoordinates = true;

            const statusTag = document.getElementById("admin-status");
            if (statusTag) {
                statusTag.textContent = "🔓 Admin Access";
                statusTag.style.color = "#2ea44f";
            }
        } else {
            checkbox.checked = false;
            window.showCoordinates = false;
            alert("❌ Incorrect Passcode");
        }
    } else {
        window.showCoordinates = false;
    }
}

function executeGitCommand(subCmd, args, writeOutput) {
    try {
        const level = window.currentLevel || getActiveLevelObj(window.currentLevelKey);
        if (!level || !level.gitState) return writeOutput("Error: No active level state.");

        const state = level.gitState;
        const activeCommitId = state.branches[state.head] || state.head;
        const currentCommit = state.commits.find(c => c.id === activeCommitId);

        if (!currentCommit) return writeOutput("Error: Active commit node not found.");

        if (subCmd === "commit") {
            let newX, newY;

            if (typeof level.getNextCommitPosition === "function") {
                const pos = level.getNextCommitPosition(state, currentCommit);
                newX = pos.x;
                newY = pos.y;
            } else {
                newX = currentCommit.x + 80;
                newY = currentCommit.y;
            }

            if (typeof level.canCommit === "function") {
                if (!level.canCommit(newX, newY, writeOutput)) return;
            }

            const newId = `C${state.commits.length}`;
            state.commits.push({ id: newId, parents: [activeCommitId], x: newX, y: newY });
            state.branches[state.head] = newId;
            writeOutput(`[${state.head} ${newId}] Advanced commit.`);

            if (typeof level.onCommit === "function") {
                level.onCommit(newX, newY, writeOutput);
            }

        } else if (subCmd === "branch") {
            const branchName = args[1];
            if (!branchName) return writeOutput("Error: Specify a branch name (e.g., git branch feature)");

            state.branches[branchName] = activeCommitId;
            writeOutput(`Created branch '${branchName}' at ${activeCommitId}`);

        } else if (subCmd === "checkout") {
            const target = args[1];
            if (state.branches[target]) {
                state.head = target;
                writeOutput(`Switched to branch '${target}'`);
            } else {
                writeOutput(`error: branch '${target}' not found`);
            }

        } else if (subCmd === "merge") {
            const targetBranch = args[1];
            if (!state.branches[targetBranch]) return writeOutput(`error: branch '${targetBranch}' not found`);

            const targetCommitId = state.branches[targetBranch];
            const targetCommit = state.commits.find(c => c.id === targetCommitId);
            const newId = `C${state.commits.length}`;

            // Merge drops straight down to active branch Y at the target commit's X position
            const mergeX = Math.max(targetCommit.x, currentCommit.x);

            state.commits.push({
                id: newId,
                parents: [activeCommitId, targetCommitId],
                x: mergeX,
                y: currentCommit.y
            });

            state.branches[state.head] = newId;

            if (typeof level.onMerge === "function") {
                level.onMerge(targetBranch, writeOutput);
            } else {
                writeOutput(`Merged '${targetBranch}' into '${state.head}'.`);
            }
        }
    } catch (err) {
        console.error("Git Execution Error:", err);
        writeOutput(`Error: ${err.message}`);
    }
}

function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const level = window.currentLevel || getActiveLevelObj(window.currentLevelKey);
    if (!level || !level.gitState || !level.gitState.commits) {
        return; // Guard against uninitialized state
    }

    const state = level.gitState;

    // 1. Draw Map/Background
    if (typeof level.draw === "function") {
        level.draw(ctx, state);
    }

    // 2. Commit Lines
    state.commits.forEach(commit => {
        if (!commit.parents) return;
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

    // 3. Commit Nodes
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

        if (window.showCoordinates) {
            ctx.fillStyle = "#79c0ff";
            ctx.font = "9px monospace";
            ctx.fillText(`(${commit.x}, ${commit.y})`, commit.x, commit.y - 18);
        }
    });

    // 4. Branch Labels & Avatar
    if (state.branches) {
        Object.keys(state.branches).forEach((bName, i) => {
            const commit = state.commits.find(c => c.id === state.branches[bName]);
            if (!commit) return;

            const isHead = (bName === state.head);
            ctx.fillStyle = isHead ? "#238636" : "#30363d";
            ctx.fillRect(commit.x - 25, commit.y + 18 + (i * 16), 50, 14);
            ctx.fillStyle = "#ffffff";
            ctx.font = "10px monospace";
            ctx.fillText(bName, commit.x, commit.y + 28 + (i * 16));

            if (isHead) {
                ctx.fillStyle = "#58a6ff";
                ctx.beginPath();
                ctx.arc(commit.x, commit.y - 22, 9, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // 5. Victory Screen
    if (state.won) {
        ctx.fillStyle = "rgba(13, 17, 23, 0.92)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#3fb950";
        ctx.font = "bold 22px monospace";
        ctx.fillText("🎉 LEVEL CLEARED! 🎉", canvas.width / 2, 130);
    }
}

function gameLoop() {
    renderGame();
    requestAnimationFrame(gameLoop);
}

// Initial Bootup
document.addEventListener("DOMContentLoaded", () => {
    switchLevel("Sandbox");
    gameLoop();
});