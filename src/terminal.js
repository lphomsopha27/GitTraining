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
        if (window.currentLevel && typeof window.currentLevel.handleCommand === "function") {
            window.currentLevel.handleCommand(args[1], args.slice(1), writeOutput);
        }
    } else {
        writeOutput(`bash: ${mainCmd}: command not found`);
    }
}