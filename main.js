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
    }

    draw(fractalType, depth, angle, length) {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2d2d2d');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw ground
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, this.ctx.canvas.height - 50, this.ctx.canvas.width, 50);

        // Draw trees based on the current fractal type
        if (fractalType === 'fractal') {
            this.drawFractalTrees(depth, angle, length);
        } else {
            this.drawLSystemTrees(depth, angle, length);
        }

        // Draw decorative elements
        this.drawDecorations();
    }

    drawFractalTrees(depth, angle, length) {
        const treeCount = Math.min(3, depth);
        const spacing = this.ctx.canvas.width / (treeCount + 1);

        for (let i = 0; i < treeCount; i++) {
            const x = spacing * (i + 1);
            const y = this.ctx.canvas.height - 50;
            this.drawFractalTree(x, y, length * 0.5, angle, depth - 1);
        }
    }

    drawFractalTree(x, y, length, angle, depth) {
        if (depth === 0) return;

        const endX = x + length * Math.sin(angle * Math.PI / 180);
        const endY = y - length * Math.cos(angle * Math.PI / 180);

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `hsl(${120 + depth * 20}, 70%, 50%)`;
        this.ctx.lineWidth = depth;
        this.ctx.stroke();

        this.drawFractalTree(endX, endY, length * 0.7, angle - angle, depth - 1);
        this.drawFractalTree(endX, endY, length * 0.7, angle + angle, depth - 1);
    }

    drawLSystemTrees(depth, angle, length) {
        const treeCount = Math.min(2, depth);
        const spacing = this.ctx.canvas.width / (treeCount + 1);

        for (let i = 0; i < treeCount; i++) {
            const x = spacing * (i + 1);
            const y = this.ctx.canvas.height - 50;
            this.drawLSystemTree(x, y, length * 0.5, angle, depth);
        }
    }

    drawLSystemTree(x, y, length, angle, depth) {
        const sequence = this.generateLSystemSequence(depth);
        let currentX = x;
        let currentY = y;
        let currentAngle = 0;

        this.ctx.beginPath();
        this.ctx.moveTo(currentX, currentY);

        for (const char of sequence) {
            switch (char) {
                case 'F':
                    const newX = currentX + length * Math.sin(currentAngle * Math.PI / 180);
                    const newY = currentY - length * Math.cos(currentAngle * Math.PI / 180);
                    this.ctx.lineTo(newX, newY);
                    currentX = newX;
                    currentY = newY;
                    break;
                case '+':
                    currentAngle += angle;
                    break;
                case '-':
                    currentAngle -= angle;
                    break;
            }
        }

        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    generateLSystemSequence(depth) {
        let result = 'F';
        for (let i = 0; i < depth; i++) {
            result = result.replace(/F/g, 'F[+F]F[-F]F');
        }
        return result;
    }

    drawDecorations() {
        // Draw grass
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < 20; i++) {
            const x = (this.ctx.canvas.width / 20) * i;
            const height = 5 + Math.random() * 5;
            this.ctx.fillRect(x, this.ctx.canvas.height - 50, 2, -height);
        }

        // Draw clouds
        this.ctx.fillStyle = '#404040';
        for (let i = 0; i < 3; i++) {
            const x = 50 + i * 150;
            const y = 50 + i * 20;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
            this.ctx.arc(x + 30, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
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
