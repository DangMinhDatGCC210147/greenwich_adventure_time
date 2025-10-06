// Biến toàn cục (giữ nguyên như đã cung cấp)
let player, background, ground, groundCollider, playerShadow;
let cursors;
let cacti; // Nhóm để quản lý cây xương rồng
let lastCactusTime = 0;
let nextCactusInterval = Phaser.Math.Between(3000, 6000); // Spawn ngẫu nhiên 3–6s
let gameOver = false;
let score = 0; // Biến điểm số
let scoreText; // Văn bản hiển thị điểm
let lastScoreTime = 0; // Thời gian tăng điểm lần cuối

// Tốc độ & độ khó
let gameSpeed = 4.2; // Tốc độ ban đầu cho nền, mặt đất, cây xương rồng
const scoreMilestones = [10, 50, 100, 150, 200, 500, 1000]; // Các mốc điểm để tăng tốc
const speedIncrements = [0.5, 0.7, 1, 1.3, 1.6, 2.0, 3.0]; // Giá trị tăng tốc tương ứng

// --- MAIN GAME SCENE ---
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('background', 'assets/groundandbackground/bg.png');
    this.load.image('ground', 'assets/groundandbackground/ground.png');
    this.load.image('player', 'assets/player/player.png');
    this.load.image('cactus', 'assets/groundandbackground/cactus.png'); 
  }

  create() {
    const { width, height } = this.scale;

    // Nền
    background = this.add.tileSprite(0, -100, width, height + 100, 'background').setOrigin(0,0).setScrollFactor(0).setDepth(0);
    const scaleBG = Math.max(width / 2796, height / 1290);
    background.setDisplaySize(width, height + 100);

    // Mặt đất
    const groundHeight = height * 0.1;
    ground = this.add.tileSprite(0, height - groundHeight, width, groundHeight, 'ground').setOrigin(0,1).setScrollFactor(0).setDepth(1);
    ground.setDisplaySize(width, groundHeight);

    // Va chạm mặt đất
    groundCollider = this.add.rectangle(width / 2, height - groundHeight / 2, width, groundHeight);
    this.physics.add.existing(groundCollider, true);
    groundCollider.visible = false;

    // Nhân vật
    player = this.physics.add.sprite(width * 0.2, height - groundHeight - 150, 'player').setCollideWorldBounds(true);
    player.setScale(0.08 * scaleBG).setDepth(2);

    // Bóng
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(30, 10, 60, 20);
    graphics.generateTexture('shadow', 60, 20);
    graphics.destroy();

    playerShadow = this.add.image(player.x, player.y + player.height * player.scaleY / 2, 'shadow').setScale(scaleBG).setDepth(1);

    // Văn bản điểm số
    scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: 64 * scaleBG,
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    }).setDepth(3).setScrollFactor(0);

    // Vật lý
    this.physics.add.collider(player, groundCollider);

    // Đầu vào
    this.input.on('pointerdown', () => jump(player));
    cursors = this.input.keyboard.createCursorKeys();

    // Nhóm cây xương rồng
    cacti = this.physics.add.group();
    this.physics.add.collider(player, cacti, () => {
      if (!gameOver) {
        gameOver = true;
        this.physics.pause(); // Tạm dừng vật lý
        player.setTint(0xff0000); // Đánh dấu nhân vật khi chết
        console.log("GAME OVER");
      }
    });

    // Tự động điều chỉnh kích thước
    this.scale.on('resize', (gameSize) => resizeGame(this, gameSize));
  }

  update(time, delta) {
    if (gameOver) return;

    // Tăng điểm mỗi 0.5s
    if (time > lastScoreTime + 500) {
      score += 1;
      scoreText.setText('Score: ' + Math.floor(score));
      lastScoreTime = time;

      // Kiểm tra mốc điểm để tăng tốc
      for (let i = 0; i < scoreMilestones.length; i++) {
        if (score === scoreMilestones[i]) {
          gameSpeed += speedIncrements[i];
          console.log(`Điểm ${score}: Tăng tốc lên ${gameSpeed}`);
        }
      }
    }

    // Di chuyển nền/mặt đất/cây xương rồng dựa trên gameSpeed
    background.tilePositionX += gameSpeed;
    ground.tilePositionX += gameSpeed;
    player.setVelocityX(0);

    // Cập nhật bóng
    if (player.body.touching.down) {
      playerShadow.setVisible(true);
      playerShadow.setPosition(player.x, player.y + player.height * player.scaleY / 2);
    } else {
      playerShadow.setVisible(false);
    }

    if (cursors && cursors.space.isDown) jump(player);

    // Tạo cây xương rồng ngẫu nhiên
    if (time > lastCactusTime + nextCactusInterval) {
      spawnCactus(this);
      lastCactusTime = time;
      nextCactusInterval = Phaser.Math.Between(1000, 6000); // Spawn ngẫu nhiên 1–6s
    }

    // Di chuyển cây xương rồng theo tốc độ game
    cacti.children.iterate((cactus) => {
      if (!cactus) return;
      cactus.x -= gameSpeed;
      if (cactus.x < -cactus.width) {
        cactus.destroy();
      }
    });
  }
}

// --- HÀM NHẢY ---
function jump(player) {
  if (player.body.touching.down) {
    player.setVelocityY(-500);
  }
}

// --- TẠO CÂY XƯƠNG RỒNG ---
function spawnCactus(scene) {
  const { width, height } = scene.scale;
  const groundHeight = height * 0.1;
  const cactus = cacti.create(width + 50, height - groundHeight, 'cactus'); // Spawn bên phải
  cactus.setOrigin(0.5, 1); // Đáy cây chạm mặt đất
  cactus.setScale(0.1); // Tỷ lệ tùy chỉnh
  cactus.setImmovable(true);
  cactus.body.allowGravity = false;
}

// --- TỰ ĐỘNG ĐIỀU CHỈNH KÍCH THƯỚC ---
function resizeGame(scene, gameSize) {
  const width = gameSize.width;
  const height = gameSize.height;
  const scaleBG = Math.max(width / 2796, height / 1290);
  const groundHeight = height * 0.1;

  // Nền
  background.setDisplaySize(width, height + 100).setPosition(0, -100);

  // Mặt đất
  ground.setDisplaySize(width, groundHeight).setPosition(0, height - groundHeight);

  // Va chạm
  groundCollider.setSize(width, groundHeight);
  groundCollider.setPosition(width / 2, height - groundHeight / 2);
  if (groundCollider.body) {
    groundCollider.body.setSize(width, groundHeight);
    groundCollider.body.updateFromGameObject();
  }

  // Nhân vật & Bóng
  player.setPosition(width * 0.2, height - groundHeight - 150);
  player.setScale(0.08 * scaleBG);
  playerShadow.setScale(scaleBG);
  playerShadow.setPosition(player.x, player.y + player.height * player.scaleY / 2);

  // Văn bản điểm số
  scoreText.setPosition(20, 20);
  scoreText.setFontSize(32 * scaleBG);
}

// Cấu hình game (định nghĩa sau các scene)
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
      debug: true
    }
  },
  scene: [LoadingScene, GameScene] // Tham chiếu scene sau khi định nghĩa
};

const game = new Phaser.Game(config);