/* ==========================================================================
   あそびモード: ずかん (Infinite Horizontal Looping Picture Card Encyclopedia)
   ========================================================================== */

// Auto-import any images dropped in /public/zukan/ using Vite glob
const globImages = import.meta.glob('/public/zukan/*.{png,jpg,jpeg,webp,svg}', { eager: true });

export class ZukanMode {
  constructor() {
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;

    this.activeCard = null;
    this.zoomProgress = 0;
    this.effects = [];

    this.scrollX = 0;
    this.targetScrollX = 0;
    this.velocityX = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.lastTouchX = 0;
    this.dragDistance = 0;

    this.cards = [];
    this.imageMap = {};

    this.loadCards();
  }

  loadCards() {
    const loadedCards = [];
    const loadedNames = new Set();

    // 1. Scan user uploaded images from /public/zukan/
    Object.keys(globImages).forEach(path => {
      // Path example: "/public/zukan/りんご.png"
      const filename = path.split('/').pop();
      const name = decodeURIComponent(filename.replace(/\.[^/.]+$/, ''));
      const url = globImages[path].default || path.replace('/public', '');

      const img = new Image();
      img.src = url;
      this.imageMap[name] = img;

      loadedCards.push({
        id: name,
        name: name,
        emoji: '🖼️',
        color: this.getColorForName(name),
        hasUserImage: true,
        imgObj: img
      });

      loadedNames.add(name);
    });

    // 2. Default fallback items to ensure rich infinite loop (if < 8 user images)
    const defaultList = [
      { name: 'りんご', emoji: '🍎', color: '#FF4757' },
      { name: 'いぬ', emoji: '🐶', color: '#FF9F1C' },
      { name: 'ねこ', emoji: '🐱', color: '#FF6584' },
      { name: 'くるま', emoji: '🚗', color: '#38BDF8' },
      { name: 'でんしゃ', emoji: '🚃', color: '#2ED573' },
      { name: 'ばなな', emoji: '🍌', color: '#FFD166' },
      { name: 'うさぎ', emoji: '🐰', color: '#A855F7' },
      { name: 'ひこうき', emoji: '✈️', color: '#118AB2' },
      { name: 'おにぎり', emoji: '🍙', color: '#1A1E36' },
      { name: 'パンダ', emoji: '🐼', color: '#FF85A2' },
      { name: 'いちご', emoji: '🍓', color: '#FF477E' },
      { name: 'バス', emoji: '🚌', color: '#FFC72C' }
    ];

    defaultList.forEach(item => {
      if (!loadedNames.has(item.name)) {
        // Try fallback image path e.g. /zukan/りんご.png
        const imgPath = `/zukan/${item.name}.png`;
        const img = new Image();
        img.src = imgPath;
        this.imageMap[item.name] = img;

        loadedCards.push({
          id: item.name,
          name: item.name,
          emoji: item.emoji,
          color: item.color,
          hasUserImage: false,
          imgObj: img
        });
      }
    });

    this.cards = loadedCards;
  }

  getColorForName(name) {
    const palette = ['#FF4757', '#FF9F1C', '#FFD166', '#2ED573', '#38BDF8', '#A855F7', '#FF6584', '#118AB2'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }
    return palette[hash % palette.length];
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;

    this.activeCard = null;
    this.zoomProgress = 0;
    this.scrollX = 0;
    this.targetScrollX = 0;
    this.velocityX = 0;
    this.effects = [];
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
  }

  onTouch(x, y) {
    if (this.activeCard) {
      if (this.soundSynth) this.soundSynth.playPop();
      this.closeZoom();
      return;
    }

    this.isDragging = true;
    this.dragStartX = x;
    this.lastTouchX = x;
    this.dragDistance = 0;
    this.velocityX = 0;

    // Check Left Arrow Click (Scroll Left)
    const leftBtn = { x: 32, y: this.height / 2, radius: 24 };
    if (Math.hypot(x - leftBtn.x, y - leftBtn.y) < leftBtn.radius) {
      this.scrollByColumn(1);
      this.isDragging = false;
      return;
    }

    // Check Right Arrow Click (Scroll Right)
    const rightBtn = { x: this.width - 32, y: this.height / 2, radius: 24 };
    if (Math.hypot(x - rightBtn.x, y - rightBtn.y) < rightBtn.radius) {
      this.scrollByColumn(-1);
      this.isDragging = false;
      return;
    }
  }

  onTouchMove(x, y) {
    if (!this.isDragging) return;

    const dx = x - this.lastTouchX;
    this.scrollX += dx;
    this.velocityX = dx;
    this.dragDistance += Math.abs(dx);
    this.lastTouchX = x;
  }

  onTouchEnd(x, y) {
    if (!this.isDragging) return;
    this.isDragging = false;

    // If tap without drag, check card click
    if (this.dragDistance < 10) {
      const visibleCards = this.getVisibleCardLayout();
      for (let i = 0; i < visibleCards.length; i++) {
        const item = visibleCards[i];
        if (x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h) {
          this.zoomCard(item.card);
          break;
        }
      }
    }
  }

  scrollByColumn(dir) {
    const layout = this.getCardDimensions();
    const step = layout.cardW + layout.gapX;
    this.targetScrollX = this.scrollX + dir * step;
    if (this.soundSynth) this.soundSynth.playPop();
  }

  zoomCard(card) {
    this.activeCard = card;
    this.zoomProgress = 0;

    if (this.soundSynth) this.soundSynth.playPeekABoo();
    this.speakName(card.name);
    this.spawnSparkles(this.width / 2, this.height / 2, [card.emoji, '✨', '⭐', '💖', '🎉']);
  }

  closeZoom() {
    this.activeCard = null;
    this.zoomProgress = 0;
  }

  speakName(text) {
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

  spawnSparkles(x, y, symbols) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      this.effects.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 24 + Math.random() * 16,
        alpha: 1
      });
    }
  }

  getCardDimensions() {
    const topOffset = 70;
    const bottomOffset = 25;
    const sideMargin = 60; // Leave space for side arrows

    const availableW = this.width - sideMargin * 2;
    const availableH = this.height - topOffset - bottomOffset;

    // 6 Cards Visible on 1 Screen:
    // Landscape: 3 columns x 2 rows = 6 visible
    // Portrait: 2 columns x 3 rows = 6 visible
    const isPortrait = this.width < this.height;
    const cols = isPortrait ? 2 : 3;
    const rows = isPortrait ? 3 : 2;

    const gapX = 16;
    const gapY = 16;

    const cardW = (availableW - (cols - 1) * gapX) / cols;
    const cardH = (availableH - (rows - 1) * gapY) / rows;

    return { cols, rows, cardW, cardH, gapX, gapY, sideMargin, topOffset, isPortrait };
  }

  getVisibleCardLayout() {
    const dim = this.getCardDimensions();
    const totalCards = this.cards.length;
    if (totalCards === 0) return [];

    const numCols = Math.ceil(totalCards / dim.rows);
    const colStep = dim.cardW + dim.gapX;
    const totalW = numCols * colStep;

    const visibleItems = [];

    // Loop through all items and calculate wrapped horizontal position
    this.cards.forEach((card, idx) => {
      const col = Math.floor(idx / dim.rows);
      const row = idx % dim.rows;

      const rawX = col * colStep + this.scrollX;
      // Modulo wrap for infinite horizontal loop
      let wrappedX = ((rawX % totalW) + totalW) % totalW;

      // Keep cards continuously visible across screen boundaries
      if (wrappedX > totalW - colStep * 2) {
        wrappedX -= totalW;
      }

      const screenX = dim.sideMargin + wrappedX;
      const screenY = dim.topOffset + row * (dim.cardH + dim.gapY);

      if (screenX + dim.cardW >= -50 && screenX <= this.width + 50) {
        visibleItems.push({
          card,
          x: screenX,
          y: screenY,
          w: dim.cardW,
          h: dim.cardH
        });
      }
    });

    return visibleItems;
  }

  update(width, height) {
    this.width = width;
    this.height = height;

    // Smooth inertia / momentum scroll
    if (!this.isDragging) {
      if (Math.abs(this.targetScrollX - this.scrollX) > 0.5) {
        this.scrollX += (this.targetScrollX - this.scrollX) * 0.15;
      } else if (Math.abs(this.velocityX) > 0.2) {
        this.scrollX += this.velocityX;
        this.velocityX *= 0.92;
        this.targetScrollX = this.scrollX;
      }
    }

    // Smooth zoom animation for popup modal
    if (this.activeCard && this.zoomProgress < 1) {
      this.zoomProgress += (1 - this.zoomProgress) * 0.22;
      if (this.zoomProgress > 0.99) this.zoomProgress = 1;
    }

    // Sparkle Particle Update
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

    // Soft Cream Background
    ctx.fillStyle = '#FFF9F2';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle background pattern dots
    ctx.fillStyle = '#FFEBD6';
    for (let x = 20; x < this.width; x += 40) {
      for (let y = 70; y < this.height; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render 6-Card Grid (Infinite Looping Horizontal Scroll)
    const visibleLayout = this.getVisibleCardLayout();
    visibleLayout.forEach(item => {
      this.renderCard(ctx, item.card, item.x, item.y, item.w, item.h, false);
    });

    // Render Left & Right Infinite Scroll Arrow Buttons
    this.renderSideArrows(ctx);

    // Zoomed Pop-up Modal Overlay
    if (this.activeCard) {
      this.renderZoomedPopup(ctx, this.activeCard);
    }

    // Sparkle Burst Particles
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

  renderCard(ctx, card, x, y, w, h, isZoomed = false) {
    ctx.save();

    // Card Background Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Card Container Box
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = isZoomed ? 4 : 2.5;
    ctx.strokeStyle = card.color;
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Top Banner Color Bar on Card
    const headerH = Math.min(26, h * 0.20);
    ctx.beginPath();
    ctx.roundRect(x, y, w, headerH, [20, 20, 0, 0]);
    ctx.fillStyle = card.color;
    ctx.fill();

    // Image / Emoji rendering
    const img = card.imgObj || this.imageMap[card.name];
    const hasImage = img && img.complete && img.naturalWidth > 0;

    const iconY = y + headerH + (h - headerH) * 0.42;

    if (hasImage) {
      const imgSize = Math.min(w * 0.70, (h - headerH) * 0.62);
      ctx.drawImage(img, x + w / 2 - imgSize / 2, iconY - imgSize / 2, imgSize, imgSize);
    } else {
      // Cute Emoji Icon
      const emojiSize = Math.min(w * 0.45, (h - headerH) * 0.50);
      ctx.font = `${emojiSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.emoji, x + w / 2, iconY);
    }

    // Card Base Name Text at Bottom (File base name without extension)
    const textY = y + h - Math.max(16, h * 0.15);
    ctx.font = `700 ${Math.max(14, Math.floor(h * 0.14))}px "Zen Maru Gothic", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';
    ctx.fillText(card.name, x + w / 2, textY);

    ctx.restore();
  }

  renderSideArrows(ctx) {
    const centerY = this.height / 2;

    // Left Arrow Button (◀)
    const leftX = 32;
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftX, centerY, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FF6584';
    ctx.stroke();

    ctx.font = '700 16px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF6584';
    ctx.fillText('◀', leftX, centerY);
    ctx.restore();

    // Right Arrow Button (▶)
    const rightX = this.width - 32;
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightX, centerY, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FF6584';
    ctx.stroke();

    ctx.font = '700 16px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF6584';
    ctx.fillText('▶', rightX, centerY);
    ctx.restore();
  }

  renderZoomedPopup(ctx, card) {
    // Backdrop Dim Overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Zoomed Center Modal Box Size
    const maxModalW = Math.min(this.width * 0.8, 420);
    const maxModalH = Math.min(this.height * 0.7, 450);

    const scale = 0.4 + this.zoomProgress * 0.6;
    const modalW = maxModalW * scale;
    const modalH = maxModalH * scale;

    const modalX = this.width / 2 - modalW / 2;
    const modalY = this.height / 2 - modalH / 2;

    // Render Expanded Card
    this.renderCard(ctx, card, modalX, modalY, modalW, modalH, true);

    // Hint text at bottom of modal
    ctx.font = '700 16px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('💡 タップして とじる', this.width / 2, modalY + modalH + 30);

    ctx.restore();
  }

  destroy() {
    this.activeCard = null;
    this.effects = [];
  }
}
