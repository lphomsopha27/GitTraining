document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("terminal-input");
    if (!input) return;

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const rawCmd = input.value.trim();
            input.value = "";
            if (!rawCmd) return;

            window.writeOutput(`detective@case-files:~$ ${rawCmd}`);

            const parts = rawCmd.split(/\s+/);
            const mainCmd = parts[0];
            const subCmd = parts[1];

            if (mainCmd === "clear") {
                const history = document.getElementById("terminal-history");
                if (history) history.innerHTML = "";
                return;
            }

            if (mainCmd === "help") {
                window.writeOutput("Available Git Detective Commands:\n - git status\n - git commit\n - git branch <lead_name>\n - git checkout <lead_name>\n - git merge <lead_name>\n - clear");
                return;
            }

            if (mainCmd === "git") {
                if (!subCmd) {
                    window.writeOutput("Usage: git <command> (e.g. 'git commit', 'git status', 'git branch lead/tech')");
                } else {
                    executeGitCommand(subCmd, parts.slice(1));
                }
            } else {
                window.writeOutput(`Command not recognized: ${mainCmd}. Type 'help' for instructions.`);
            }
        }
    });
});