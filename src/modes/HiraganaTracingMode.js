/* ==========================================================================
   あそびモード 5: ひらがななぞりがき (Hiragana Stroke Order Tracing)
   ========================================================================== */

export class HiraganaTracingMode {
  constructor() {
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;

    this.charList = [
      {
        char: 'あ',
        word: 'あひる',
        icon: '🐥',
        strokes: [
          [{ x: 0.25, y: 0.35 }, { x: 0.75, y: 0.35 }],
          [{ x: 0.50, y: 0.20 }, { x: 0.48, y: 0.85 }],
          [{ x: 0.65, y: 0.48 }, { x: 0.35, y: 0.52 }, { x: 0.28, y: 0.70 }, { x: 0.48, y: 0.82 }, { x: 0.72, y: 0.70 }]
        ]
      },
      {
        char: 'い',
        word: 'いちご',
        icon: '🍓',
        strokes: [
          [{ x: 0.35, y: 0.25 }, { x: 0.30, y: 0.75 }],
          [{ x: 0.65, y: 0.32 }, { x: 0.68, y: 0.65 }]
        ]
      },
      {
        char: 'う',
        word: 'うさぎ',
        icon: '🐰',
        strokes: [
          [{ x: 0.45, y: 0.22 }, { x: 0.55, y: 0.28 }],
          [{ x: 0.35, y: 0.42 }, { x: 0.65, y: 0.48 }, { x: 0.55, y: 0.78 }, { x: 0.32, y: 0.82 }]
        ]
      },
      {
        char: 'え',
        word: 'えんぴつ',
        icon: '✏️',
        strokes: [
          [{ x: 0.45, y: 0.22 }, { x: 0.55, y: 0.28 }],
          [{ x: 0.30, y: 0.45 }, { x: 0.70, y: 0.45 }, { x: 0.32, y: 0.78 }, { x: 0.50, y: 0.72 }, { x: 0.72, y: 0.80 }]
        ]
      },
      {
        char: 'お',
        word: 'おにぎり',
        icon: '🍙',
        strokes: [
          [{ x: 0.25, y: 0.35 }, { x: 0.60, y: 0.35 }],
          [{ x: 0.42, y: 0.20 }, { x: 0.42, y: 0.72 }, { x: 0.28, y: 0.78 }, { x: 0.40, y: 0.85 }, { x: 0.62, y: 0.72 }],
          [{ x: 0.68, y: 0.32 }, { x: 0.78, y: 0.42 }]
        ]
      },
      {
        char: 'か',
        word: 'かめ',
        icon: '🐢',
        strokes: [
          [{ x: 0.30, y: 0.32 }, { x: 0.62, y: 0.32 }, { x: 0.55, y: 0.78 }],
          [{ x: 0.40, y: 0.22 }, { x: 0.30, y: 0.82 }],
          [{ x: 0.68, y: 0.28 }, { x: 0.78, y: 0.45 }]
        ]
      },
      {
        char: 'き',
        word: 'きりん',
        icon: '🦒',
        strokes: [
          [{ x: 0.30, y: 0.30 }, { x: 0.70, y: 0.30 }],
          [{ x: 0.32, y: 0.44 }, { x: 0.68, y: 0.44 }],
          [{ x: 0.55, y: 0.18 }, { x: 0.40, y: 0.68 }],
          [{ x: 0.35, y: 0.75 }, { x: 0.58, y: 0.82 }]
        ]
      },
      {
        char: 'く',
        word: 'くま',
        icon: '🐻',
        strokes: [
          [{ x: 0.65, y: 0.25 }, { x: 0.30, y: 0.50 }, { x: 0.65, y: 0.78 }]
        ]
      },
      {
        char: 'け',
        word: 'けーき',
        icon: '🎂',
        strokes: [
          [{ x: 0.30, y: 0.25 }, { x: 0.28, y: 0.80 }],
          [{ x: 0.50, y: 0.40 }, { x: 0.78, y: 0.40 }],
          [{ x: 0.65, y: 0.25 }, { x: 0.65, y: 0.80 }]
        ]
      },
      {
        char: 'こ',
        word: 'らいおん',
        icon: '🦁',
        strokes: [
          [{ x: 0.30, y: 0.32 }, { x: 0.70, y: 0.32 }],
          [{ x: 0.30, y: 0.70 }, { x: 0.70, y: 0.70 }]
        ]
      }
    ];

    this.charIndex = 0;
    this.currentStrokeIdx = 0;
    this.currentPointIdx = 0;

    this.completedStrokes = [];
    this.currentDrawnPoints = [];

    this.isCompleted = false;
    this.celebrationParticles = [];

    this.boxSize = 320;
    this.boxX = 0;
    this.boxY = 0;
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
  }

  updateBoxPos() {
    this.boxSize = Math.min(this.width * 0.7, this.height * 0.55, 360);
    this.boxX = (this.width - this.boxSize) / 2;
    this.boxY = (this.height - this.boxSize) / 2 + 10;
  }

  loadChar(index) {
    this.charIndex = (index + this.charList.length) % this.charList.length;
    this.currentStrokeIdx = 0;
    this.currentPointIdx = 0;
    this.completedStrokes = [];
    this.currentDrawnPoints = [];
    this.isCompleted = false;
    this.celebrationParticles = [];
  }

  getCanvasCoords(normPt) {
    return {
      x: this.boxX + normPt.x * this.boxSize,
      y: this.boxY + normPt.y * this.boxSize
    };
  }

  onTouch(x, y) {
    // Check Navigation Buttons
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
      this.processTracingPoint(x, y);
    }
  }

  onTouchMove(x, y) {
    if (this.isCompleted) return;
    this.processTracingPoint(x, y);
  }

  onTouchEnd() {
    // Keep currently drawn points if stroke not complete yet
  }

  processTracingPoint(x, y) {
    const currentChar = this.charList[this.charIndex];
    if (!currentChar || this.currentStrokeIdx >= currentChar.strokes.length) return;

    const stroke = currentChar.strokes[this.currentStrokeIdx];
    const targetNormPt = stroke[this.currentPointIdx];
    const targetPt = this.getCanvasCoords(targetNormPt);

    const dist = Math.hypot(x - targetPt.x, y - targetPt.y);
    const hitRadius = Math.max(36, this.boxSize * 0.14);

    if (dist < hitRadius) {
      // Point hit! Add to drawn path
      this.currentDrawnPoints.push(targetPt);
      this.currentPointIdx++;

      // Check if stroke is completed
      if (this.currentPointIdx >= stroke.length) {
        // Complete current stroke
        const fullStrokePoints = stroke.map(pt => this.getCanvasCoords(pt));
        this.completedStrokes.push(fullStrokePoints);
        this.currentDrawnPoints = [];

        this.soundSynth.playStrokeSuccess();
        this.currentStrokeIdx++;
        this.currentPointIdx = 0;

        // Check if all strokes in letter are completed!
        if (this.currentStrokeIdx >= currentChar.strokes.length) {
          this.triggerCompletion();
        }
      }
    }
  }

  triggerCompletion() {
    this.isCompleted = true;
    this.soundSynth.playCompleteFanfare();

    // Spawn celebration confetti & stars
    this.celebrationParticles = [];
    const colors = ['#FF6584', '#FF9F1C', '#FFD166', '#06D6A0', '#118AB2', '#A855F7'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      this.celebrationParticles.push({
        x: this.boxX + this.boxSize / 2,
        y: this.boxY + this.boxSize / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 12,
        alpha: 1
      });
    }
  }

  update() {
    // Update celebration particles
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

    // 1. Render Tracing Box Card
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.boxX, this.boxY, this.boxSize, this.boxSize, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFE0E9';
    ctx.stroke();

    // Dotted crosshairs inside tracing box
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.moveTo(this.boxX + this.boxSize / 2, this.boxY + 10);
    ctx.lineTo(this.boxX + this.boxSize / 2, this.boxY + this.boxSize - 10);
    ctx.moveTo(this.boxX + 10, this.boxY + this.boxSize / 2);
    ctx.lineTo(this.boxX + this.boxSize - 10, this.boxY + this.boxSize / 2);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 2. Render Header Title Banner (e.g. 「あ」 あひる 🐥)
    ctx.font = '900 28px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';
    ctx.fillText(`${currentChar.char} - ${currentChar.word} ${currentChar.icon}`, this.width / 2, this.boxY - 35);

    // 3. Render Background Guide Strokes (Light Gray Dotted Lines)
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    currentChar.strokes.forEach(stroke => {
      ctx.beginPath();
      stroke.forEach((pt, idx) => {
        const c = this.getCanvasCoords(pt);
        if (idx === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
      });
      ctx.stroke();
    });

    // 4. Render Completed Strokes (Vibrant Rainbow Pink)
    ctx.strokeStyle = '#FF6584';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.completedStrokes.forEach(strokePts => {
      ctx.beginPath();
      strokePts.forEach((c, idx) => {
        if (idx === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
      });
      ctx.stroke();
    });

    // Render In-Progress Drawn Stroke
    if (this.currentDrawnPoints.length > 0) {
      ctx.beginPath();
      this.currentDrawnPoints.forEach((c, idx) => {
        if (idx === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
      });
      ctx.stroke();
    }

    // 5. Render Stroke Order Numbers & Pulsing Guides (①, ②, ③)
    if (!this.isCompleted && this.currentStrokeIdx < currentChar.strokes.length) {
      currentChar.strokes.forEach((stroke, strokeIdx) => {
        if (strokeIdx >= this.currentStrokeIdx) {
          const startPt = this.getCanvasCoords(stroke[0]);
          const isActive = strokeIdx === this.currentStrokeIdx;

          // Start Circle Indicator
          ctx.beginPath();
          ctx.arc(startPt.x, startPt.y, isActive ? 18 : 14, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? '#FF9F1C' : '#94A3B8';
          ctx.fill();

          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(`${strokeIdx + 1}`, startPt.x, startPt.y);

          // Pulsing target indicator on active point
          if (isActive && stroke[this.currentPointIdx]) {
            const targetPt = this.getCanvasCoords(stroke[this.currentPointIdx]);
            const pulseR = 20 + Math.sin(Date.now() * 0.008) * 5;
            ctx.beginPath();
            ctx.arc(targetPt.x, targetPt.y, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = '#FF6584';
            ctx.lineWidth = 3.5;
            ctx.stroke();
          }
        }
      });
    }

    // 6. Navigation Buttons (◀ 前 のもじ / つぎ のもじ ▶)
    const prevBtn = { x: 50, y: this.height / 2, r: 35 };
    const nextBtn = { x: this.width - 50, y: this.height / 2, r: 35 };

    // Prev Btn
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

    // Next Btn
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

    // Reset Button
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

    // 7. Completion Celebration Banner
    if (this.isCompleted) {
      ctx.save();
      ctx.font = '900 48px "Zen Maru Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FF6584';
      ctx.fillText('できたね！👏✨', this.width / 2, this.boxY + this.boxSize / 2);
      ctx.restore();
    }

    // Celebration Particles
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
    this.completedStrokes = [];
    this.currentDrawnPoints = [];
    this.celebrationParticles = [];
  }
}
