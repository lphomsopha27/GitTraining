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
    const args = inputStr.split(" ");
    const mainCommand = args[0].toLowerCase();

    switch (mainCommand) {
        case "help":
            writeOutput("Available commands: ls, cd, git status, git add, git commit, clear");
            break;
        case "ls":
            writeOutput("assets/   src/   index.html   README.md");
            break;
        case "clear":
            terminalHistory.innerHTML = "";
            break;
        case "git":
            handleGitCommands(args.slice(1));
            break;
        default:
            writeOutput(`bash: ${mainCommand}: command not found`);
    }
}

function handleGitCommands(gitArgs) {
    const subCommand = gitArgs[0];

    if (subCommand === "status") {
        writeOutput("On branch main. Staged file: src/player.js");
    } else if (subCommand === "commit") {
        writeOutput("[main 4a12f90] Fixed player speed bug!");
        // Connect directly to game logic
        gameState.hero.speed = 8; 
    } else {
        writeOutput(`git: '${subCommand}' is not a valid git command.`);
    }
}