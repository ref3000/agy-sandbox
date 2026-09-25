/* ==========================================================================
   Canvas Engine & Multi-Touch Particle Physics System (Optimized for iPad)
   ========================================================================== */

export class CanvasEngine {
  constructor(canvasElement, soundSynth) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.soundSynth = soundSynth;

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    this.particles = [];
    this.ripples = [];
    this.activeMode = null;
    this.isDragging = false;

    this.colors = ['#FF6584', '#FF9F1C', '#FFD166', '#06D6A0', '#118AB2', '#A855F7', '#38BDF8'];

    this.initCanvas();
    this.bindEvents();
    this.startLoop();
  }

  initCanvas() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.activeMode && this.activeMode.onResize) {
      this.activeMode.onResize(this.width, this.height);
    }
  }

  setMode(mode) {
    if (this.activeMode && this.activeMode.destroy) {
      this.activeMode.destroy();
    }
    this.activeMode = mode;
    if (this.activeMode && this.activeMode.init) {
      this.activeMode.init(this.width, this.height, this.soundSynth);
    }
  }

  bindEvents() {
    let isTouchDevice = false;

    const handleTouchStart = (e) => {
      isTouchDevice = true;
      this.isDragging = true;
      e.preventDefault();
      
      const rect = this.canvas.getBoundingClientRect();
      const changed = e.changedTouches ? Array.from(e.changedTouches) : [];

      for (let i = 0; i < changed.length; i++) {
        const touch = changed[i];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.handleSingleTouch(x, y, i);
      }
    };

    const handleTouchMove = (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touches = e.touches ? Array.from(e.touches) : [];
      if (touches.length > 0) {
        const touch = touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        if (this.activeMode && this.activeMode.onTouchMove) {
          this.activeMode.onTouchMove(x, y);
        }
      }
    };

    const handleTouchEnd = () => {
      this.isDragging = false;
      if (this.activeMode && this.activeMode.onTouchEnd) {
        this.activeMode.onTouchEnd();
      }
    };

    const handleMouseDown = (e) => {
      if (isTouchDevice) return;
      this.isDragging = true;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleSingleTouch(x, y, 0);
    };

    const handleMouseMove = (e) => {
      if (isTouchDevice || !this.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (this.activeMode && this.activeMode.onTouchMove) {
        this.activeMode.onTouchMove(x, y);
      }
    };

    const handleMouseUp = () => {
      if (isTouchDevice) return;
      this.isDragging = false;
      if (this.activeMode && this.activeMode.onTouchEnd) {
        this.activeMode.onTouchEnd();
      }
    };

    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    this.canvas.addEventListener('mousedown', handleMouseDown);
    this.canvas.addEventListener('mousemove', handleMouseMove);
    this.canvas.addEventListener('mouseup', handleMouseUp);
  }

  handleSingleTouch(x, y, index) {
    this.spawnTouchBurst(x, y);

    // Play Japanese Nursery Rhyme ("チューリップ") melody note on tap in Ponpon (Bubble Pop) mode
    if (this.activeMode && (this.activeMode.constructor.name === 'BubblePopMode' || this.activeMode.isBubbleMode)) {
      this.soundSynth.playNurseryMelodyNote();
    } else {
      const pitchIdx = Math.floor((x / Math.max(1, this.width)) * 11);
      this.soundSynth.playTouchTone(pitchIdx);
    }

    if (this.activeMode && this.activeMode.onTouch) {
      this.activeMode.onTouch(x, y, index);
    }
  }

  spawnTouchBurst(x, y) {
    if (this.ripples.length > 8) {
      this.ripples.shift();
    }

    this.ripples.push({
      x, y,
      radius: 6,
      maxRadius: 40 + Math.random() * 30,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      alpha: 1
    });

    if (this.particles.length > 25) {
      this.particles.splice(0, this.particles.length - 20);
    }

    const modeSymbols = (this.activeMode && this.activeMode.symbols) ? this.activeMode.symbols : null;

    const particleCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.4;
      const speed = 2.5 + Math.random() * 4.5;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      const symbol = modeSymbols ? modeSymbols[Math.floor(Math.random() * modeSymbols.length)] : null;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        color,
        symbol,
        size: symbol ? 12 + Math.random() * 6 : 8 + Math.random() * 10,
        alpha: 1
      });
    }
  }

  startLoop() {
    const loop = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.activeMode && this.activeMode.render) {
        this.activeMode.update(this.width, this.height);
        this.activeMode.render(this.ctx, this.width, this.height);
      }

      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.15;
        r.alpha -= 0.04;

        if (r.alpha <= 0) {
          this.ripples.splice(i, 1);
          continue;
        }

        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = r.color;
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = Math.max(0, r.alpha);
        this.ctx.stroke();
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.globalAlpha = Math.max(0, p.alpha);
        if (p.symbol) {
          this.ctx.font = `${p.size * 1.5}px sans-serif`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(p.symbol, p.x, p.y);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.fill();
        }
      }

      this.ctx.globalAlpha = 1.0;

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
