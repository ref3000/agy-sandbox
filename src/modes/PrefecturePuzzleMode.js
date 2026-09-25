/* ==========================================================================
   あそびモード 7: 47都道府県パズル (All 47 Japanese Prefectures Puzzle)
   ========================================================================== */

import { PREFECTURES } from '../data/prefecturesData.js';

export class PrefecturePuzzleMode {
  constructor() {
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;

    this.mapImage = new Image();
    this.mapImage.src = './japan_map.svg';

    this.activePiece = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.effects = [];
    this.isCompleted = false;

    this.allPrefectures = [];
    this.trayPieces = [];
    this.fittedPieces = [];
    this.queue = [];
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

    // Shuffle copy of 47 prefectures
    const shuffled = [...PREFECTURES].sort(() => Math.random() - 0.5);

    this.allPrefectures = shuffled.map(p => ({
      ...p,
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      isFitted: false,
      scale: 1.0
    }));

    this.fittedPieces = [];
    // Take first 6 for tray
    this.trayPieces = this.allPrefectures.slice(0, 6);
    this.queue = this.allPrefectures.slice(6);

    this.updateTargetPositions();
    this.layoutTrayPieces();
  }

  updateTargetPositions() {
    const mapSize = Math.min(this.width * 0.72, this.height * 0.75);
    const mapX = this.width / 2 - mapSize / 2;
    const mapY = this.height / 2 - mapSize / 2 + 10;

    this.allPrefectures.forEach(p => {
      p.targetX = mapX + p.relX * mapSize;
      p.targetY = mapY + p.relY * mapSize;
      if (p.isFitted) {
        p.x = p.targetX;
        p.y = p.targetY;
      }
    });
  }

  layoutTrayPieces() {
    const trayMargin = 50;
    const trayWidth = Math.max(200, this.width - trayMargin * 2);
    const count = this.trayPieces.length;

    this.trayPieces.forEach((p, idx) => {
      if (!p.isFitted) {
        const step = count > 1 ? trayWidth / (count - 1) : 0;
        p.x = trayMargin + idx * step + (Math.random() * 10 - 5);
        p.y = this.height - 65 + (idx % 2 === 0 ? -12 : 12);
      }
    });
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;

    this.updateTargetPositions();
    this.layoutTrayPieces();
  }

  onTouch(x, y) {
    // Check Reset Button at top right
    const resetBtn = { x: this.width - 70, y: 70, w: 100, h: 36 };
    if (Math.abs(x - resetBtn.x) < resetBtn.w / 2 && Math.abs(y - resetBtn.y) < resetBtn.h / 2) {
      if (this.soundSynth) this.soundSynth.playPop();
      this.resetGame();
      return;
    }

    // Pick top-most unfitted tray piece
    for (let i = this.trayPieces.length - 1; i >= 0; i--) {
      const p = this.trayPieces[i];
      if (!p.isFitted) {
        const dist = Math.hypot(x - p.x, y - p.y);
        if (dist < 45) {
          this.activePiece = p;
          this.dragOffsetX = x - p.x;
          this.dragOffsetY = y - p.y;
          p.scale = 1.3;
          if (this.soundSynth) this.soundSynth.playPop();
          // Move to end of tray array for top z-index
          this.trayPieces.splice(i, 1);
          this.trayPieces.push(p);
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

      if (distToTarget < 55) {
        // Snap!
        p.x = p.targetX;
        p.y = p.targetY;
        p.isFitted = true;

        if (this.soundSynth) this.soundSynth.playPop();
        this.speakPrefecture(p.name);
        this.spawnCelebration(p.x, p.y, [p.badge, '✨', '⭐', '🎉']);

        // Remove from tray & add next piece from queue
        const idx = this.trayPieces.indexOf(p);
        if (idx !== -1) {
          this.trayPieces.splice(idx, 1);
          this.fittedPieces.push(p);
        }

        if (this.queue.length > 0) {
          const nextPiece = this.queue.shift();
          this.trayPieces.push(nextPiece);
          this.layoutTrayPieces();
        }

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
    if (this.fittedPieces.length >= 47 && !this.isCompleted) {
      this.isCompleted = true;
      setTimeout(() => this.speakPrefecture('47とどうふけん ぜんぶかんせい！すごいね！'), 500);
      this.spawnCelebration(this.width / 2, this.height / 2, ['🎉', '👑', '✨', '💖', '🍈', '🗼', '🐙', '🌸']);
    }
  }

  spawnCelebration(x, y, symbols) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      this.effects.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 20 + Math.random() * 14,
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

    // Grid waves
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < this.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // 2. Render Full 47 Prefectures SVG Map as Background Base
    const mapSize = Math.min(this.width * 0.72, this.height * 0.75);
    const mapX = this.width / 2 - mapSize / 2;
    const mapY = this.height / 2 - mapSize / 2 + 10;

    if (this.mapImage.complete && this.mapImage.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.drawImage(this.mapImage, mapX, mapY, mapSize, mapSize);
      ctx.restore();
    }

    // 3. Draw Fitted Pieces on Map
    this.fittedPieces.forEach(p => {
      ctx.save();
      ctx.translate(p.targetX, p.targetY);

      // Fitted Pill Pin
      ctx.beginPath();
      ctx.roundRect(-30, -18, 60, 36, 18);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.font = '700 12px "Zen Maru Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(p.kanji, 0, -5);

      ctx.font = '13px sans-serif';
      ctx.fillText(p.badge, 0, 9);

      ctx.restore();
    });

    // 4. Draw Floating Tray Pieces at Bottom
    this.trayPieces.forEach(p => {
      if (p.isFitted) return;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.scale, p.scale);

      // Piece Card
      ctx.beginPath();
      ctx.roundRect(-34, -22, 68, 44, 20);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Shadow when dragging
      if (this.activePiece === p) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 6;
      }

      ctx.font = '700 13px "Zen Maru Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(p.name, 0, -7);

      ctx.font = '15px sans-serif';
      ctx.fillText(p.badge, 0, 10);

      ctx.restore();
    });

    // 5. Render Top Pill Status & Reset Button
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
    ctx.fillText(`🗾 とどうふけん (${this.fittedPieces.length}/47)`, this.width / 2, pillY + pillH / 2);

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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillRect(0, this.height / 2 - 50, this.width, 100);

      ctx.font = '900 32px "Zen Maru Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FF477E';
      ctx.fillText('🎉 47とどうふけん ぜんぶかんせい！ 🎉', this.width / 2, this.height / 2);
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
    this.allPrefectures = [];
    this.trayPieces = [];
    this.fittedPieces = [];
    this.effects = [];
  }
}
