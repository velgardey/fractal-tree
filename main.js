// Canvas setup
const fractalCanvas = document.getElementById('fractalCanvas');
const gameCanvas = document.getElementById('gameCanvas');
const fractalCtx = fractalCanvas.getContext('2d');
const gameCtx = gameCanvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const containerWidth = fractalCanvas.parentElement.clientWidth;
    fractalCanvas.width = containerWidth;
    fractalCanvas.height = 300;
    gameCanvas.width = containerWidth;
    gameCanvas.height = 300;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Controls
const generationType = document.getElementById('generationType');
const depthInput = document.getElementById('depth');
const angleInput = document.getElementById('angle');
const lengthInput = document.getElementById('length');
const axiomInput = document.getElementById('axiom');
const ruleInput = document.getElementById('rule');
const lsystemControls = document.getElementById('lsystemControls');

// Update display values
function updateDisplayValues() {
    document.getElementById('depthValue').textContent = depthInput.value;
    document.getElementById('angleValue').textContent = angleInput.value + '°';
    document.getElementById('lengthValue').textContent = lengthInput.value;
}

// Toggle L-system controls
generationType.addEventListener('change', () => {
    lsystemControls.style.display = generationType.value === 'lsystem' ? 'flex' : 'none';
    generate();
});

// Add event listeners for all controls
[depthInput, angleInput, lengthInput, axiomInput, ruleInput].forEach(input => {
    input.addEventListener('input', () => {
        updateDisplayValues();
        generate();
    });
});

// Fractal Tree Generation
class FractalTree {
    constructor(ctx, startX, startY, length, angle, depth) {
        this.ctx = ctx;
        this.startX = startX;
        this.startY = startY;
        this.length = length;
        this.angle = angle;
        this.depth = depth;
    }

    draw() {
        this.drawBranch(this.startX, this.startY, this.length, 0, this.depth);
    }

    drawBranch(x, y, length, angle, depth) {
        if (depth === 0) return;

        const endX = x + length * Math.sin(angle * Math.PI / 180);
        const endY = y - length * Math.cos(angle * Math.PI / 180);

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `hsl(${120 + depth * 20}, 70%, 50%)`;
        this.ctx.lineWidth = depth;
        this.ctx.stroke();

        this.drawBranch(endX, endY, length * 0.7, angle - this.angle, depth - 1);
        this.drawBranch(endX, endY, length * 0.7, angle + this.angle, depth - 1);
    }
}

// L-System Generation
class LSystem {
    constructor(ctx, axiom, rule, iterations, length, angle) {
        this.ctx = ctx;
        this.axiom = axiom;
        this.rule = rule;
        this.iterations = iterations;
        this.length = length;
        this.angle = angle;
        this.stack = [];
    }

    generate() {
        let result = this.axiom;
        for (let i = 0; i < this.iterations; i++) {
            result = result.replace(/F/g, this.rule);
        }
        return result;
    }

    draw() {
        const sequence = this.generate();
        let x = this.ctx.canvas.width / 2;
        let y = this.ctx.canvas.height;
        let angle = 0;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        for (const char of sequence) {
            switch (char) {
                case 'F':
                    const newX = x + this.length * Math.sin(angle * Math.PI / 180);
                    const newY = y - this.length * Math.cos(angle * Math.PI / 180);
                    this.ctx.lineTo(newX, newY);
                    x = newX;
                    y = newY;
                    break;
                case '+':
                    angle += this.angle;
                    break;
                case '-':
                    angle -= this.angle;
                    break;
                case '[':
                    this.stack.push({ x, y, angle });
                    break;
                case ']':
                    const state = this.stack.pop();
                    x = state.x;
                    y = state.y;
                    angle = state.angle;
                    this.ctx.moveTo(x, y);
                    break;
            }
        }

        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

// Game Preview Generation
class GamePreview {
    constructor(ctx) {
        this.ctx = ctx;
        this.playerX = 50;
        this.playerY = 0; // Will be set based on ground level
        this.playerDirection = 1; // 1 = right, -1 = left
        this.platforms = [];
        this.animationFrame = 0;
    }

    draw(fractalType, depth, angle, length) {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Increment animation frame
        this.animationFrame = (this.animationFrame + 1) % 60;
        
        // Draw simple background
        this.drawSimpleBackground();
        
        // Generate level elements based on fractal parameters
        this.generateLevel(fractalType, depth, angle, length);
        
        // Draw platforms
        this.drawPlatforms();
        
        // Draw player character
        this.drawPlayer();
    }
    
    drawSimpleBackground() {
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
        gradient.addColorStop(0, '#0a1a2a');
        gradient.addColorStop(1, '#2a3a4a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#2d3d4d';
        this.ctx.fillRect(0, this.ctx.canvas.height - 30, this.ctx.canvas.width, 30);
    }
    
    generateLevel(fractalType, depth, angle, length) {
        // Reset level elements
        this.platforms = [];
        
        // Generate platforms based on fractal pattern
        if (fractalType === 'fractal') {
            this.generateFractalPlatforms(this.ctx.canvas.width / 2, this.ctx.canvas.height - 30, length * 0.8, -90, angle, depth);
        } else {
            this.generateLSystemPlatforms(depth, angle, length);
        }
        
        // Add ground platform
        this.platforms.push({
            x: 0,
            y: this.ctx.canvas.height - 30,
            width: this.ctx.canvas.width,
            height: 30,
            color: '#2d3d4d'
        });
        
        // Set player position on ground
        this.playerY = this.ctx.canvas.height - 30;
    }
    
    generateFractalPlatforms(x, y, length, angle, branchAngle, depth) {
        if (depth <= 0) return;
        
        // Calculate endpoint using trigonometry
        const endX = x + length * Math.cos(angle * Math.PI / 180);
        const endY = y + length * Math.sin(angle * Math.PI / 180);
        
        // Create platform
        const platformWidth = Math.max(10, length * 0.8);
        const platformHeight = 10;
        
        this.platforms.push({
            x: Math.min(x, endX) - platformWidth * 0.1,
            y: Math.min(y, endY) - platformHeight * 0.5,
            width: platformWidth,
            height: platformHeight,
            color: `hsl(${120 + depth * 30}, 70%, 40%)`
        });
        
        // Recursively create branches
        this.generateFractalPlatforms(endX, endY, length * 0.7, angle - branchAngle, branchAngle, depth - 1);
        this.generateFractalPlatforms(endX, endY, length * 0.7, angle + branchAngle, branchAngle, depth - 1);
    }
    
    generateLSystemPlatforms(depth, angle, length) {
        const sequence = this.generateLSystemSequence(depth);
        let x = this.ctx.canvas.width / 2;
        let y = this.ctx.canvas.height - 30;
        let currentAngle = -90;
        const stack = [];
        
        for (const char of sequence) {
            switch (char) {
                case 'F':
                    const newX = x + length * 0.5 * Math.cos(currentAngle * Math.PI / 180);
                    const newY = y + length * 0.5 * Math.sin(currentAngle * Math.PI / 180);
                    
                    // Create platform
                    this.platforms.push({
                        x: Math.min(x, newX) - 5,
                        y: Math.min(y, newY) - 5,
                        width: Math.abs(newX - x) + 10,
                        height: 10,
                        color: `hsl(${140 + currentAngle % 360}, 70%, 40%)`
                    });
                    
                    x = newX;
                    y = newY;
                    break;
                case '+':
                    currentAngle += angle;
                    break;
                case '-':
                    currentAngle -= angle;
                    break;
                case '[':
                    stack.push({ x, y, angle: currentAngle });
                    break;
                case ']':
                    const state = stack.pop();
                    x = state.x;
                    y = state.y;
                    currentAngle = state.angle;
                    break;
            }
        }
    }
    
    generateLSystemSequence(depth) {
        let result = 'F';
        for (let i = 0; i < depth; i++) {
            result = result.replace(/F/g, 'F[+F]F[-F]F');
        }
        return result;
    }
    
    drawPlatforms() {
        for (const platform of this.platforms) {
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add platform details
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(platform.x, platform.y, platform.width, 2);
        }
    }
    
    drawPlayer() {
        // Update player position for animation
        this.playerX += this.playerDirection * 0.5;
        
        // Change direction at screen edges
        if (this.playerX < 30 || this.playerX > this.ctx.canvas.width - 30) {
            this.playerDirection *= -1;
        }
        
        // Body
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.playerX - 10, this.playerY - 40, 20, 20);
        
        // Legs
        const legOffset = Math.sin(this.animationFrame * 0.2) * 3;
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(this.playerX - 7, this.playerY - 20, 4, 20 + legOffset);
        this.ctx.fillRect(this.playerX + 3, this.playerY - 20, 4, 20 - legOffset);
        
        // Arms
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(
            this.playerX - 15, 
            this.playerY - 35 + Math.sin(this.animationFrame * 0.2) * 2, 
            5, 
            5
        );
        this.ctx.fillRect(
            this.playerX + 10, 
            this.playerY - 35 + Math.sin(this.animationFrame * 0.2 + Math.PI) * 2, 
            5, 
            5
        );
        
        // Head
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.arc(this.playerX, this.playerY - 45, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Face
        this.ctx.fillStyle = 'black';
        
        // Eyes
        const eyeX = this.playerDirection > 0 ? 2 : -2;
        this.ctx.beginPath();
        this.ctx.arc(this.playerX - 3 + eyeX, this.playerY - 47, 1.5, 0, Math.PI * 2);
        this.ctx.arc(this.playerX + 3 + eyeX, this.playerY - 47, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Mouth
        this.ctx.beginPath();
        this.ctx.arc(this.playerX + this.playerDirection * 2, this.playerY - 42, 2, 0, Math.PI);
        this.ctx.stroke();
    }
}

// Main generation function
function generate() {
    // Clear fractal canvas
    fractalCtx.fillStyle = '#1a1a1a';
    fractalCtx.fillRect(0, 0, fractalCanvas.width, fractalCanvas.height);

    const depth = parseInt(depthInput.value);
    const angle = parseInt(angleInput.value);
    const length = parseInt(lengthInput.value);

    if (generationType.value === 'fractal') {
        const tree = new FractalTree(
            fractalCtx,
            fractalCanvas.width / 2,
            fractalCanvas.height,
            length,
            angle,
            depth
        );
        tree.draw();
    } else {
        const axiom = axiomInput.value;
        const rule = ruleInput.value.replace('→', '');
        const lsystem = new LSystem(
            fractalCtx,
            axiom,
            rule,
            depth,
            length,
            angle
        );
        lsystem.draw();
    }

    // Update game preview with current parameters
    const gamePreview = new GamePreview(gameCtx);
    gamePreview.draw(generationType.value, depth, angle, length);
}

// Initial generation
generate();
