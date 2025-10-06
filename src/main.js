let player, background, ground, groundCollider, playerShadow;
let cursors;
let cacti; // group để quản lý cactus
let lastCactusTime = 0;
let nextCactusInterval = Phaser.Math.Between(3000, 6000); // spawn ngẫu nhiên 3–6s
let gameOver = false;

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
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

// --- LOAD ASSETS ---
function preload() {
  this.load.image('background', 'assets/groundandbackground/bg.png');
  this.load.image('ground', 'assets/groundandbackground/ground.png');
  this.load.image('player', 'assets/player/player.png');
  this.load.image('cactus', 'assets/groundandbackground/cactus.png'); 
}

// --- CREATE OBJECTS ---
function create() {
  const { width, height } = this.scale;

  // Background
  background = this.add.tileSprite(0, -100, width, height + 100, 'background').setOrigin(0,0).setScrollFactor(0).setDepth(0);
  const scaleBG = Math.max(width / 2796, height / 1290);
  background.setDisplaySize(width, height + 100);

  // Ground
  const groundHeight = height * 0.1;
  ground = this.add.tileSprite(0, height - groundHeight, width, groundHeight, 'ground').setOrigin(0,1).setScrollFactor(0).setDepth(1);
  ground.setDisplaySize(width, groundHeight);

  // Ground Collider
  groundCollider = this.add.rectangle(width / 2, height - groundHeight / 2, width, groundHeight);
  this.physics.add.existing(groundCollider, true);
  groundCollider.visible = false;

  // Player
  player = this.physics.add.sprite(width * 0.2, height - groundHeight - 150, 'player').setCollideWorldBounds(true);
  player.setScale(0.08 * scaleBG).setDepth(2);

  // Shadow
  const graphics = this.add.graphics();
  graphics.fillStyle(0x000000, 0.3);
  graphics.fillEllipse(30, 10, 60, 20);
  graphics.generateTexture('shadow', 60, 20);
  graphics.destroy();

  playerShadow = this.add.image(player.x, player.y + player.height * player.scaleY / 2, 'shadow').setScale(scaleBG).setDepth(1);

  // Physics
  this.physics.add.collider(player, groundCollider);

  // Input
  this.input.on('pointerdown', () => jump(player));
  cursors = this.input.keyboard.createCursorKeys();

  // Cactus group
  cacti = this.physics.add.group();
  this.physics.add.collider(player, cacti, () => {
    if (!gameOver) {
      gameOver = true;
      this.physics.pause(); // dừng physics
      player.setTint(0xff0000); // highlight player bị chết
      console.log("GAME OVER");
    }
  });

  // Resize auto
  this.scale.on('resize', (gameSize) => resizeGame(this, gameSize));
}

// --- JUMP FUNCTION ---
function jump(player) {
  if (player.body.touching.down) {
    player.setVelocityY(-500);
  }
}

// --- UPDATE LOOP ---
function update(time, delta) {
  if (gameOver) return;
  
  background.tilePositionX += 4;
  ground.tilePositionX += 4;
  player.setVelocityX(0);

  // Update shadow
  if (player.body.touching.down) {
    playerShadow.setVisible(true);
    playerShadow.setPosition(player.x, player.y + player.height * player.scaleY / 2);
  } else {
    playerShadow.setVisible(false);
  }

  if (cursors && cursors.space.isDown) jump(player);

  // Spawn cactus ngẫu nhiên 3–6s
  if (time > lastCactusTime + nextCactusInterval) {
    spawnCactus(this);
    lastCactusTime = time;
    nextCactusInterval = Phaser.Math.Between(3000, 6000);
  }

  // Di chuyển cactus cùng tốc độ background/ground
  cacti.children.iterate((cactus) => {
    if (!cactus) return; // 👈 check null
      cactus.x -= 4; // tốc độ trượt giống ground
    if (cactus.x < -cactus.width) {
      cactus.destroy(); // xóa cactus khi ra khỏi màn hình
    }
  });
}

// --- SPAWN CACTUS ---
function spawnCactus(scene) {
  const { width, height } = scene.scale;
  const groundHeight = height * 0.1;
  const cactus = cacti.create(width + 50, height - groundHeight, 'cactus'); // spawn bên phải màn hình
  cactus.setOrigin(0.5, 1); // đáy cactus chạm ground
  cactus.setScale(0.1); // scale tùy chỉnh
  cactus.setImmovable(true);
  cactus.body.allowGravity = false;
}

// --- AUTO RESIZE ---
function resizeGame(scene, gameSize) {
  const width = gameSize.width;
  const height = gameSize.height;
  const scaleBG = Math.max(width / 2796, height / 1290);
  const groundHeight = height * 0.1;

  // Background
  background.setDisplaySize(width, height + 100).setPosition(0, -100);

  // Ground
  ground.setDisplaySize(width, groundHeight).setPosition(0, height - groundHeight);

  // Collider
  groundCollider.setSize(width, groundHeight);
  groundCollider.setPosition(width / 2, height - groundHeight / 2);
  if (groundCollider.body) {
    groundCollider.body.setSize(width, groundHeight);
    groundCollider.body.updateFromGameObject();
  }

  // Player & Shadow
  player.setPosition(width * 0.2, height - groundHeight - 150);
  player.setScale(0.08 * scaleBG);
  playerShadow.setScale(scaleBG);
  playerShadow.setPosition(player.x, player.y + player.height * player.scaleY / 2);
}
