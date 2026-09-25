/* ==========================================================================
   あそびモード 5: ひらがななぞりがき (Exact Font Silhouette Tracing Mode)
   ========================================================================== */

export class HiraganaTracingMode {
  constructor() {
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;

    this.charList = [
      { char: 'あ', word: 'あひる', icon: '🐥', startPts: [{ x: 0.25, y: 0.35, n: 1 }, { x: 0.50, y: 0.20, n: 2 }, { x: 0.65, y: 0.45, n: 3 }] },
      { char: 'い', word: 'いちご', icon: '🍓', startPts: [{ x: 0.35, y: 0.25, n: 1 }, { x: 0.65, y: 0.32, n: 2 }] },
      { char: 'う', word: 'うさぎ', icon: '🐰', startPts: [{ x: 0.48, y: 0.22, n: 1 }, { x: 0.35, y: 0.42, n: 2 }] },
      { char: 'え', word: 'えんぴつ', icon: '✏️', startPts: [{ x: 0.48, y: 0.22, n: 1 }, { x: 0.30, y: 0.45, n: 2 }] },
      { char: 'お', word: 'おにぎり', icon: '🍙', startPts: [{ x: 0.25, y: 0.35, n: 1 }, { x: 0.42, y: 0.20, n: 2 }, { x: 0.68, y: 0.32, n: 3 }] },
      { char: 'か', word: 'かめ', icon: '🐢', startPts: [{ x: 0.28, y: 0.32, n: 1 }, { x: 0.40, y: 0.22, n: 2 }, { x: 0.68, y: 0.28, n: 3 }] },
      { char: 'き', word: 'きりん', icon: '🦒', startPts: [{ x: 0.30, y: 0.30, n: 1 }, { x: 0.32, y: 0.44, n: 2 }, { x: 0.55, y: 0.18, n: 3 }, { x: 0.35, y: 0.75, n: 4 }] },
      { char: 'く', word: 'くま', icon: '🐻', startPts: [{ x: 0.68, y: 0.25, n: 1 }] },
      { char: 'け', word: 'けーき', icon: '🎂', startPts: [{ x: 0.30, y: 0.25, n: 1 }, { x: 0.48, y: 0.40, n: 2 }, { x: 0.65, y: 0.25, n: 3 }] },
      { char: 'こ', word: 'らいおん', icon: '🦁', startPts: [{ x: 0.30, y: 0.32, n: 1 }, { x: 0.30, y: 0.70, n: 2 }] }
    ];

    this.charIndex = 0;
    this.boxSize = 340;
    this.boxX = 0;
    this.boxY = 0;

    // Offscreen Canvas for Font Mask & User Traced Path
    this.maskCanvas = document.createElement('canvas');
    this.maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: true });

    this.traceCanvas = document.createElement('canvas');
    this.traceCtx = this.traceCanvas.getContext('2d');

    this.fontPixelsCount = 0;
    this.tracedRatio = 0;
    this.isCompleted = false;
    this.celebrationParticles = [];

    this.lastTouchPt = null;
    this.brushColors = ['#FF6584', '#FF9F1C', '#FFD166', '#06D6A0', '#118AB2', '#A855F7'];
    this.colorIdx = 0;
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;
    this.updateBoxPos();
    this.loadChar(this.charIndex);
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.updateBoxPos();
    this.loadChar(this.charIndex);
  }

  updateBoxPos() {
    this.boxSize = Math.min(this.width * 0.75, this.height * 0.60, 380);
    this.boxX = (this.width - this.boxSize) / 2;
    this.boxY = (this.height - this.boxSize) / 2 + 10;

    this.maskCanvas.width = this.boxSize;
    this.maskCanvas.height = this.boxSize;
    this.traceCanvas.width = this.boxSize;
    this.traceCanvas.height = this.boxSize;
  }

  loadChar(index) {
    this.charIndex = (index + this.charList.length) % this.charList.length;
    this.isCompleted = false;
    this.celebrationParticles = [];
    this.tracedRatio = 0;
    this.lastTouchPt = null;

    const currentChar = this.charList[this.charIndex];

    // 1. Generate Font Silhouette Mask in Offscreen Canvas
    this.maskCtx.clearRect(0, 0, this.boxSize, this.boxSize);
    this.maskCtx.font = `900 ${this.boxSize * 0.72}px "Zen Maru Gothic", -apple-system, sans-serif`;
    this.maskCtx.textAlign = 'center';
    this.maskCtx.textBaseline = 'middle';
    this.maskCtx.fillStyle = '#000000';
    this.maskCtx.fillText(currentChar.char, this.boxSize / 2, this.boxSize / 2 + 10);

    // Count font silhouette non-transparent pixels
    const imgData = this.maskCtx.getImageData(0, 0, this.boxSize, this.boxSize);
    let count = 0;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] > 30) count++;
    }
    this.fontPixelsCount = count || 1;

    // 2. Clear User Trace Canvas
    this.traceCtx.clearRect(0, 0, this.boxSize, this.boxSize);
  }

  onTouch(x, y) {
    // Navigation & Action Buttons Hit Tests
    const prevBtn = { x: 50, y: this.height / 2, r: 35 };
    const nextBtn = { x: this.width - 50, y: this.height / 2, r: 35 };
    const resetBtn = { x: this.width / 2, y: this.boxY + this.boxSize + 45, w: 140, h: 44 };

    if (Math.hypot(x - prevBtn.x, y - prevBtn.y) < prevBtn.r) {
      this.loadChar(this.charIndex - 1);
      this.soundSynth.playTouchTone(2);
      return;
    }
    if (Math.hypot(x - nextBtn.x, y - nextBtn.y) < nextBtn.r) {
      this.loadChar(this.charIndex + 1);
      this.soundSynth.playTouchTone(6);
      return;
    }
    if (Math.abs(x - resetBtn.x) < resetBtn.w / 2 && Math.abs(y - resetBtn.y) < resetBtn.h / 2) {
      this.loadChar(this.charIndex);
      this.soundSynth.playTouchTone(4);
      return;
    }

    if (!this.isCompleted) {
      const localX = x - this.boxX;
      const localY = y - this.boxY;
      this.lastTouchPt = { x: localX, y: localY };
      this.paintStroke(localX, localY);
    }
  }

  onTouchMove(x, y) {
    if (this.isCompleted) return;
    const localX = x - this.boxX;
    const localY = y - this.boxY;
    this.paintStroke(localX, localY);
  }

  onTouchEnd() {
    this.lastTouchPt = null;
  }

  paintStroke(x, y) {
    if (x < 0 || x > this.boxSize || y < 0 || y > this.boxSize) {
      this.lastTouchPt = null;
      return;
    }

    const brushRadius = Math.max(24, this.boxSize * 0.08);

    // Draw vibrant brush on traceCtx
    this.traceCtx.save();
    this.traceCtx.lineCap = 'round';
    this.traceCtx.lineJoin = 'round';
    this.traceCtx.lineWidth = brushRadius * 2;
    this.traceCtx.strokeStyle = this.brushColors[this.colorIdx % this.brushColors.length];

    if (this.lastTouchPt) {
      this.traceCtx.beginPath();
      this.traceCtx.moveTo(this.lastTouchPt.x, this.lastTouchPt.y);
      this.traceCtx.lineTo(x, y);
      this.traceCtx.stroke();
    } else {
      this.traceCtx.beginPath();
      this.traceCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
      this.traceCtx.fillStyle = this.brushColors[this.colorIdx % this.brushColors.length];
      this.traceCtx.fill();
    }
    this.traceCtx.restore();

    this.lastTouchPt = { x, y };
    this.colorIdx++;

    // Calculate Traced Coverage Ratio
    this.checkCoverage();
  }

  checkCoverage() {
    const maskData = this.maskCtx.getImageData(0, 0, this.boxSize, this.boxSize).data;
    const traceData = this.traceCtx.getImageData(0, 0, this.boxSize, this.boxSize).data;

    let covered = 0;
    // Check overlap of trace pixels on font silhouette pixels
    for (let i = 3; i < maskData.length; i += 16) { // Step by 16 for performance
      if (maskData[i] > 30 && traceData[i] > 30) {
        covered++;
      }
    }

    const totalSampled = Math.ceil(this.fontPixelsCount / 4);
    this.tracedRatio = covered / totalSampled;

    // If 75%+ of font silhouette is painted/traced, trigger completion!
    if (this.tracedRatio > 0.75 && !this.isCompleted) {
      this.triggerCompletion();
    }
  }

  triggerCompletion() {
    this.isCompleted = true;
    this.soundSynth.playCompleteFanfare();

    // Fill entire font mask nicely upon completion
    this.traceCtx.save();
    this.traceCtx.globalCompositeOperation = 'source-over';
    this.traceCtx.fillStyle = '#FF6584';
    this.traceCtx.fillRect(0, 0, this.boxSize, this.boxSize);
    this.traceCtx.restore();

    // Celebration fireworks particles
    this.celebrationParticles = [];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      this.celebrationParticles.push({
        x: this.boxX + this.boxSize / 2,
        y: this.boxY + this.boxSize / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: this.brushColors[Math.floor(Math.random() * this.brushColors.length)],
        size: 8 + Math.random() * 12,
        alpha: 1
      });
    }
  }

  update() {
    for (let i = this.celebrationParticles.length - 1; i >= 0; i--) {
      const p = this.celebrationParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.alpha -= 0.018;

      if (p.alpha <= 0) {
        this.celebrationParticles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    const currentChar = this.charList[this.charIndex];
    if (!currentChar) return;

    // 1. Render Tracing Card Background
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.boxX, this.boxY, this.boxSize, this.boxSize, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFE0E9';
    ctx.stroke();

    // Dotted Grid Line Crosshairs
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.moveTo(this.boxX + this.boxSize / 2, this.boxY + 12);
    ctx.lineTo(this.boxX + this.boxSize / 2, this.boxY + this.boxSize - 12);
    ctx.moveTo(this.boxX + 12, this.boxY + this.boxSize / 2);
    ctx.lineTo(this.boxX + this.boxSize - 12, this.boxY + this.boxSize / 2);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 2. Render Header Banner (e.g. 「あ」- あひる 🐥)
    ctx.font = '900 28px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';
    ctx.fillText(`${currentChar.char} - ${currentChar.word} ${currentChar.icon}`, this.width / 2, this.boxY - 35);

    // 3. Render Base Font Silhouette (Soft Dotted Pink/Gray Template)
    ctx.save();
    ctx.font = `900 ${this.boxSize * 0.72}px "Zen Maru Gothic", -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 133, 162, 0.22)';
    ctx.fillText(currentChar.char, this.boxX + this.boxSize / 2, this.boxY + this.boxSize / 2 + 10);
    ctx.restore();

    // 4. Render User Traced Color (Clipped Exactly to the Font Silhouette!)
    ctx.save();
    // Composite traced user paint onto offscreen mask
    const renderCompCanvas = document.createElement('canvas');
    renderCompCanvas.width = this.boxSize;
    renderCompCanvas.height = this.boxSize;
    const compCtx = renderCompCanvas.getContext('2d');

    // Draw user traced colors
    compCtx.drawImage(this.traceCanvas, 0, 0);
    // Clip to font silhouette!
    compCtx.globalCompositeOperation = 'destination-in';
    compCtx.drawImage(this.maskCanvas, 0, 0);

    // Draw clipped rainbow traced font onto main canvas
    ctx.drawImage(renderCompCanvas, this.boxX, this.boxY);
    ctx.restore();

    // 5. Render Stroke Order Start Numbers (①, ②, ③)
    if (!this.isCompleted && currentChar.startPts) {
      currentChar.startPts.forEach(pt => {
        const px = this.boxX + pt.x * this.boxSize;
        const py = this.boxY + pt.y * this.boxSize;

        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#FF9F1C';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`${pt.n}`, px, py);
      });
    }

    // 6. Navigation Controls (◀ ▶ 🔄)
    const prevBtn = { x: 50, y: this.height / 2, r: 35 };
    const nextBtn = { x: this.width - 50, y: this.height / 2, r: 35 };

    ctx.beginPath();
    ctx.arc(prevBtn.x, prevBtn.y, prevBtn.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFCCD5';
    ctx.stroke();
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF6584';
    ctx.fillText('◀', prevBtn.x, prevBtn.y);

    ctx.beginPath();
    ctx.arc(nextBtn.x, nextBtn.y, nextBtn.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFCCD5';
    ctx.stroke();
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF6584';
    ctx.fillText('▶', nextBtn.x, nextBtn.y);

    const resetBtn = { x: this.width / 2, y: this.boxY + this.boxSize + 40, w: 140, h: 44 };
    ctx.beginPath();
    ctx.roundRect(resetBtn.x - resetBtn.w / 2, resetBtn.y - resetBtn.h / 2, resetBtn.w, resetBtn.h, 22);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();
    ctx.font = 'bold 16px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748B';
    ctx.fillText('🔄 もういちど', resetBtn.x, resetBtn.y);

    // 7. Celebration Screen on Completion
    if (this.isCompleted) {
      ctx.save();
      ctx.font = '900 44px "Zen Maru Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FF6584';
      ctx.fillText('できたね！👏✨', this.width / 2, this.boxY + this.boxSize / 2);
      ctx.restore();
    }

    // Celebration particles
    for (let i = 0; i < this.celebrationParticles.length; i++) {
      const p = this.celebrationParticles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  destroy() {
    this.celebrationParticles = [];
  }
}
