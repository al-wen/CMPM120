class Controls extends Phaser.Scene {
    constructor() {
        super("controlsScene");
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

        // controls

        my.sprite.a_key = this.add.sprite(200, 180, "tilemap", "a_key.png").setScale(3);
        my.sprite.d_key = this.add.sprite(280, 180, "tilemap", "d_key.png").setScale(3);

        my.text.instructions1 = this.add.text(240, 240, "Use A and D to move left and right", {
            font: "20px Verdana",
            fill: "#ffffff",
            align: "center"
        }).setOrigin(0.5);
        my.text.instructions2 = this.add.text(240, 360, "Space to shoot", {
            font: "20px Verdana",
            fill: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        my.sprite.a_key = this.add.sprite(200, 180, "tilemap", "a_key.png").setScale(3);
        my.sprite.d_key = this.add.sprite(280, 180, "tilemap", "d_key.png").setScale(3);
        
        my.sprite.space1_key = this.add.sprite(195, 310, "tilemap", "space1_key.png").setScale(3);
        my.sprite.space2_key = this.add.sprite(240, 310, "tilemap", "space2_key.png").setScale(3);
        my.sprite.space3_key = this.add.sprite(285, 310, "tilemap", "space3_key.png").setScale(3);

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