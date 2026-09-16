const terminalInput = document.getElementById("terminal-input");
const terminalHistory = document.getElementById("terminal-history");

terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const command = terminalInput.value.trim();
        if (command) {
            writeOutput(`guest@git-dungeon:~$ ${command}`);
            parseCommand(command);
        }
        terminalInput.value = "";
    }
});

function writeOutput(text) {
    const line = document.createElement("div");
    line.textContent = text;
    terminalHistory.appendChild(line);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

function parseCommand(inputStr) {
    const args = inputStr.split(/\s+/);
    const mainCmd = args[0].toLowerCase();

    if (mainCmd === "help") {
        writeOutput("Commands: git branch <name>, git checkout <name>, git commit, git merge <name>, clear");
    } else if (mainCmd === "clear") {
        terminalHistory.innerHTML = "";
    } else if (mainCmd === "git") {
        handleGitCommand(args.slice(1));
    } else {
        writeOutput(`bash: ${mainCmd}: command not found`);
    }
}

function handleGitCommand(args) {
    const subCmd = args[0];
    const state = window.gitState;
    const activeCommitId = state.branches[state.head] || state.head;
    const currentCommit = state.commits.find(c => c.id === activeCommitId);

    if (subCmd === "commit") {
        let newX, newY;

        if (state.head === "main") {
            newX = currentCommit.x + 80;
            newY = 200; // Main corridor level

            // Block movement past the gate if it isn't unlocked
            if (newX >= 340 && !state.gateUnlocked) {
                writeOutput("⛔ BLOCKED! The gate at x:340 is locked. Checkout your side branch, grab the key, switch back to 'main', and merge!");
                return;
            }
        } else {
            // Side Branch Movement (Angled path into side tunnel)
            if (currentCommit.y === 200) {
                newX = currentCommit.x + 60;
                newY = 100;
            } else {
                newX = currentCommit.x + 60;
                newY = 100;
            }
        }

        const newId = `C${state.commits.length}`;
        state.commits.push({ id: newId, parents: [activeCommitId], x: newX, y: newY });
        state.branches[state.head] = newId;
        writeOutput(`[${state.head} ${newId}] Advanced commit.`);

        // Key pickup logic on side tunnel
        if (state.head !== "main" && newX >= 280 && !state.hasKey) {
            state.hasKey = true;
            writeOutput("🔑 KEY GRABBED! Now type 'git checkout main' and 'git merge " + state.head + "' to bring the key back!");
        }

        // Win Condition: Main branch reaches the exit square at x:500
        if (state.head === "main" && newX >= 480) {
            state.won = true;
            writeOutput("🏆 VICTORY! You committed main directly into the exit!");
            if (typeof downloadBadge === "function") {
                downloadBadge("Student", "Git Maze Escaped", newId);
            }
        }

    } else if (subCmd === "branch") {
        const branchName = args[1];
        if (!branchName) return writeOutput("Error: Specify a branch name (e.g., git branch side)");

        state.branches[branchName] = activeCommitId;
        writeOutput(`Created branch '${branchName}' at ${activeCommitId}. Use 'git checkout ${branchName}' to move into it.`);

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

        if (state.head !== "main") {
            return writeOutput("Notice: Switch back to 'main' using 'git checkout main' before merging!");
        }

        const targetCommitId = state.branches[targetBranch];
        
        // Merge commit C4 created on main corridor right at gate (x: 340, y: 200)
        const newId = `C${state.commits.length}`;
        state.commits.push({
            id: newId,
            parents: [activeCommitId, targetCommitId], // Connects C1 (main) and C3 (side)
            x: 340,
            y: 200
        });

        // ADVANCE MAIN TO MERGE COMMIT (Leave side branch back at C3)
        state.branches["main"] = newId;

        if (state.hasKey) {
            state.gateUnlocked = true;
            writeOutput(`Merged '${targetBranch}' into 'main'. 🔑 Key merged! 🔓 GATE UNLOCKED! Type 'git commit' to step into the exit!`);
        } else {
            writeOutput(`Merged '${targetBranch}' into 'main', but '${targetBranch}' did not collect the key!`);
        }
    }
}