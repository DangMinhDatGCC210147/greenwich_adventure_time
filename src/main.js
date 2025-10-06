let player, background, ground, groundCollider, playerShadow;
let cursors;

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
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

// --- LOAD ASSETS ---
function preload() {
  this.load.image('background', 'greenwich_adventure_time/assets/groundandbackground/bg.png');
  this.load.image('ground', 'greenwich_adventure_time/assets/groundandbackground/ground.png');
  this.load.image('player', 'greenwich_adventure_time/assets/player/player.png');
}

// --- CREATE OBJECTS ---
function create() {
  const { width, height } = this.scale;

  // --- Background ---
  background = this.add.tileSprite(0, -100, width, height + 100, 'background');
  background.setOrigin(0, 0);
  const scaleBG = Math.max(width / 2796, height / 1290);
  background.setDisplaySize(width, height + 100).setScrollFactor(0).setDepth(0);

  // --- Ground ---
  const groundHeight = height * 0.1;
  ground = this.add.tileSprite(0, height - groundHeight, width, groundHeight, 'ground');
  ground.setOrigin(0, 1);
  ground.setScrollFactor(0).setDepth(1).setDisplaySize(width, groundHeight);

  // --- Ground Collider ---
  groundCollider = this.add.rectangle(width / 2, height - groundHeight / 2, width, groundHeight);
  this.physics.add.existing(groundCollider, true);
  groundCollider.visible = false;

  // --- Player ---
  player = this.physics.add.sprite(width * 0.2, height - groundHeight - 150, 'player');
  player.setCollideWorldBounds(true);
  player.setScale(0.08 * scaleBG);
  player.setDepth(2);

  // --- Shadow ---
  const graphics = this.add.graphics();
  graphics.fillStyle(0x000000, 0.3);
  graphics.fillEllipse(30, 10, 60, 20);
  graphics.generateTexture('shadow', 60, 20);
  graphics.destroy();

  playerShadow = this.add.image(player.x, player.y + player.height * player.scaleY / 2, 'shadow');
  playerShadow.setScale(scaleBG).setDepth(1);

  // --- Physics ---
  this.physics.add.collider(player, groundCollider);

  // --- Input ---
  this.input.on('pointerdown', () => jump(player));
  cursors = this.input.keyboard.createCursorKeys();

  // --- Resize auto ---
  this.scale.on('resize', (gameSize) => resizeGame(this, gameSize));
}

// --- JUMP FUNCTION ---
function jump(player) {
  if (player.body.touching.down) {
    player.setVelocityY(-500);
  }
}

// --- UPDATE LOOP ---
function update() {
  background.tilePositionX += 4;
  ground.tilePositionX += 4;
  player.setVelocityX(0);

  if (player.body.touching.down) {
    playerShadow.setVisible(true);
    playerShadow.setPosition(player.x, player.y + player.height * player.scaleY / 2);
  } else {
    playerShadow.setVisible(false);
  }

  if (cursors && cursors.space.isDown) jump(player);
}

// --- AUTO RESIZE ---
function resizeGame(scene, gameSize) {
  const width = gameSize.width;
  const height = gameSize.height;
  const scaleBG = Math.max(width / 2796, height / 1290);
  const groundHeight = height * 0.2;

  // Background
  background.setDisplaySize(width, height + 100).setPosition(0, -100).setScale(1);

  // Ground
  ground.setDisplaySize(width, groundHeight).setPosition(0, height - groundHeight);

  // Collider
  groundCollider.x = width / 2;
  groundCollider.y = height - groundHeight / 2;
  groundCollider.width = width;
  groundCollider.height = groundHeight;
  groundCollider.body.setSize(width, groundHeight);
  groundCollider.body.updateFromGameObject();

  // Player & Shadow
  player.setPosition(width * 0.2, height - groundHeight - 150);
  player.setScale(0.08 * scaleBG);
  playerShadow.setScale(scaleBG);
  playerShadow.setPosition(player.x, player.y + player.height * player.scaleY / 2);
}