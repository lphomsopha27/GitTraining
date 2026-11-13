document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("terminal-input");
    
    // Welcome Header
    window.writeOutput = function(text) {
        const history = document.getElementById("terminal-history");
        if (!history) return;
        const line = document.createElement("div");
        line.style.marginBottom = "6px";
        line.style.whiteSpace = "pre-wrap";
        line.textContent = text;
        history.appendChild(line);
        history.scrollTop = history.scrollHeight;
    };

    window.writeOutput("🕵️ CASE #101 INITIATED.\nYou are at your desk. Type 'git status' to inspect the case corkboard.");

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
                document.getElementById("terminal-history").innerHTML = "";
                return;
            }

            if (mainCmd === "help") {
                window.writeOutput("Available Commands:\n - git status\n - git branch -a\n - git branch [name]\n - git checkout [name]\n - git commit [findings]\n - git merge [name]\n - clear");
                return;
            }

            if (mainCmd === "git") {
                if (!subCmd) {
                    window.writeOutput("Usage: git status | git branch [name] | git checkout [name] | git commit | git merge [name]");
                } else {
                    handleGitCommand(subCmd, parts.slice(2));
                }
            } else {
                window.writeOutput(`Command not recognized: ${mainCmd}. Type 'help' for available git commands.`);
            }
        }
    });
});