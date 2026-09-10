function downloadBadge(studentName, questTitle, commitHash) {
  const certCanvas = document.createElement("canvas");
  certCanvas.width = 600; 
  certCanvas.height = 350;
  const ctx = certCanvas.getContext("2d");

  // Certificate Design
  ctx.fillStyle = "#1e1e2e"; 
  ctx.fillRect(0, 0, 600, 350);
  ctx.strokeStyle = "#ffcc00"; 
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 580, 330);

  // Text & Details
  ctx.fillStyle = "#ffffff"; 
  ctx.font = "bold 22px monospace";
  ctx.fillText(`🏆 GIT QUEST BADGE: ${questTitle}`, 40, 70);

  ctx.font = "16px monospace";
  ctx.fillText(`Awarded to: ${studentName}`, 40, 130);
  ctx.fillText(`Date Completed: ${new Date().toLocaleDateString()}`, 40, 170);
  ctx.fillText(`Verified Commit: ${commitHash.slice(0, 7)}`, 40, 210);

  // Trigger Download
  const downloadLink = document.createElement("a");
  downloadLink.download = `${studentName}_${questTitle}_badge.png`;
  downloadLink.href = certCanvas.toDataURL();
  downloadLink.click();
}