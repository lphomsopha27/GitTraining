let audioCtx = null;
let soundEnabled = false;
let isHelperOpen = false;
let isGameActive = false;

function toggleAudio() {
    soundEnabled = !soundEnabled;
    const gameBtn = document.getElementById("sound-btn");
    const homeBtn = document.getElementById("home-sound-btn");
    if (gameBtn) gameBtn.textContent = soundEnabled ? "🔊 ON" : "🔇 OFF";
    if (homeBtn) homeBtn.textContent = soundEnabled ? "🔊" : "🔇";

    if (soundEnabled && !audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep(freq = 440, type = "sine", duration = 0.08) {
    if (!soundEnabled || !audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function openSubView(viewName) {
    const titleView = document.getElementById("title-menu-view");
    const levelsView = document.getElementById("levels-subview");
    const achView = document.getElementById("achievements-subview");

    titleView.classList.add("hidden");
    levelsView.classList.add("hidden");
    achView.classList.add("hidden");

    if (viewName === "LEVELS") {
        refreshHomeScreen();
        levelsView.classList.remove("hidden");
    } else if (viewName === "ACHIEVEMENTS") {
        renderAchievements();
        achView.classList.remove("hidden");
    } else {
        refreshHomeScreen();
        titleView.classList.remove("hidden");
    }
    playBeep(500, "triangle", 0.06);
}

function openHomeScreen(subView = "TITLE") {
    isGameActive = false;
    document.getElementById("app-shell").classList.add("hidden");
    document.getElementById("home-screen").classList.remove("hidden");
    openSubView(subView);
}

function updateAchievementCounters() {
    const total = Object.keys(COMMAND_HELPERS).length;
    const unlocked = seenCommands.size;

    const gameCounter = document.getElementById("game-badge-counter");
    const titleBadges = document.getElementById("title-badges-stat");
    const summaryPill = document.getElementById("achievements-summary-pill");

    if (gameCounter) gameCounter.textContent = `${unlocked}/${total}`;
    if (titleBadges) titleBadges.textContent = `${unlocked}/${total} BADGES`;
    if (summaryPill) summaryPill.textContent = `${unlocked} / ${total} UNLOCKED`;
}

function refreshHomeScreen() {
    const state = window.GameState;
    const totalLeads = Object.keys(state.evidenceFiles).length;
    const mergedCount = Object.keys(state.evidenceFiles).filter(k => state.branches[k] && state.branches[k].merged).length;
    const hasStarted = state.currentStep > 1 || Object.keys(state.branches).length > 1;
    const allSolved = mergedCount === totalLeads;

    const titleLeads = document.getElementById("title-leads-stat");
    const badge = document.getElementById("level1-status-badge");
    const progressText = document.getElementById("level1-progress-text");
    const playBtn = document.getElementById("level1-play-btn");
    const replayBtn = document.getElementById("level1-replay-btn");

    if (titleLeads) titleLeads.textContent = `${mergedCount}/${totalLeads} LEADS`;
    if (progressText) progressText.textContent = `${mergedCount} / ${totalLeads}`;

    if (allSolved) {
        if (badge) {
            badge.textContent = "✓ SOLVED";
            badge.className = "px-2.5 py-0.5 bg-[#182d1e] text-emerald-400 border border-emerald-500/50 font-terminal text-base";
        }
        if (playBtn) playBtn.textContent = "▶ INSPECT";
        if (replayBtn) replayBtn.classList.remove("hidden");
    } else if (hasStarted) {
        if (badge) {
            badge.textContent = "● IN PROGRESS";
            badge.className = "px-2.5 py-0.5 bg-[#2b2310] text-[#fde047] border border-yellow-500/50 font-terminal text-base";
        }
        if (playBtn) playBtn.textContent = "▶ CONTINUE";
        if (replayBtn) replayBtn.classList.remove("hidden");
    } else {
        if (badge) {
            badge.textContent = "● READY";
            badge.className = "px-2.5 py-0.5 bg-[#162847] text-sky-300 border border-sky-500/50 font-terminal text-base";
        }
        if (playBtn) playBtn.textContent = "▶ START";
        if (replayBtn) replayBtn.classList.add("hidden");
    }

    updateAchievementCounters();
}

function renderAchievements() {
    const grid = document.getElementById("achievements-grid");
    if (!grid) return;

    grid.innerHTML = "";
    updateAchievementCounters();

    Object.keys(COMMAND_HELPERS).forEach(key => {
        const cmd = COMMAND_HELPERS[key];
        const isUnlocked = seenCommands.has(key);
        const card = document.createElement("div");

        if (isUnlocked) {
            card.className = "bg-[#10182b] border-2 border-[#facc15] p-3.5 flex flex-col justify-between shadow-lg";
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                        <span class="text-xl">${cmd.icon}</span>
                        <span class="px-2 py-0.5 bg-[#182d1e] text-emerald-400 border border-emerald-500/50 font-terminal text-sm font-bold">✓ LEARNED</span>
                    </div>
                    <div class="text-[#fde047] font-terminal font-bold text-xl">${cmd.title}</div>
                    <div class="text-white font-pixel text-[10px] mt-1 mb-1.5">${cmd.badgeName.toUpperCase()}</div>
                    <p class="text-gray-300 font-terminal text-base leading-snug">${cmd.metaphor}</p>
                </div>
                <div class="mt-2.5 pt-2 border-t border-[#1f2b42] text-sm font-terminal text-sky-300">
                    💻 ${cmd.git}
                </div>
            `;
        } else {
            const hintText = cmd.level === 2
                ? "🔒 Available in Level 02"
                : `🔒 Use '${cmd.title.split(" ")[0]} ${key}' in Level 01`;

            card.className = "bg-[#0c111f] border-2 border-[#232f47] p-3.5 flex flex-col justify-between opacity-65";
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                        <span class="text-xl">🔒</span>
                        <span class="px-2 py-0.5 bg-[#161e2e] text-gray-300 border border-[#2c3a57] font-terminal text-sm font-bold">LOCKED</span>
                    </div>
                    <div class="text-gray-300 font-terminal font-bold text-xl">${cmd.title}</div>
                    <div class="text-gray-400 font-pixel text-[10px] mt-1 mb-1.5">??? LOCKED</div>
                    <p class="text-gray-400 font-terminal text-base leading-snug">
                        Run this Git command during a case to unlock its badge.
                    </p>
                </div>
                <div class="mt-2.5 pt-2 border-t border-[#1a2234] text-sm font-terminal text-gray-400">
                    ${hintText}
                </div>
            `;
        }
        grid.appendChild(card);
    });
}

function resetAllProgress() {
    if (!confirm("Reset all saved progress and command badges?")) return;
    seenCommands.clear();
    resetLevel1State();

    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    setCookie(SAVE_KEY, "", -1);

    refreshHomeScreen();
    renderAchievements();
    updateInstructionBanner();
    playBeep(280, "sawtooth", 0.14);
}

function startLevel1(forceReset = false) {
    if (forceReset) {
        resetLevel1State();
        saveProgress();
    }

    document.getElementById("home-screen").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");
    isGameActive = true;

    const history = document.getElementById("terminal-history");
    if (history && history.children.length === 0) {
        window.writeOutput("detective-os v2.4 [repo: case-104-bank-heist]");
        window.writeOutput(
            window.GameState.currentStep > 1
                ? `Resumed session on branch '${window.GameState.activeBranch}'.`
                : "On branch main. Working tree clean.",
            window.GameState.currentStep > 1 ? "text-[#fde047]" : "text-gray-300"
        );
    }

    updateInstructionBanner();
    const input = document.getElementById("terminal-input");
    if (input) input.focus();
}

function showHelperCard(cmdKey) {
    if (seenCommands.has(cmdKey) || !COMMAND_HELPERS[cmdKey]) return;
    seenCommands.add(cmdKey);
    saveProgress();

    const info = COMMAND_HELPERS[cmdKey];
    document.getElementById("helper-cmd-title").textContent = info.title;
    document.getElementById("helper-cmd-tag").textContent = info.tag;
    document.getElementById("helper-metaphor-text").textContent = info.metaphor;
    document.getElementById("helper-git-text").textContent = info.git;

    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.classList.add("opacity-30", "brightness-50", "pointer-events-none");

    document.getElementById("helper-card-overlay").classList.remove("hidden");
    isHelperOpen = true;

    const input = document.getElementById("terminal-input");
    if (input) input.blur();
    playBeep(520, "triangle", 0.12);
}

function closeHelperCard() {
    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.classList.remove("opacity-30", "brightness-50", "pointer-events-none");

    document.getElementById("helper-card-overlay").classList.add("hidden");
    isHelperOpen = false;

    const input = document.getElementById("terminal-input");
    if (input && isGameActive) input.focus();
}

window.writeOutput = function(text, color = "text-gray-300") {
    const history = document.getElementById("terminal-history");
    if (!history) return;
    const line = document.createElement("div");
    line.className = `${color} whitespace-pre-wrap leading-tight font-terminal`;
    line.textContent = text;
    history.appendChild(line);
    history.scrollTop = history.scrollHeight;
    playBeep(600, "square", 0.03);
};

window.triggerScreenFade = function(callback) {
    const overlay = document.getElementById("fade-overlay");
    if (!overlay) {
        callback();
        updateInstructionBanner();
        saveProgress();
        return;
    }

    overlay.style.opacity = "1";
    setTimeout(() => {
        callback();
        updateInstructionBanner();
        saveProgress();
        setTimeout(() => { overlay.style.opacity = "0"; }, 100);
    }, 180);
};

function updateInstructionBanner() {
    const state = window.GameState;
    const banner = document.getElementById("instruction-banner");
    const textEl = document.getElementById("instruction-text");
    if (!banner || !textEl) return;

    const allSolved = Object.keys(state.evidenceFiles).every(k => state.branches[k] && state.branches[k].merged);

    if (allSolved) {
        textEl.textContent = "🏆 CASE #104 SOLVED! All 4 evidence leads verified and merged into main.";
        banner.classList.replace("border-[#e1b12c]", "border-[#2ea44f]");
        textEl.classList.replace("text-[#fde047]", "text-[#2ea44f]");
        return;
    }

    banner.classList.replace("border-[#2ea44f]", "border-[#e1b12c]");
    textEl.classList.replace("text-[#2ea44f]", "text-[#fde047]");

    const steps = {
        1: "🎯 Step 1: Type 'git status' to inspect the Corkboard.",
        2: "🎯 Step 2: Pin the crime scene lead by typing 'git branch atTheScene'.",
        3: "🎯 Step 3: Investigate lead by typing 'git checkout atTheScene'.",
        4: "🎯 Step 4: Document code findings by typing 'git commit'.",
        5: "🎯 Step 5: Return to the corkboard by typing 'git checkout main'.",
        6: "🎯 Step 6: File lead into main case by typing 'git merge atTheScene'."
    };
    textEl.textContent = steps[state.currentStep] || "🎯 Step 7: Pin, checkout, commit & merge remaining leads (videologs, witness1, witness2).";
}

function handleGitCommand(subCmd, args) {
    const state = window.GameState;

    if (subCmd === "status") {
        if (state.currentView === "DESK") {
            window.triggerScreenFade(() => {
                state.currentView = "CORKBOARD";
                if (state.currentStep === 1) state.currentStep = 2;
            });
        } else {
            saveProgress();
        }
        const unpinned = Object.keys(state.evidenceFiles).filter(k => !state.branches[k]);
        window.writeOutput(`On branch ${state.activeBranch}\nUnpinned leads remaining: ${unpinned.length > 0 ? unpinned.join(", ") : "none"}`);
        showHelperCard("status");
        return;
    }

    if (subCmd === "branch" && (args[0] === "-a" || !args[0])) {
        const branchList = Object.keys(state.branches).map(b => (b === state.activeBranch ? `* ${b}` : `  ${b}`)).join("\n");
        window.writeOutput(branchList, "text-[#58a6ff]");
        return;
    }

    if (subCmd === "branch") {
        const name = args[0];
        if (!state.evidenceFiles[name]) {
            return window.writeOutput(`fatal: '${name}' is not a valid lead. Available: atTheScene, videologs, witness1, witness2`, "text-red-400");
        }
        if (state.branches[name]) {
            return window.writeOutput(`fatal: A branch named '${name}' already exists.`, "text-yellow-400");
        }

        state.branches[name] = { pinned: true, merged: false };
        if (state.currentView === "DESK") state.currentView = "CORKBOARD";
        if (state.currentStep === 2 && name === "atTheScene") state.currentStep = 3;
        updateInstructionBanner();
        saveProgress();

        window.writeOutput(`Created branch '${name}' from main.`, "text-[#fde047]");
        showHelperCard("branch");
        return;
    }

    if (subCmd === "checkout") {
        const target = args[0];
        if (!target) return window.writeOutput("error: switch `checkout' requires a branch name", "text-red-400");

        if (target === "main") {
            state.activeBranch = "main";
            window.triggerScreenFade(() => {
                state.currentView = "CORKBOARD";
                if (state.currentStep === 5) state.currentStep = 6;
            });
            window.writeOutput("Switched to branch 'main'", "text-[#2ea44f]");
            showHelperCard("checkout");
            return;
        }

        if (!state.evidenceFiles[target]) {
            return window.writeOutput(`error: pathspec '${target}' did not match any known lead`, "text-red-400");
        }
        if (!state.branches[target]) {
            state.branches[target] = { pinned: true, merged: false };
        }

        state.activeBranch = target;
        window.triggerScreenFade(() => {
            state.currentView = "EVIDENCE_PORTAL";
            if ((state.currentStep === 2 || state.currentStep === 3) && target === "atTheScene") {
                state.currentStep = 4;
            }
        });

        window.writeOutput(`Switched to branch '${target}'`, "text-[#58a6ff]");
        showHelperCard("checkout");
        return;
    }

    if (subCmd === "commit") {
        if (state.activeBranch === "main") {
            return window.writeOutput("On branch main — nothing to commit, working tree clean", "text-yellow-400");
        }
        state.evidenceFiles[state.activeBranch].taskCompleted = true;
        if (state.currentStep === 4 && state.activeBranch === "atTheScene") state.currentStep = 5;
        updateInstructionBanner();
        saveProgress();

        window.writeOutput(`[${state.activeBranch} 7c3e91a] Logged forensic findings for ${state.activeBranch}`, "text-[#2ea44f]");
        showHelperCard("commit");
        return;
    }

    if (subCmd === "merge") {
        const target = args[0];
        if (!target) return window.writeOutput("fatal: No branch specified for merge.", "text-red-400");
        if (state.activeBranch !== "main") return window.writeOutput("error: Switch to 'main' before merging a lead branch.", "text-yellow-400");
        if (!state.branches[target]) return window.writeOutput(`merge: ${target} - not something we can merge`, "text-red-400");

        const ev = state.evidenceFiles[target];
        if (!ev || !ev.taskCompleted) {
            return window.writeOutput(`error: '${target}' has no committed findings to merge.`, "text-red-400");
        }

        state.branches[target].merged = true;
        if (state.currentView === "DESK") state.currentView = "CORKBOARD";
        if (state.currentStep === 6 && target === "atTheScene") state.currentStep = 7;
        updateInstructionBanner();
        saveProgress();

        window.writeOutput(`Updating 1a4b802..7c3e91a — Fast-forward: merged '${target}' into main.`, "text-[#eb3b5a]");
        showHelperCard("merge");

        const allMerged = Object.keys(state.evidenceFiles).every(k => state.branches[k] && state.branches[k].merged);
        if (allMerged) {
            window.writeOutput("CASE #104 SOLVED: All 4 leads verified and merged into main.", "text-[#2ea44f] font-bold");
        }
        return;
    }

    window.writeOutput(`git: '${subCmd}' is not a git command. See 'help'.`, "text-gray-400");
}

function submitTerminalInput() {
    if (isHelperOpen || !isGameActive) return;

    const input = document.getElementById("terminal-input");
    const rawCmd = input.value.trim();
    input.value = "";
    if (!rawCmd) return;

    window.writeOutput(`detective@case-files:~$ ${rawCmd}`, "text-[#58a6ff] font-bold");

    const parts = rawCmd.split(/\s+/);
    const mainCmd = parts[0];
    const subCmd = parts[1];

    if (mainCmd === "clear") {
        document.getElementById("terminal-history").innerHTML = "";
    } else if (mainCmd === "help") {
        window.writeOutput("Available commands: git status | git branch <lead> | git checkout <branch> | git commit | git merge <lead> | clear");
    } else if (mainCmd === "git") {
        if (!subCmd) {
            window.writeOutput("usage: git [status | branch | checkout | commit | merge]");
        } else {
            handleGitCommand(subCmd, parts.slice(2));
        }
    } else {
        window.writeOutput(`bash: ${mainCmd}: command not found`, "text-gray-400");
    }
}

function mainLoop() {
    if (isGameActive) {
        renderCanvasFrame();
    } else if (typeof renderHomeBgFrame === "function") {
        renderHomeBgFrame();
    }
    requestAnimationFrame(mainLoop);
}

document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    refreshHomeScreen();
    updateInstructionBanner();

    const input = document.getElementById("terminal-input");
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (isHelperOpen) {
                e.preventDefault();
                closeHelperCard();
            } else if (!isGameActive) {
                const titleView = document.getElementById("title-menu-view");
                if (titleView && titleView.classList.contains("hidden")) {
                    e.preventDefault();
                    openSubView("TITLE");
                }
            }
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            submitTerminalInput();
        }
    });

    mainLoop();
});