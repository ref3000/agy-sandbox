/* ==========================================================================
   あそびモード 7: 都道府県パズル (Japanese Prefectures Touch & Snap Puzzle)
   ========================================================================== */

export class PrefecturePuzzleMode {
  constructor() {
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;

    this.mapImage = new Image();
    this.mapImage.src = './japan_map.png';

    this.activePiece = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.effects = [];
    this.isCompleted = false;

    // Relative coordinates mapped against the uploaded Japan map image
    this.prefecturesMaster = [
      {
        id: 'hokkaido',
        name: 'ほっかいどう',
        color: '#FF9F1C',
        badge: '🍈',
        mapRelX: 0.78,
        mapRelY: 0.17,
        w: 90, h: 70,
        path: [
          [-40, -30], [35, -35], [45, 10], [5, 35], [-35, 20]
        ]
      },
      {
        id: 'tokyo',
        name: 'とうきょう',
        color: '#FF477E',
        badge: '🗼',
        mapRelX: 0.65,
        mapRelY: 0.52,
        w: 75, h: 55,
        path: [
          [-30, -18], [30, -20], [25, 18], [-25, 20]
        ]
      },
      {
        id: 'aichi',
        name: 'あいち',
        color: '#FFD166',
        badge: '🏯',
        mapRelX: 0.55,
        mapRelY: 0.60,
        w: 70, h: 55,
        path: [
          [-25, -18], [25, -18], [20, 18], [-20, 20]
        ]
      },
      {
        id: 'osaka',
        name: 'おおさか',
        color: '#38BDF8',
        badge: '🐙',
        mapRelX: 0.44,
        mapRelY: 0.67,
        w: 65, h: 55,
        path: [
          [-22, -20], [22, -18], [18, 20], [-18, 18]
        ]
      },
      {
        id: 'kyoto',
        name: 'きょうと',
        color: '#A855F7',
        badge: '⛩️',
        mapRelX: 0.45,
        mapRelY: 0.58,
        w: 60, h: 60,
        path: [
          [-18, -25], [20, -20], [18, 25], [-20, 20]
        ]
      },
      {
        id: 'fukuoka',
        name: 'ふくおか',
        color: '#2ED573',
        badge: '🍜',
        mapRelX: 0.20,
        mapRelY: 0.79,
        w: 68, h: 55,
        path: [
          [-25, -18], [25, -20], [20, 18], [-20, 18]
        ]
      },
      {
        id: 'okinawa',
        name: 'おきなわ',
        color: '#00D2D3',
        badge: '🌺',
        mapRelX: 0.18,
        mapRelY: 0.22,
        w: 60, h: 50,
        path: [
          [-22, -14], [22, -18], [18, 14], [-18, 16]
        ]
      }
    ];

    this.pieces = [];
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;

    this.resetGame();
  }

  resetGame() {
    this.isCompleted = false;
    this.effects = [];
    this.activePiece = null;

    const mapSize = Math.min(this.width * 0.65, this.height * 0.68);
    const mapX = this.width / 2 - mapSize / 2;
    const mapY = this.height / 2 - mapSize / 2 + 10;

    // Clone pieces & assign initial floating tray positions
    this.pieces = this.prefecturesMaster.map((pref, idx) => {
      const targetX = mapX + pref.mapRelX * mapSize;
      const targetY = mapY + pref.mapRelY * mapSize;

      // Spawn in tray area at bottom
      const trayMargin = 50;
      const trayWidth = Math.max(200, this.width - trayMargin * 2);
      const pieceX = trayMargin + (idx / Math.max(1, this.prefecturesMaster.length - 1)) * (trayWidth - 50);
      const pieceY = this.height - 70 + (idx % 2 === 0 ? -12 : 12);

      return {
        ...pref,
        targetX,
        targetY,
        x: pieceX,
        y: pieceY,
        isFitted: false,
        scale: 1.0
      };
    });
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;

    const mapSize = Math.min(this.width * 0.65, this.height * 0.68);
    const mapX = this.width / 2 - mapSize / 2;
    const mapY = this.height / 2 - mapSize / 2 + 10;

    this.pieces.forEach(p => {
      p.targetX = mapX + p.mapRelX * mapSize;
      p.targetY = mapY + p.mapRelY * mapSize;
      if (p.isFitted) {
        p.x = p.targetX;
        p.y = p.targetY;
      }
    });
  }

  onTouch(x, y) {
    // Check Reset Button at top right
    const resetBtn = { x: this.width - 70, y: 70, w: 100, h: 36 };
    if (Math.abs(x - resetBtn.x) < resetBtn.w / 2 && Math.abs(y - resetBtn.y) < resetBtn.h / 2) {
      if (this.soundSynth) this.soundSynth.playPop();
      this.resetGame();
      return;
    }

    // Pick top-most unfitted piece
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      if (!p.isFitted) {
        const dist = Math.hypot(x - p.x, y - p.y);
        if (dist < 50) {
          this.activePiece = p;
          this.dragOffsetX = x - p.x;
          this.dragOffsetY = y - p.y;
          p.scale = 1.25;
          if (this.soundSynth) this.soundSynth.playPop();
          // Move picked piece to end of array for top z-index
          this.pieces.splice(i, 1);
          this.pieces.push(p);
          break;
        }
      }
    }
  }

  onTouchMove(x, y) {
    if (this.activePiece) {
      this.activePiece.x = x - this.dragOffsetX;
      this.activePiece.y = y - this.dragOffsetY;
    }
  }

  onTouchEnd() {
    if (this.activePiece) {
      const p = this.activePiece;
      p.scale = 1.0;

      // Check snap to target location
      const distToTarget = Math.hypot(p.x - p.targetX, p.y - p.targetY);

      if (distToTarget < 60) {
        // Snap!
        p.x = p.targetX;
        p.y = p.targetY;
        p.isFitted = true;

        if (this.soundSynth) this.soundSynth.playPeekABoo();
        this.speakPrefecture(p.name);
        this.spawnCelebration(p.x, p.y, [p.badge, '✨', '⭐', '🎉']);

        this.checkCompletion();
      }

      this.activePiece = null;
    }
  }

  speakPrefecture(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'ja-JP';
        msg.rate = 1.0;
        msg.pitch = 1.3;
        window.speechSynthesis.speak(msg);
      } catch (e) {}
    }
  }

  checkCompletion() {
    const allFitted = this.pieces.every(p => p.isFitted);
    if (allFitted && !this.isCompleted) {
      this.isCompleted = true;
      setTimeout(() => this.speakPrefecture('ぜんぶかんせい！すごいね！'), 500);
      this.spawnCelebration(this.width / 2, this.height / 2, ['🎉', '👑', '✨', '💖', '🍈', '🗼', '🐙']);
    }
  }

  spawnCelebration(x, y, symbols) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      this.effects.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 22 + Math.random() * 16,
        alpha: 1
      });
    }
  }

  update(width, height) {
    this.width = width;
    this.height = height;

    // Particle Burst Update
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.12;
      e.alpha -= 0.025;
      if (e.alpha <= 0) {
        this.effects.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // 1. Background Ocean Color
    ctx.fillStyle = '#E0F2FE';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle Map Grid Waves
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < this.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // 2. Render Uploaded Japan Map Image as Background Base
    const mapSize = Math.min(this.width * 0.65, this.height * 0.68);
    const mapX = this.width / 2 - mapSize / 2;
    const mapY = this.height / 2 - mapSize / 2 + 10;

    if (this.mapImage.complete && this.mapImage.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.drawImage(this.mapImage, mapX, mapY, mapSize, mapSize);
      ctx.restore();
    }

    // 3. Draw Target Outlines (Silhouette Map Slots)
    this.pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.targetX, p.targetY);

      ctx.beginPath();
      p.path.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      });
      ctx.closePath();

      // Target Silhouette Slot
      ctx.fillStyle = p.isFitted ? 'rgba(255, 255, 255, 0.45)' : 'rgba(203, 213, 225, 0.65)';
      ctx.fill();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#475569';
      ctx.stroke();
      ctx.setLineDash([]);

      // Label inside silhouette target
      if (!p.isFitted) {
        ctx.font = '700 12px "Zen Maru Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#334155';
        ctx.fillText(p.name, 0, 0);
      }

      ctx.restore();
    });

    // 4. Draw Prefecture Puzzle Pieces
    this.pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.scale, p.scale);

      ctx.beginPath();
      p.path.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      });
      ctx.closePath();

      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Shadow when dragging
      if (this.activePiece === p) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;
      }

      // Name & Specialty Badge inside fitted piece
      ctx.font = '700 13px "Zen Maru Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(p.name, 0, -6);

      ctx.font = '16px sans-serif';
      ctx.fillText(p.badge, 0, 10);

      ctx.restore();
    });

    // 5. Render Top Pill Status & Reset Button
    const fittedCount = this.pieces.filter(p => p.isFitted).length;
    const pillW = 250;
    const pillH = 40;
    const pillX = this.width / 2 - pillW / 2;
    const pillY = 65;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FF9F1C';
    ctx.stroke();

    ctx.font = '700 15px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';
    ctx.fillText(`🗾 とどうふけん (${fittedCount}/${this.pieces.length})`, this.width / 2, pillY + pillH / 2);

    // Reset Button (Top Right)
    const resetX = this.width - 70;
    const resetY = 70;
    ctx.beginPath();
    ctx.roundRect(resetX - 45, resetY - 18, 90, 36, 18);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38BDF8';
    ctx.stroke();

    ctx.font = '700 14px "Zen Maru Gothic", sans-serif';
    ctx.fillStyle = '#0284C7';
    ctx.fillText('🔄 リセット', resetX, resetY);

    // Completion Banner
    if (this.isCompleted) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(0, this.height / 2 - 50, this.width, 100);

      ctx.font = '900 32px "Zen Maru Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FF477E';
      ctx.fillText('🎉 ぜんぶかんせい！ すごいね！ 🎉', this.width / 2, this.height / 2);
      ctx.restore();
    }

    // 6. Celebration Effects
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

  destroy() {
    this.pieces = [];
    this.effects = [];
  }
}
