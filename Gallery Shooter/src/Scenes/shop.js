class Shop extends Phaser.Scene {
    constructor() {
        super("shopScene");
        this.my = { sprite: {}, text: {} };
    }
    init(data) {
        this.playerStats = data.playerStats;
    }
    create() {
        let my = this.my;
        let y = 120;
        this.add.text(240, 60, "SHOP", { font: "32px Verdana", fill: "#ffffff" }).setOrigin(0.5);
        this.add.text(240, y, `Bits: ${this.playerStats.score}`, { font: "20px Verdana", fill: "#ffffff" }).setOrigin(0.5);

        // stats
        y += 30;
        this.add.text(240, y, 
            `HP: ${this.playerStats.hp || 3}   Speed: ${this.playerStats.speed || 5}   Fire Rate: ${this.playerStats.fireRate || 500}\nBullet Size: ${this.playerStats.bulletSize || 2}   Attack Speed: ${this.playerStats.bulletsPerShot || 1}`,
            { font: "16px Verdana", fill: "#aaa", align: "center" }
        ).setOrigin(0.5);

        y += 40;
        my.text.hp = this.add.text(240, y, `HP (+1) - 3 bits`, { font: "20px Verdana", fill: "#ffffff" }).setOrigin(0.5);
        y += 40;
        my.text.speed = this.add.text(240, y, `Speed (+1) - 5 bits`, { font: "20px Verdana", fill: "#ffffff" }).setOrigin(0.5);
        y += 40;
        my.text.fireRate = this.add.text(240, y, `Fire Rate (-50) - 5 bits`, { font: "20px Verdana", fill: "#ffffff" }).setOrigin(0.5);
        y += 40;
        my.text.bulletSize = this.add.text(240, y, `Bullet Size (+0.5) - 5 bits`, { font: "20px Verdana", fill: "#ffffff" }).setOrigin(0.5);
        y += 40;
        my.text.bulletsPerShot = this.add.text(240, y, `Bullet Count (+1) - 8 bits`, { font: "20px Verdana", fill: "#ffffff" }).setOrigin(0.5);
        y += 60;
        my.text.continue = this.add.text(240, y, "Leave", { font: "28px Verdana", fill: "#ffffff" }).setOrigin(0.5);

        // hand
        my.sprite.select_hand = this.add.sprite(0, 0, "tilemap", "hand_point_right.png");
        my.sprite.select_hand.setScale(2);
        my.sprite.select_hand.setVisible(false);

        // buttons
        const buttons = [
            my.text.hp,
            my.text.speed,
            my.text.fireRate,
            my.text.bulletSize,
            my.text.bulletsPerShot,
            my.text.continue
        ];
        let selected = 0;

        const showHand = (button) => {
            my.sprite.select_hand.setPosition(button.x - button.width / 2 - 30, button.y);
            my.sprite.select_hand.setVisible(true);
        };

        const updateSelection = () => {
            buttons.forEach((btn, idx) => {
                if (idx === selected) {
                    btn.setStyle({ fill: "#ffff00" });
                } else if (btn === my.text.continue) {
                    btn.setStyle({ fill: "#0f0" });
                } else {
                    btn.setStyle({ fill: "#ffffff" });
                }
            });
            showHand(buttons[selected]);
        };

        // hover
        buttons.forEach((btn, idx) => {
            btn.setInteractive({ useHandCursor: true });
            btn.on("pointerover", () => {
                selected = idx;
                updateSelection();
            });
            btn.on("pointerout", () => {
                btn.setStyle({ fill: btn === my.text.continue ? "#ffffff" : "#ffffff" });
                my.sprite.select_hand.setVisible(false);
            });
        });

        // upgrade
        my.text.hp.on("pointerdown", () => {
            if (this.playerStats.score >= 3) {
                this.playerStats.hp += 1;
                this.playerStats.score -= 3;
                this.scene.restart({ playerStats: this.playerStats, round: this.scene.settings.data.round });
            }
        });
        my.text.speed.on("pointerdown", () => {
            if (this.playerStats.score >= 5) {
                this.playerStats.speed = (this.playerStats.speed || 5) + 1;
                this.playerStats.score -= 5;
                this.scene.restart({ playerStats: this.playerStats, round: this.scene.settings.data.round });
            }
        });
        my.text.fireRate.on("pointerdown", () => {
            if (this.playerStats.score >= 5) {
                this.playerStats.fireRate = Math.max(50, (this.playerStats.fireRate || 500) - 50);
                this.playerStats.score -= 5;
                this.scene.restart({ playerStats: this.playerStats, round: this.scene.settings.data.round });
            }
        });
        my.text.bulletSize.on("pointerdown", () => {
            if (this.playerStats.score >= 5) {
                this.playerStats.bulletSize = (this.playerStats.bulletSize || 2) + 0.5;
                this.playerStats.score -= 5;
                this.scene.restart({ playerStats: this.playerStats, round: this.scene.settings.data.round });
            }
        });
        my.text.bulletsPerShot.on("pointerdown", () => {
            if (this.playerStats.score >= 8) {
                this.playerStats.bulletsPerShot = (this.playerStats.bulletsPerShot || 1) + 1;
                this.playerStats.score -= 8;
                this.scene.restart({ playerStats: this.playerStats, round: this.scene.settings.data.round });
            }
        });
        my.text.continue.on("pointerdown", () => {
            this.scene.start("gameScene", { playerStats: this.playerStats, round: this.scene.settings.data.round });
        });

        updateSelection();
    }
}