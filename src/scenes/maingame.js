let player, background, ground, groundCollider;
let cursors;
let cacti;
let lastCactusTime = 0;
let nextCactusInterval = Phaser.Math.Between(4000, 9000);
let gameOver = false;
let score = 0;
let scoreText;
let lastScoreTime = 0;
let gameSpeed = 4.2;
let currentBgKey = null;

const difficultyLevels = [
    { score: 0,   speed: 4.2 },
    { score: 25,  speed: 5.0 },
    { score: 35,  speed: 5.8 },
    { score: 50,  speed: 6.5 },
    { score: 60,  speed: 7.6 },
    { score: 100, speed: 8.5 },
    { score: 115, speed: 9.5 },
    { score: 130, speed: 11.0 },
];

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        gameOver = false;
        score = 0;
        lastScoreTime = 0;
        gameSpeed = 4.2;
        lastCactusTime = 0;
        nextCactusInterval = Phaser.Math.Between(4000, 9000);
    }

    preload() {
        this.load.image('ground', 'assets/groundandbackground/ground.png');
        this.load.image('player', 'assets/player/player.png');
        this.load.image('cactus', 'assets/groundandbackground/cactus.png');

        // 3 ảnh nền cho từng loại thiết bị
        this.load.image('bg_desktop', 'assets/groundandbackground/background_desktop.png');
        this.load.image('bg_tablet', 'assets/groundandbackground/background_tablet.png');
        this.load.image('bg_mobile', 'assets/groundandbackground/background_mobile.png');
    }

    create() {
        const { width, height } = this.scale;

        // 🌄 Tạo background ban đầu theo loại thiết bị
        currentBgKey = this.getBackgroundKey(width);
        background = this.add.tileSprite(0, 0, width, height, currentBgKey)
            .setOrigin(0.5)
            .setScrollFactor(0);

        // 🟫 Ground
        const groundHeight = height * 0.1;
        ground = this.add.tileSprite(0, height, width, groundHeight, 'ground')
            .setOrigin(0, 1)
            .setScrollFactor(0);

        // ⚙️ Collider vật lý
        groundCollider = this.add.rectangle(width / 2, height - groundHeight / 2, width, groundHeight);
        this.physics.add.existing(groundCollider, true);

        // 🧍‍♂️ Player
        player = this.physics.add.sprite(width * 0.2, height - groundHeight - 150, 'player')
            .setCollideWorldBounds(true)
            .setScale(0.08);
        this.physics.add.collider(player, groundCollider);

        // 🧮 Score
        scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: 36,
            color: '#000',
            fontStyle: 'bold'
        }).setDepth(10);

        // 🎮 Input
        cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () => jump(player));

        // 🌵 Cactus
        cacti = this.physics.add.group();
        this.physics.add.collider(player, cacti, () => {
            if (!gameOver) {
                gameOver = true;
                this.physics.pause();
                player.setTint(0xff0000);
                this.scene.start('GameOverScene', { score });
            }
        });

        // 🧭 Popup
        this.createPausePopup();

        // 📱 Theo dõi hướng màn hình
        const handleOrientation = () => {
            const isLandscape = window.innerWidth > window.innerHeight;
            const message = document.getElementById('pauseMessage');
            const resumeBtn = document.getElementById('resumeBtn');
            if (!message || !resumeBtn) return;

            if (isLandscape) {
                resumeBtn.disabled = false;
                resumeBtn.style.opacity = '1';
                resumeBtn.style.cursor = 'pointer';
                message.textContent = 'You are ready! Press "Resume Game" to continue.';
                message.style.color = '#0a0';
            } else {
                this.pauseGame();
                resumeBtn.disabled = true;
                resumeBtn.style.opacity = '0.5';
                resumeBtn.style.cursor = 'not-allowed';
                message.textContent = 'Please rotate your device to landscape mode to resume.';
                message.style.color = '#c00';
            }
        };

        window.addEventListener('resize', handleOrientation);
        window.addEventListener('orientationchange', handleOrientation);
        handleOrientation();

        // 🟦 Cập nhật layout khi resize
        this.scale.on('resize', this.handleResize, this);

        // 🧹 Cleanup
        this.events.once('shutdown', () => {
            window.removeEventListener('resize', handleOrientation);
            window.removeEventListener('orientationchange', handleOrientation);
            this.scale.off('resize', this.handleResize, this);
            ['pausePopup', 'pauseOverlay'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
            });
        });

        // Gọi resize 1 lần đầu tiên
        this.handleResize({ width, height });
    }

    update(time) {
        if (gameOver || this.scene.isPaused()) return;

        if (time > lastScoreTime + 500) {
            score++;
            scoreText.setText('Score: ' + score);
            lastScoreTime = time;
            this.adjustSpeedByScore(score);
        }

        // 🌄 Scroll background + ground
        background.tilePositionX += gameSpeed;
        ground.tilePositionX += gameSpeed;

        // Jump
        if (cursors.space.isDown) jump(player);

        // 🌵 Sinh cactus
        if (time > lastCactusTime + nextCactusInterval) {
            this.spawnCactus();
            lastCactusTime = time;
            nextCactusInterval = Phaser.Math.Between(1500, 4000);
        }

        // Xoá cactus ngoài màn
        cacti.children.iterate((cactus) => {
            if (cactus) cactus.x -= gameSpeed;
            if (cactus && cactus.x < -100) cactus.destroy();
        });
    }

    // 🔁 Chọn ảnh nền phù hợp theo kích thước
    getBackgroundKey(width) {
        if (width >= 1920) return 'bg_desktop';
        if (width >= 1200) return 'bg_tablet';
        return 'bg_mobile';
    }

    // 🔧 Khi resize
    handleResize(gameSize) {
        const { width, height } = gameSize;

        // Chọn ảnh nền phù hợp theo width
        const newBgKey = this.getBackgroundKey(width);
        if (currentBgKey !== newBgKey) {
            background.setTexture(newBgKey);
            currentBgKey = newBgKey;
        }

        // ✅ Scale theo chiều rộng, giữ tỉ lệ gốc, căn giữa theo chiều dọc
        const texture = this.textures.get(currentBgKey).getSourceImage();
        const scale = width / texture.width;  // scale cố định theo chiều rộng
        const displayHeight = texture.height * scale;

        background
            .setDisplaySize(width, displayHeight)
            .setOrigin(0.5, 1)
            .setPosition(width / 2, height * 1.12);

        // 🟫 Ground và collider luôn nằm sát đáy
        const groundHeight = height * 0.1;
        ground.setPosition(0, height).setDisplaySize(width, groundHeight);

        groundCollider
            .setPosition(width / 2, height - groundHeight / 2)
            .setSize(width, groundHeight);

        // 🧍‍♂️ Player đặt ngay trên ground
        player.setY(height - groundHeight - 150);
    }

    adjustSpeedByScore(score) {
        // Tìm level cao nhất phù hợp với điểm hiện tại
        const level = difficultyLevels
            .slice() // sao chép mảng để tránh mutate
            .reverse()
            .find(l => score >= l.score);

        if (level && gameSpeed !== level.speed) {
            gameSpeed = level.speed;
            console.log(`Level up! Score: ${score}, Speed: ${gameSpeed}`);
        }
    }

    spawnCactus() {
        const { width, height } = this.scale;
        const groundHeight = height * 0.085;
        const cactus = cacti.create(width + 50, height - groundHeight, 'cactus');
        cactus.setOrigin(0.5, 1);
        cactus.setScale(0.085);
        cactus.body.allowGravity = false;
    }

    createPausePopup() {
        const overlay = document.createElement('div');
        overlay.id = 'pauseOverlay';
        Object.assign(overlay.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.95)',
            zIndex: 40,
            display: 'none',
            transition: 'opacity 0.3s ease'
        });
        document.body.appendChild(overlay);

        const popup = document.createElement('div');
        popup.id = 'pausePopup';
        Object.assign(popup.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.95)',
            padding: '28px 24px',
            borderRadius: '16px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            width: 'clamp(280px, 80vw, 400px)',
            zIndex: 50,
            animation: 'fadeIn 0.6s ease'
        });

        const title = document.createElement('div');
        title.innerHTML = '<span style="background:linear-gradient(45deg,#007bff,#00c6ff,#28a745);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Game Paused</span>';
        Object.assign(title.style, {
            fontWeight: '800',
            fontSize: 'clamp(2rem, 5vw, 2.8rem)',
            textAlign: 'center',
            marginBottom: '10px'
        });

        const message = document.createElement('p');
        message.id = 'pauseMessage';
        Object.assign(message.style, {
            fontSize: 'clamp(1rem,3vw,1.1rem)',
            textAlign: 'center',
            marginBottom: '16px',
            color: '#c00'
        });

        const resumeBtn = document.createElement('button');
        resumeBtn.id = 'resumeBtn';
        resumeBtn.className = 'btn w-100 text-white fw-bold py-2';
        Object.assign(resumeBtn.style, {
            background: 'linear-gradient(45deg, #28a745, #85e085)',
            border: 'none',
            boxShadow: '0 4px 10px rgba(40,167,69,0.3)',
            fontSize: 'clamp(1rem, 2vw, 1.3rem)'
        });
        resumeBtn.innerHTML = '<i class="bi bi-play-fill me-1"></i> Resume Game';
        resumeBtn.onclick = () => {
            if (!resumeBtn.disabled) {
                popup.classList.add('fade-out');
                overlay.style.opacity = '0';
                setTimeout(() => {
                    this.resumeGame();
                    popup.style.display = 'none';
                    overlay.style.display = 'none';
                    overlay.style.opacity = '1';
                    popup.classList.remove('fade-out');
                }, 400);
            }
        };

        popup.append(title, message, resumeBtn);
        document.body.append(popup);
    }

    pauseGame() {
        this.physics.pause();
        this.scene.pause();
        const popup = document.getElementById('pausePopup');
        const overlay = document.getElementById('pauseOverlay');
        if (popup) popup.style.display = 'flex';
        if (overlay) overlay.style.display = 'block';
    }

    resumeGame() {
        this.physics.resume();
        this.scene.resume();
        const popup = document.getElementById('pausePopup');
        const overlay = document.getElementById('pauseOverlay');
        if (popup) popup.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    }
}

function jump(player) {
    if (player.body.touching.down) player.setVelocityY(-500);
}


function makeResponsiveBackground(scene, key, depth = 0) {
    const { width, height } = scene.scale;
    const bg = scene.add.image(width / 2, height / 2, key)
        .setOrigin(0.5)
        .setDepth(depth);

    const resize = (gameSize) => {
        const w = gameSize ? gameSize.width : width;
        const h = gameSize ? gameSize.height : height;
        const scale = Math.max(w / bg.width, h / bg.height);
        bg.setScale(scale).setPosition(w / 2, h / 2);
    };

    resize({ width, height });
    scene.scale.on('resize', resize);
    scene.events.once('shutdown', () => scene.scale.off('resize', resize));

    return bg;
}