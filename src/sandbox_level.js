window.sandbox_level = {
    title: "🧪 GIT DUNGEON: SANDBOX MODE 🧪",
    instructions: "Freeplay mode! Practice branching, committing, and merging with no gates or obstacles.",

    gitState: {
        commits: [{ id: "C0", parents: [], x: 80, y: 200 }],
        branches: { "main": "C0" },
        head: "main",
        branchYMap: { "main": 200 },
        won: false
    },

    getNextCommitPosition(state, currentCommit) {
        if (!state.branchYMap) state.branchYMap = { "main": 200 };

        if (!state.branchYMap[state.head]) {
            const branchCount = Object.keys(state.branchYMap).length;
            state.branchYMap[state.head] = 200 - (branchCount * 70);
        }

        const targetY = state.branchYMap[state.head];
        const nextX = (currentCommit.y === targetY) ? currentCommit.x + 80 : currentCommit.x + 60;

        return { x: nextX, y: targetY };
    },

    draw(ctx, state) {
        // Subtle grid lines for sandbox positioning
        ctx.strokeStyle = "#161b22";
        ctx.lineWidth = 1;
        for (let x = 40; x < 560; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 280);
            ctx.stroke();
        }
    },

    handleCommand(subCmd, args, writeOutput) {
        executeGitCommand(subCmd, args, writeOutput);
    }
};