class Start extends Phaser.Scene {
    constructor() {
        super("startScene");
        this.my = {sprite: {}, text: {}};

        this.keySprites = [];
        this.keyNames = [];
        this.timer = 0;
        this.interval = Phaser.Math.Between(20, 60);
    }
    preload() {
        this.load.setPath("./assets/");

        this.load.atlasXML("tilemap", "tilemap_packed.png", "tilemap_packed.xml");
    }
    create() {
        let my = this.my;

        this.keyNames = this.textures.get('tilemap').getFrameNames().filter(name => name.includes('_key'));

        // text

        my.text.title = this.add.text(240, 300, "Finger", {
            font: "24px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        my.text.start_button = this.add.text(240, 400, "Start", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        my.text.controls_button = this.add.text(240, 450, "Controls", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        my.text.credit_button = this.add.text(240, 550, "Credits", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        my.text.highscore_button = this.add.text(240, 500, "High Score", {
            font: "20px Verdana",
            fill: "#ffff88"
        }).setOrigin(0.5);


        // select_hand

        my.sprite.select_hand = this.add.sprite(0, 0, "tilemap", "hand_point_right.png");
        my.sprite.select_hand.setScale(2);
        my.sprite.select_hand.setVisible(false);

        const showHand = (button) => {
            my.sprite.select_hand.setPosition(button.x - button.width / 2 - 30, button.y);
            my.sprite.select_hand.setVisible(true);
        };

        // demo

        my.sprite.demo_hand = this.add.sprite(240, 520, "tilemap", "hand.png");
        my.sprite.demo_hand.setScale(2);
        my.sprite.demo_hand.setDepth(-1);
        my.sprite.demo_hand.setAlpha(0.5);

        this.demoHandTargetX = Phaser.Math.Between(40, 440);
        //this.demoHandTargetY = Phaser.Math.Between();
        this.demoHandSpeed = 2;

        // start

        my.text.start_button.setInteractive({ useHandCursor: true });
        my.text.start_button.on('pointerdown', () => {
            this.scene.start("gameScene", { 
                playerStats: { 
                    hp: 3, 
                    speed: 5, 
                    fireRate: 1000, 
                    bulletSize: 2, 
                    bulletsPerShot: 1, 
                    score: 0 
                }, 
                round: 1 
            });
        });
        my.text.start_button.on('pointerover', () => {
            my.text.start_button.setStyle({ fill: "#ffff00" });
            showHand(my.text.start_button);
        });
        my.text.start_button.on('pointerout', () => {
            my.text.start_button.setStyle({ fill: "#ffffff" });
            my.sprite.select_hand.setVisible(false);
        });

        // controls

        my.text.controls_button.setInteractive({ useHandCursor: true });
        my.text.controls_button.on('pointerdown', () => {
            this.scene.start("controlsScene");
        });
        my.text.controls_button.on('pointerover', () => {
            my.text.controls_button.setStyle({ fill: "#ffff00" });
            showHand(my.text.controls_button);
        });
        my.text.controls_button.on('pointerout', () => {
            my.text.controls_button.setStyle({ fill: "#ffffff" });
            my.sprite.select_hand.setVisible(false);
        });

        // credits

        my.text.credit_button.setInteractive({ useHandCursor: true });
        my.text.credit_button.on('pointerdown', () => {
            this.scene.start("creditsScene");
        });
        my.text.credit_button.on('pointerover', () => {
            my.text.credit_button.setStyle({ fill: "#ffff00" });
            showHand(my.text.credit_button);
        });
        my.text.credit_button.on('pointerout', () => {
            my.text.credit_button.setStyle({ fill: "#ffffff" });
            my.sprite.select_hand.setVisible(false);
        });

        // high score

        my.text.highscore_button.setInteractive({ useHandCursor: true });
        my.text.highscore_button.on('pointerdown', () => {
            this.scene.start("highscoreScene");
        });
        my.text.highscore_button.on('pointerover', () => {
            my.text.highscore_button.setStyle({ fill: "#ffff00" });
            showHand(my.text.highscore_button);
        });
        my.text.highscore_button.on('pointerout', () => {
            my.text.highscore_button.setStyle({ fill: "#ffff88" });
            my.sprite.select_hand.setVisible(false);
        });
    }
    update() {
        this.timer++;
        if (this.timer > this.interval) {
            this.timer = 0;
            this.interval = Phaser.Math.Between(20, 50);
            let frame = Phaser.Utils.Array.GetRandom(this.keyNames);
            let x = Phaser.Math.Between(0, this.game.config.width);
            let scale = Phaser.Math.FloatBetween(1, 2.5);
            let speed = Phaser.Math.FloatBetween(0.5, 2) * scale;
            let sprite = this.add.sprite(x, -16, "tilemap", frame);
            sprite.setScale(scale);
            sprite.setDepth(-1);
            sprite._rainSpeed = speed;
            this.keySprites.push(sprite);
        }

        for (let i = this.keySprites.length - 1; i >= 0; i--) {
            let sprite = this.keySprites[i];
            sprite.y += sprite._rainSpeed;
            if (sprite.y > this.game.config.height + 16) {
                sprite.destroy();
                this.keySprites.splice(i, 1);
            }
        }

        if (this.my && this.my.sprite && this.my.sprite.demo_hand) {
            let hand = this.my.sprite.demo_hand;
            if (Math.abs(hand.x - this.demoHandTargetX) < 2) {
                this.demoHandTargetX = Phaser.Math.Between(40, 440);
                this.demoHandSpeed = Phaser.Math.FloatBetween(1.5, 3.5);
            }
            if (hand.x < this.demoHandTargetX) {
                hand.x += this.demoHandSpeed;
                if (hand.x > this.demoHandTargetX) hand.x = this.demoHandTargetX;
            } else if (hand.x > this.demoHandTargetX) {
                hand.x -= this.demoHandSpeed;
                if (hand.x < this.demoHandTargetX) hand.x = this.demoHandTargetX;
            }
        }
    }
}