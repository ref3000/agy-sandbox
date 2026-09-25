/* ==========================================================================
   あそびモード 6: しましまぐるぐる風 絵本モード (High-Contrast Picture Book)
   ========================================================================== */

export class EhonMode {
  constructor() {
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;

    this.currentPageIndex = 0;
    this.targetPageIndex = 0;
    this.isFlipping = false;
    this.flipProgress = 0;
    this.flipDirection = 1; // +1: next, -1: prev

    this.touchStartX = 0;
    this.touchStartY = 0;

    this.rotationAngle = 0;
    this.effects = [];

    // 5 High-Contrast Picture Book Pages
    this.pages = [
      {
        id: 'shimashima',
        title: 'しましま ぐるぐる',
        bgType: 'stripes_diagonal',
        colors: ['#1A1E36', '#FFE066'],
        swirlColor: '#FF477E',
        face: '😊'
      },
      {
        id: 'mizutama',
        title: 'みずたま ぽん！',
        bgType: 'dots',
        colors: ['#FF4757', '#FFFFFF', '#1A1E36'],
        items: [
          { xRatio: 0.3, yRatio: 0.4, size: 70, color: '#FFFFFF', face: '🐶', scale: 1 },
          { xRatio: 0.7, yRatio: 0.35, size: 85, color: '#1A1E36', face: '🐱', scale: 1 },
          { xRatio: 0.5, yRatio: 0.7, size: 90, color: '#FFE066', face: '🐰', scale: 1 }
        ]
      },
      {
        id: 'osakana',
        title: 'おさかな すいすい',
        bgType: 'waves',
        colors: ['#0F172A', '#38BDF8'],
        fish: [
          { xRatio: 0.2, yRatio: 0.3, size: 65, color: '#FF9F1C', icon: '🐠', vx: 1.5 },
          { xRatio: 0.7, yRatio: 0.5, size: 75, color: '#FF477E', icon: '🐟', vx: -1.8 },
          { xRatio: 0.4, yRatio: 0.72, size: 60, color: '#2ED573', icon: '🐡', vx: 1.2 }
        ]
      },
      {
        id: 'kaokao',
        title: 'かお かお にっこり',
        bgType: 'split',
        colors: ['#FF477E', '#FFD166'],
        faces: [
          { xRatio: 0.32, yRatio: 0.5, size: 100, label: 'ねこ', face: '😸', blink: false },
          { xRatio: 0.68, yRatio: 0.5, size: 100, label: 'くま', face: '🐻', blink: false }
        ]
      },
      {
        id: 'hoshizora',
        title: 'ぐるぐる ほしぞら',
        bgType: 'galaxy',
        colors: ['#1E1035', '#4C1D95'],
        stars: [
          { xRatio: 0.25, yRatio: 0.35, size: 55, icon: '⭐', angle: 0 },
          { xRatio: 0.75, yRatio: 0.3, size: 65, icon: '🌟', angle: 0 },
          { xRatio: 0.5, yRatio: 0.65, size: 80, icon: '🌙', angle: 0 }
        ]
      }
    ];
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;

    this.currentPageIndex = 0;
    this.targetPageIndex = 0;
    this.isFlipping = false;
    this.flipProgress = 0;
    this.rotationAngle = 0;
    this.effects = [];
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
  }

  onTouch(x, y) {
    if (this.isFlipping) return;

    this.touchStartX = x;
    this.touchStartY = y;

    // Check Prev Page Button Click (Bottom Left)
    const prevBtn = { x: 75, y: this.height - 50, radius: 32 };
    if (Math.hypot(x - prevBtn.x, y - prevBtn.y) < prevBtn.radius) {
      this.prevPage();
      return;
    }

    // Check Next Page Button Click (Bottom Right)
    const nextBtn = { x: this.width - 75, y: this.height - 50, radius: 32 };
    if (Math.hypot(x - nextBtn.x, y - nextBtn.y) < nextBtn.radius) {
      this.nextPage();
      return;
    }

    // Interactive taps per page
    const page = this.pages[this.currentPageIndex];

    if (page.id === 'shimashima') {
      if (this.soundSynth) this.soundSynth.playPop();
      this.spawnSparkles(x, y, ['🌀', '✨', '💛', '💖']);
      page.face = page.face === '😊' ? '😜' : '😊';
    } else if (page.id === 'mizutama') {
      let hit = false;
      page.items.forEach(item => {
        const ix = item.xRatio * this.width;
        const iy = item.yRatio * this.height;
        if (Math.hypot(x - ix, y - iy) < item.size + 15) {
          hit = true;
          item.scale = 1.35;
          if (this.soundSynth) this.soundSynth.playPop();
          this.spawnSparkles(ix, iy, ['⚪', '🔴', '🟡', '✨']);
        }
      });
      if (!hit && this.soundSynth) {
        this.soundSynth.playTouchTone();
        this.spawnSparkles(x, y, ['✨', '🔴']);
      }
    } else if (page.id === 'osakana') {
      let hit = false;
      page.fish.forEach(f => {
        const fx = f.xRatio * this.width;
        const fy = f.yRatio * this.height;
        if (Math.hypot(x - fx, y - fy) < f.size + 15) {
          hit = true;
          f.vx *= -1.5;
          if (this.soundSynth) this.soundSynth.playPop();
          this.spawnSparkles(fx, fy, ['🫧', '💧', '🐟', '✨']);
        }
      });
      if (!hit && this.soundSynth) {
        this.soundSynth.playTouchTone();
        this.spawnSparkles(x, y, ['🫧', '✨']);
      }
    } else if (page.id === 'kaokao') {
      page.faces.forEach(f => {
        const fx = f.xRatio * this.width;
        const fy = f.yRatio * this.height;
        if (Math.hypot(x - fx, y - fy) < f.size + 20) {
          f.blink = true;
          setTimeout(() => f.blink = false, 600);
          if (this.soundSynth) this.soundSynth.playPeekABoo();
          this.spawnSparkles(fx, fy, ['😍', '❤️', '✨', '🌟']);
        }
      });
    } else if (page.id === 'hoshizora') {
      page.stars.forEach(s => {
        const sx = s.xRatio * this.width;
        const sy = s.yRatio * this.height;
        if (Math.hypot(x - sx, y - sy) < s.size + 20) {
          s.angle += Math.PI;
          if (this.soundSynth) this.soundSynth.playTouchTone(Math.floor(Math.random() * 8));
          this.spawnSparkles(sx, sy, ['⭐', '✨', '🌙', '💫']);
        }
      });
    }
  }

  onTouchEnd() {
    // Swipe gestures handled in onTouchMove / onTouchEnd if distance is significant
  }

  onTouchMove(x, y) {
    if (this.isFlipping) return;
    const dx = x - this.touchStartX;
    const dy = y - this.touchStartY;

    if (Math.abs(dx) > 80 && Math.abs(dy) < 60) {
      if (dx < 0) {
        this.nextPage();
      } else {
        this.prevPage();
      }
      this.touchStartX = x; // Reset swipe anchor
    }
  }

  nextPage() {
    if (this.isFlipping) return;
    this.targetPageIndex = (this.currentPageIndex + 1) % this.pages.length;
    this.startFlip(1);
  }

  prevPage() {
    if (this.isFlipping) return;
    this.targetPageIndex = (this.currentPageIndex - 1 + this.pages.length) % this.pages.length;
    this.startFlip(-1);
  }

  startFlip(direction) {
    this.isFlipping = true;
    this.flipProgress = 0;
    this.flipDirection = direction;

    if (this.soundSynth && this.soundSynth.playPageFlip) {
      this.soundSynth.playPageFlip();
    }
  }

  spawnSparkles(x, y, symbols) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.effects.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 20 + Math.random() * 15,
        alpha: 1
      });
    }
  }

  update(width, height) {
    this.width = width;
    this.height = height;

    this.rotationAngle += 0.02;

    // Page flip animation progress
    if (this.isFlipping) {
      this.flipProgress += 0.045;
      if (this.flipProgress >= 1) {
        this.flipProgress = 1;
        this.currentPageIndex = this.targetPageIndex;
        this.isFlipping = false;
      }
    }

    // Page 2 Fish Movement
    const fishPage = this.pages[2];
    fishPage.fish.forEach(f => {
      f.xRatio += (f.vx * 0.0015);
      if (f.xRatio > 0.88 || f.xRatio < 0.12) {
        f.vx *= -1;
      }
    });

    // Page 1 Item scale damping
    const dotPage = this.pages[1];
    dotPage.items.forEach(item => {
      item.scale += (1 - item.scale) * 0.1;
    });

    // Sparkle Effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.1;
      e.alpha -= 0.03;
      if (e.alpha <= 0) {
        this.effects.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    if (!this.isFlipping) {
      this.renderPageContent(ctx, this.currentPageIndex);
    } else {
      // 3D Page Flip Rendering Effect ("ペラっ")
      const foldX = this.flipDirection > 0
        ? this.width * (1 - this.flipProgress)
        : this.width * this.flipProgress;

      // 1. Draw Target Page Underneath
      this.renderPageContent(ctx, this.targetPageIndex);

      // 2. Draw Current Page Clipped up to foldX
      ctx.save();
      ctx.beginPath();
      if (this.flipDirection > 0) {
        ctx.rect(0, 0, foldX, this.height);
      } else {
        ctx.rect(foldX, 0, this.width - foldX, this.height);
      }
      ctx.clip();
      this.renderPageContent(ctx, this.currentPageIndex);
      ctx.restore();

      // 3. Draw Page Curl Shadow & Fold Line Edge
      ctx.save();
      const shadowW = Math.sin(this.flipProgress * Math.PI) * 70 + 20;

      const gradient = this.flipDirection > 0
        ? ctx.createLinearGradient(foldX - shadowW, 0, foldX, 0)
        : ctx.createLinearGradient(foldX, 0, foldX + shadowW, 0);

      if (this.flipDirection > 0) {
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      } else {
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
        gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.25)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = gradient;
      if (this.flipDirection > 0) {
        ctx.fillRect(foldX - shadowW, 0, shadowW, this.height);
      } else {
        ctx.fillRect(foldX, 0, shadowW, this.height);
      }

      // Bright Fold Curve Highlight Line
      ctx.beginPath();
      ctx.moveTo(foldX, 0);
      ctx.lineTo(foldX, this.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // Overlay Navigation UI (Top Pill & Bottom Corner Buttons)
    this.renderBookUI(ctx);

    // Particle Burst Effects
    for (let i = 0; i < this.effects.length; i++) {
      const e = this.effects[i];
      ctx.globalAlpha = Math.max(0, e.alpha);
      ctx.font = `${e.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.symbol, e.x, e.y);
    }

    ctx.restore();
  }

  renderPageContent(ctx, pageIndex) {
    const page = this.pages[pageIndex];

    // Background Rendering
    if (page.bgType === 'stripes_diagonal') {
      ctx.fillStyle = page.colors[0];
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = page.colors[1];
      const stripeWidth = 60;
      for (let x = -this.height; x < this.width + this.height; x += stripeWidth * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripeWidth, 0);
        ctx.lineTo(x + stripeWidth - this.height, this.height);
        ctx.lineTo(x - this.height, this.height);
        ctx.fill();
      }

      // Center Swirl & Face
      const cx = this.width / 2;
      const cy = this.height / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotationAngle);

      // Multi-color Swirl (ぐるぐる)
      const swirlColors = ['#FF477E', '#FFD166', '#38BDF8', '#2ED573'];
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 140 - i * 25, i * (Math.PI / 2), i * (Math.PI / 2) + Math.PI * 1.3);
        ctx.lineWidth = 22;
        ctx.strokeStyle = swirlColors[i];
        ctx.stroke();
      }
      ctx.restore();

      // Face inside swirl
      ctx.font = '110px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(page.face, cx, cy);

    } else if (page.bgType === 'dots') {
      ctx.fillStyle = page.colors[0];
      ctx.fillRect(0, 0, this.width, this.height);

      page.items.forEach(item => {
        const ix = item.xRatio * this.width;
        const iy = item.yRatio * this.height;

        ctx.save();
        ctx.translate(ix, iy);
        ctx.scale(item.scale, item.scale);

        ctx.beginPath();
        ctx.arc(0, 0, item.size, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();

        ctx.font = `${item.size * 1.1}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.face, 0, 3);

        ctx.restore();
      });

    } else if (page.bgType === 'waves') {
      ctx.fillStyle = page.colors[0];
      ctx.fillRect(0, 0, this.width, this.height);

      // Wavy background stripes
      ctx.fillStyle = page.colors[1];
      for (let y = 0; y < this.height + 80; y += 90) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= this.width; x += 40) {
          ctx.lineTo(x, y + Math.sin(x * 0.02 + this.rotationAngle + y) * 20);
        }
        ctx.lineTo(this.width, y + 45);
        ctx.lineTo(0, y + 45);
        ctx.fill();
      }

      // Swimming Fish
      page.fish.forEach(f => {
        const fx = f.xRatio * this.width;
        const fy = f.yRatio * this.height;

        ctx.font = `${f.size * 1.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.save();
        ctx.translate(fx, fy);
        if (f.vx < 0) ctx.scale(-1, 1);
        ctx.fillText(f.icon, 0, 0);
        ctx.restore();
      });

    } else if (page.bgType === 'split') {
      ctx.fillStyle = page.colors[0];
      ctx.fillRect(0, 0, this.width / 2, this.height);

      ctx.fillStyle = page.colors[1];
      ctx.fillRect(this.width / 2, 0, this.width / 2, this.height);

      page.faces.forEach(f => {
        const fx = f.xRatio * this.width;
        const fy = f.yRatio * this.height;

        ctx.font = `${f.size * 1.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.blink ? '😉' : f.face, fx, fy);
      });

    } else if (page.bgType === 'galaxy') {
      ctx.fillStyle = page.colors[0];
      ctx.fillRect(0, 0, this.width, this.height);

      // Spiral galaxy lines
      const cx = this.width / 2;
      const cy = this.height / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotationAngle * 0.5);

      ctx.lineWidth = 14;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.1) {
        const r = a * 18;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.stroke();
      ctx.restore();

      // Glowing Stars
      page.stars.forEach(s => {
        const sx = s.xRatio * this.width;
        const sy = s.yRatio * this.height;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(s.angle);
        ctx.font = `${s.size * 1.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.icon, 0, 0);
        ctx.restore();
      });
    }
  }

  renderBookUI(ctx) {
    const page = this.pages[this.currentPageIndex];

    // 1. Top Pill Badge: Title & Page Number
    const pillW = 240;
    const pillH = 40;
    const pillX = this.width / 2 - pillW / 2;
    const pillY = 65;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FF477E';
    ctx.stroke();

    ctx.font = '700 16px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1A1E36';
    ctx.fillText(`📖 ${page.title} (${this.currentPageIndex + 1}/${this.pages.length})`, this.width / 2, pillY + pillH / 2);
    ctx.restore();

    // 2. Bottom Left (Prev) & Bottom Right (Next) Corner Flip Buttons
    // Prev Button
    const prevBtn = { x: 65, y: this.height - 50, radius: 28 };
    ctx.save();
    ctx.beginPath();
    ctx.arc(prevBtn.x, prevBtn.y, prevBtn.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1A1E36';
    ctx.stroke();

    ctx.font = '700 18px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1A1E36';
    ctx.fillText('◀ まえ', prevBtn.x, prevBtn.y);
    ctx.restore();

    // Next Button
    const nextBtn = { x: this.width - 65, y: this.height - 50, radius: 28 };
    ctx.save();
    ctx.beginPath();
    ctx.arc(nextBtn.x, nextBtn.y, nextBtn.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FF477E';
    ctx.stroke();

    ctx.font = '700 18px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF477E';
    ctx.fillText('つぎ ▶', nextBtn.x, nextBtn.y);
    ctx.restore();
  }

  destroy() {
    this.effects = [];
  }
}
