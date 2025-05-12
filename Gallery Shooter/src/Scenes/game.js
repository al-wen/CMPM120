class Game extends Phaser.Scene {
    constructor() {
        super("gameScene");

        this.my = {sprite: {}};

        this.bullets = [];

        this.enemyBullets = [];
        this.enemies = [];

        this.maxEnemy1 = 3;
        this.maxEnemy2 = 2;

        this.baseEnemyFireRate = 3000;
    }
    preload() {
        this.load.setPath("./assets/");

        this.load.atlasXML("tilemap", "tilemap_packed.png", "tilemap_packed.xml");
        this.load.atlasXML("small_cards", "cardsSmall_tilemap_packed.png", "cardsSmall_tilemap_packed.xml");
        this.load.atlasXML("tilemap_white", "tilemap_white_packed.png", "tilemap_white_packed.xml");
    }
    init(data) {
        this.playerStats = data.playerStats || {};
        this.round = (data.round || 1);
        this.maxEnemy1 = 3 + (this.round - 1);
        this.maxEnemy2 = 2 + Math.floor((this.round - 1) / 2);
        this.enemyFireRate = Math.max(500, this.baseEnemyFireRate - (this.round - 1) * 200);
        this.enemySpawnInterval = Math.max(15, 60 - (this.round - 1) * 4);
    }
    create() {
        let my = this.my;

        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.player = new Player(
            this,
            240, 550,
            "tilemap",
            "hand.png",
            this.leftKey,
            this.rightKey,
            this.fireKey,
            this.playerStats.hp || 3,
            this.playerStats.speed || 5,
            this.playerStats.fireRate || 1000,
            this.playerStats.bulletSize || 2,
            this.playerStats.bulletsPerShot || 1,
            3
        );

        this.hp = this.playerStats.hp || 3;
        this.score = this.playerStats.score || 0;

        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];

        // UI
        this.box = this.add.rectangle(240, 30, 480, 60, 0x1D1D1D).setOrigin(0.5, 0.5);
        this.hpIcon = this.add.sprite(40, 32, "small_cards", "heart.png").setScale(2).setOrigin(0.5);

        this.hpText = this.add.text(65, 20, "3", {
            font: "20px Verdana",
            fill: "#ffffff"
        });

        this.timerText = this.add.text(225, 20, "0", {
            font: "20px Verdana",
            fill: "#ffffff"
        });

        this.scoreText = this.add.text(360, 20, "Bits: 0", {
            font: "20px Verdana",
            fill: "#ffffff"
        });

        this.roundText = this.add.text(210, 45, "Round: " + this.round, {
            font: "10px Verdana",
            fill: "#ffffff"
        });

        //time per round
        this.timer = 20;
        this.timeLeft = this.timer;

        // enemy 
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 60;

        this.enemy1Slots = [];
        let slotCount = this.maxEnemy1;
        let slotStartX = 60;
        let slotEndX = 420;
        for (let i = 0; i < slotCount; i++) {
            let x = Phaser.Math.Linear(slotStartX, slotEndX, i / (slotCount - 1));
            this.enemy1Slots.push({ x: x, y: 80, taken: false });
        }

        // red
        this.redFlash = this.add.rectangle(240, 320, 480, 640, 0xff0000, 0.5);
        this.redFlash.setDepth(9999);
        this.redFlash.setVisible(false);

        // starfield
        this.stars = [];
        for (let i = 0; i < 40; i++) {
            let x = Phaser.Math.Between(0, 480);
            let y = Phaser.Math.Between(0, 600);
            let speed = Phaser.Math.FloatBetween(1, 3);
            let star = this.add.sprite(x, y, "tilemap_white", "star.png");
            star.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
            star.speed = speed;
            this.stars.push(star);
        }
    }
    update(time) {
        let my = this.my;

        // bullet
        my.player.update(time, this.bullets);

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let bullet = this.bullets[i];
            bullet.y -= 10;
            if (bullet.y < 60) {
                bullet.destroy();
                this.bullets.splice(i, 1);
                continue;
            }
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                let enemy = this.enemies[j];
                if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), enemy.getBounds())) {
                    bullet.destroy();
                    this.bullets.splice(i, 1);
                    if (enemy instanceof Enemy1 && enemy.slotIndex !== undefined && this.enemy1Slots[enemy.slotIndex]) {
                        this.enemy1Slots[enemy.slotIndex].taken = false;
                    }
                    enemy.active = false;
                    enemy.destroy();
                    this.enemies.splice(j, 1);
                    this.score += 1;
                    break;
                }
            }
        }

        //enemy bullet
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            let bullet = this.enemyBullets[i];
            bullet.y += 3;
            if (bullet.y > this.game.config.height + 10) {
                bullet.destroy();
                this.enemyBullets.splice(i, 1);
                continue;
            }
            if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), my.player.getBounds())) {
                bullet.destroy();
                this.enemyBullets.splice(i, 1);
                this.hp -= 1;
                
                this.redFlash.setVisible(true);
                this.redFlash.alpha = 0.3;
                this.tweens.add({
                    targets: this.redFlash,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        this.redFlash.setVisible(false);
                    }
                });
                
                if (this.hp <= 0) {
                    this.scene.start("gameOverScene", {
                        score: this.score,
                        playerStats: {
                            hp: this.hp,
                            speed: my.player.playerSpeed,
                            fireRate: my.player.fireRate,
                            bulletSize: my.player.bulletSize,
                            bulletsPerShot: my.player.bulletsPerShot
                        }
                    });
                    return;
                }
            }
        }

        // enemy1
        if (!this.enemies) this.enemies = [];
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            if (enemy instanceof Enemy1 && enemy.targetSlot) {
                let dx = enemy.targetSlot.x - enemy.x;
                let dy = enemy.targetSlot.y - enemy.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let slideSpeed = 4;
                if (dist > 2) {
                    enemy.x += dx / dist * slideSpeed;
                    enemy.y += dy / dist * slideSpeed;
                } else {
                    enemy.x = enemy.targetSlot.x;
                    enemy.y = enemy.targetSlot.y;
                    enemy.targetSlot = null;
                }
            }

            if (Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), my.player.getBounds())) {
                if (enemy instanceof Enemy1 && enemy.slotIndex !== undefined && this.enemy1Slots[enemy.slotIndex]) {
                    this.enemy1Slots[enemy.slotIndex].taken = false;
                }
                enemy.active = false;
                enemy.destroy();
                this.enemies.splice(i, 1);
                this.hp -= 1;

                this.redFlash.setVisible(true);
                this.redFlash.alpha = 0.3;
                this.tweens.add({
                    targets: this.redFlash,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        this.redFlash.setVisible(false);
                    }
                });

                if (this.hp <= 0) {
                    this.scene.start("gameOverScene", {
                        score: this.score,
                        playerStats: {
                            hp: this.hp,
                            speed: my.player.playerSpeed,
                            fireRate: my.player.fireRate,
                            bulletSize: my.player.bulletSize,
                            bulletsPerShot: my.player.bulletsPerShot
                        }
                    });
                    return;
                }
                continue;
            }

            if (enemy.active) {
                enemy.update(time);
            }
            if (!enemy.active) {
                if (enemy instanceof Enemy1 && enemy.slotIndex !== undefined && this.enemy1Slots[enemy.slotIndex]) {
                    this.enemy1Slots[enemy.slotIndex].taken = false;
                }
                enemy.destroy();
                this.enemies.splice(i, 1);
            }
        }

        // spawn
        let enemy1Count = this.enemies.filter(e => e instanceof Enemy1).length;
        let enemy2Count = this.enemies.filter(e => e instanceof Enemy2).length;

        this.enemySpawnTimer++;
        if (this.enemySpawnTimer > this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            let freeSlots = this.enemy1Slots.map((slot, idx) => !slot.taken ? idx : -1).filter(idx => idx !== -1);
            if (Math.random() < 0.8 && freeSlots.length > 0 && enemy1Count < this.maxEnemy1) {
                // enemy1
                let idx = Phaser.Utils.Array.GetRandom(freeSlots);
                let slot = this.enemy1Slots[idx];
                let enemyTexture = enemy1_texture();
                let enemy = new Enemy1(this, slot.x, 0, "tilemap", enemyTexture, 0, 2.5, this.enemyFireRate, this.enemyBullets);
                enemy.targetSlot = { x: slot.x, y: slot.y };
                enemy.slotIndex = idx;
                slot.taken = true;
                this.enemies.push(enemy);
            } else if (enemy2Count < this.maxEnemy2) {
                // enemy2
                let enemyTexture = enemy2_texture();
                let x;
                if (enemyTexture === "down_key.png") {
                    x = my.player.x;
                } else {
                    x = Phaser.Math.Between(60, 420);
                }
                let enemy = new Enemy2(this, x, 0, "tilemap", enemyTexture, 4, 2.5, this.enemyFireRate, this.enemyBullets);
                this.enemies.push(enemy);
            }
        }

        // UI
        this.scoreText.setText("Bits: " + this.score);
        this.hpText.setText(this.hp);
        this.roundText.setText("Round: " + this.round);

        let delta = this.game.loop.delta / 1000;
        this.timeLeft -= delta;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            // Pass round+1 to shop and next game round
            this.scene.start("shopScene", { 
                playerStats: { 
                    hp: this.hp, 
                    speed: my.player.playerSpeed, 
                    fireRate: my.player.fireRate, 
                    bulletSize: my.player.bulletSize, 
                    bulletsPerShot: my.player.bulletsPerShot, 
                    score: this.score 
                },
                round: this.round + 1
            });
            return;
        }
        this.timerText.setText(Math.ceil(this.timeLeft));

        // starfield
        for (let star of this.stars) {
            star.y += star.speed;
            if (star.y > 600) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, 480);
                star.speed = Phaser.Math.FloatBetween(1, 3);
                star.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
            }
        }
    }
}

function enemy1_texture() {
    const allKeys = [
        "1_key.png", "2_key.png", "3_key.png", "4_key.png", "5_key.png", "6_key.png", "7_key.png", "8_key.png", "9_key.png", "0_key.png",
        "q_key.png", "w_key.png", "e_key.png", "r_key.png", "t_key.png", "y_key.png", "u_key.png", "i_key.png", "o_key.png", "p_key.png",
        "a_key.png", "s_key.png", "d_key.png", "f_key.png", "g_key.png", "h_key.png", "j_key.png", "k_key.png", "l_key.png",
        "z_key.png", "x_key.png", "c_key.png", "v_key.png", "b_key.png", "n_key.png", "m_key.png",
        "-_key.png", "+_key.png", "=_key.png", "?_key.png"
    ];
    const exclude = [
        "up_key.png", "down_key.png", "left_key.png", "right_key.png",
        "space1_key.png", "space2_key.png", "space3_key.png"
    ];
    const validKeys = allKeys.filter(key => !exclude.includes(key));
    return Phaser.Utils.Array.GetRandom(validKeys);
}

function enemy2_texture() {
    const textures = ["right_key.png", "down_key.png", "left_key.png"];
    return Phaser.Utils.Array.GetRandom(textures);
}