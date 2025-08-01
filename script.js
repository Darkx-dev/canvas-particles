const canvas = document.getElementById('canvas')
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const particlesArray = []
let hue = 0

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

const mouse = {
    x: undefined,
    y: undefined,
    pressed: false
}

canvas.addEventListener('click', (e) => {
    mouse.x = e.x
    mouse.y = e.y
    // for (let i = 0; i < 10; i++) {
    //     particlesArray.push(new Particle())
    // }
})

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.x
    mouse.y = e.y
    for (let i = 0; i < 3; i ++) {
        particlesArray.push(new Particle())
    }

})

canvas.addEventListener('mouseout', (e) => {
    mouse.x = undefined
    mouse.y = undefined
    // particlesArray.push(new Particle())

})

canvas.addEventListener('mousedown', (e) => {
    mouse.pressed = true
})

canvas.addEventListener('mouseup', (e) => {
    mouse.pressed = false
})

class Particle {
    constructor() {
        this.x = mouse.x
        this.y = mouse.y
        // this.x = Math.random() * canvas.width
        // this.y = Math.random() * canvas.height
        this.size = Math.random() * 10 + 1
        this.speedX = Math.random() * 4 - 2
        this.speedY = Math.random() * 4 - 2
        this.color = `hsl(${hue},100%, 50%)`
    }

    update() {
        if (this.x > canvas.width - this.size || this.x < this.size) this.speedX *= -1
        this.x += this.speedX
        if (this.y > canvas.height - this.size || this.y < this.size) this.speedY *= -1
        this.y += this.speedY
        if (this.size > 0.2) this.size -= 0.03
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
    }
}

function init() {
    for (let i = 0; i < 100; i++) {
        particlesArray.push(new Particle())
    }
}
// init()

function handleParticles() {
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
        const dx = particlesArray[i].x - mouse.x
        const dy = particlesArray[i].y - mouse.y
        const distance = Math.hypot(dx, dy)

        if (distance < 400 && mouse.pressed) {
                ctx.beginPath();
                ctx.strokeStyle = `hsl(${hue},100%, 50%)`
                ctx.lineWidth = 1
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y)
                ctx.lineTo(mouse.x, mouse.y)
                ctx.stroke()
        }
        for (let j = 0; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x
            const dy = particlesArray[i].y - particlesArray[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = particlesArray[i].color
                ctx.lineWidth = 0.2
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y)
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y)
                ctx.stroke()
            }
        }
        if (particlesArray[i].size <= 0.2) {
            particlesArray.splice(i, 1)
            i--
        }
    }
    if (mouse.pressed) {
        console.log('You are pressing the mosuse sir!')
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // ctx.fillStyle = `rgba(0,0,0,0.2)`
    // ctx.fillRect(0, 0, canvas.width, canvas.height)
    handleParticles()
    if (hue > 360) {
        hue = 0
    } 
    hue++
    requestAnimationFrame(animate)
}

animate()