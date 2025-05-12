class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, speed = 2, scale = 3, fireRate = 500) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.scene = scene;
        this.speed = speed;
        this.setScale(scale);
        this.active = true;
        this.fireRate = fireRate;
    }

    update(time) {
        
    }
}

class Enemy1 extends Enemy {
    constructor(scene, x, y, texture, frame, speed = 0, scale = 3, fireRate = 120, bulletArray = []) {
        super(scene, x, y, texture, frame, speed, scale, fireRate);
        this.lastShot = 0;
        this.bulletArray = bulletArray;
    }

    update(time) {
        if (time > this.lastShot + this.fireRate) {
            this.lastShot = time;
            let bullet = this.scene.add.sprite(this.x, this.y + this.displayHeight / 2, "tilemap", "enemy_bullet.png");
            bullet.setScale(2);
            bullet._enemyBullet = true;
            if (this.bulletArray) {
                this.bulletArray.push(bullet);
            }
        }
    }
}

class Enemy2 extends Enemy {
    constructor(scene, x, y, texture, frame, speed = 4, scale = 2) {
        super(scene, x, y, texture, frame, speed, scale);
        this.isSnake = (frame === "left_key.png" || frame === "right_key.png");
        if (frame === "left_key.png") {
            this.snakeDir = -1;
        } else {
            this.snakeDir = 1;
        }
        this.snakeTimer = 0;
        this.snakeDuration = 40;
        this.acceleration = 0.1;
        this.maxSpeed = 12;
    }

    update(time) {
        this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);

        if (this.isSnake) {
            this.y += this.speed;
            this.x += this.snakeDir * 1.5;
            this.snakeTimer++;
            if (this.snakeTimer > this.snakeDuration) {
                this.snakeDir *= -1;
                this.snakeTimer = 0;
            }
        } else {
            this.y += this.speed;
        }
        if (this.scene && this.scene.game && this.y > this.scene.game.config.height + this.displayHeight / 2) {
            this.destroy();
            this.active = false;
        }
    }
}