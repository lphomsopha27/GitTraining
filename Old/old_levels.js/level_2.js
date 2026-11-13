window.Level2 = {
    title: "🔥 GIT DUNGEON: LEVEL 2 — DUAL BRANCH GATE 🔥",
    instructions: "Branch off into two different feature branches to grab Key A and Key B, then merge both into main!",

    gitState: {
        commits: [{ id: "C0", parents: [], x: 80, y: 200 }],
        branches: { "main": "C0" },
        head: "main",
        hasKeyA: false,
        hasKeyB: false,
        gateUnlocked: false,
        won: false
    },

    positions: {
        keyA: { x: 220, y: 100 },
        keyB: { x: 340, y: 100 },
        gateX: 420,
        exitX: 500
    },

    getNextCommitPosition(state, currentCommit) {
        if (state.head === "main") {
            return { x: currentCommit.x + 80, y: 200 };
        } else {
            const nextX = currentCommit.y === 200 ? currentCommit.x : currentCommit.x + 60;
            return { x: nextX, y: 100 };
        }
    },

    canCommit(newX, newY, writeOutput) {
        const state = this.gitState;
        if (state.head === "main" && newX >= this.positions.gateX && !state.gateUnlocked) {
            writeOutput("⛔ BLOCKED! The gate requires BOTH Key A and Key B merged into main!");
            return false;
        }
        return true;
    },

    onCommit(newX, newY, writeOutput) {
        const state = this.gitState;

        if (state.head !== "main") {
            if (newX >= this.positions.keyA.x && !state.hasKeyA) {
                state.hasKeyA = true;
                writeOutput("🔑 KEY A GRABBED!");
            }
            if (newX >= this.positions.keyB.x && !state.hasKeyB) {
                state.hasKeyB = true;
                writeOutput("🔑 KEY B GRABBED!");
            }
        }

        if (state.head === "main" && newX >= this.positions.exitX) {
            state.won = true;
            writeOutput("🏆 VICTORY! Level 2 Cleared!");
        }
    },

    onMerge(targetBranch, writeOutput) {
        const state = this.gitState;
        if (state.hasKeyA && state.hasKeyB) {
            state.gateUnlocked = true;
            writeOutput(`Merged '${targetBranch}'. Both keys present! 🔓 GATE UNLOCKED!`);
        } else {
            writeOutput(`Merged '${targetBranch}'. Keys collected: KeyA=${state.hasKeyA}, KeyB=${state.hasKeyB}`);
        }
    },

    draw(ctx, state) {
        // Main corridor & Top Tunnel
        ctx.fillStyle = "#161b22";
        ctx.fillRect(40, 160, 480, 80);
        ctx.fillRect(140, 60, 260, 80);

        // Key A
        if (!state.hasKeyA) {
            ctx.fillStyle = "#eac54f";
            ctx.beginPath();
            ctx.arc(this.positions.keyA.x, this.positions.keyA.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("🔑 A", this.positions.keyA.x, this.positions.keyA.y - 16);
        }

        // Key B
        if (!state.hasKeyB) {
            ctx.fillStyle = "#eac54f";
            ctx.beginPath();
            ctx.arc(this.positions.keyB.x, this.positions.keyB.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("🔑 B", this.positions.keyB.x, this.positions.keyB.y - 16);
        }

        // Gate
        ctx.fillStyle = state.gateUnlocked ? "#2ea44f" : "#da3633";
        ctx.fillRect(this.positions.gateX - 6, 160, 12, 80);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(state.gateUnlocked ? "OPEN" : "GATE", this.positions.gateX, 145);

        // Exit
        ctx.fillStyle = "#238636";
        ctx.fillRect(this.positions.exitX - 20, 180, 40, 40);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("EXIT 🏁", this.positions.exitX, 170);
    },

    handleCommand(subCmd, args, writeOutput) {
        executeGitCommand(subCmd, args, writeOutput);
    }
};