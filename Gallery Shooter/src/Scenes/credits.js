class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
        this.my = {sprite: {}, text: {}};
    }
    preload() {
        this.load.setPath("./assets/");

        this.load.atlasXML("tilemap", "tilemap_packed.png", "tilemap_packed.xml");
    }
    create() {
        let my = this.my;

        my.sprite.select_hand = this.add.sprite(0, 0, "tilemap", "hand_point_right.png");
        my.sprite.select_hand.setScale(2);
        my.sprite.select_hand.setVisible(false);

        // credits

        my.text.game_design = this.add.text(240, 220, "Game Design: Al Wen", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        my.text.programming = this.add.text(240, 260, "Programming: Al Wen", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        my.text.art = this.add.text(240, 300, "Art: Kenney", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        my.text.sound = this.add.text(240, 340, "Sound effects: Kenney", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        my.text.course = this.add.text(240, 380, "Developed for CMPM 120", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // hand

        const showHand = (button) => {
            my.sprite.select_hand.setPosition(button.x - button.width / 2 - 30, button.y);
            my.sprite.select_hand.setVisible(true);
        };

        // back

        my.text.back_button = this.add.text(240, 500, "Back", {
            font: "20px Verdana",
            fill: "#ffffff"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

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