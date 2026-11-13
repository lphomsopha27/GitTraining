const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Image Asset Manager
const images = {};
const assetPaths = {
    desk: "assets/desk.png",
    corkboard: "assets/corkboard.png",
    evidence_videologs: "assets/evidence_videologs.png",
    evidence_atscene: "assets/evidence_atscene.png",
    evidence_witness1: "assets/evidence_witness1.png",
    evidence_witness2: "assets/evidence_witness2.png"
};

// Preload images
Object.keys(assetPaths).forEach(key => {
    const img = new Image();
    img.src = assetPaths[key];
    img.onload = () => { images[key] = img; };
});

// Fade Transition Helper
window.triggerScreenFade = function(callback) {
    const overlay = document.getElementById("fade-overlay");
    if (!overlay) { callback(); return; }

    overlay.style.opacity = "1";
    setTimeout(() => {
        callback();
        setTimeout(() => {
            overlay.style.opacity = "0";
        }, 100);
    }, 400);
};

function drawPlaceholder(type, text) {
    ctx.fillStyle = type === "DESK" ? "#2b1e1a" : type === "CORKBOARD" ? "#3a2818" : "#1a2332";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`[ Placeholder: ${text} ]`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText("Drop your iPad PNG artwork into assets/", canvas.width / 2, canvas.height / 2 + 10);
}

function render() {
    const state = window.GameState;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.currentView === "DESK") {
        if (images.desk) {
            ctx.drawImage(images.desk, 0, 0, canvas.width, canvas.height);
        } else {
            drawPlaceholder("DESK", "desk.png");
        }
    } 
    else if (state.currentView === "CORKBOARD") {
        if (images.corkboard) {
            ctx.drawImage(images.corkboard, 0, 0, canvas.width, canvas.height);
        } else {
            drawPlaceholder("CORKBOARD", "corkboard.png");
            
            // Render central "WHO?"
            ctx.fillStyle = "#e1b12c";
            ctx.font = "bold 28px monospace";
            ctx.textAlign = "center";
            ctx.fillText("WHO?", canvas.width / 2, canvas.height / 2);
        }

        const centerPos = { x: canvas.width / 2, y: canvas.height / 2 };

        // Draw pinned evidence cards and red string connections
        Object.keys(state.evidenceFiles).forEach(key => {
            const ev = state.evidenceFiles[key];
            const branch = state.branches[key];

            if (branch && branch.pinned) {
                // Red string connection if merged
                if (branch.merged) {
                    ctx.strokeStyle = "#eb3b5a";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(centerPos.x, centerPos.y);
                    ctx.lineTo(ev.pinPos.x, ev.pinPos.y);
                    ctx.stroke();
                }

                // Polaroid Card
                ctx.fillStyle = "#f5f6fa";
                ctx.fillRect(ev.pinPos.x - 30, ev.pinPos.y - 20, 60, 40);
                ctx.fillStyle = "#2f3640";
                ctx.fillRect(ev.pinPos.x - 26, ev.pinPos.y - 16, 52, 28);

                // Pushpin
                ctx.fillStyle = "#e1b12c";
                ctx.beginPath();
                ctx.arc(ev.pinPos.x, ev.pinPos.y - 18, 4, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = "#2f3640";
                ctx.font = "bold 8px monospace";
                ctx.textAlign = "center";
                ctx.fillText(key, ev.pinPos.x, ev.pinPos.y + 16);
            }
        });
    } 
    else if (state.currentView === "EVIDENCE_PORTAL") {
        const evKey = state.activeBranch;
        const ev = state.evidenceFiles[evKey];

        if (images[ev.imageKey]) {
            ctx.drawImage(images[ev.imageKey], 0, 0, canvas.width, canvas.height);
        } else {
            drawPlaceholder("PORTAL", `${ev.imageKey}.png`);
        }

        // Overlay Title Bar
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, 36);
        ctx.fillStyle = "#e1b12c";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`🔍 ACTIVE PORTAL: ${ev ? ev.title : evKey}`, 16, 22);
    }

    requestAnimationFrame(render);
}

document.addEventListener("DOMContentLoaded", () => {
    render();
});