class FormScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FormScene' });
  }

  preload() {
    this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
  }

  create() {
    const { width, height } = this.scale;

    // ===== background (lưu trên this) =====
    this.bg = this.add.image(0, 0, 'background2')
      .setOrigin(0.5)
      .setDepth(0)
      .setScrollFactor(0);

    // bindable resize function for bg (so we can .off later)
    this._resizeBg = () => {
      if (!this.bg || this.bg.destroyed) return;
      const scaleX = this.scale.width / this.bg.width;
      const scaleY = this.scale.height / this.bg.height;
      const scale = Math.max(scaleX, scaleY); // "cover"
      this.bg.setScale(scale);
      this.bg.setPosition(this.scale.width / 2, this.scale.height / 2);
    };

    // initial resize + register
    this._resizeBg();
    this.scale.on('resize', this._resizeBg);

    // ===== overlay (lưu trên this) =====
    this.overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.4)
      .setOrigin(0)
      .setDepth(1)
      .setScrollFactor(0);

    // unified resize handler that is safe (checks existence)
    this._onResize = (gameSize) => {
      const w = gameSize?.width || this.scale.width;
      const h = gameSize?.height || this.scale.height;

      if (this.overlay && !this.overlay.destroyed) {
        // setSize exists on Rectangle game object
        this.overlay.setSize(w, h);
      }

      // also keep background updated
      if (this.bg && !this.bg.destroyed) {
        this._resizeBg();
      }
    };

    // register
    this.scale.on('resize', this._onResize);

    // clean up when scene shutdown/destroy
    this.events.once('shutdown', this.shutdown, this);
    this.events.once('destroy', this.shutdown, this);

    // create the DOM form
    this.createForm();
  }

  createForm() {
    const { width, height } = this.scale;

    // Xóa form cũ nếu có
    const oldForm = document.getElementById('formContainer');
    if (oldForm) oldForm.remove();

    // Container
    const formContainer = document.createElement('div');
    formContainer.id = 'formContainer';
    formContainer.className = 'game-form';
    document.body.appendChild(formContainer);

    // Header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'form-header d-flex justify-content-center align-items-center position-relative w-100 mb-3';
    formContainer.appendChild(headerDiv);

    const title = document.createElement('h4');
    title.innerText = 'YOUR INFORMATION';
    title.className = 'form-title text-center flex-grow-1';
    headerDiv.appendChild(title);

    // Config button
    const configBtn = document.createElement('button');
    configBtn.innerHTML = '<i class="bi bi-gear-fill"></i>';
    configBtn.className = 'btn btn-sm btn-outline-secondary config-icon-btn';
    headerDiv.appendChild(configBtn);

    configBtn.addEventListener('click', () => {
      formContainer.classList.add('fade-out');
      setTimeout(() => {
        formContainer.remove();
        this.scene.start('ConfigScene');
      }, 300);
    });

    // Input fields
    const fields = [
      { id: 'name', label: 'Your name', type: 'text', placeholder: 'Ex: Nguyen Van A' },
      { id: 'phone', label: 'Phone number', type: 'tel', placeholder: 'Ex: 0123456789' },
      { id: 'class', label: 'Class', type: 'text', placeholder: 'Ex: 12A1' },
      { id: 'school', label: 'School Name', type: 'text', placeholder: 'Ex: THPT Nguyen Viet Hong' }
    ];

    fields.forEach(field => {
      const div = document.createElement('div');
      div.className = 'mb-3';
      div.innerHTML = `
        <label for="${field.id}" class="form-label fw-semibold">${field.label}</label>
        <input id="${field.id}" type="${field.type}" placeholder="${field.placeholder}" class="form-control" />
      `;
      formContainer.appendChild(div);
    });

    // Go button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary w-100 start-btn';
    submitBtn.innerText = 'Go';
    formContainer.appendChild(submitBtn);

    // Submit event (unchanged)
    submitBtn.addEventListener('click', async () => {
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const className = document.getElementById('class').value.trim();
      const school = document.getElementById('school').value.trim();

      const phoneRegex = /^(?:\+84|0)(3|5|7|8|9)[0-9]{8}$/;

      if (!name || !phone || !className || !school) {
        alert('Please enter full information');
        return;
      }

      if (!phoneRegex.test(phone)) {
        alert('Invalid phone number format! (Ex: 0912345678 or +84912345678)');
        return;
      }

      const SHEET_ID = localStorage.getItem('sheetId');
      const WEBHOOK_URL = localStorage.getItem('webhookUrl');

      if (!SHEET_ID || !WEBHOOK_URL) {
        alert('⚙️ Missing configuration! Please open settings (gear icon) first.');
        return;
      }

      try {
        const response = await fetch(
          `https://cors-proxy.kadendang-forfigma.workers.dev/?url=${encodeURIComponent(WEBHOOK_URL)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sheetId: SHEET_ID,
              name,
              phone,
              className,
              school
            }),
          }
        );

        const text = await response.text();
        console.log('Raw webhook response:', text);

        let result;
        try {
          result = JSON.parse(text);
        } catch {
          result = { result: "success" };
        }

      } catch (err) {
        console.error('Webhook error:', err);
        alert('Failed to send data to Google Sheet.');
        return;
      }

      // Transition to LoadingScene
      formContainer.classList.add('fade-out');
      setTimeout(() => {
        formContainer.remove();
        this.scene.start('LoadingScene');
      }, 400);
    });
  }

  shutdown() {
    // Xóa DOM
    const formContainer = document.getElementById('formContainer');
    if (formContainer) formContainer.remove();

    // Gỡ listeners resize
    if (this._onResize) {
      this.scale.off('resize', this._onResize);
      this._onResize = null;
    }
    if (this._resizeBg) {
      this.scale.off('resize', this._resizeBg);
      this._resizeBg = null;
    }

    // Hủy overlay và bg
    if (this.overlay && !this.overlay.destroyed) {
      this.overlay.destroy();
      this.overlay = null;
    }
    if (this.bg && !this.bg.destroyed) {
      this.bg.destroy();
      this.bg = null;
    }
  }
}

// =============================
// ⚙️ Phaser Configuration
// =============================
const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE, // cho phép resize động
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 2796,
    height: 1290,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },
  scene: [FormScene, LoadingScene, GameScene, GameOverScene, ConfigScene]
};

// ✅ Start the game
const game = new Phaser.Game(config);