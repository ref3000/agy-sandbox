/* ==========================================================================
   あそびモード 5: ひらがないなぞりがき (High-Quality Smooth Hiragana Tracing)
   ========================================================================== */

export class HiraganaTracingMode {
  constructor() {
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;

    // Define characters with high-resolution Bezier curves for natural, smooth Hiragana
    this.charList = [
      {
        char: 'あ',
        word: 'あひる',
        icon: '🐥',
        strokes: [
          // 1st stroke: top horizontal line
          { type: 'line', points: [{ x: 0.22, y: 0.35 }, { x: 0.78, y: 0.35 }] },
          // 2nd stroke: vertical stem with slight curve
          { type: 'quad', points: [{ x: 0.50, y: 0.18 }, { x: 0.48, y: 0.50 }, { x: 0.46, y: 0.85 }] },
          // 3rd stroke: loop & curve
          {
            type: 'cubic',
            points: [
              { x: 0.65, y: 0.45 },
              { x: 0.25, y: 0.48 },
              { x: 0.20, y: 0.80 },
              { x: 0.50, y: 0.82 },
              { x: 0.78, y: 0.72 }
            ]
          }
        ]
      },
      {
        char: 'い',
        word: 'いちご',
        icon: '🍓',
        strokes: [
          // 1st stroke: left hook
          { type: 'quad', points: [{ x: 0.35, y: 0.25 }, { x: 0.26, y: 0.60 }, { x: 0.32, y: 0.78 }] },
          // 2nd stroke: right stroke
          { type: 'quad', points: [{ x: 0.65, y: 0.32 }, { x: 0.70, y: 0.52 }, { x: 0.68, y: 0.68 }] }
        ]
      },
      {
        char: 'う',
        word: 'うさぎ',
        icon: '🐰',
        strokes: [
          // 1st stroke: top dash
          { type: 'line', points: [{ x: 0.42, y: 0.22 }, { x: 0.58, y: 0.26 }] },
          // 2nd stroke: big arc
          {
            type: 'cubic',
            points: [
              { x: 0.32, y: 0.42 },
              { x: 0.72, y: 0.42 },
              { x: 0.65, y: 0.82 },
              { x: 0.30, y: 0.82 }
            ]
          }
        ]
      },
      {
        char: 'え',
        word: 'えんぴつ',
        icon: '✏️',
        strokes: [
          // 1st stroke: top dash
          { type: 'line', points: [{ x: 0.42, y: 0.22 }, { x: 0.58, y: 0.26 }] },
          // 2nd stroke: zig-zag & wave
          {
            type: 'multi',
            segments: [
              { type: 'line', points: [{ x: 0.28, y: 0.45 }, { x: 0.72, y: 0.45 }] },
              { type: 'line', points: [{ x: 0.72, y: 0.45 }, { x: 0.30, y: 0.76 }] },
              { type: 'quad', points: [{ x: 0.30, y: 0.76 }, { x: 0.52, y: 0.68 }, { x: 0.74, y: 0.80 }] }
            ]
          }
        ]
      },
      {
        char: 'お',
        word: 'おにぎり',
        icon: '🍙',
        strokes: [
          // 1st stroke: top horizontal
          { type: 'line', points: [{ x: 0.22, y: 0.35 }, { x: 0.60, y: 0.35 }] },
          // 2nd stroke: stem + loop
          {
            type: 'multi',
            segments: [
              { type: 'line', points: [{ x: 0.42, y: 0.20 }, { x: 0.42, y: 0.70 }] },
              { type: 'cubic', points: [{ x: 0.42, y: 0.70 }, { x: 0.22, y: 0.75 }, { x: 0.35, y: 0.88 }, { x: 0.65, y: 0.72 }] }
            ]
          },
          // 3rd stroke: right dot
          { type: 'line', points: [{ x: 0.68, y: 0.32 }, { x: 0.78, y: 0.42 }] }
        ]
      },
      {
        char: 'か',
        word: 'かめ',
        icon: '🐢',
        strokes: [
          // 1st stroke: main arc
          { type: 'quad', points: [{ x: 0.28, y: 0.32 }, { x: 0.65, y: 0.30 }, { x: 0.55, y: 0.78 }] },
          // 2nd stroke: vertical cross
          { type: 'quad', points: [{ x: 0.40, y: 0.22 }, { x: 0.32, y: 0.52 }, { x: 0.30, y: 0.80 }] },
          // 3rd stroke: right dash
          { type: 'line', points: [{ x: 0.68, y: 0.28 }, { x: 0.78, y: 0.45 }] }
        ]
      },
      {
        char: 'き',
        word: 'きりん',
        icon: '🦒',
        strokes: [
          { type: 'line', points: [{ x: 0.30, y: 0.30 }, { x: 0.70, y: 0.30 }] },
          { type: 'line', points: [{ x: 0.32, y: 0.44 }, { x: 0.68, y: 0.44 }] },
          { type: 'quad', points: [{ x: 0.55, y: 0.18 }, { x: 0.48, y: 0.45 }, { x: 0.40, y: 0.68 }] },
          { type: 'quad', points: [{ x: 0.35, y: 0.75 }, { x: 0.48, y: 0.82 }, { x: 0.62, y: 0.78 }] }
        ]
      },
      {
        char: 'く',
        word: 'くま',
        icon: '🐻',
        strokes: [
          { type: 'line', points: [{ x: 0.68, y: 0.25 }, { x: 0.30, y: 0.50 }] },
          { type: 'line', points: [{ x: 0.30, y: 0.50 }, { x: 0.68, y: 0.78 }] }
        ]
      },
      {
        char: 'け',
        word: 'けーき',
        icon: '🎂',
        strokes: [
          { type: 'quad', points: [{ x: 0.30, y: 0.25 }, { x: 0.26, y: 0.60 }, { x: 0.30, y: 0.80 }] },
          { type: 'line', points: [{ x: 0.48, y: 0.40 }, { x: 0.78, y: 0.40 }] },
          { type: 'line', points: [{ x: 0.65, y: 0.25 }, { x: 0.65, y: 0.80 }] }
        ]
      },
      {
        char: 'こ',
        word: 'らいおん',
        icon: '🦁',
        strokes: [
          { type: 'quad', points: [{ x: 0.30, y: 0.32 }, { x: 0.55, y: 0.30 }, { x: 0.70, y: 0.35 }] },
          { type: 'quad', points: [{ x: 0.30, y: 0.70 }, { x: 0.52, y: 0.72 }, { x: 0.70, y: 0.68 }] }
        ]
      }
    ];

    this.charIndex = 0;
    this.currentStrokeIdx = 0;
    this.completedStrokes = [];
    this.activeSampledPoints = []; // Fine-grained waypoints for current stroke
    this.tracedIndex = 0; // Progress along activeSampledPoints

    this.isCompleted = false;
    this.celebrationParticles = [];

    this.boxSize = 340;
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
    this.prepareActiveStrokePoints();
  }

  updateBoxPos() {
    this.boxSize = Math.min(this.width * 0.72, this.height * 0.58, 380);
    this.boxX = (this.width - this.boxSize) / 2;
    this.boxY = (this.height - this.boxSize) / 2 + 10;
  }

  loadChar(index) {
    this.charIndex = (index + this.charList.length) % this.charList.length;
    this.currentStrokeIdx = 0;
    this.completedStrokes = [];
    this.isCompleted = false;
    this.celebrationParticles = [];
    this.prepareActiveStrokePoints();
  }

  // Sample smooth dense points along Bezier curves
  sampleStrokePoints(strokeDef) {
    const rawPts = [];
    const step = 0.05; // 20 samples per curve segment

    const sampleSegment = (seg) => {
      if (seg.type === 'line') {
        const [p0, p1] = seg.points;
        for (let t = 0; t <= 1; t += step) {
          rawPts.push({
            x: p0.x + (p1.x - p0.x) * t,
            y: p0.y + (p1.y - p0.y) * t
          });
        }
      } else if (seg.type === 'quad') {
        const [p0, p1, p2] = seg.points;
        for (let t = 0; t <= 1; t += step) {
          const u = 1 - t;
          rawPts.push({
            x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
            y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
          });
        }
      } else if (seg.type === 'cubic') {
        const [p0, p1, p2, p3, p4] = seg.points;
        // If 5 points provided, split into 2 quads or 1 cubic
        if (seg.points.length === 5) {
          const q1 = { type: 'quad', points: [p0, p1, p2] };
          const q2 = { type: 'quad', points: [p2, p3, p4] };
          sampleSegment(q1);
          sampleSegment(q2);
        } else {
          const [cp0, cp1, cp2, cp3] = seg.points;
          for (let t = 0; t <= 1; t += step) {
            const u = 1 - t;
            rawPts.push({
              x: u*u*u*cp0.x + 3*u*u*t*cp1.x + 3*u*t*t*cp2.x + t*t*t*cp3.x,
              y: u*u*u*cp0.y + 3*u*u*t*cp1.y + 3*u*t*t*cp2.y + t*t*t*cp3.y
            });
          }
        }
      } else if (seg.type === 'multi') {
        seg.segments.forEach(s => sampleSegment(s));
      }
    };

    sampleSegment(strokeDef);

    // Convert normalized coordinates to canvas pixels
    return rawPts.map(pt => ({
      x: this.boxX + pt.x * this.boxSize,
      y: this.boxY + pt.y * this.boxSize
    }));
  }

  prepareActiveStrokePoints() {
    const currentChar = this.charList[this.charIndex];
    if (!currentChar || this.currentStrokeIdx >= currentChar.strokes.length) {
      this.activeSampledPoints = [];
      this.tracedIndex = 0;
      return;
    }

    const strokeDef = currentChar.strokes[this.currentStrokeIdx];
    this.activeSampledPoints = this.sampleStrokePoints(strokeDef);
    this.tracedIndex = 0;
  }

  onTouch(x, y) {
    // Navigation Buttons Hit Tests
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
      this.processTracing(x, y);
    }
  }

  onTouchMove(x, y) {
    if (this.isCompleted) return;
    this.processTracing(x, y);
  }

  processTracing(x, y) {
    if (!this.activeSampledPoints || this.activeSampledPoints.length === 0) return;

    const hitRadius = Math.max(42, this.boxSize * 0.15);

    // Look ahead from current tracedIndex
    for (let i = this.tracedIndex; i < Math.min(this.tracedIndex + 5, this.activeSampledPoints.length); i++) {
      const target = this.activeSampledPoints[i];
      const dist = Math.hypot(x - target.x, y - target.y);

      if (dist < hitRadius) {
        this.tracedIndex = i + 1;

        // Check if stroke completed (90%+ sampled waypoints hit)
        if (this.tracedIndex >= this.activeSampledPoints.length - 1) {
          this.completedStrokes.push(this.activeSampledPoints);
          this.soundSynth.playStrokeSuccess();

          this.currentStrokeIdx++;
          const currentChar = this.charList[this.charIndex];

          if (this.currentStrokeIdx >= currentChar.strokes.length) {
            this.triggerCompletion();
          } else {
            this.prepareActiveStrokePoints();
          }
        }
        break;
      }
    }
  }

  triggerCompletion() {
    this.isCompleted = true;
    this.soundSynth.playCompleteFanfare();

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

    // 1. Tracing Card Box Background
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

    // 2. High-Quality Font Stencil Template Background (Zen Maru Gothic font)
    ctx.save();
    ctx.font = `900 ${this.boxSize * 0.72}px "Zen Maru Gothic", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 133, 162, 0.15)'; // Soft pink font stencil
    ctx.fillText(currentChar.char, this.boxX + this.boxSize / 2, this.boxY + this.boxSize / 2 + 10);
    ctx.restore();

    // 3. Header Title Banner (e.g. 「あ」- あひる 🐥)
    ctx.font = '900 28px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';
    ctx.fillText(`${currentChar.char} - ${currentChar.word} ${currentChar.icon}`, this.width / 2, this.boxY - 35);

    // 4. Render Dotted Guide Lines for ALL strokes
    currentChar.strokes.forEach((strokeDef, sIdx) => {
      const sampled = this.sampleStrokePoints(strokeDef);
      if (sampled.length > 1) {
        ctx.beginPath();
        sampled.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = sIdx === this.currentStrokeIdx ? 'rgba(255, 159, 28, 0.35)' : 'rgba(203, 213, 225, 0.35)';
        ctx.lineWidth = 26;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    });

    // 5. Render Completed Strokes (Solid Vibrant Rainbow Pink)
    this.completedStrokes.forEach(pts => {
      if (pts.length > 1) {
        ctx.beginPath();
        pts.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = '#FF6584';
        ctx.lineWidth = 26;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    });

    // 6. Render Active In-Progress Traced Path
    if (this.tracedIndex > 0 && this.activeSampledPoints.length > 0) {
      ctx.beginPath();
      for (let i = 0; i < Math.min(this.tracedIndex, this.activeSampledPoints.length); i++) {
        const pt = this.activeSampledPoints[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = '#FF6584';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // 7. Render Stroke Order Numbers (①, ②, ③) & Animated Guide Star
    if (!this.isCompleted && this.currentStrokeIdx < currentChar.strokes.length) {
      currentChar.strokes.forEach((strokeDef, sIdx) => {
        if (sIdx >= this.currentStrokeIdx) {
          const sampled = this.sampleStrokePoints(strokeDef);
          if (sampled.length > 0) {
            const startPt = sampled[0];
            const isActive = sIdx === this.currentStrokeIdx;

            // Stroke Number Badge
            ctx.beginPath();
            ctx.arc(startPt.x, startPt.y, isActive ? 20 : 15, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? '#FF9F1C' : '#94A3B8';
            ctx.fill();

            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`${sIdx + 1}`, startPt.x, startPt.y);

            // Animated Sliding Star Guide on current stroke
            if (isActive && this.activeSampledPoints.length > 0) {
              const animSpeed = 0.0015;
              const progressT = (Date.now() * animSpeed) % 1;
              const guideIdx = Math.floor(progressT * (this.activeSampledPoints.length - 1));
              const guidePt = this.activeSampledPoints[guideIdx] || this.activeSampledPoints[0];

              ctx.font = '22px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('⭐', guidePt.x, guidePt.y);
            }
          }
        }
      });
    }

    // 8. Navigation UI Controls (◀ ▶ 🔄)
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

    // 9. Celebration Screen on Complete
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
    this.completedStrokes = [];
    this.activeSampledPoints = [];
    this.celebrationParticles = [];
  }
}
