let player, bullets, enemies, score, spaceshipImg, asteroidImg, backgroundImg;
let imagesLoaded = false;
let loadingStatus = "Loading assets...";
let skipImages = false; // Keep true to use fallback graphics
let loadTimeout;

function preload() {
    if (skipImages) {
        console.log("Skipping image loading. Using fallback graphics.");
        imagesLoaded = false;
        loadingStatus = "";
        return;
    }

    try {
        console.log("Attempting to load assets...");
        spaceshipImg = loadImage('assets/spaceship.png', 
            () => console.log("spaceship.png loaded successfully"),
            () => console.error("Failed to load assets/spaceship.png")
        );
        asteroidImg = loadImage('assets/asteroid.png',
            () => console.log("asteroid.png loaded successfully"),
            () => console.error("Failed to load assets/asteroid.png")
        );
        backgroundImg = loadImage('assets/space_background.jpg',
            () => console.log("space_background.jpg loaded successfully"),
            () => console.error("Failed to load assets/space_background.png")
        );
        loadTimeout = setTimeout(() => {
            console.warn("Image loading timed out after 5 seconds. Using fallback graphics.");
            imagesLoaded = false;
            loadingStatus = "";
        }, 5000);
    } catch (e) {
        console.error("Error in preload:", e);
        imagesLoaded = false;
        loadingStatus = "Failed to load images. Using fallback graphics.";
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
    console.log("Setup complete. Starting game.");
    loadingStatus = "";
    if (loadTimeout) clearTimeout(loadTimeout);
}

function draw() {
    if (loadingStatus) {
        background(0);
        fill(255);
        textSize(width * 0.03);
        textAlign(CENTER);
        text(loadingStatus, width / 2, height / 2);
        return;
    }
    // Draw background
    if (imagesLoaded && backgroundImg) {
        image(backgroundImg, 0, 0, width, height);
    } else {
        background(0);
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
        if (player.hits(enemy)) {
            noLoop();
            textSize(width * 0.05);
            fill(255);
            textAlign(CENTER);
            text("Game Over", width / 2, height / 2);
        }
    }
    // Display score with more margin
    textSize(width * 0.03);
    fill(255);
    textAlign(LEFT);
    text("Score: " + score, width * 0.05, height * 0.08); // Adjusted Y-position
}

function keyPressed() {
    if (keyCode === 32) {
        bullets.push(new Bullet(player.x, player.y));
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Adjust player position and constraints on resize
    player.adjustForResize();
    // Adjust enemy positions
    for (let enemy of enemies) {
        enemy.adjustForResize();
    }
    // Adjust bullet properties
    for (let bullet of bullets) {
        bullet.adjustForResize();
    }
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
        this.y = constrain(this.y, 0, height - this.h); // Ensure player stays visible
    }
    show() {
        if (imagesLoaded && spaceshipImg) {
            image(spaceshipImg, this.x, this.y, this.w, this.h);
        } else {
            fill(0, 255, 0);
            rect(this.x, this.y, this.w, this.h);
        }
    }
    hits(enemy) {
        return (this.x < enemy.x + enemy.w &&
                this.x + this.w > enemy.x &&
                this.y < enemy.y + enemy.h &&
                this.y + this.h > enemy.y);
    }
    adjustForResize() {
        this.w = width * 0.05;
        this.h = this.w;
        this.speed = width * 0.01;
        // Reposition player to stay within new canvas bounds
        this.x = constrain(this.x, 0, width - this.w);
        this.y = height * 0.9; // Keep player near bottom
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
    adjustForResize() {
        this.r = width * 0.01;
        this.speed = -height * 0.02;
        this.x = constrain(this.x, 0, width);
        this.y = constrain(this.y, -height, height);
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
        this.y = constrain(this.y, 0, height - this.h); // Keep enemies visible
    }
    show() {
        if (imagesLoaded && asteroidImg) {
            image(asteroidImg, this.x, this.y, this.w, this.h);
        } else {
            fill(255, 0, 0);
            rect(this.x, this.y, this.w, this.h);
        }
    }
    adjustForResize() {
        this.w = width * 0.05;
        this.h = this.w;
        this.speed = width * 0.005;
        this.x = constrain(this.x, 0, width - this.w);
        this.y = constrain(this.y, 0, height - this.h);
    }
}
