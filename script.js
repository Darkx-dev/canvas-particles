const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const settings = {
    mode: 'randomized',
    spawnRate: 3,
    maxParticles: 1000,
    connectDistance: 100,
    mouseConnectDistance: 400,
    lineOpacity: 1,
    lineWidth: 1,
    particleSpeed: 2,
    sizeRange: 10,
    bounce: true,
    trailFade: false,
    rainbow: true,
    glowEffect: false,
    particleShape: 'circle',
    backgroundColor: '#000000',
    colorMode: 'rainbow',
    rotation: false,
    pulsation: false,
    explosionPreset: function () {
        Object.assign(settings, {
            mode: 'onclick',
            spawnRate: 20,
            maxParticles: 1000,
            connectDistance: 50,
            particleSpeed: 8,
            rainbow: true,
            glowEffect: true,
            particleShape: 'square',
            backgroundColor: '#000000',
            bounce: false
        });
        gui.updateDisplay();
        init();
    }
};

const particlesArray = [];
let hue = 0;
let frameCount = 0;
let fps = 0;
let lastTime = performance.now();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const mouse = {
    x: undefined,
    y: undefined,
    pressed: false
};

canvas.addEventListener('click', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    if (settings.mode === 'onclick') {
        for (let i = 0; i < settings.spawnRate; i++) {
            if (particlesArray.length < settings.maxParticles) {
                particlesArray.push(new Particle());
            }
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    document.getElementById('mousePos').textContent = `${Math.round(e.x)}, ${Math.round(e.y)}`;

    if (settings.mode === 'onhover') {
        for (let i = 0; i < settings.spawnRate; i++) {
            if (particlesArray.length < settings.maxParticles) {
                particlesArray.push(new Particle());
            }
        }
    }
});

canvas.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

canvas.addEventListener('mousedown', () => {
    mouse.pressed = true;
});

canvas.addEventListener('mouseup', () => {
    mouse.pressed = false;
});

class Particle {
    constructor() {
        if (settings.mode !== 'randomized') {
            this.x = mouse.x + (Math.random() - 0.5) * 20;
            this.y = mouse.y + (Math.random() - 0.5) * 20;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        this.size = Math.random() * settings.sizeRange + 1;
        this.originalSize = this.size;
        this.vx = (Math.random() - 0.5) * settings.particleSpeed * 2;
        this.vy = (Math.random() - 0.5) * settings.particleSpeed * 2;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;

        this.hue = settings.colorMode === 'rainbow' ? hue : Math.random() * 360;
        this.color = `hsl(${this.hue}, 100%, 50%)`;
    }

    update() {
        // Boundary collision
        if (settings.bounce) {
            if (this.x > canvas.width - this.size || this.x < this.size) {
                this.vx *= -1;
                this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
            }
            if (this.y > canvas.height - this.size || this.y < this.size) {
                this.vy *= -1;
                this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
            }
        } else {
            if (this.x > canvas.width + this.size) this.x = -this.size;
            if (this.x < -this.size) this.x = canvas.width + this.size;
            if (this.y > canvas.height + this.size) this.y = -this.size;
            if (this.y < -this.size) this.y = canvas.height + this.size;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Rotation
        if (settings.rotation) {
            this.rotation += this.rotationSpeed;
        }

        // Pulsation
        if (settings.pulsation) {
            this.size = this.originalSize + Math.sin(frameCount * 0.1 + this.x * 0.01) * (this.originalSize * 0.3);
        }
        
        // Life cycle by size
        if (this.size > 0.2 && settings.mode != 'randomized') this.size -= 0.05

        // Color updates
        if (settings.rainbow && settings.colorMode === 'rainbow') {
            this.hue = hue;
            this.color = `hsl(${this.hue}, 100%, 50%)`;
        }
    }

    draw() {
        ctx.save();

        if (settings.glowEffect) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
        }

        ctx.translate(this.x, this.y);
        if (settings.rotation) {
            ctx.rotate(this.rotation);
        }

        ctx.fillStyle = this.color;

        switch (settings.particleShape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                break;
        }

        ctx.restore();
    }
}

function init() {
    particlesArray.length = 0;
    for (let i = 0; i < Math.min(100, settings.maxParticles); i++) {
        particlesArray.push(new Particle());
    }
}

function handleParticles() {
    // Continuous spawning
    if (settings.mode === 'continuous' && particlesArray.length < settings.maxParticles) {
        for (let i = 0; i < settings.spawnRate; i++) {
            particlesArray.push(new Particle());
        }
    }

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        // Mouse connections
        if (mouse.x !== undefined && mouse.y !== undefined) {
            const dx = particlesArray[i].x - mouse.x;
            const dy = particlesArray[i].y - mouse.y;
            const distance = Math.hypot(dx, dy);

            if (distance < settings.mouseConnectDistance && mouse.pressed) {
                ctx.beginPath();
                ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${settings.lineOpacity})`;
                ctx.lineWidth = 2;
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }

        // Particle connections
        for (let j = i + 1; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const distance = Math.hypot(dx, dy);

            if (distance < settings.connectDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `hsla(${particlesArray[i].hue}, 100%, 50%, ${settings.lineOpacity * (1 - distance / settings.connectDistance)})`;
                ctx.lineWidth = settings.lineWidth;
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }

        // Remove dead particles
        if (particlesArray[i].size <= 0.2) {
            particlesArray.splice(i, 1);
            i--;
        }
    }

    // Update stats
    document.getElementById('particleCount').textContent = particlesArray.length;
}

function animate(currentTime) {
    // FPS calculation
    if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        document.getElementById('fps').textContent = fps;
        frameCount = 0;
        lastTime = currentTime;
    }
    frameCount++;

    // Clear canvas
    if (!settings.trailFade) {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = `${settings.backgroundColor}20`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    handleParticles();

    if (hue > 360) hue = 0;
    if (settings.rainbow) hue += 0.5;

    requestAnimationFrame(animate);
}

// Setup dat.GUI
const gui = new dat.GUI();

// Presets folder
const presetsFolder = gui.addFolder('Presets');
presetsFolder.add(settings, 'explosionPreset').name('Explosion');
presetsFolder.open();

// Particle System folder
const particleFolder = gui.addFolder('Particle System');
particleFolder.add(settings, 'mode', ['randomized', 'onhover', 'onclick', 'continuous']).onChange(() => {
    if (settings.mode === 'randomized') {
        init();
    } else {
        particlesArray.length = 0;
    }
});
particleFolder.add(settings, 'spawnRate', 1, 50, 1);
particleFolder.add(settings, 'maxParticles', 50, 1000, 10);
particleFolder.open();

// Connections folder
const connectionsFolder = gui.addFolder('Connections');
connectionsFolder.add(settings, 'connectDistance', 20, 400, 10);
connectionsFolder.add(settings, 'mouseConnectDistance', 50, 800, 10);
connectionsFolder.add(settings, 'lineOpacity', 0, 1, 0.1);
connectionsFolder.add(settings, 'lineWidth', 0, 15, 1);
connectionsFolder.open();

// Physics folder
const physicsFolder = gui.addFolder('Physics');
physicsFolder.add(settings, 'particleSpeed', 0.1, 10, 0.1).onChange(() => {
    if (settings.mode === 'randomized') {
        init();
    } else {
        particlesArray.length = 0;
    }
});
physicsFolder.add(settings, 'sizeRange', 1, 20, 1).onChange(() => {
    if (settings.mode === 'randomized') {
        init();
    } else {
        particlesArray.length = 0;
    }
});
physicsFolder.add(settings, 'bounce');
physicsFolder.open();

// Visual Effects folder
const visualFolder = gui.addFolder('Visual Effects');
visualFolder.add(settings, 'rainbow');
visualFolder.add(settings, 'trailFade');
visualFolder.add(settings, 'glowEffect');
visualFolder.add(settings, 'particleShape', ['circle', 'square']);
visualFolder.addColor(settings, 'backgroundColor');
visualFolder.add(settings, 'colorMode', ['rainbow', 'single', 'gradient']);
visualFolder.open();

// Animation folder
const animationFolder = gui.addFolder('Animation');
animationFolder.add(settings, 'rotation');
animationFolder.add(settings, 'pulsation');
animationFolder.open();

// Initialize and start
if (settings.mode === 'randomized') {
    init();
}

// Start animation
animate(performance.now());