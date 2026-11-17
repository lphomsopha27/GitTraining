let audioCtx = null;
let soundEnabled = false;
let isHelperOpen = false;
let isCommitModalOpen = false;
let isHintOpen = false;
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

function isAnyModalOpen() {
    return isHelperOpen || isCommitModalOpen || isHintOpen;
}

// ==================== HOME & SUB-VIEWS ====================
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
    syncCodePuzzleOverlay();
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

    syncCodePuzzleOverlay();
    updateInstructionBanner();
    const input = document.getElementById("terminal-input");
    if (input) input.focus();
}

// ==================== FILL-IN-THE-BLANK CODE PUZZLE ====================
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function syncCodePuzzleOverlay() {
    const state = window.GameState;
    const overlay = document.getElementById("code-puzzle-overlay");
    const linesContainer = document.getElementById("code-puzzle-lines");
    const feedbackEl = document.getElementById("code-puzzle-feedback");
    const verifyBtn = document.getElementById("code-verify-btn");

    if (!overlay || !linesContainer) return;

    if (state.currentView !== "EVIDENCE_PORTAL" || !state.evidenceFiles[state.activeBranch]) {
        overlay.classList.add("hidden");
        return;
    }

    const ev = state.evidenceFiles[state.activeBranch];
    overlay.classList.remove("hidden");

    linesContainer.innerHTML = ev.codeLines.map((rawLine, idx) => {
        const lineNum = `<span class="text-gray-500 select-none mr-2.5">${idx + 1}</span>`;
        const isComment = rawLine.trim().startsWith("//");

        if (rawLine.includes("{{BLANK}}")) {
            const parts = rawLine.split("{{BLANK}}");
            const safeBefore = escapeHtml(parts[0]).replace(/ /g, "&nbsp;");
            const safeAfter = escapeHtml(parts[1]).replace(/ /g, "&nbsp;");

            if (ev.puzzleSolved) {
                return `<div class="leading-relaxed whitespace-nowrap">${lineNum}<span>${safeBefore}</span><span class="px-1.5 py-0.5 bg-emerald-900/60 border border-emerald-400 text-emerald-300 font-bold">${escapeHtml(ev.blankAnswer)}</span><span>${safeAfter}</span></div>`;
            }

            return `<div class="leading-relaxed whitespace-nowrap">${lineNum}<span>${safeBefore}</span><input id="code-blank-input" type="text" autocomplete="off" placeholder="${ev.blankPlaceholder || "???"}" class="mx-0.5 px-1.5 py-0.5 w-28 bg-[#121929] border-2 border-[#facc15] focus:border-[#38bdf8] text-[#fde047] font-code text-xs sm:text-sm outline-none" /><span>${safeAfter}</span></div>`;
        }

        const formatted = escapeHtml(rawLine).replace(/ /g, "&nbsp;");
        return `<div class="leading-relaxed whitespace-nowrap ${isComment ? "text-[#6a9955]" : "text-[#58a6ff]"}">${lineNum}${formatted}</div>`;
    }).join("");

    if (ev.puzzleSolved) {
        feedbackEl.textContent = "✓ Verified! Run 'git commit'";
        feedbackEl.className = "font-terminal text-sm sm:text-base text-emerald-400 truncate";
        verifyBtn.textContent = "SOLVED ✓";
        verifyBtn.disabled = true;
        verifyBtn.className = "px-2.5 py-0.5 bg-emerald-900/60 text-emerald-300 font-pixel text-[9px] sm:text-[10px] border border-emerald-500/50 shrink-0";
    } else {
        feedbackEl.textContent = "Fill in the blank using the clue on the left";
        feedbackEl.className = "font-terminal text-sm sm:text-base text-gray-400 truncate";
        verifyBtn.textContent = "VERIFY";
        verifyBtn.disabled = false;
        verifyBtn.className = "px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-[9px] sm:text-[10px] border border-emerald-300 shrink-0 cursor-pointer";

        const blankInput = document.getElementById("code-blank-input");
        if (blankInput) {
            blankInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    verifyCodePuzzle();
                }
            });
        }
    }
}

function verifyCodePuzzle() {
    const state = window.GameState;
    const ev = state.evidenceFiles[state.activeBranch];
    const blankInput = document.getElementById("code-blank-input");
    const feedbackEl = document.getElementById("code-puzzle-feedback");

    if (!ev || ev.puzzleSolved || !blankInput) return;

    const cleaned = blankInput.value.trim().replace(/^["'#]+|["']+$/g, "").toUpperCase();
    const expected = ev.blankAnswer.trim().replace(/^["'#]+|["']+$/g, "").toUpperCase();

    if (cleaned === expected) {
        ev.puzzleSolved = true;
        saveProgress();
        syncCodePuzzleOverlay();
        updateInstructionBanner();
        playBeep(660, "triangle", 0.14);
        window.writeOutput(`[analyzer] Code verified on '${state.activeBranch}'. Ready to run 'git commit'.`, "text-emerald-400");

        const termInput = document.getElementById("terminal-input");
        if (termInput) termInput.focus();
    } else {
        feedbackEl.textContent = "✕ Mismatch — check the evidence log on the left!";
        feedbackEl.className = "font-terminal text-sm sm:text-base text-rose-400 truncate";
        blankInput.classList.remove("border-[#facc15]");
        blankInput.classList.add("border-rose-500");
        playBeep(220, "sawtooth", 0.14);
        blankInput.focus();
    }
}

// ==================== COMMIT MESSAGE MODAL ====================
function openCommitModal() {
    const state = window.GameState;
    const modal = document.getElementById("commit-modal-overlay");
    const branchLabel = document.getElementById("commit-branch-label");
    const msgInput = document.getElementById("commit-msg-input");
    const errEl = document.getElementById("commit-modal-error");

    if (!modal || !msgInput) return;

    branchLabel.textContent = `branch: ${state.activeBranch}`;
    msgInput.value = "";
    errEl.classList.add("hidden");

    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.classList.add("opacity-30", "brightness-50", "pointer-events-none");

    modal.classList.remove("hidden");
    isCommitModalOpen = true;
    playBeep(540, "triangle", 0.08);
    setTimeout(() => msgInput.focus(), 20);
}

function closeCommitModal() {
    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.classList.remove("opacity-30", "brightness-50", "pointer-events-none");

    document.getElementById("commit-modal-overlay").classList.add("hidden");
    isCommitModalOpen = false;

    const input = document.getElementById("terminal-input");
    if (input && isGameActive && !isAnyModalOpen()) input.focus();
}

function finalizeCommit(message) {
    const state = window.GameState;
    const ev = state.evidenceFiles[state.activeBranch];
    if (!ev) return;

    ev.taskCompleted = true;
    ev.commitMessage = message;
    if (state.currentStep === 4 && state.activeBranch === "atTheScene") {
        state.currentStep = 5;
    }

    updateInstructionBanner();
    saveProgress();

    window.writeOutput(`[${state.activeBranch} 7c3e91a] ${message}`, "text-[#2ea44f]");
    showHelperCard("commit");
}

function submitCommitMessage() {
    const msgInput = document.getElementById("commit-msg-input");
    const errEl = document.getElementById("commit-modal-error");
    if (!msgInput) return;

    const msg = msgInput.value.trim();
    if (msg.length < 3) {
        errEl.classList.remove("hidden");
        playBeep(220, "sawtooth", 0.12);
        msgInput.focus();
        return;
    }

    closeCommitModal();
    finalizeCommit(msg);
}

// ==================== DETECTIVE HINT MODAL ====================
function getContextualHint() {
    const state = window.GameState;
    const allKeys = Object.keys(state.evidenceFiles);
    const mergedCount = allKeys.filter(k => state.branches[k] && state.branches[k].merged).length;

    if (mergedCount === allKeys.length) {
        return {
            stage: "CASE SOLVED",
            body: "All 4 leads have been investigated, committed, and merged into main!",
            cmd: "Click MENU to inspect your badges or replay the case."
        };
    }

    if (state.currentView === "DESK") {
        return {
            stage: "STEP 1: INSPECT THE BOARD",
            body: "Check your repository status to walk over to the detective corkboard.",
            cmd: "git status"
        };
    }

    if (state.currentView === "EVIDENCE_PORTAL") {
        const branch = state.activeBranch;
        const ev = state.evidenceFiles[branch];

        if (!ev.puzzleSolved) {
            return {
                stage: `CODE PUZZLE (${branch})`,
                body: ev.blankHint,
                cmd: `Type "${ev.blankAnswer}" into the yellow code box and click VERIFY.`
            };
        }
        if (!ev.taskCompleted) {
            return {
                stage: `COMMIT FINDINGS (${branch})`,
                body: "Your forensic code fix is verified! Now seal your findings onto this branch.",
                cmd: "git commit"
            };
        }
        return {
            stage: "RETURN TO MAIN BOARD",
            body: "Your findings are committed on this branch. Switch back to main so you can merge them.",
            cmd: "git checkout main"
        };
    }

    const readyToMerge = allKeys.find(k => state.branches[k] && state.evidenceFiles[k].taskCompleted && !state.branches[k].merged);
    if (readyToMerge) {
        return {
            stage: `MERGE LEAD (${readyToMerge})`,
            body: `You committed findings on '${readyToMerge}'. Connect its red thread to the main suspect board.`,
            cmd: `git merge ${readyToMerge}`
        };
    }

    const nextLead = allKeys.find(k => !state.branches[k] || !state.branches[k].merged);
    if (nextLead) {
        if (!state.branches[nextLead]) {
            return {
                stage: `ISOLATE LEAD (${nextLead})`,
                body: `Create a dedicated investigation branch for '${nextLead}' before checking it out.`,
                cmd: `git branch ${nextLead}`
            };
        }
        return {
            stage: `INVESTIGATE LEAD (${nextLead})`,
            body: `Branch '${nextLead}' is pinned on the board. Switch into that branch to examine its evidence.`,
            cmd: `git checkout ${nextLead}`
        };
    }

    return {
        stage: "INVESTIGATION",
        body: "Use git status to inspect your current case state.",
        cmd: "git status"
    };
}

function openHintModal() {
    const hint = getContextualHint();
    document.getElementById("hint-stage-label").textContent = hint.stage;
    document.getElementById("hint-body-text").textContent = hint.body;
    document.getElementById("hint-cmd-box").textContent = `> ${hint.cmd}`;

    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.classList.add("opacity-30", "brightness-50", "pointer-events-none");

    document.getElementById("hint-modal-overlay").classList.remove("hidden");
    isHintOpen = true;
    playBeep(580, "triangle", 0.08);
}

function closeHintModal() {
    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.classList.remove("opacity-30", "brightness-50", "pointer-events-none");

    document.getElementById("hint-modal-overlay").classList.add("hidden");
    isHintOpen = false;

    const input = document.getElementById("terminal-input");
    if (input && isGameActive && !isAnyModalOpen()) input.focus();
}

// ==================== FIELD MANUAL MODAL ====================
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
    if (input && isGameActive && !isAnyModalOpen()) input.focus();
}

// ==================== TERMINAL & MISSION BANNER ====================
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
        syncCodePuzzleOverlay();
        updateInstructionBanner();
        saveProgress();
        return;
    }

    overlay.style.opacity = "1";
    setTimeout(() => {
        callback();
        syncCodePuzzleOverlay();
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

    const allKeys = Object.keys(state.evidenceFiles);
    const mergedCount = allKeys.filter(k => state.branches[k] && state.branches[k].merged).length;
    const allSolved = mergedCount === allKeys.length;
    const trainingWheelsOff = mergedCount >= 2;

    if (allSolved) {
        textEl.textContent = "🏆 CASE #104 SOLVED! All 4 evidence leads verified and merged into main.";
        banner.classList.replace("border-[#e1b12c]", "border-[#2ea44f]");
        textEl.classList.replace("text-[#fde047]", "text-[#2ea44f]");
        return;
    }

    banner.classList.replace("border-[#2ea44f]", "border-[#e1b12c]");
    textEl.classList.replace("text-[#2ea44f]", "text-[#fde047]");

    if (state.currentView === "DESK") {
        textEl.textContent = "🎯 Step 1: Type 'git status' to inspect the Corkboard.";
        return;
    }

    if (state.currentView === "EVIDENCE_PORTAL") {
        const ev = state.evidenceFiles[state.activeBranch];
        if (ev && !ev.puzzleSolved) {
            textEl.textContent = `🧩 Fill in the missing code value for '${state.activeBranch}' and click VERIFY.`;
        } else if (ev && !ev.taskCompleted) {
            textEl.textContent = "💾 Code verified! Type 'git commit' to log your commit message.";
        } else {
            textEl.textContent = trainingWheelsOff
                ? "🎯 Findings committed! Return to the main corkboard to merge."
                : "🎯 Findings committed! Return to the corkboard by typing 'git checkout main'.";
        }
        return;
    }

    const readyToMerge = allKeys.find(k => state.branches[k] && state.evidenceFiles[k].taskCompleted && !state.branches[k].merged);
    if (readyToMerge) {
        textEl.textContent = `🎯 File verified lead into main case by typing 'git merge ${readyToMerge}'.`;
        return;
    }

    const nextLead = allKeys.find(k => !state.branches[k] || !state.branches[k].merged);
    if (nextLead) {
        if (trainingWheelsOff) {
            const remaining = allKeys.filter(k => !state.branches[k] || !state.branches[k].merged);
            textEl.textContent = `🕵️ Training Wheels Off (${mergedCount}/4): Isolate & investigate '${remaining.join(", ")}' on your own!`;
        } else if (!state.branches[nextLead]) {
            textEl.textContent = `🎯 Lead ${mergedCount + 1}/4: Pin the lead by typing 'git branch ${nextLead}'.`;
        } else {
            textEl.textContent = `🎯 Lead ${mergedCount + 1}/4: Investigate lead by typing 'git checkout ${nextLead}'.`;
        }
    }
}

function handleGitCommand(subCmd, args, rawCmd) {
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
            return window.writeOutput(`error: branch '${target}' does not exist yet. Create it first with 'git branch ${target}'.`, "text-red-400");
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

        const ev = state.evidenceFiles[state.activeBranch];
        if (ev && !ev.puzzleSolved) {
            playBeep(220, "sawtooth", 0.14);
            return window.writeOutput("error: forensic script has an unsolved blank. Solve and verify the code puzzle first!", "text-red-400");
        }

        const mMatch = rawCmd.match(/git\s+commit\s+-m\s+["'](.+?)["']/);
        if (mMatch && mMatch[1].trim().length >= 3) {
            finalizeCommit(mMatch[1].trim());
            return;
        }

        openCommitModal();
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
    if (isAnyModalOpen() || !isGameActive) return;

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
            handleGitCommand(subCmd, parts.slice(2), rawCmd);
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
    syncCodePuzzleOverlay();
    updateInstructionBanner();

    const input = document.getElementById("terminal-input");
    const commitMsgInput = document.getElementById("commit-msg-input");

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (isCommitModalOpen) {
                e.preventDefault();
                closeCommitModal();
            } else if (isHintOpen) {
                e.preventDefault();
                closeHintModal();
            } else if (isHelperOpen) {
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

    if (commitMsgInput) {
        commitMsgInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                submitCommitMessage();
            }
        });
    }

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            submitTerminalInput();
        }
    });

    mainLoop();
});