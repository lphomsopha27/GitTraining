const COMMAND_HELPERS = {
    status: {
        title: "git status",
        badgeName: "Crime Scene Surveyor",
        icon: "🔍",
        tag: "INSPECT THE BOARD",
        level: 1,
        metaphor: "Before touching any clues, a detective steps up to the corkboard to survey the whole case—checking which folder is currently open and which leads still need to be pinned.",
        git: "Shows your current active branch and lists any modified, staged, or untracked files without altering your project."
    },
    branch: {
        title: "git branch <lead>",
        badgeName: "Lead Isolator",
        icon: "📌",
        tag: "ISOLATE A LEAD",
        level: 1,
        metaphor: "You pin a dedicated lead card onto the board so you can chase down a theory on its own track without risking your clean, official 'main' case file.",
        git: "Creates a new, isolated branch pointer from your current commit so you can develop or test ideas separately from 'main'."
    },
    checkout: {
        title: "git checkout <branch>",
        badgeName: "Dossier Hopper",
        icon: "📂",
        tag: "SWITCH WORKSPACE",
        level: 1,
        metaphor: "Checking out a lead opens that specific evidence folder on your desk so you can examine its logs. Checking out 'main' brings you back to the master board.",
        git: "Switches your active working directory to the specified branch, updating the files you view and edit to match that branch."
    },
    commit: {
        title: "git commit",
        badgeName: "Forensic Archivist",
        icon: "📝",
        tag: "STAMP & LOG FINDINGS",
        level: 1,
        metaphor: "Once you verify a clue, you stamp and sign your forensic report into the folder so your discovery is permanently saved to that lead's timeline.",
        git: "Records a permanent snapshot (checkpoint) of your staged changes in the current branch's version history."
    },
    merge: {
        title: "git merge <lead>",
        badgeName: "Red String Weaver",
        icon: "🧵",
        tag: "CONNECT THE RED STRING",
        level: 1,
        metaphor: "You tie a red string from a solved lead straight to the primary suspect on 'main'—officially weaving your side investigation into the master case.",
        git: "Integrates the committed changes from a completed branch back into your active branch ('main')."
    },
    log: {
        title: "git log",
        badgeName: "Timeline Tracker",
        icon: "🕰️",
        tag: "LEVEL 02 COMMAND",
        level: 2,
        metaphor: "A detective flips backward through dated case reports to trace exactly when and who added each clue to the archive.",
        git: "Displays the chronological commit history for the current branch, including commit hashes, authors, and messages."
    },
    revert: {
        title: "git revert <commit>",
        badgeName: "Cold Case Undone",
        icon: "⏪",
        tag: "LEVEL 02 COMMAND",
        level: 2,
        metaphor: "Instead of tearing pages out of an official ledger, a detective files a formal correction entry that cancels out a tampered clue.",
        git: "Safely undoes the changes from a previous commit by creating a brand-new commit with the inverse changes."
    }
};

const seenCommands = new Set();

window.GameState = {
    currentView: "DESK",
    activeBranch: "main",
    currentStep: 1,
    branches: {
        "main": { pinned: true, merged: true }
    },
    evidenceFiles: {
        "atTheScene": {
            title: "Lead #1: Crime Scene Visitor Log",
            subtitle: "VAULT ACCESS LOG",
            tilt: -0.04,
            pinPos: { x: 310, y: 174 },
            taskCompleted: false,
            taskPrompt: "Filter visitor logs to identify who was present inside the vault at 22:15.",
            codeSnippet: "// Visitor Log Algorithm\nfor (let i = 0; i < logs.length; i++) {\n  if (logs[i].atScene) {\n    verifySuspect(logs[i]);\n  }\n}",
            logs: [
                { time: "22:15", name: "Vault Tech", status: "AT SCENE", suspect: true },
                { time: "22:42", name: "Bank Manager", status: "VERIFIED", suspect: false },
                { time: "23:05", name: "Passerby Witness", status: "QUESTIONED", suspect: false }
            ]
        },
        "videologs": {
            title: "Lead #2: Security Video Logs (CAM-02)",
            subtitle: "CAM-02 FOOTAGE",
            tilt: 0.035,
            pinPos: { x: 655, y: 174 },
            taskCompleted: false,
            taskPrompt: "Scan vault corridor surveillance frames for unauthorized motion.",
            codeSnippet: "// Camera Scanner Loop\nfor (let frame of camLogs) {\n  if (frame.motionDetected) {\n    console.log('Motion at ' + frame.time);\n  }\n}",
            logs: [
                { time: "22:14:00", name: "CAM-02 Active", status: "NORMAL", suspect: false },
                { time: "22:15:03", name: "Vault Breach Detected", status: "ALERT", suspect: true }
            ]
        },
        "witness1": {
            title: "Lead #3: Witness 1 Interrogation (Passerby)",
            subtitle: "GETAWAY CAR TIP",
            tilt: 0.03,
            pinPos: { x: 310, y: 378 },
            taskCompleted: false,
            taskPrompt: "Record testimony variables from the outside street witness.",
            codeSnippet: "// Witness Statement Logic\nlet knowsSuspect = false;\nlet atScene = true;\nlet isInnocent = true;",
            logs: [
                { quote: "\"I saw a black sedan driving off fast at 10:20 PM.\"" }
            ]
        },
        "witness2": {
            title: "Lead #4: Witness 2 Interrogation (Bank Worker)",
            subtitle: "OVERRIDE KEYCARD",
            tilt: -0.035,
            pinPos: { x: 655, y: 378 },
            taskCompleted: false,
            taskPrompt: "Record testimony variables from the bank staff witness.",
            codeSnippet: "// Witness Statement Logic\nlet knowsSuspect = true;\nlet atScene = true;\nlet isInnocent = false;",
            logs: [
                { quote: "\"The vault technician asked for the override code yesterday.\"" }
            ]
        }
    }
};

const SAVE_KEY = "git_detective_progress_v1";

function setCookie(name, value, days = 365) {
    try {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    } catch (e) {}
}

function getCookie(name) {
    try {
        const match = document.cookie.split("; ").find(row => row.startsWith(name + "="));
        return match ? decodeURIComponent(match.split("=")[1]) : null;
    } catch (e) {
        return null;
    }
}

function saveProgress() {
    const state = window.GameState;
    const completedTasks = {};
    Object.keys(state.evidenceFiles).forEach(k => {
        completedTasks[k] = !!state.evidenceFiles[k].taskCompleted;
    });

    const payload = {
        unlockedCommands: Array.from(seenCommands),
        level1: {
            currentStep: state.currentStep,
            currentView: state.currentView,
            activeBranch: state.activeBranch,
            branches: state.branches,
            completedTasks: completedTasks
        }
    };

    const jsonStr = JSON.stringify(payload);
    try { localStorage.setItem(SAVE_KEY, jsonStr); } catch (e) {}
    setCookie(SAVE_KEY, jsonStr, 365);

    if (typeof updateAchievementCounters === "function") {
        updateAchievementCounters();
    }
}

function loadProgress() {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) {}
    if (!raw) raw = getCookie(SAVE_KEY);
    if (!raw) return;

    try {
        const data = JSON.parse(raw);
        if (Array.isArray(data.unlockedCommands)) {
            data.unlockedCommands.forEach(cmd => seenCommands.add(cmd));
        }
        if (data.level1) {
            const l1 = data.level1;
            if (typeof l1.currentStep === "number") window.GameState.currentStep = l1.currentStep;
            if (l1.currentView) window.GameState.currentView = l1.currentView;
            if (l1.activeBranch) window.GameState.activeBranch = l1.activeBranch;
            if (l1.branches) {
                window.GameState.branches = Object.assign({ "main": { pinned: true, merged: true } }, l1.branches);
            }
            if (l1.completedTasks) {
                Object.keys(l1.completedTasks).forEach(k => {
                    if (window.GameState.evidenceFiles[k]) {
                        window.GameState.evidenceFiles[k].taskCompleted = !!l1.completedTasks[k];
                    }
                });
            }
        }
    } catch (e) {}
}

function resetLevel1State() {
    window.GameState.currentView = "DESK";
    window.GameState.activeBranch = "main";
    window.GameState.currentStep = 1;
    window.GameState.branches = { "main": { pinned: true, merged: true } };
    Object.keys(window.GameState.evidenceFiles).forEach(k => {
        window.GameState.evidenceFiles[k].taskCompleted = false;
    });
    const history = document.getElementById("terminal-history");
    if (history) history.innerHTML = "";
}