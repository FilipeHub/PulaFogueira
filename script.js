document.addEventListener('DOMContentLoaded', () => {
    const gameMusic = document.getElementById('game-music');
    const dino = document.getElementById('dino');
    const cactus = document.getElementById('cactus');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const gameOverDisplay = document.getElementById('game-over');
    const restartButton = document.getElementById('restart-button');
    const gameContainer = document.querySelector('.game-container');

    let isJumping = false;
    let isGameOver = false;
    let score = 0;
    let highScore = 0;
    let animationId;
    let scoreInterval;
    let gameStarted = false;

    gameMusic.volume = 0.5;

    // ----------------------------
    // SPRITE POR IMAGENS (NOVO)
    // ----------------------------
    const dinoFrames = [
        "images/run01.png",
        "images/run02.png",
        "images/run03.png",
        "images/run04.png"
    ];

    let frameIndex = 0;
    let runInterval = null;

    // Estado inicial parado
    gameContainer.style.animation = 'none';
    setIdle();

    // ----------------------------
    // ANIMAÇÃO DO PERSONAGEM
    // ----------------------------
    function startRunAnimation() {
        stopRunAnimation();

        runInterval = setInterval(() => {
            dino.style.backgroundImage = `url(${dinoFrames[frameIndex]})`;

            frameIndex = (frameIndex + 1) % dinoFrames.length;
        }, 100);
    }

    function stopRunAnimation() {
        if (runInterval) {
            clearInterval(runInterval);
            runInterval = null;
        }
    }

    function setIdle() {
        dino.style.backgroundImage = `url(${dinoFrames[0]})`;
    }

    // ----------------------------
    // HELPERS
    // ----------------------------
    function containerSize() {
        return {
            w: gameContainer.offsetWidth,
            h: gameContainer.offsetHeight,
        };
    }

    // ----------------------------
    // START GAME
    // ----------------------------
    function startGame() {
        gameStarted = true;

        gameMusic.play().catch(() => {});

        isGameOver = false;
        dino.classList.remove('dead');

        frameIndex = 0;
        startRunAnimation();

        score = 0;
        scoreDisplay.textContent = score;

        gameOverDisplay.classList.add('hidden');
        restartButton.hidden = true;

        cactus.classList.remove('hidden');
        cactus.style.right = '-6.25%';

        gameContainer.style.animation = 'moveBackground 30s linear infinite';

        scoreInterval = setInterval(() => {
            if (!isGameOver) {
                score++;
                scoreDisplay.textContent = score;
            }
        }, 100);

        animateGame();
    }

    // ----------------------------
    // GAME LOOP
    // ----------------------------
    function animateGame() {
        if (isGameOver) return;

        const { w, h } = containerSize();

        let cactusRight = parseFloat(
            window.getComputedStyle(cactus).getPropertyValue('right')
        );

        if (cactusRight > w) {
            cactusRight = -(w * 0.0625);
        }

        const speed = w * 0.0125;
        cactus.style.right = `${cactusRight + speed}px`;

        const groundH = h * 0.0571;
        const dinoW = w * 0.075;
        const dinoLeft = w * 0.0625;
        const dinoRight = dinoLeft + dinoW;
        const dinoBottom = parseFloat(
            window.getComputedStyle(dino).getPropertyValue('bottom')
        );

        const cactusW = w * 0.0375;
        const cactusLeft = w - cactusRight - cactusW;
        const cactusRight2 = cactusLeft + cactusW;
        const cactusH = cactusW;

        if (
            dinoRight > cactusLeft &&
            dinoLeft < cactusRight2 &&
            dinoBottom < groundH + cactusH
        ) {
            gameOver();
            return;
        }

        animationId = requestAnimationFrame(animateGame);
    }

    // ----------------------------
    // JUMP
    // ----------------------------
    function jump() {
        if (isJumping || isGameOver) return;

        isJumping = true;

        stopRunAnimation();

        dino.classList.add('jumping');

        setTimeout(() => {
            dino.classList.remove('jumping');
            isJumping = false;

            if (!isGameOver) {
                startRunAnimation();
            }
        }, 700);
    }

    // ----------------------------
    // GAME OVER
    // ----------------------------
    function gameOver() {
        isGameOver = true;

        clearInterval(scoreInterval);
        cancelAnimationFrame(animationId);

        gameMusic.pause();
        gameMusic.currentTime = 0;

        gameContainer.style.animation = 'stopBackground 16s linear infinite';

        stopRunAnimation();
        dino.classList.add('dead');
        setIdle();

        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = `Dono da Fogueira: ${highScore}`;
        }

        gameOverDisplay.classList.remove('hidden');
        restartButton.hidden = false;
        cactus.classList.add('hit');
    }
    

    // ----------------------------
    // CONTROLES TECLADO
    // ----------------------------
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            event.preventDefault();

            if (gameStarted && !isGameOver) {
                jump();
            } else if (isGameOver) {
                startGame();
                
            }
        }
    });

    // ----------------------------
    // TOQUE MOBILE
    // ----------------------------
    function handleTap(e) {
        if (e.target === restartButton) return;

        e.preventDefault();

        if (gameStarted && !isGameOver) {
            jump();
        }
    }

    gameContainer.addEventListener('touchstart', handleTap, { passive: false });
    gameContainer.addEventListener('click', handleTap);

    // ----------------------------
    // RESTART
    // ----------------------------
    restartButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
    });
});