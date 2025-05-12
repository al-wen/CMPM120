class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, leftKey, rightKey, fireKey, hp = 3, playerSpeed = 5, fireRate = 1000, bulletSize = 2, bulletsPerShot = 1, playerScale = 3) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);

        // movement
        this.left = leftKey;
        this.right = rightKey;
        this.fire = fireKey;

        // stats
        this.hp = hp;
        this.playerSpeed = playerSpeed;
        this.fireRate = fireRate;
        this.bulletSize = bulletSize;
        this.bulletsPerShot = bulletsPerShot;

        // size
        this.playerScale = playerScale;
        this.setScale(this.playerScale);

        // last bullet shot
        this.lastShot = 0;
        this.scene = scene;
    }

    update(time, bulletsArray) {
        // movement
        if (this.left.isDown && this.x > (this.displayWidth / 2)) {
            this.x -= this.playerSpeed;
        }
        if (this.right.isDown && this.x < (this.scene.game.config.width - this.displayWidth / 2)) {
            this.x += this.playerSpeed;
        }

        // update hand sprite based on bulletsPerShot
        let desiredFrame = "hand.png";
        if (this.bulletsPerShot >= 4) {
            desiredFrame = "hand4.png";
        } else if (this.bulletsPerShot === 3) {
            desiredFrame = "hand3.png";
        } else if (this.bulletsPerShot === 2) {
            desiredFrame = "hand2.png";
        }
        if (this.texture.key !== "tilemap" || this.frame.name !== desiredFrame) {
            this.setTexture("tilemap", desiredFrame);
        }

        // bullet
        if (this.fire.isDown && time > this.lastShot + this.fireRate) {
            this.lastShot = time;
            for (let i = 0; i < this.bulletsPerShot; i++) {
                let offset = (i - (this.bulletsPerShot - 1) / 2) * 10;
                let bullet = this.scene.add.sprite(this.x + offset, this.y - 10, "tilemap", "bullet.png");
                bullet.setScale(this.bulletSize);
                bulletsArray.push(bullet);
            }
        }
    }

    upgradeHP(amount = 1) {
        this.hp += amount;
    }

    upgradeSpeed(amount = 1) {
        this.playerSpeed += amount;
    }

    upgradeFireRate(amount = 10) {
        this.fireRate = Math.max(50, this.fireRate - amount);
    }

    upgradeBulletSize(amount = 0.5) {
        this.bulletSize += amount;
    }

    upgradeBulletsPerShot(amount = 1) {
        this.bulletsPerShot += amount;
    }
}