class DashyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameover, victory
        this.currentLevel = 1;
        this.score = 0;
        this.unlockedLevels = 1;
        
        // Bird properties
        this.bird = {
            x: 80,
            y: 300,
            radius: 15,
            velocity: 0,
            gravity: 0.5,
            jumpPower: -8,
            rotation: 0,
            squash: 1,
            stretch: 1,
            wingAnimation: 0,
            color: '#ffeb3b'
        };
        
        // Pipe properties
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 2;
        this.pipeSpacing = 200;
        
        // Particles
        this.particles = [];
        this.scorePopups = [];
        
        // Background
        this.backgroundX = 0;
        this.clouds = this.generateClouds();
        
        // Animation
        this.animationFrame = 0;
        this.menuAnimation = 0;
        
        // Levels configuration
        this.levels = this.createLevels();
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupLevelSelect();
        this.gameLoop();
    }
    
    createLevels() {
        return [
            // Levels 1-5: Easy
            { gap: 180, speed: 1.5, spacing: 220, color: '#4ecdc4', bgColor: '#87ceeb' },
            { gap: 175, speed: 1.6, spacing: 210, color: '#4ecdc4', bgColor: '#87ceeb' },
            { gap: 170, speed: 1.7, spacing: 200, color: '#4ecdc4', bgColor: '#87ceeb' },
            { gap: 165, speed: 1.8, spacing: 195, color: '#4ecdc4', bgColor: '#87ceeb' },
            { gap: 160, speed: 1.9, spacing: 190, color: '#4ecdc4', bgColor: '#87ceeb' },
            
            // Levels 6-10: Medium
            { gap: 155, speed: 2.0, spacing: 185, color: '#ff8e53', bgColor: '#ffa500' },
            { gap: 150, speed: 2.1, spacing: 180, color: '#ff8e53', bgColor: '#ffa500' },
            { gap: 145, speed: 2.2, spacing: 175, color: '#ff8e53', bgColor: '#ffa500' },
            { gap: 140, speed: 2.3, spacing: 170, color: '#ff8e53', bgColor: '#ffa500' },
            { gap: 135, speed: 2.4, spacing: 165, color: '#ff8e53', bgColor: '#ffa500' },
            
            // Levels 11-15: Hard
            { gap: 130, speed: 2.5, spacing: 160, color: '#ff6b6b', bgColor: '#ff4444' },
            { gap: 125, speed: 2.6, spacing: 155, color: '#ff6b6b', bgColor: '#ff4444' },
            { gap: 120, speed: 2.7, spacing: 150, color: '#ff6b6b', bgColor: '#ff4444' },
            { gap: 115, speed: 2.8, spacing: 145, color: '#ff6b6b', bgColor: '#ff4444' },
            { gap: 110, speed: 2.9, spacing: 140, color: '#ff6b6b', bgColor: '#ff4444' },
            
            // Levels 16-20: Expert
            { gap: 105, speed: 3.0, spacing: 135, color: '#9b59b6', bgColor: '#8e44ad' },
            { gap: 100, speed: 3.1, spacing: 130, color: '#9b59b6', bgColor: '#8e44ad' },
            { gap: 95, speed: 3.2, spacing: 125, color: '#9b59b6', bgColor: '#8e44ad' },
            { gap: 90, speed: 3.3, spacing: 120, color: '#9b59b6', bgColor: '#8e44ad' },
            { gap: 85, speed: 3.4, spacing: 115, color: '#9b59b6', bgColor: '#8e44ad' },
            
            // Levels 21-25: Master
            { gap: 80, speed: 3.5, spacing: 110, color: '#e74c3c', bgColor: '#c0392b', moving: true },
            { gap: 75, speed: 3.6, spacing: 105, color: '#e74c3c', bgColor: '#c0392b', moving: true },
            { gap: 70, speed: 3.7, spacing: 100, color: '#e74c3c', bgColor: '#c0392b', moving: true },
            { gap: 65, speed: 3.8, spacing: 95, color: '#e74c3c', bgColor: '#c0392b', moving: true },
            { gap: 60, speed: 4.0, spacing: 90, color: '#e74c3c', bgColor: '#c0392b', moving: true }
        ];
    }
    
    generateClouds() {
        const clouds = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * 200,
                width: 60 + Math.random() * 40,
                height: 30 + Math.random() * 20,
                speed: 0.2 + Math.random() * 0.3
            });
        }
        return clouds;
    }
    
    setupEventListeners() {
        // Play button
        document.getElementById('playButton').addEventListener('click', () => {
            this.showLevelSelect();
        });
        
        // Back to menu
        document.getElementById('backToMenu').addEventListener('click', () => {
            this.showMenu();
        });
        
        // Pause button
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Game over buttons
        document.getElementById('retryButton').addEventListener('click', () => {
            this.startLevel(this.currentLevel);
        });
        
        document.getElementById('menuButton').addEventListener('click', () => {
            this.showMenu();
        });
        
        // Victory button
        document.getElementById('victoryMenuButton').addEventListener('click', () => {
            this.showMenu();
        });
        
        // Game controls
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.jump();
            }
        });
    }
    
    setupLevelSelect() {
        const levelGrid = document.getElementById('levelGrid');
        levelGrid.innerHTML = '';
        
        for (let i = 1; i <= 25; i++) {
            const button = document.createElement('button');
            button.className = 'level-button';
            button.textContent = i;
            
            if (i <= this.unlockedLevels) {
                button.addEventListener('click', () => {
                    this.startLevel(i);
                });
            } else {
                button.classList.add('locked');
                button.textContent = '🔒';
            }
            
            levelGrid.appendChild(button);
        }
    }
    
    showMenu() {
        this.gameState = 'menu';
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('levelSelect').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('victoryScreen').style.display = 'none';
        document.getElementById('gameUI').style.display = 'none';
    }
    
    showLevelSelect() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('levelSelect').style.display = 'flex';
    }
    
    startLevel(level) {
        this.currentLevel = level;
        this.score = 0;
        this.bird.y = 300;
        this.bird.velocity = 0;
        this.pipes = [];
        this.particles = [];
        this.scorePopups = [];
        
        const levelConfig = this.levels[level - 1];
        this.pipeGap = levelConfig.gap;
        this.pipeSpeed = levelConfig.speed;
        this.pipeSpacing = levelConfig.spacing;
        
        this.gameState = 'playing';
        
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('levelSelect').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('victoryScreen').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
        
        document.getElementById('levelDisplay').textContent = `Level ${level}`;
        this.updateScore();
        
        // Generate initial pipes
        this.generatePipe();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseButton').textContent = '▶️';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseButton').textContent = '⏸️';
        }
    }
    
    jump() {
        this.bird.velocity = this.bird.jumpPower;
        
        // Cool jump animation
        this.bird.squash = 0.8;
        this.bird.stretch = 1.2;
        
        // Create jump particles
        this.createJumpParticles();
        
        // Play jump sound (simulated with visual feedback)
        this.createJumpEffect();
    }
    
    createJumpParticles() {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.bird.x,
                y: this.bird.y + this.bird.radius,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 2 + 1,
                size: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
                life: 1.0
            });
        }
    }
    
    createJumpEffect() {
        // Visual feedback for jump
        this.bird.wingAnimation = 0.5;
    }
    
    createScorePopup(x, y, points) {
        this.scorePopups.push({
            x: x,
            y: y,
            text: `+${points}`,
            size: 24,
            alpha: 1.0,
            vy: -2
        });
    }
    
    generatePipe() {
        const levelConfig = this.levels[this.currentLevel - 1];
        const minHeight = 50;
        const maxHeight = this.height - this.pipeGap - minHeight;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.width,
            topHeight: height,
            bottomY: height + this.pipeGap,
            passed: false,
            color: levelConfig.color,
            moveOffset: 0,
            moveSpeed: levelConfig.moving ? Math.sin(Date.now() * 0.001) * 2 : 0
        });
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.animationFrame++;
        this.menuAnimation += 0.05;
        
        // Update bird physics
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Update bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);
        
        // Animate bird squash and stretch
        if (this.bird.squash < 1) {
            this.bird.squash += 0.02;
            this.bird.stretch -= 0.01;
        }
        if (this.bird.stretch < 1) {
            this.bird.stretch += 0.02;
        }
        
        // Update wing animation
        if (this.bird.wingAnimation > 0) {
            this.bird.wingAnimation -= 0.05;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Moving pipes for master levels
            if (pipe.moveSpeed !== 0) {
                pipe.moveOffset = Math.sin(Date.now() * 0.001) * 20;
            }
            
            // Check if bird passed pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.updateScore();
                this.createScorePopup(this.bird.x, this.bird.y, 1);
                
                // Check level completion
                if (this.score >= 10) {
                    this.completeLevel();
                }
            }
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Generate new pipes
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.width - this.pipeSpacing) {
            this.generatePipe();
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update score popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.scorePopups[i];
            popup.y += popup.vy;
            popup.alpha -= 0.02;
            popup.size += 0.5;
            
            if (popup.alpha <= 0) {
                this.scorePopups.splice(i, 1);
            }
        }
        
        // Update background
        this.backgroundX -= this.pipeSpeed * 0.5;
        if (this.backgroundX <= -this.width) {
            this.backgroundX = 0;
        }
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.width;
                cloud.y = Math.random() * 200;
            }
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        // Ground and ceiling collision
        if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.height) {
            this.gameOver();
            return;
        }
        
        // Pipe collision
        for (const pipe of this.pipes) {
            const actualTopHeight = pipe.topHeight + pipe.moveOffset;
            const actualBottomY = pipe.bottomY + pipe.moveOffset;
            
            if (this.bird.x + this.bird.radius > pipe.x && 
                this.bird.x - this.bird.radius < pipe.x + this.pipeWidth) {
                
                if (this.bird.y - this.bird.radius < actualTopHeight || 
                    this.bird.y + this.bird.radius > actualBottomY) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    completeLevel() {
        if (this.currentLevel < 25) {
            // Unlock next level
            if (this.currentLevel + 1 > this.unlockedLevels) {
                this.unlockedLevels = this.currentLevel + 1;
                this.setupLevelSelect();
            }
            
            // Show level complete message
            this.showLevelComplete();
        } else {
            // Victory!
            this.showVictory();
        }
    }
    
    showLevelComplete() {
        setTimeout(() => {
            alert(`Level ${this.currentLevel} Complete! 🎉`);
            this.showLevelSelect();
        }, 100);
    }
    
    showVictory() {
        this.gameState = 'victory';
        document.getElementById('victoryScreen').style.display = 'flex';
    }
    
    gameOver() {
        this.gameState = 'gameover';
        document.getElementById('gameOverScreen').style.display = 'flex';
        document.getElementById('finalScore').textContent = `Score: ${this.score}`;
    }
    
    updateScore() {
        document.getElementById('scoreDisplay').textContent = this.score;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.levels[this.currentLevel - 1].bgColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw background elements
        this.drawBackground();
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // Draw pipes
            this.drawPipes();
            
            // Draw particles
            this.drawParticles();
            
            // Draw bird
            this.drawBird();
            
            // Draw score popups
            this.drawScorePopups();
        }
        
        // Draw menu animation
        if (this.gameState === 'menu') {
            this.drawMenuAnimation();
        }
    }
    
    drawBackground() {
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x, cloud.y, cloud.width/2, cloud.height/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw moving background pattern
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            const x = (this.backgroundX + i * 100) % (this.width + 100);
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
    }
    
    drawBird() {
        this.ctx.save();
        this.ctx.translate(this.bird.x, this.bird.y);
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        this.ctx.scale(this.bird.squash, this.bird.stretch);
        
        // Bird body
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.bird.radius);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.7, this.bird.color);
        gradient.addColorStop(1, '#f39c12');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird eye
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(5, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(6, -3, 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird beak
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.radius - 2, 0);
        this.ctx.lineTo(this.bird.radius + 8, 0);
        this.ctx.lineTo(this.bird.radius - 2, 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Wing animation
        if (this.bird.wingAnimation > 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.ellipse(-5, 0, 8 * this.bird.wingAnimation, 5 * this.bird.wingAnimation, -20 * Math.PI / 180, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawPipes() {
        this.pipes.forEach(pipe => {
            const actualTopHeight = pipe.topHeight + pipe.moveOffset;
            const actualBottomY = pipe.bottomY + pipe.moveOffset;
            
            // Pipe gradient
            const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            gradient.addColorStop(0, pipe.color);
            gradient.addColorStop(0.5, this.lightenColor(pipe.color, 20));
            gradient.addColorStop(1, pipe.color);
            
            this.ctx.fillStyle = gradient;
            
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, actualTopHeight);
            this.ctx.fillRect(pipe.x - 5, actualTopHeight - 30, this.pipeWidth + 10, 30);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, actualBottomY, this.pipeWidth, this.height - actualBottomY);
            this.ctx.fillRect(pipe.x - 5, actualBottomY, this.pipeWidth + 10, 30);
            
            // Pipe highlights
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, actualTopHeight);
            this.ctx.strokeRect(pipe.x, actualBottomY, this.pipeWidth, this.height - actualBottomY);
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawScorePopups() {
        this.scorePopups.forEach(popup => {
            this.ctx.save();
            this.ctx.globalAlpha = popup.alpha;
            this.ctx.fillStyle = '#ffeb3b';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;
            this.ctx.font = `bold ${popup.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(popup.text, popup.x, popup.y);
            this.ctx.fillText(popup.text, popup.x, popup.y);
            this.ctx.restore();
        });
    }
    
    drawMenuAnimation() {
        // Animated background birds
        for (let i = 0; i < 3; i++) {
            const x = (this.menuAnimation * 50 + i * 150) % (this.width + 100) - 50;
            const y = 100 + Math.sin(this.menuAnimation + i) * 30;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(Math.sin(this.menuAnimation * 2 + i) * 0.2);
            this.ctx.scale(0.5, 0.5);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new DashyBird();
});