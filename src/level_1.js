window.Level1 = {
    title: "⚔️ GIT DUNGEON: LEVEL 1 — THE BRANCHING MAZE ⚔️",

    gitState: {
        commits: [{ id: "C0", parents: [], x: 80, y: 200 }],
        branches: { "main": "C0" },
        head: "main",
        hasKey: false,
        gateUnlocked: false,
        won: false
    },

    positions: {
        key: { x: 260, y: 100 },
        gateX: 340,
        exitX: 440
    },

    // 1. Calculate commit coordinates for Level 1 layout
    getNextCommitPosition(state, currentCommit) {
        if (state.head === "main") {
            return { x: currentCommit.x + 80, y: 200 };
        } else {
            const nextX = currentCommit.y === 200 ? currentCommit.x : currentCommit.x + 60;
            return { x: nextX, y: 100 };
        }
    },

    // 2. Lock gate validation
    canCommit(newX, newY, writeOutput) {
        const state = this.gitState;
        if (state.head === "main" && newX >= this.positions.gateX && !state.gateUnlocked) {
            writeOutput("⛔ BLOCKED! Gate is locked. Checkout your side branch, grab the key, and merge into 'main' first!");
            return false;
        }
        return true;
    },

    // 3. Key grabbing & Victory checks
    onCommit(newX, newY, writeOutput) {
        const state = this.gitState;

        if (state.head !== "main" && newX >= this.positions.key.x && !state.hasKey) {
            state.hasKey = true;
            writeOutput("🔑 KEY GRABBED! Run 'git checkout main' and 'git merge " + state.head + "'");
        }

        if (state.head === "main" && newX >= this.positions.exitX) {
            state.won = true;
            writeOutput("🏆 VICTORY! Level 1 Cleared!");
        }
    },

    // 4. Gate unlocking on merge
    onMerge(targetBranch, writeOutput) {
        const state = this.gitState;
        if (state.hasKey) {
            state.gateUnlocked = true;
            writeOutput(`Merged '${targetBranch}' into 'main'. 🔑 Key merged! 🔓 GATE UNLOCKED! Run 'git commit' to move forward.`);
        } else {
            writeOutput(`Merged '${targetBranch}', but it didn't have the key!`);
        }
    },

    // 5. Draw map visuals
    draw(ctx, state) {
        ctx.fillStyle = "#161b22";
        ctx.fillRect(40, 160, 440, 80);
        ctx.fillRect(140, 60, 260, 80);

        ctx.beginPath();
        ctx.lineWidth = 60;
        ctx.strokeStyle = "#161b22";
        ctx.moveTo(160, 200);
        ctx.lineTo(160, 100);
        ctx.stroke();

        if (!state.hasKey) {
            ctx.fillStyle = "#eac54f";
            ctx.beginPath();
            ctx.arc(this.positions.key.x, this.positions.key.y, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px monospace";
            ctx.textAlign = "center";
            ctx.fillText("🔑 KEY", this.positions.key.x, this.positions.key.y - 20);
        }

        ctx.fillStyle = state.gateUnlocked ? "#2ea44f" : "#da3633";
        ctx.fillRect(this.positions.gateX - 6, 160, 12, 80);
        ctx.fillStyle = "#ffffff";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(state.gateUnlocked ? "OPEN" : "LOCKED GATE", this.positions.gateX, 145);

        ctx.fillStyle = "#238636";
        ctx.fillRect(this.positions.exitX - 20, 180, 40, 40);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("EXIT 🏁", this.positions.exitX, 170);

        if (window.showCoordinates) {
            ctx.fillStyle = "#ffa657";
            ctx.font = "10px monospace";
            ctx.textAlign = "center";

            if (!state.hasKey) {
                ctx.fillText(`(${this.positions.key.x}, ${this.positions.key.y})`, this.positions.key.x, this.positions.key.y + 25);
            }
            ctx.fillText(`x: ${this.positions.gateX}`, this.positions.gateX, 250);
            ctx.fillText(`x: ${this.positions.exitX}`, this.positions.exitX, 235);
        }
    },

    // Pass through to core engine
    handleCommand(subCmd, args, writeOutput) {
        executeGitCommand(subCmd, args, writeOutput);
    }
};