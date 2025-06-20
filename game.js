// Game variables
let player;
let bullets = [];
let enemies = [];
let particles = [];
let powerUps = [];
let stars = [];

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let lives = 3;
let level = 1;
let enemySpawnRate = 60;
let lastEnemySpawn = 0;

// User data
let currentUser = null;
let highScores = [];
let isLoggedIn = false;

// Game settings
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Initialize Puter and check authentication
async function initializePuter() {
    try {
        // Check if user is already signed in
        if (puter.auth.isSignedIn()) {
            currentUser = await puter.auth.getUser();
            isLoggedIn = true;
            updateUserInfo();
            document.getElementById('loginBtn').textContent = 'Logged in as ' + currentUser.username;
            document.getElementById('saveScoreBtn').style.display = 'inline-block';
        }

        // Load high scores
        await loadHighScores();
    } catch (error) {
        console.log('Puter initialization error:', error);
    }
}

// Update user info display
function updateUserInfo() {
    const userInfoDiv = document.getElementById('userInfo');
    if (isLoggedIn && currentUser) {
        userInfoDiv.innerHTML = `Logged in as: ${currentUser.username}`;
    } else {
        userInfoDiv.innerHTML = 'Not logged in';
    }
}

// Load high scores from Puter KV store
async function loadHighScores() {
    try {
        const scoresData = await puter.kv.get('highScores');
        if (scoresData) {
            highScores = JSON.parse(scoresData);
        } else {
            highScores = [];
        }
        displayHighScores();
    } catch (error) {
        console.log('Error loading high scores:', error);
        highScores = [];
        displayHighScores();
    }
}

// Save high scores to Puter KV store
async function saveHighScores() {
    try {
        await puter.kv.set('highScores', JSON.stringify(highScores));
    } catch (error) {
        console.log('Error saving high scores:', error);
    }
}

// Display high scores
function displayHighScores() {
    const highScoresDiv = document.getElementById('highScores');
    if (highScores.length === 0) {
        highScoresDiv.innerHTML = '<div class="score-entry">No high scores yet!</div>';
        return;
    }

    // Sort scores in descending order and take top 5
    const sortedScores = highScores.sort((a, b) => b.score - a.score).slice(0, 5);

    let html = '';
    sortedScores.forEach((entry, index) => {
        html += `<div class="score-entry">${index + 1}. ${entry.username}: ${entry.score}</div>`;
    });

    highScoresDiv.innerHTML = html;
}

// Add new high score
async function addHighScore(username, score) {
    highScores.push({
        username: username,
        score: score,
        date: new Date().toISOString()
    });

    await saveHighScores();
    displayHighScores();
}

// p5.js setup function
function setup() {
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent('gameContainer');

    // Initialize game objects
    initializeGame();

    // Initialize Puter
    initializePuter();

    // Set up event listeners
    setupEventListeners();
}

// Initialize game objects
function initializeGame() {
    // Create player
    player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);

    // Create background stars
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }

    // Reset game state
    bullets = [];
    enemies = [];
    particles = [];
    powerUps = [];
    score = 0;
    lives = 3;
    level = 1;
    enemySpawnRate = 60;
    lastEnemySpawn = 0;

    updateUI();
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('saveScoreBtn').addEventListener('click', handleSaveScore);
}

// Handle login
async function handleLogin() {
    if (!isLoggedIn) {
        try {
            await puter.auth.signIn();
            currentUser = await puter.auth.getUser();
            isLoggedIn = true;
            updateUserInfo();
            document.getElementById('loginBtn').textContent = 'Logged in as ' + currentUser.username;
            document.getElementById('saveScoreBtn').style.display = 'inline-block';
            await loadHighScores();
        } catch (error) {
            console.log('Login error:', error);
        }
    }
}

// Handle save score
async function handleSaveScore() {
    if (isLoggedIn && currentUser) {
        await addHighScore(currentUser.username, score);
        document.getElementById('highScoreMsg').innerHTML = 'High score saved!';
        document.getElementById('saveScoreBtn').style.display = 'none';
    }
}

// Start game
function startGame() {
    gameState = 'playing';
    document.getElementById('startScreen').style.display = 'none';
    initializeGame();
}

// Restart game
function restartGame() {
    gameState = 'playing';
    document.getElementById('gameOver').style.display = 'none';
    initializeGame();
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// p5.js draw function
function draw() {
    background(0, 10, 30);

    // Draw stars
    for (let star of stars) {
        star.update();
        star.display();
    }

    if (gameState === 'playing') {
        // Update and display player
        player.update();
        player.display();

        // Update and display bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].update();
            bullets[i].display();

            // Remove bullets that are off screen
            if (bullets[i].y < 0) {
                bullets.splice(i, 1);
            }
        }

        // Spawn enemies
        if (frameCount - lastEnemySpawn > enemySpawnRate) {
            enemies.push(new Enemy());
            lastEnemySpawn = frameCount;

            // Increase difficulty over time
            if (enemySpawnRate > 20) {
                enemySpawnRate -= 0.5;
            }
        }

        // Update and display enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].update();
            enemies[i].display();

            // Remove enemies that are off screen
            if (enemies[i].y > CANVAS_HEIGHT + 50) {
                enemies.splice(i, 1);
            }

            // Check collision with player
            if (enemies[i] && player.collidesWith(enemies[i])) {
                // Create explosion particles
                for (let j = 0; j < 10; j++) {
                    particles.push(new Particle(player.x, player.y, color(255, 100, 100)));
                }

                enemies.splice(i, 1);
                lives--;

                if (lives <= 0) {
                    gameOver();
                }
            }
        }

        // Check bullet-enemy collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (bullets[i] && enemies[j] && bullets[i].collidesWith(enemies[j])) {
                    // Create explosion particles
                    for (let k = 0; k < 8; k++) {
                        particles.push(new Particle(enemies[j].x, enemies[j].y, color(255, 255, 100)));
                    }

                    // Add score
                    score += enemies[j].points;

                    // Remove bullet and enemy
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);

                    // Level up every 1000 points
                    if (score > 0 && score % 1000 === 0) {
                        level++;
                    }

                    break;
                }
            }
        }

        // Update and display particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].display();

            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }

        updateUI();
    }
}

// Handle key presses
function keyPressed() {
    if (gameState === 'playing') {
        if (key === ' ') {
            player.shoot();
        }
    }
}

// Game over
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';

    // Check if it's a high score
    if (highScores.length < 5 || score > Math.min(...highScores.map(s => s.score))) {
        document.getElementById('highScoreMsg').innerHTML = '🎉 New High Score! 🎉';
        if (isLoggedIn) {
            document.getElementById('saveScoreBtn').style.display = 'inline-block';
        }
    } else {
        document.getElementById('highScoreMsg').innerHTML = '';
        document.getElementById('saveScoreBtn').style.display = 'none';
    }
}

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
        this.lastShot = 0;
        this.shootCooldown = 10;
    }

    update() {
        // Movement
        if (keyIsDown(LEFT_ARROW) && this.x > this.size / 2) {
            this.x -= this.speed;
        }
        if (keyIsDown(RIGHT_ARROW) && this.x < CANVAS_WIDTH - this.size / 2) {
            this.x += this.speed;
        }
        if (keyIsDown(UP_ARROW) && this.y > this.size / 2) {
            this.y -= this.speed;
        }
        if (keyIsDown(DOWN_ARROW) && this.y < CANVAS_HEIGHT - this.size / 2) {
            this.y += this.speed;
        }
    }

    display() {
        push();
        translate(this.x, this.y);

        // Draw ship
        fill(100, 200, 255);
        stroke(255);
        strokeWeight(2);

        beginShape();
        vertex(0, -this.size / 2);
        vertex(-this.size / 3, this.size / 2);
        vertex(0, this.size / 3);
        vertex(this.size / 3, this.size / 2);
        endShape(CLOSE);

        // Engine glow
        fill(255, 100, 100, 150);
        noStroke();
        ellipse(0, this.size / 2 + 5, 8, 15);

        pop();
    }

    shoot() {
        if (frameCount - this.lastShot > this.shootCooldown) {
            bullets.push(new Bullet(this.x, this.y - this.size / 2));
            this.lastShot = frameCount;
        }
    }

    collidesWith(other) {
        let distance = dist(this.x, this.y, other.x, other.y);
        return distance < (this.size / 2 + other.size / 2);
    }
}

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 4;
        this.speed = 8;
    }

    update() {
        this.y -= this.speed;
    }

    display() {
        fill(255, 255, 100);
        noStroke();
        ellipse(this.x, this.y, this.size);

        // Trail effect
        fill(255, 255, 100, 100);
        ellipse(this.x, this.y + 5, this.size / 2);
    }

    collidesWith(other) {
        let distance = dist(this.x, this.y, other.x, other.y);
        return distance < (this.size / 2 + other.size / 2);
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.x = random(20, CANVAS_WIDTH - 20);
        this.y = -20;
        this.size = random(15, 25);
        this.speed = random(1, 3);
        this.points = Math.floor(this.size);
        this.color = color(random(200, 255), random(50, 150), random(50, 150));
    }

    update() {
        this.y += this.speed;
        this.x += sin(frameCount * 0.02 + this.y * 0.01) * 0.5;
    }

    display() {
        push();
        translate(this.x, this.y);

        fill(this.color);
        stroke(255, 100);
        strokeWeight(1);

        // Draw enemy ship
        beginShape();
        vertex(0, this.size / 2);
        vertex(-this.size / 2, -this.size / 2);
        vertex(0, -this.size / 3);
        vertex(this.size / 2, -this.size / 2);
        endShape(CLOSE);

        pop();
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y, col) {
        this.x = x;
        this.y = y;
        this.vx = random(-3, 3);
        this.vy = random(-3, 3);
        this.life = 255;
        this.decay = random(3, 8);
        this.size = random(2, 6);
        this.color = col;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.98;
    }

    display() {
        push();
        fill(red(this.color), green(this.color), blue(this.color), this.life);
        noStroke();
        ellipse(this.x, this.y, this.size);
        pop();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Star class for background
class Star {
    constructor() {
        this.x = random(CANVAS_WIDTH);
        this.y = random(CANVAS_HEIGHT);
        this.speed = random(0.5, 2);
        this.brightness = random(100, 255);
        this.size = random(1, 3);
    }

    update() {
        this.y += this.speed;
        if (this.y > CANVAS_HEIGHT) {
            this.y = 0;
            this.x = random(CANVAS_WIDTH);
        }
    }

    display() {
        fill(this.brightness);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }
}
