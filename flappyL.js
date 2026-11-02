/**
 * Flappy L - Portfolio Easter Egg Game
 * Matches the GitHub.io site color palette and theme.
 */
function launchFlappyL() {
    // Prevent multiple instances
    if (document.getElementById('flappy-modal')) return;

    // Detect current site theme (Dark / Light)
    const isDark = document.documentElement.classList.contains('dark');
    
    // Theme color tokens matching s.css / Tailwind config
    const theme = {
        bg: isDark ? '#0b0f19' : '#f8fafc',
        cardBg: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1e293b',
        muted: isDark ? '#64748b' : '#94a3b8',
        pipe: isDark ? '#334155' : '#cbd5e1',
        pipeBorder: isDark ? '#475569' : '#94a3b8',
        accent: '#10b981', // Emerald
        ground: isDark ? '#1e293b' : '#e2e8f0'
    };

    // Inject Flapping Animation Keyframes for the Header Title
    if (!document.getElementById('flappy-keyframes')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'flappy-keyframes';
        styleSheet.textContent = `
            @keyframes flapTitle {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-4px) rotate(-6deg); }
            }
            .flapping-l-title {
                display: inline-block;
                animation: flapTitle 0.8s ease-in-out infinite;
                color: #10b981;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Create Modal Overlay
    const overlay = document.createElement('div');
    overlay.id = 'flappy-modal';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Oxygen', sans-serif;
    `;

    // Create Game Container Box
    const box = document.createElement('div');
    box.style.cssText = `
        background: ${theme.cardBg}; color: ${theme.text};
        border: 1px solid ${theme.pipeBorder}; border-radius: 16px;
        padding: 24px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
        max-width: 420px; width: 100%; position: relative;
    `;

    box.innerHTML = `
        <button id="close-flappy" style="position: absolute; top: 16px; right: 20px; background:none; border:none; color:${theme.muted}; font-size: 1.5rem; cursor:pointer; line-height: 1;">&times;</button>
        <h3 style="font-size: 1.5rem; font-weight: bold; margin: 0 0 16px 0; text-align: center;">
            <span class="flapping-l-title">L</span>
        </h3>
        <canvas id="flappyCanvas" width="360" height="480" style="background: ${theme.bg}; border-radius: 12px; border: 1px solid ${theme.pipeBorder}; display: block; margin: 0 auto;"></canvas>
        <p style="font-size: 0.85rem; color: ${theme.muted}; margin-top: 12px;">Press <kbd style="background:${theme.pipe}; padding: 2px 6px; border-radius: 4px; font-weight:bold;">SPACEBAR</kbd> to flap & jump</p>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Canvas Setup
    const canvas = document.getElementById('flappyCanvas');
    const ctx = canvas.getContext('2d');

    // Game Variables
    let gameRunning = true;
    let score = 0;
    let highScore = localStorage.getItem('flappy_l_highscore') || 0;

    const bird = {
        x: 80,
        y: 200,
        width: 28,
        height: 28,
        gravity: 0.45,
        lift: -8.5,
        velocity: 0
    };

    let pipes = [];
    let pipeWidth = 44;
    let frameCount = 0;

    // Input Control: ONLY Spacebar
    function handleKeyDown(e) {
        if (e.code === 'Space') {
            e.preventDefault(); // Stop page scrolling
            if (gameRunning) {
                bird.velocity = bird.lift;
            } else {
                resetGame();
            }
        }
    }
    window.addEventListener('keydown', handleKeyDown);

    function resetGame() {
        bird.y = 200;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        frameCount = 0;
        gameRunning = true;
    }

    function spawnPipe() {
        const minHeight = 50;
        // Gap starts very wide (185px) at score 0 and gradually tightens as score increases (min 140px)
        const currentGap = Math.max(140, 185 - (score * 3));
        const maxHeight = canvas.height - currentGap - 100;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        pipes.push({
            x: canvas.width,
            top: height,
            bottom: canvas.height - height - currentGap,
            passed: false
        });
    }

    // Main Game Loop
    function update() {
        if (!gameRunning) return;

        // Bird physics
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Ground/Ceiling collision
        if (bird.y + bird.height >= canvas.height - 40 || bird.y <= 0) {
            gameRunning = false;
        }

        // Pipe spawning & movement
        if (frameCount % 110 === 0) {
            spawnPipe();
        }

        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= 2.5;

            // Collision detection
            if (
                bird.x < pipes[i].x + pipeWidth &&
                bird.x + bird.width > pipes[i].x &&
                (bird.y < pipes[i].top || bird.y + bird.height > canvas.height - pipes[i].bottom - 40)
            ) {
                gameRunning = false;
            }

            // Scoring
            if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
                score++;
                pipes[i].passed = true;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('flappy_l_highscore', highScore);
                }
            }

            // Remove off-screen pipes
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }

        frameCount++;
    }

    function draw() {
        // Clear background
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Pipes
        pipes.forEach(pipe => {
            ctx.fillStyle = theme.pipe;
            ctx.strokeStyle = theme.pipeBorder;
            ctx.lineWidth = 2;

            // Top pipe
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
            ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);

            // Bottom pipe
            ctx.fillRect(pipe.x, canvas.height - pipe.bottom - 40, pipeWidth, pipe.bottom);
            ctx.strokeRect(pipe.x, canvas.height - pipe.bottom - 40, pipeWidth, pipe.bottom);
        });

        // Draw Ground Floor
        ctx.fillStyle = theme.ground;
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = theme.accent;
        ctx.fillRect(0, canvas.height - 40, canvas.width, 4);

        // Draw Bird: Clean Letter "L" with rotation/twist
        ctx.save();
        ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        
        let rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.velocity * 0.08));
        ctx.rotate(rotation);

        ctx.fillStyle = theme.accent;
        ctx.font = 'bold 32px Oxygen, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', 0, 0);

        ctx.restore();

        // Draw Scoreboard overlay on canvas
        ctx.fillStyle = theme.text;
        ctx.font = 'bold 20px Oxygen, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 16, 32);

        // Game Over screen overlay
        if (!gameRunning) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 26px Oxygen, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);

            ctx.font = '16px Oxygen, sans-serif';
            ctx.fillStyle = theme.muted;
            ctx.fillText(`Score: ${score}  |  High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 10);
            
            ctx.fillStyle = theme.accent;
            ctx.font = 'bold 14px Oxygen, sans-serif';
            ctx.fillText('Press SPACEBAR to Play Again', canvas.width / 2, canvas.height / 2 + 50);
        }
    }

    let animationId;
    function loop() {
        update();
        draw();
        animationId = requestAnimationFrame(loop);
    }
    loop();

    // Close handlers
    function closeModal() {
        cancelAnimationFrame(animationId);
        window.removeEventListener('keydown', handleKeyDown);
        overlay.remove();
    }

    document.getElementById('close-flappy').onclick = closeModal;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };
}