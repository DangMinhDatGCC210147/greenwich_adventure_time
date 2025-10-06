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

    // Overlay đen mờ
    this.add.rectangle(0, 0, width, height, 0x000000, 0.4)
      .setOrigin(0, 0)
      .setDepth(1);

    // Xóa form cũ nếu có
    const oldForm = document.getElementById('formContainer');
    if (oldForm) oldForm.remove();

    // Tạo form container
    const formContainer = document.createElement('div');
    formContainer.id = 'formContainer';
    formContainer.className = 'game-form';
    document.body.appendChild(formContainer);

    // Tiêu đề
    const title = document.createElement('h4');
    title.innerText = 'YOUR INFORMATION';
    title.className = 'form-title';
    formContainer.appendChild(title);

    // Các ô input
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

    // Nút submit
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary w-100 start-btn';
    submitBtn.innerText = 'Go';
    formContainer.appendChild(submitBtn);

    // Sự kiện click
    submitBtn.addEventListener('click', () => {
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const className = document.getElementById('class').value.trim();
      const school = document.getElementById('school').value.trim();

      // ✅ Regex kiểm tra số điện thoại (Việt Nam & quốc tế cơ bản)
      const phoneRegex = /^(?:\+84|0)(3|5|7|8|9)[0-9]{8}$/;

      if (!name || !phone || !className || !school) {
        alert('Please enter full information');
        return;
      }

      if (!phoneRegex.test(phone)) {
        alert('Invalid phone number format! (Ex: 0912345678 or +84912345678)');
        return;
      }

      // ✅ Nếu hợp lệ -> lưu và qua màn tiếp theo
      localStorage.setItem('playerInfo', JSON.stringify({ name, phone, className, school }));
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
  scene: [FormScene, LoadingScene, GameScene, GameOverScene]
};

// ✅ Khởi tạo game
const game = new Phaser.Game(config);
