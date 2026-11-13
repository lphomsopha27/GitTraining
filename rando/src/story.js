window.GameState = {
    currentView: "DESK", // "DESK", "CORKBOARD", or "EVIDENCE_PORTAL"
    activeBranch: "main",
    
    // Branches created by player
    branches: {
        "main": { pinned: true, merged: true }
    },

    // Evidence file definitions from your flowchart
    evidenceFiles: {
        "videologs": {
            title: "Evidence File 1: Videologs",
            imageKey: "evidence_videologs",
            pinPos: { x: 180, y: 110 },
            taskCompleted: false,
            taskPrompt: "Task: Write a for loop to scan through log entries.\nExample: for (let i = 0; i < logs.length; i++)",
            codeKeyword: "for"
        },
        "atTheScene": {
            title: "Evidence File 2: Log of Everyone at Scene",
            imageKey: "evidence_atscene",
            pinPos: { x: 460, y: 110 },
            taskCompleted: false,
            taskPrompt: "Task: Write a loop with an 'if' statement to filter visitors at scene.\nExample: if (person.atScene) { checkLog(); }",
            codeKeyword: "if"
        },
        "witness1": {
            title: "Evidence File 3: Questioning of Witness 1 (Passerby)",
            imageKey: "evidence_witness1",
            pinPos: { x: 180, y: 250 },
            taskCompleted: false,
            taskPrompt: "Task: Declare boolean variables for witness 1.\nRequired: atScene = true, knowsSuspect = false, isInnocent = true",
            codeKeyword: "knowsSuspect = false"
        },
        "witness2": {
            title: "Evidence File 4: Questioning of Witness 2 (Bank Worker)",
            imageKey: "evidence_witness2",
            pinPos: { x: 460, y: 250 },
            taskCompleted: false,
            taskPrompt: "Task: Declare boolean variables for witness 2.\nRequired: atScene = true, knowsSuspect = true, isInnocent = false",
            codeKeyword: "knowsSuspect = true"
        }
    }
};

function handleGitCommand(subCmd, args) {
    const state = window.GameState;

    // git status
    if (subCmd === "status") {
        if (state.currentView === "DESK") {
            window.triggerScreenFade(() => {
                state.currentView = "CORKBOARD";
            });
            window.writeOutput("On branch main.\nSwitched view to Investigation Corkboard.");
        } else {
            window.writeOutput(`On branch '${state.activeBranch}'.\nCurrent View: ${state.currentView}`);
        }
        return;
    }

    // git branch -a
    if (subCmd === "branch" && args[0] === "-a") {
        const branchList = Object.keys(state.branches).map(b => (b === state.activeBranch ? `* ${b}` : `  ${b}`)).join("\n");
        window.writeOutput(`All Case Branches:\n${branchList}`);
        return;
    }

    // git branch [name]
    if (subCmd === "branch") {
        const name = args[0];
        if (!name) return window.writeOutput("Error: Specify evidence branch name (e.g., 'git branch witness1')");
        if (!state.evidenceFiles[name]) return window.writeOutput(`Error: '${name}' is not a valid evidence file. Valid files: videologs, atTheScene, witness1, witness2`);
        if (state.branches[name]) return window.writeOutput(`Branch '${name}' already exists.`);

        state.branches[name] = { pinned: true, merged: false };
        if (state.currentView === "DESK") state.currentView = "CORKBOARD";
        window.writeOutput(`📌 Pinned evidence folder '${name}' onto the corkboard!`);
        return;
    }

    // git checkout [name]
    if (subCmd === "checkout") {
        const target = args[0];
        if (!target) return window.writeOutput("Error: Specify branch to checkout.");

        if (target === "main") {
            state.activeBranch = "main";
            window.triggerScreenFade(() => {
                state.currentView = "DESK";
            });
            window.writeOutput("Switched to branch 'main'. Returned to Detective Desk.");
            return;
        }

        if (!state.branches[target]) return window.writeOutput(`Error: Branch '${target}' does not exist. Pin it first with 'git branch ${target}'`);

        state.activeBranch = target;
        window.triggerScreenFade(() => {
            state.currentView = "EVIDENCE_PORTAL";
        });

        const ev = state.evidenceFiles[target];
        window.writeOutput(`🌀 Portaled into evidence file '${target}'!\n\n${ev.title}\n${ev.taskPrompt}`);
        return;
    }

    // git commit [summary/code]
    if (subCmd === "commit") {
        if (state.activeBranch === "main") {
            return window.writeOutput("On main branch. Checkout an evidence branch to document findings.");
        }

        const ev = state.evidenceFiles[state.activeBranch];
        const inputCode = args.join(" ");

        if (!ev.taskCompleted) {
            if (inputCode.includes(ev.codeKeyword) || args.length === 0) {
                ev.taskCompleted = true;
                window.writeOutput(`📝 Findings documented for '${state.activeBranch}'!\nTask marked complete. Run 'git checkout main' then 'git merge ${state.activeBranch}' to connect red string.`);
            } else {
                window.writeOutput(`⚠️ Findings incomplete. Check prompt requirements:\n${ev.taskPrompt}`);
            }
        } else {
            window.writeOutput(`Findings already documented for '${state.activeBranch}'.`);
        }
        return;
    }

    // git merge [name]
    if (subCmd === "merge") {
        const target = args[0];
        if (!target) return window.writeOutput("Error: Specify branch to merge.");
        if (state.activeBranch !== "main") return window.writeOutput("Must be on 'main' branch to merge evidence.");
        if (!state.branches[target]) return window.writeOutput(`Branch '${target}' not found.`);
        
        const ev = state.evidenceFiles[target];
        if (!ev || !ev.taskCompleted) {
            return window.writeOutput(`Cannot merge '${target}'. You must checkout '${target}' and complete 'git commit' first!`);
        }

        state.branches[target].merged = true;
        if (state.currentView === "DESK") state.currentView = "CORKBOARD";
        window.writeOutput(`🧵 Merged '${target}' into main! Red string connected on corkboard!`);

        // Check victory
        const allMerged = Object.keys(state.evidenceFiles).every(k => state.branches[k] && state.branches[k].merged);
        if (allMerged) {
            window.writeOutput("\n🎉 CASE SOLVED! All evidence branches merged into main!");
        }
        return;
    }

    window.writeOutput(`Unknown git command: '${subCmd}'. Try status, branch, checkout, commit, or merge.`);
}