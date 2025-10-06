let player, background, ground, groundCollider, playerShadow;
let cursors;
let cacti;
let lastCactusTime = 0;
let nextCactusInterval = Phaser.Math.Between(3000, 8000);
let gameOver = false;
let score = 0;
let scoreText;
let lastScoreTime = 0;

let gameSpeed = 4.2;
const scoreMilestones = [10, 50, 100, 150, 200, 500, 1000];
const speedIncrements = [0.5, 0.7, 1, 1.3, 1.6, 2.0, 3.0];

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        //console.log("GameScene init"); // Debug log
        // Reset all global variables
        gameOver = false;
        score = 0;
        lastScoreTime = 0;
        gameSpeed = 4.2;
        lastCactusTime = 0;
        nextCactusInterval = Phaser.Math.Between(3000, 8000);

        // Destroy existing game objects if they exist
        if (player) player.destroy();
        if (playerShadow) playerShadow.destroy();
        if (background) background.destroy();
        if (ground) ground.destroy();
        if (groundCollider) groundCollider.destroy();
        if (scoreText) scoreText.destroy();
        if (cacti) {
            try {
                cacti.children.each(cactus => {
                    if (cactus && cactus.active) cactus.destroy();
                });
                cacti.clear(false, true); // chỉ clear reference, không cố destroy lại
            } catch (e) {
                console.warn("Error clearing cacti:", e);
            }
}


        // Clear all input listeners
        this.input.removeAllListeners();
        // Remove resize listener to prevent premature calls
        this.scale.off('resize');

        // Resume physics if paused
        if (this.physics.world.isPaused) {
            this.physics.resume();
        }
    }

    preload() {
        //console.log("GameScene preload"); // Debug log
        this.load.image('background', 'assets/groundandbackground/bg.png');
        this.load.image('ground', 'assets/groundandbackground/ground.png');
        this.load.image('player', 'assets/player/player.png');
        this.load.image('cactus', 'assets/groundandbackground/cactus.png');
    }

    create() {
        //console.log("GameScene create start"); // Debug log
        const { width, height } = this.scale;

        // Background
        background = this.add.tileSprite(0, -100, width, height + 100, 'background').setOrigin(0, 0).setScrollFactor(0).setDepth(0);
        const scaleBG = Math.max(width / 2796, height / 1290);
        background.setDisplaySize(width, height + 100);
        background.tilePositionX = 0;

        // Ground
        const groundHeight = height * 0.1;
        ground = this.add.tileSprite(0, height - groundHeight, width, groundHeight, 'ground').setOrigin(0, 1).setScrollFactor(0).setDepth(1);
        ground.setDisplaySize(width, groundHeight);
        ground.tilePositionX = 0;

        // Ground collider
        groundCollider = this.add.rectangle(width / 2, height - groundHeight / 2, width, groundHeight);
        this.physics.add.existing(groundCollider, true);
        groundCollider.visible = false;

        // Player
        player = this.physics.add.sprite(width * 0.2, height - groundHeight - 150, 'player').setCollideWorldBounds(true);
        player.setScale(0.08 * scaleBG).setDepth(2);
        player.clearTint();

        // Shadow
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(30, 10, 60, 20);
        graphics.generateTexture('shadow', 60, 20);
        graphics.destroy();

        playerShadow = this.add.image(player.x, player.y + player.height * player.scaleY / 2, 'shadow').setScale(scaleBG).setDepth(1);

        // Score text
        scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: 64 * scaleBG,
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        }).setDepth(3).setScrollFactor(0);

        // Physics
        this.physics.add.collider(player, groundCollider);

        // Input
        this.input.on('pointerdown', () => {
            //console.log("Pointer down detected"); // Debug log
            jump(player);
        });
        cursors = this.input.keyboard.createCursorKeys();

        // Cacti group
        cacti = this.physics.add.group();
        this.physics.add.collider(player, cacti, () => {
            //console.log("Collision with cactus detected"); // Debug log
            if (!gameOver) {
                gameOver = true;
                this.physics.pause();
                player.setTint(0xff0000);
                this.scene.launch('GameOverScene', { score: score });
                //console.log("GAME OVER");
            }
        });

        // Resize event (added after initialization)
        //console.log("GameScene create adding resize listener"); // Debug log
        this.scale.on('resize', (gameSize) => resizeGame(this, gameSize));
        //console.log("GameScene create end"); // Debug log
    }

    update(time, delta) {
        //console.log("GameScene update"); // Debug log
        if (gameOver) return;

        // Update score
        if (time > lastScoreTime + 500) {
            score += 1;
            scoreText.setText('Score: ' + Math.floor(score));
            lastScoreTime = time;

            for (let i = 0; i < scoreMilestones.length; i++) {
                if (score === scoreMilestones[i]) {
                    gameSpeed += speedIncrements[i];
                    //console.log(`Điểm ${score}: Tăng tốc lên ${gameSpeed}`);
                }
            }
        }

        // Move background/ground
        background.tilePositionX += gameSpeed;
        ground.tilePositionX += gameSpeed;
        player.setVelocityX(0);

        // Update shadow
        if (player.body.touching.down) {
            playerShadow.setVisible(true);
            playerShadow.setPosition(player.x, player.y + player.height * player.scaleY / 2);
        } else {
            playerShadow.setVisible(false);
        }

        // Jump with spacebar
        if (cursors && cursors.space.isDown) {
            //console.log("Spacebar pressed"); // Debug log
            jump(player);
        }

        // Spawn cacti
        if (time > lastCactusTime + nextCactusInterval) {
            spawnCactus(this);
            lastCactusTime = time;
            nextCactusInterval = Phaser.Math.Between(1000, 6000);
        }

        // Move cacti
        cacti.children.iterate((cactus) => {
            if (!cactus) return;
            cactus.x -= gameSpeed;
            if (cactus.x < -cactus.width) {
                cactus.destroy();
            }
        });
    }

    shutdown() {
        //console.log("GameScene shutdown"); // Debug log
        // Clean up resources when scene stops
        this.input.removeAllListeners();
        this.scale.off('resize'); // Remove resize listener
        if (player) player.destroy();
        if (playerShadow) playerShadow.destroy();
        if (background) background.destroy();
        if (ground) ground.destroy();
        if (groundCollider) groundCollider.destroy();
        if (scoreText) scoreText.destroy();
        if (cacti) cacti.clear(true, true);
    }
}

function jump(player) {
    if (player.body.touching.down) {
        //console.log("Player jumping"); // Debug log
        player.setVelocityY(-500);
    } else {
        //console.log("Player not on ground, cannot jump"); // Debug log
    }
}

function spawnCactus(scene) {
    const { width, height } = scene.scale;
    const groundHeight = height * 0.1;
    const cactus = cacti.create(width + 50, height - groundHeight, 'cactus');
    cactus.setOrigin(0.5, 1);
    cactus.setScale(0.1);
    cactus.setImmovable(true);
    cactus.body.allowGravity = false;

    const colliderScale = 0.7;
    const originalWidth = cactus.body.width;
    const originalHeight = cactus.body.height;
    const newWidth = originalWidth * colliderScale;
    const newHeight = originalHeight * colliderScale;
    cactus.body.setSize(newWidth, newHeight);
    cactus.body.setOffset(
        (originalWidth - newWidth) / 2,
        (originalHeight - newHeight) / 2
    );
}

function resizeGame(scene, gameSize) {
    if (!scene || !gameSize) return;
    const width = gameSize.width;
    const height = gameSize.height;
    const scaleBG = Math.max(width / 2796, height / 1290);
    const groundHeight = height * 0.1;

    if (background && background.active) {
        background.setDisplaySize(width, height + 100).setPosition(0, -100);
    }

    if (ground && ground.active) {
        ground.setDisplaySize(width, groundHeight).setPosition(0, height - groundHeight);
    }

    // ✅ Fix here — check for undefined safely
    if (groundCollider && groundCollider.body) {
        groundCollider.setSize(width, groundHeight);
        groundCollider.setPosition(width / 2, height - groundHeight / 2);
        if (groundCollider.body) {
            groundCollider.body.setSize(width, groundHeight);
            groundCollider.body.updateFromGameObject();
        }
    }

    if (player && player.active) {
        player.setPosition(width * 0.2, height - groundHeight - 150).setScale(0.08 * scaleBG);
    }

    if (playerShadow && playerShadow.active) {
        playerShadow.setScale(scaleBG).setPosition(player.x, player.y + player.height * player.scaleY / 2);
    }

    if (scoreText && scoreText.active) {
        scoreText.setPosition(20, 20).setFontSize(32 * scaleBG);
    }
}