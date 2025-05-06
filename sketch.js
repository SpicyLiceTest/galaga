let player, bullets, enemies, score;

function setup() {
    createCanvas(400, 600);
    player = new Player();
    bullets = [];
    enemies = [];
    score = 0;
    // Initialize enemies in a grid
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            enemies.push(new Enemy(50 + i * 60, 50 + j * 50));
        }
    }
}

function draw() {
    background(0);
    // Update and show player
    player.update();
    player.show();
    // Update and show bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].show();
        if (bullets[i].offscreen()) {
            bullets.splice(i, 1);
            continue;
        }
        // Check bullet-enemy collisions
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i] && bullets[i].hits(enemies[j])) {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                break;
            }
        }
    }
    // Update and show enemies
    for (let enemy of enemies) {
        enemy.update();
        enemy.show();
        // Check player-enemy collision
        if (player.hits(enemy)) {
            noLoop();
            textSize(32);
            fill(255);
            textAlign(CENTER);
            text("Game Over", width / 2, height / 2);
        }
    }
    // Display score
    textSize(20);
    fill(255);
    textAlign(LEFT);
    text("Score: " + score, 10, 30);
}

function keyPressed() {
    if (keyCode === 32) { // Spacebar
        bullets.push(new Bullet(player.x, player.y));
    }
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 50;
        this.w = 20;
        this.h = 20;
        this.speed = 5;
    }
    update() {
        if (keyIsDown(LEFT_ARROW)) {
            this.x -= this.speed;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            this.x += this.speed;
        }
        this.x = constrain(this.x, 0, width - this.w);
    }
    show() {
        fill(0, 255, 0);
        rect(this.x, this.y, this.w, this.h);
    }
    hits(enemy) {
        return (this.x < enemy.x + enemy.w &&
                this.x + this.w > enemy.x &&
                this.y < enemy.y + enemy.h &&
                this.y + this.h > enemy.y);
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x + 8;
        this.y = y;
        this.r = 5;
        this.speed = -10;
    }
    update() {
        this.y += this.speed;
    }
    show() {
        fill(255, 255, 0);
        ellipse(this.x, this.y, this.r * 2);
    }
    offscreen() {
        return this.y < 0;
    }
    hits(enemy) {
        let d = dist(this.x, this.y, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
        return d < this.r + enemy.w / 2;
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 20;
        this.speed = 1;
        this.direction = 1;
    }
    update() {
        this.x += this.speed * this.direction;
        if (this.x > width - this.w || this.x < 0) {
            this.direction *= -1;
            this.y += 20;
        }
    }
    show() {
        fill(255, 0, 0);
        rect(this.x, this.y, this.w, this.h);
    }
}
