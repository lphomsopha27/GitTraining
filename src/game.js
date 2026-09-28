const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

window.adminUnlocked = false;
window.showCoordinates = false;
window.currentLevelKey = "Level1";

// Universal terminal logging function
window.writeOutput = function(text) {
    const history = document.getElementById("terminal-history");
    if (!history) return;
    const line = document.createElement("div");
    line.style.marginBottom = "4px";
    line.style.whiteSpace = "pre-wrap";
    line.textContent = text;
    history.appendChild(line);
    history.scrollTop = history.scrollHeight;
};

function getActiveLevelObj(key) {
    if (key === "Level1") return window.Level1;
    if (key === "Sandbox") return window.SandboxLevel;
    return window.Level1;
}

function getFreshLevelState(levelKey) {
    if (levelKey === "Level1") {
        return {
            commits: [{ id: "C0", parents: [], x: 80, y: 200 }],
            branches: { "main": "C0" },
            head: "main",
            hasKey: false,
            gateUnlocked: false,
            won: false
        };
    } else {
        return {
            commits: [{ id: "C0", parents: [], x: 80, y: 200 }],
            branches: { "main": "C0" },
            head: "main",
            branchYMap: { "main": 200 },
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

    const history = document.getElementById("terminal-history");
    if (history) history.innerHTML = "";

    if (window.currentLevel.title) window.writeOutput(window.currentLevel.title);
    if (window.currentLevel.instructions) window.writeOutput(window.currentLevel.instructions);
    window.writeOutput("Type 'help' to see available git commands.\n");
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

function executeGitCommand(subCmd, args) {
    try {
        const level = window.currentLevel || getActiveLevelObj(window.currentLevelKey);
        if (!level || !level.gitState) return window.writeOutput("Error: No active level state.");

        const state = level.gitState;
        const activeCommitId = state.branches[state.head] || state.head;
        const currentCommit = state.commits.find(c => c.id === activeCommitId);

        if (!currentCommit) return window.writeOutput("Error: Active commit node not found.");

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
                if (!level.canCommit(newX, newY, window.writeOutput)) return;
            }

            const newId = `C${state.commits.length}`;
            state.commits.push({ id: newId, parents: [activeCommitId], x: newX, y: newY });
            state.branches[state.head] = newId;
            window.writeOutput(`[${state.head} ${newId}] Pinned evidence note.`);

            if (typeof level.onCommit === "function") {
                level.onCommit(newX, newY, window.writeOutput);
            }

        } else if (subCmd === "branch") {
            const branchName = args[1];
            if (!branchName) return window.writeOutput("Error: Specify a branch name (e.g., git branch lead/tech)");

            state.branches[branchName] = activeCommitId;
            window.writeOutput(`Created lead branch '${branchName}' at ${activeCommitId}`);

        } else if (subCmd === "checkout") {
            const target = args[1];
            if (state.branches[target]) {
                state.head = target;
                window.writeOutput(`Switched focus to lead branch '${target}'`);
            } else {
                window.writeOutput(`error: lead branch '${target}' not found`);
            }

        } else if (subCmd === "merge") {
            const targetBranch = args[1];
            if (!state.branches[targetBranch]) return window.writeOutput(`error: branch '${targetBranch}' not found`);

            const targetCommitId = state.branches[targetBranch];
            const targetCommit = state.commits.find(c => c.id === targetCommitId);
            const newId = `C${state.commits.length}`;

            const mergeX = Math.max(targetCommit.x, currentCommit.x);

            state.commits.push({
                id: newId,
                parents: [activeCommitId, targetCommitId],
                x: mergeX,
                y: currentCommit.y
            });

            state.branches[state.head] = newId;

            if (typeof level.onMerge === "function") {
                level.onMerge(targetBranch, window.writeOutput);
            } else {
                window.writeOutput(`Merged '${targetBranch}' into '${state.head}'.`);
            }
        } else if (subCmd === "status") {
            window.writeOutput(`On branch ${state.head}\nActive evidence node: ${activeCommitId}`);
        } else {
            window.writeOutput(`git: '${subCmd}' is not a valid command. Try 'commit', 'branch', 'checkout', or 'merge'.`);
        }
    } catch (err) {
        console.error("Git Execution Error:", err);
        window.writeOutput(`Error: ${err.message}`);
    }
}

function renderGame() {
    // Always render corkboard background first
    ctx.fillStyle = "#1a1614";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const level = window.currentLevel || getActiveLevelObj(window.currentLevelKey);
    if (!level || !level.gitState || !level.gitState.commits) return;

    const state = level.gitState;

    if (typeof level.draw === "function") {
        level.draw(ctx, state);
    }

    // Red Investigation Threads
    state.commits.forEach(commit => {
        if (!commit.parents) return;
        commit.parents.forEach(parentId => {
            const parent = state.commits.find(c => c.id === parentId);
            if (parent) {
                ctx.strokeStyle = "rgba(235, 59, 90, 0.4)";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(parent.x, parent.y);
                ctx.lineTo(commit.x, commit.y);
                ctx.stroke();

                ctx.strokeStyle = "#eb3b5a";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(parent.x, parent.y);
                ctx.lineTo(commit.x, commit.y);
                ctx.stroke();
            }
        });
    });

    // Polaroid Evidence Nodes
    state.commits.forEach(commit => {
        ctx.fillStyle = "#f5f6fa";
        ctx.fillRect(commit.x - 16, commit.y - 16, 32, 32);
        
        ctx.fillStyle = "#2f3640";
        ctx.fillRect(commit.x - 12, commit.y - 14, 24, 20);

        ctx.fillStyle = "#e1b12c";
        ctx.beginPath();
        ctx.arc(commit.x, commit.y - 14, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#2f3640";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(commit.id, commit.x, commit.y + 12);

        if (window.showCoordinates) {
            ctx.fillStyle = "#f5f6fa";
            ctx.font = "9px monospace";
            ctx.fillText(`(${commit.x}, ${commit.y})`, commit.x, commit.y - 20);
        }
    });

    // Folder Tags & Detective Badge
    if (state.branches) {
        Object.keys(state.branches).forEach((bName, i) => {
            const commit = state.commits.find(c => c.id === state.branches[bName]);
            if (!commit) return;

            const isHead = (bName === state.head);
            ctx.fillStyle = isHead ? "#e1b12c" : "#7f8fa6";
            ctx.fillRect(commit.x - 32, commit.y + 20 + (i * 16), 64, 14);
            
            ctx.fillStyle = "#1e272e";
            ctx.font = "bold 9px monospace";
            ctx.fillText(bName, commit.x, commit.y + 30 + (i * 16));

            if (isHead) {
                ctx.fillStyle = "#e1b12c";
                ctx.beginPath();
                ctx.arc(commit.x, commit.y - 24, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#1e272e";
                ctx.font = "bold 8px monospace";
                ctx.fillText("🕵️", commit.x, commit.y - 21);
            }
        });
    }

    if (state.won) {
        ctx.fillStyle = "rgba(30, 39, 46, 0.94)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#44bd32";
        ctx.font = "bold 22px monospace";
        ctx.fillText("📂 CASE SOLVED & CLOSED! 📂", canvas.width / 2, 130);
    }
}

function gameLoop() {
    renderGame();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("DOMContentLoaded", () => {
    switchLevel("Level1");
    gameLoop();
});