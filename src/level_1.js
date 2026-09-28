window.Level1 = {
    title: "🕵️ CASE #101: THE BANK VAULT HEIST",
    instructions: "The District Attorney won't accept charges on 'main' without the vault key code! Open a lead branch ('git branch lead/tech'), switch to it ('git checkout lead/tech'), log evidence ('git commit'), then merge the verified lead back into 'main'.",

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
            writeOutput("⛔ INDICTMENT REJECTED! DA needs the security key code from the technical lead file before advancing main.");
            return false;
        }
        return true;
    },

    onCommit(newX, newY, writeOutput) {
        const state = this.gitState;

        if (state.head !== "main" && newX >= this.positions.key.x && !state.hasKey) {
            state.hasKey = true;
            writeOutput("📸 EVIDENCE LOGGED! Recovered vault security key code from suspect's ledger!");
        }

        if (state.head === "main" && newX >= this.positions.exitX) {
            state.won = true;
            writeOutput("🏆 CASE CLOSED! Suspect indicted and conviction secured!");
        }
    },

    onMerge(targetBranch, writeOutput) {
        const state = this.gitState;
        if (state.hasKey) {
            state.gateUnlocked = true;
            writeOutput(`Merged '${targetBranch}' into 'main'. 📂 Key code filed! 🔓 DA APPROVED! Run 'git commit' on main to file final charges.`);
        } else {
            writeOutput(`Merged '${targetBranch}', but no critical evidence was found in that folder!`);
        }
    },

    draw(ctx, state) {
        // Track corridors
        ctx.fillStyle = "#26201c";
        ctx.fillRect(40, 160, 440, 80);
        ctx.fillRect(140, 60, 260, 80);

        // Evidence Clue
        if (!state.hasKey) {
            ctx.fillStyle = "#e1b12c";
            ctx.beginPath();
            ctx.arc(this.positions.key.x, this.positions.key.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("📸 KEY CODE", this.positions.key.x, this.positions.key.y - 18);
        }

        // DA Gate
        ctx.fillStyle = state.gateUnlocked ? "#2ea44f" : "#da3633";
        ctx.fillRect(this.positions.gateX - 6, 160, 12, 80);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(state.gateUnlocked ? "DA APPROVED" : "LOCKED FILE", this.positions.gateX, 145);

        // Courtroom Goal
        ctx.fillStyle = "#8957e5";
        ctx.fillRect(this.positions.exitX - 20, 180, 40, 40);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("COURT ⚖️", this.positions.exitX, 170);
    }
};