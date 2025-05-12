class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOverScene");
        this.my = { sprite: {}, text: {} };
    }
    init(data) {
        this.finalScore = data && data.score ? data.score : 0;
        this.finalStats = data && data.playerStats ? data.playerStats : {};
    }
    preload() {
        this.load.setPath("./assets/");
        this.load.atlasXML("tilemap", "tilemap_packed.png", "tilemap_packed.xml");
    }
    create() {
        let my = this.my;

        // high score

        let prevHighScore = parseInt(localStorage.getItem("highScore") || "0");
        if (this.finalScore > prevHighScore) {
            localStorage.setItem("highScore", this.finalScore);
        }

        my.sprite.select_hand = this.add.sprite(0, 0, "tilemap", "hand_point_right.png");
        my.sprite.select_hand.setScale(2);
        my.sprite.select_hand.setVisible(false);

        my.text.title = this.add.text(240, 120, "GAME OVER", {
            font: "32px Verdana",
            fill: "#ff4444"
        }).setOrigin(0.5);

        my.text.score = this.add.text(240, 170, `Bits: ${this.finalScore}`, {
            font: "24px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // stats
        let statsY = 210;
        this.add.text(240, statsY, 
            `HP: ${this.finalStats.hp || 3}   Speed: ${this.finalStats.speed || 5}   Fire Rate: ${this.finalStats.fireRate || 500}\nBullet Size: ${this.finalStats.bulletSize || 2}   Bullet Count: ${this.finalStats.bulletsPerShot || 1}`,
            { font: "16px Verdana", fill: "#aaa", align: "center" }
        ).setOrigin(0.5);

        my.text.back_button = this.add.text(240, 340, "Back", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const showHand = (button) => {
            my.sprite.select_hand.setPosition(button.x - button.width / 2 - 30, button.y);
            my.sprite.select_hand.setVisible(true);
        };

        my.text.back_button.on('pointerdown', () => {
            this.scene.start("startScene");
        });
        my.text.back_button.on('pointerover', () => {
            my.text.back_button.setStyle({ fill: "#ffff00" });
            showHand(my.text.back_button);
        });
        my.text.back_button.on('pointerout', () => {
            my.text.back_button.setStyle({ fill: "#ffffff" });
            my.sprite.select_hand.setVisible(false);
        });
    }
}