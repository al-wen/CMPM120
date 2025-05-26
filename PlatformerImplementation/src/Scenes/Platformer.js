class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 1000;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1000;
        this.JUMP_VELOCITY = -300;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;

        this.MAX_SPEED = 100;
        this.TERMINAL_VELOCITY = 1000;

        this.bounceSoundCooldown = 0;
        this.winSoundCooldown = 0;
    }

    create() {
        this.map = this.add.tilemap("platformer-level-1", 8, 8, 240, 1200);

        this.tileset = this.map.addTilesetImage("tilemap", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("platforms", this.tileset, 0, 0);

        this.environmentLayer = this.map.createLayer("environment", this.tileset, 0, 0);

        this.bounceLayer = this.map.createLayer("bounce", this.tileset, 0, 0);
        this.bounceRightLayer = this.map.createLayer("bounceRight", this.tileset, 0, 0);
        this.bounceLeftLayer = this.map.createLayer("bounceLeft", this.tileset, 0, 0);

        this.spikeLayer = this.map.createLayer("spikes", this.tileset, 0, 0);

        this.win = this.map.createLayer("win", this.tileset, 0, 0);
        this.win.setVisible(false);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.bounceLayer.setCollisionByProperty({
            collides: true
        });
        this.bounceRightLayer.setCollisionByProperty({
            collides: true
        });
        this.bounceLeftLayer.setCollisionByProperty({
            collides: true
        });
        this.spikeLayer.setCollisionByProperty({
            collides: true
        });
        this.win.setCollisionByProperty({
            collides: true
        });

        // coin
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 88
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.coins);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(32, 1162, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(false);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Add bounce collider UP
        this.physics.add.collider(my.sprite.player, this.bounceLayer, () => {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY * 1.5);
            if (this.time.now > this.bounceSoundCooldown) {
                this.sound.play("jumpSound", { volume: 0.4 });
                this.bounceSoundCooldown = this.time.now + 500;
            }
        }, null, this);

        // RIGHT
        this.physics.add.collider(my.sprite.player, this.bounceRightLayer, () => {
            my.sprite.player.isBouncing = true;
            my.sprite.player.body.setVelocityX(this.MAX_SPEED * 5);
            this.time.delayedCall(250, () => { my.sprite.player.isBouncing = false; });
            this.sound.play("jumpSound", { volume: 0.4 });
        }, null, this);

        // LEFT
        this.physics.add.collider(my.sprite.player, this.bounceLeftLayer, () => {
            my.sprite.player.isBouncing = true;
            my.sprite.player.body.setVelocityX(-this.MAX_SPEED * 5);
            this.time.delayedCall(250, () => { my.sprite.player.isBouncing = false; });
            this.sound.play("jumpSound", { volume: 0.4 });
        }, null, this);

        // spikes
        this.physics.add.collider(my.sprite.player, this.spikeLayer, () => {
            my.sprite.player.x = 32;
            my.sprite.player.y = 1162;
            my.sprite.player.body.setVelocity(0, 0);
            this.sound.play("deadSound", { volume: 0.3 });
        }, null, this);

        // coin collision
        this.coinCollectEmitter = this.add.particles(0, 0, "platformer_characters", {
            frame: ["coin.png"],
            x: -100,
            y: -100,
            lifespan: 500,
            speed: { min: 60, max: 120 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.2, end: 0.1 },
            alpha: { start: 1, end: 0 },
            quantity: 8,
            gravityY: 0,
            on: false // Don't run until triggered
        });

        // Coin collision handler
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.coinCollectEmitter.emitParticleAt(obj2.x, obj2.y);
            this.sound.play("coinSound", { volume: 0.3 });

        });

        // win
        this.physics.add.collider(my.sprite.player, this.win, () => {
            this.win.setVisible(true);
            if (this.time.now > this.winSoundCooldown) {
                this.sound.play("deadSound", { volume: 0.4, rate: 2.5 });
                this.sound.play("deadSound", { volume: 0.5, rate: 3 });
                this.winSoundCooldown = this.time.now + 1000000;
            }
        }, null, this);
        
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "platformer_characters", {
            frame: ['cloud1.png', 'cloud2.png'],
            scale: {start: 0.3, end: 1.0},
            lifespan: 350,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();


        // camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.scale.width / this.map.widthInPixels);

        this.cameras.main.scrollX = this.map.widthInPixels / 2 - this.cameras.main.width / 2;
    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2+1, my.sprite.player.displayHeight/2-1, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-1, my.sprite.player.displayHeight/2-1, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play("jumpSound", { volume: 0.4, rate: Phaser.Math.FloatBetween(1.6, 2) });
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // speed cap
        if (!my.sprite.player.isBouncing) {
            if (my.sprite.player.body.velocity.x > this.MAX_SPEED) {
                my.sprite.player.body.velocity.x = this.MAX_SPEED;
            } else if (my.sprite.player.body.velocity.x < -this.MAX_SPEED) {
                my.sprite.player.body.velocity.x = -this.MAX_SPEED;
            }
        }

        if (my.sprite.player.body.velocity.y > this.TERMINAL_VELOCITY) {
            my.sprite.player.body.velocity.y = this.TERMINAL_VELOCITY;
        }
    }
}