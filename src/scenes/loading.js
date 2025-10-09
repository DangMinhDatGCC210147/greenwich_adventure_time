class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
    this.load.image('player', 'assets/player/player.png');
    this.load.image('ground', 'assets/groundandbackground/ground.png');
    this.load.image('cactus', 'assets/groundandbackground/cactus.png');
  }

  create() {
    const { width, height } = this.scale;

    // 🟩 Responsive background
    this.bg = makeResponsiveBackground(this, 'background2');

    // 🖤 Dark overlay
    this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35)
      .setOrigin(0.5)
      .setDepth(1);

    // 🧩 DOM UI
    const popup = document.createElement('div');
    popup.id = 'loadingPopup';
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.alignItems = 'center';
    popup.style.background = 'rgba(255,255,255,0.95)';
    popup.style.padding = '28px 24px';
    popup.style.borderRadius = '16px';
    popup.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    popup.style.width = 'clamp(280px, 80vw, 400px)';
    popup.style.zIndex = '20';
    popup.style.animation = 'fadeIn 0.6s ease';

    // 🌀 Loading text with gradient & animation
    const loadingText = document.createElement('div');
    loadingText.id = 'loadingText';
    loadingText.innerHTML = 'Loading<span class="dots">...</span>';
    loadingText.style.fontWeight = '800';
    loadingText.style.fontSize = 'clamp(2rem, 5vw, 2.8rem)';
    loadingText.style.background = 'linear-gradient(45deg, #007bff, #00c6ff, #28a745)';
    loadingText.style.backgroundSize = '300%';
    loadingText.style.webkitBackgroundClip = 'text';
    loadingText.style.webkitTextFillColor = 'transparent';
    loadingText.style.textAlign = 'center';
    loadingText.style.animation = 'gradientMove 3s linear infinite, fadeIn 1s ease';

    // 🧭 Orientation message
    const message = document.createElement('p');
    message.id = 'orientationMessage';
    message.textContent = 'Please rotate your device to landscape mode to start the game.';
    message.style.color = '#333';
    message.style.fontSize = 'clamp(1rem, 3vw, 1.1rem)';
    message.style.textAlign = 'center';
    message.style.marginBottom = '16px';
    message.style.transition = 'color 0.3s ease';

    // 🟩 Start button
    const startBtn = document.createElement('button');
    startBtn.id = 'startBtn';
    startBtn.className = 'btn w-100 text-white fw-bold py-2';
    startBtn.style.background = 'linear-gradient(45deg, #28a745, #85e085)';
    startBtn.style.border = 'none';
    startBtn.style.boxShadow = '0 4px 10px rgba(40,167,69,0.3)';
    startBtn.style.fontSize = 'clamp(1rem, 2vw, 1.3rem)';
    startBtn.innerHTML = '<i class="bi bi-play-fill me-1"></i> Start Game';

    popup.appendChild(loadingText);
    popup.appendChild(message);
    popup.appendChild(startBtn);
    document.body.appendChild(popup);

    // 🧭 Orientation check
    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      if (isLandscape) {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        message.textContent = 'You are ready! Press "Start Game" to play.';
        message.style.color = '#0a0';
      } else {
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';
        message.textContent = 'Please rotate your device to landscape mode to start the game.';
        message.style.color = '#c00';
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    startBtn.onclick = () => {
      if (startBtn.disabled) return;
      popup.classList.add('fade-out');
      setTimeout(() => {
        popup.remove();
        this.scene.start('GameScene');
      }, 400);
    };

    // 🧹 Cleanup
    this.events.once('shutdown', () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      const p = document.getElementById('loadingPopup');
      if (p) p.remove();
    });

    // Responsive background
    const handleResize = (gameSize) => {
      if (!this.scene.isActive()) return;
      if (!this.bg || !this.overlay) return;
      const { width, height } = gameSize;
      const scale = Math.max(width / this.bg.width, height / this.bg.height);
      this.bg.setScale(scale).setPosition(width / 2, height / 2);
      this.overlay.setSize(width, height).setPosition(width / 2, height / 2);
    };

    this.scale.on('resize', handleResize, this);
    this.events.once('shutdown', () => this.scale.off('resize', handleResize, this));
  }
}

// === Responsive Background Helper ===
function makeResponsiveBackground(scene, key, depth = 0) {
  const { width, height } = scene.scale;
  const bg = scene.add.image(width / 2, height / 2, key)
    .setOrigin(0.5)
    .setDepth(depth);

  const resize = (gameSize) => {
    const w = gameSize ? gameSize.width : scene.scale.width;
    const h = gameSize ? gameSize.height : scene.scale.height;
    const scale = Math.max(w / bg.width, h / bg.height);
    bg.setScale(scale).setPosition(w / 2, h / 2);
  };

  resize({ width, height });
  scene.scale.on('resize', resize);
  scene.events.once('shutdown', () => scene.scale.off('resize', resize));
  return bg;
}
