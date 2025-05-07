let player, bullets, enemies, score, spaceshipImg, asteroidImg, backgroundImg;
let imagesLoaded = true;

function preload() {
    try {
        spaceshipImg = loadImage('assets/spaceship.png');
        asteroidImg = loadImage('assets/asteroid.png');
        backgroundImg = loadImage('assets/space_background.jpg');
    } catch (e) {
        console.error("Error loading images:", e);
        imagesLoaded = false; // Fallback to rectangles if images fail
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    player = new Player();
    bullets = [];
    enemies = [];
    score = 0;
    // Initialize enemies in a grid, scaled to canvas size
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            enemies.push(new Enemy(width * 0.2 + i * width * 0.15, height * 0.1 + j * height * 0.1));
        }
    }
}

function draw() {
    // Draw background (image or fallback)
    if (imagesLoaded && backgroundImg) {
        image(backgroundImg, 0, 0, width, height);
    } else {
        background(0); // Fallback to black
    }
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
            textSize(width * 0.05);
            fill(255);
            textAlign(CENTER);
            text("Game Over", width / 2, height / 2);
        }
    }
    // Display score
    textSize(width * 0.03);
    fill(255);
    textAlign(LEFT);
    text("Score: " + score, width * 0.05, height * 0.05);
}

function keyPressed() {
    if (keyCode === 32) { // Spacebar
        bullets.push(new Bullet(player.x, player.y));
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height * 0.9;
        this.w = width * 0.05;
        this.h = this.w;
        this.speed = width * 0.01;
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
        if (imagesLoaded && spaceshipImg) {
            image(spaceshipImg, this.x, this.y, this.w, this.h);
        } else {
            fill(0, 255, 0); // Fallback to green rectangle
            rect(this.x, this.y, this.w, this.h);
        }
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
        this.x = x + width * 0.025;
        this.y = y;
        this.r = width * 0.01;
        this.speed = -height * 0.02;
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
        this.w = width * 0.05;
        this.h = this.w;
        this.speed = width * 0.005;
        this.direction = 1;
    }
    update() {
        this.x += this.speed * this.direction;
        if (this.x > width - this.w || this.x < 0) {
            this.direction *= -1;
            this.y += height * 0.05;
        }
    }
    show() {
        if (imagesLoaded && asteroidImg) {
            image(asteroidImg, this.x, this.y, this.w, this.h);
        } else {
            fill(255, 0, 0); // Fallback to red rectangle
            rect(this.x, this.y, this.w, this.h);
        }
    }
}
