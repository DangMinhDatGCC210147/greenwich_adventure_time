// src/utils/responsiveBackground.js
export function makeResponsiveBackground(scene, key, depth = 0) {
    const { width, height } = scene.scale;
    const bg = scene.add.image(width / 2, height / 2, key)
        .setOrigin(0.5)
        .setDepth(depth);

    // 🔹 Hàm resize lại background khi thay đổi kích thước
    const resize = (gameSize) => {
        const w = gameSize ? gameSize.width : width;
        const h = gameSize ? gameSize.height : height;
        const scale = Math.max(w / bg.width, h / bg.height);
        bg.setScale(scale).setPosition(w / 2, h / 2);
    };

    // 🔹 Gọi resize ngay lần đầu tiên
    resize({ width, height });

    // 🔹 Lắng nghe sự kiện resize
    scene.scale.on('resize', resize);
    scene.events.once('shutdown', () => {
        scene.scale.off('resize', resize);
    });

    return bg;
}
