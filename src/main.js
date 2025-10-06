class FormScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FormScene' });
  }

  preload() {
    this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.image(width / 2, height / 2, 'background2')
      .setOrigin(0.5)
      .setDepth(0);
    const scaleBG = Math.max(width / 2796, height / 1290);
    bg.setScale(scaleBG);
    bg.setDisplaySize(width, height + 100);

    // Overlay mờ
    this.add.rectangle(0, 0, width, height, 0x000000, 0.4)
      .setOrigin(0, 0)
      .setDepth(1);

    // Xóa form cũ nếu có
    const oldForm = document.getElementById('formContainer');
    if (oldForm) oldForm.remove();

    // Container
    const formContainer = document.createElement('div');
    formContainer.id = 'formContainer';
    formContainer.className = 'game-form';
    document.body.appendChild(formContainer);

    // Header (tiêu đề + nút config)
    const headerDiv = document.createElement('div');
    headerDiv.className = 'form-header d-flex justify-content-center align-items-center position-relative w-100 mb-3';
    formContainer.appendChild(headerDiv);

    const title = document.createElement('h4');
    title.innerText = 'YOUR INFORMATION';
    title.className = 'form-title text-center flex-grow-1';
    headerDiv.appendChild(title);

    // Nút config (icon bánh răng)
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

    // Nút Go
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary w-100 start-btn';
    submitBtn.innerText = 'Go';
    formContainer.appendChild(submitBtn);

    // Sự kiện click Go
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

      // Lấy cấu hình webhook & sheet ID
      const SHEET_ID = localStorage.getItem('sheetId');
      const WEBHOOK_URL = localStorage.getItem('webhookUrl');

      if (!SHEET_ID || !WEBHOOK_URL) {
        alert('⚙️ Missing configuration! Please open settings (gear icon) first.');
        return;
      }

      // Gửi dữ liệu tới Google Apps Script
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheetId: SHEET_ID,
            name,
            phone,
            className,
            school
          })
        });

        const result = await response.json();
        console.log('Webhook response:', result);

      } catch (err) {
        console.error('Webhook error:', err);
        alert('Failed to send data to Google Sheet.');
        return;
      }

      // Chuyển sang màn LoadingScene
      formContainer.classList.add('fade-out');
      setTimeout(() => {
        formContainer.remove();
        this.scene.start('LoadingScene');
      }, 400);
    });
  }

  shutdown() {
    const formContainer = document.getElementById('formContainer');
    if (formContainer) formContainer.remove();
  }
}

// =============================
// ⚙️ Cấu hình Phaser
// =============================
const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
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

// ✅ Khởi tạo game
const game = new Phaser.Game(config);
