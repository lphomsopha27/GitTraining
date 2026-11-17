const SAVE_KEY = "git_detective_save_v2";

const COMMAND_HELPERS = {
    status: {
        title: "git status",
        tag: "INSPECT THE BOARD",
        icon: "🔍",
        badgeName: "Scene Inspector",
        level: 1,
        metaphor: "Stepping back from your desk to look at the entire corkboard—seeing which clues are pinned, modified, or still unexamined.",
        git: "Shows your current branch, uncommitted changes, and untracked files in the working directory."
    },
    branch: {
        title: "git branch <name>",
        tag: "ISOLATE A LEAD",
        icon: "📌",
        badgeName: "Lead Isolator",
        level: 1,
        metaphor: "Pinning a fresh evidence card onto its own investigation lane so you can test theories without messing up the main case file.",
        git: "Creates a new branch pointer so you can develop features or fixes in isolation."
    },
    checkout: {
        title: "git checkout <branch>",
        tag: "SWITCH FOCUS",
        icon: "🗂️",
        badgeName: "Case Jumper",
        level: 1,
        metaphor: "Walking over to a specific evidence folder—or stepping back to the main corkboard—to work directly on that lead.",
        git: "Switches your active HEAD pointer and updates your working files to match the target branch."
    },
    commit: {
        title: "git commit",
        tag: "SEAL THE RECORD",
        icon: "💾",
        badgeName: "Archivist",
        level: 1,
        metaphor: "Stamping your verified forensic findings with a timestamped case note so they are permanently logged on that branch.",
        git: "Saves a permanent snapshot of your changes to the current branch's history along with a descriptive commit message."
    },
    merge: {
        title: "git merge <branch>",
        tag: "CONNECT THE THREADS",
        icon: "🧶",
        badgeName: "Thread Weaver",
        level: 1,
        metaphor: "Tying the red string from a verified evidence card straight to the central suspect photo on the main board.",
        git: "Integrates the committed history from a feature branch back into your current branch (such as main)."
    },
    log: {
        title: "git log",
        tag: "AUDIT TIMELINE",
        icon: "📜",
        badgeName: "Timeline Auditor",
        level: 2,
        metaphor: "Flipping backward through every stamped entry in the detective ledger to spot who altered a record and when.",
        git: "Displays the chronological commit history, commit hashes, authors, and messages for the current branch."
    },
    revert: {
        title: "git revert <hash>",
        tag: "UNDO SAFELY",
        icon: "⏪",
        badgeName: "Forgery Reverser",
        level: 2,
        metaphor: "Filing an official correction entry that cancels out a forged clue without erasing the case's audit trail.",
        git: "Creates a new commit that safely undoes the changes introduced by an earlier commit without rewriting history."
    }
};

const seenCommands = new Set();

function createInitialEvidenceFiles() {
    return {
        atTheScene: {
            title: "Lead #1: Crime Scene Visitor Log",
            subtitle: "VAULT ACCESS LOG",
            pinPos: { x: 265, y: 145 },
            tilt: -0.05,
            logs: [
                { time: "22:15", name: "Vault Tech", status: "AT SCENE", suspect: true },
                { time: "22:42", name: "Bank Manager", status: "VERIFIED", suspect: false },
                { time: "23:05", name: "Passerby Witness", status: "QUESTIONED", suspect: false }
            ],
            taskPrompt: "Filter the visitor logs by the unverified status flag shown on the suspect's record.",
            codeLines: [
                "// Flag unverified scene presence",
                "for (const log of logs) {",
                "  if (log.status === \"{{BLANK}}\") {",
                "    flagSuspect(log);",
                "  }",
                "}"
            ],
            blankAnswer: "AT SCENE",
            blankPlaceholder: "STATUS",
            blankHint: "Look at the red-flagged STATUS value on the Vault Tech entry: AT SCENE.",
            puzzleSolved: false,
            taskCompleted: false,
            commitMessage: ""
        },
        videologs: {
            title: "Lead #2: CCTV Security Feed",
            subtitle: "CAMERA TELEMETRY",
            pinPos: { x: 700, y: 148 },
            tilt: 0.04,
            logs: [
                { time: "22:12", name: "Cam_04_Hallway", status: "NORMAL", suspect: false },
                { time: "22:15", name: "Cam_01_Vault", status: "SIGNAL CUT", suspect: true },
                { time: "22:20", name: "Cam_02_Lobby", status: "NORMAL", suspect: false }
            ],
            taskPrompt: "Scan the camera telemetry feeds for the fault status indicating tampering.",
            codeLines: [
                "// CCTV Feed Tamper Watchdog",
                "for (const cam of feeds) {",
                "  if (cam.status === \"{{BLANK}}\") {",
                "    alertForensics(cam.id);",
                "  }",
                "}"
            ],
            blankAnswer: "SIGNAL CUT",
            blankPlaceholder: "STATUS",
            blankHint: "Check the fault status reported by Cam_01_Vault: SIGNAL CUT.",
            puzzleSolved: false,
            taskCompleted: false,
            commitMessage: ""
        },
        witness1: {
            title: "Lead #3: Alleyway Witness Statement",
            subtitle: "GETAWAY VEHICLE",
            pinPos: { x: 272, y: 392 },
            tilt: 0.05,
            logs: [
                { quote: "\"At 22:19, a matte-black sedan sped out of the rear vault alley. I caught the first three characters on the plate: X99!\"" }
            ],
            taskPrompt: "Query the traffic camera ALPR records using the partial license plate prefix from the witness.",
            codeLines: [
                "// Traffic Cam ALPR Prefix Query",
                "const matches = trafficLogs.filter(car =>",
                "  car.plate.startsWith(\"{{BLANK}}\")",
                ");"
            ],
            blankAnswer: "X99",
            blankPlaceholder: "PREFIX",
            blankHint: "Witness #1 caught the first three characters of the getaway plate: X99.",
            puzzleSolved: false,
            taskCompleted: false,
            commitMessage: ""
        },
        witness2: {
            title: "Lead #4: Night Supervisor Testimony",
            subtitle: "OVERRIDE CLEARANCE",
            pinPos: { x: 696, y: 395 },
            tilt: -0.04,
            logs: [
                { quote: "\"After 22:00, only a senior Vault Tech has OVERRIDE clearance to bypass the electronic vault lock.\"" }
            ],
            taskPrompt: "Audit the vault access logs for the elevated clearance level used to bypass the lock.",
            codeLines: [
                "// Vault Access Privilege Audit",
                "const breach = vaultLogs.find(entry =>",
                "  entry.clearance === \"{{BLANK}}\"",
                ");"
            ],
            blankAnswer: "OVERRIDE",
            blankPlaceholder: "CLEARANCE",
            blankHint: "Check the clearance level named in the Night Supervisor's testimony: OVERRIDE.",
            puzzleSolved: false,
            taskCompleted: false,
            commitMessage: ""
        }
    };
}

window.GameState = {
    currentView: "DESK",
    currentStep: 1,
    activeBranch: "main",
    branches: {
        main: { pinned: true, merged: true }
    },
    evidenceFiles: createInitialEvidenceFiles()
};

function setCookie(name, value, days) {
    try {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
    } catch (e) {}
}

function getCookie(name) {
    try {
        const prefix = `${name}=`;
        const parts = document.cookie.split(";");
        for (let c of parts) {
            c = c.trim();
            if (c.indexOf(prefix) === 0) return decodeURIComponent(c.substring(prefix.length));
        }
    } catch (e) {}
    return null;
}

function resetLevel1State() {
    window.GameState.currentView = "DESK";
    window.GameState.currentStep = 1;
    window.GameState.activeBranch = "main";
    window.GameState.branches = {
        main: { pinned: true, merged: true }
    };
    window.GameState.evidenceFiles = createInitialEvidenceFiles();
}

function saveProgress() {
    try {
        const evState = {};
        Object.keys(window.GameState.evidenceFiles).forEach(k => {
            const ev = window.GameState.evidenceFiles[k];
            evState[k] = {
                puzzleSolved: !!ev.puzzleSolved,
                taskCompleted: !!ev.taskCompleted,
                commitMessage: ev.commitMessage || ""
            };
        });

        const payload = JSON.stringify({
            seenCommands: Array.from(seenCommands),
            currentView: window.GameState.currentView,
            currentStep: window.GameState.currentStep,
            activeBranch: window.GameState.activeBranch,
            branches: window.GameState.branches,
            evState
        });

        try { localStorage.setItem(SAVE_KEY, payload); } catch (e) {}
        setCookie(SAVE_KEY, payload, 30);
    } catch (e) {}
}

function loadProgress() {
    try {
        let raw = null;
        try { raw = localStorage.getItem(SAVE_KEY); } catch (e) {}
        if (!raw) raw = getCookie(SAVE_KEY);
        if (!raw) return;

        const data = JSON.parse(raw);
        if (Array.isArray(data.seenCommands)) {
            seenCommands.clear();
            data.seenCommands.forEach(c => seenCommands.add(c));
        }
        if (data.currentView) window.GameState.currentView = data.currentView;
        if (data.currentStep) window.GameState.currentStep = data.currentStep;
        if (data.activeBranch) window.GameState.activeBranch = data.activeBranch;
        if (data.branches) window.GameState.branches = data.branches;

        if (data.evState) {
            Object.keys(data.evState).forEach(k => {
                if (window.GameState.evidenceFiles[k]) {
                    window.GameState.evidenceFiles[k].puzzleSolved = !!data.evState[k].puzzleSolved;
                    window.GameState.evidenceFiles[k].taskCompleted = !!data.evState[k].taskCompleted;
                    window.GameState.evidenceFiles[k].commitMessage = data.evState[k].commitMessage || "";
                }
            });
        }
    } catch (e) {}
}