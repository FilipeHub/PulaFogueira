document.addEventListener('DOMContentLoaded', () => {
    const gameMusic        = document.getElementById('game-music');
    const dino             = document.getElementById('dino');
    const cactus           = document.getElementById('cactus');
    const scoreDisplay     = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const gameOverDisplay  = document.getElementById('game-over');
    const restartButton    = document.getElementById('restart-button');
    const gameContainer    = document.querySelector('.game-container');

    let isJumping   = false;
    let isGameOver  = false;
    let score       = 0;
    let highScore   = 0;
    let animationId;
    let scoreInterval;
    let gameStarted = false;

    gameMusic.volume = 0.5;

    // -------------------------------------------------------
    // Helper: live pixel dimensions of the container.
    // All collision math uses these — never hardcoded 800/350.
    // -------------------------------------------------------
    function containerSize() {
        return {
            w: gameContainer.offsetWidth,
            h: gameContainer.offsetHeight,
        };
    }

    // -------------------------------------------------------
    // Iniciar / Reiniciar
    // -------------------------------------------------------
    function startGame() {
        gameStarted = true;

        // Mobile autoplay policy: play() returns a Promise
        gameMusic.play().catch(() => { /* silently ignore */ });

        isGameOver = false;
        score      = 0;
        scoreDisplay.textContent = score;
        gameOverDisplay.classList.add('hidden');
        restartButton.hidden = true;

        cactus.classList.remove('hidden');
        cactus.style.right = '-6.25%';  // off-screen (mirrors CSS default)

        // Reiniciar animação do fundo
        gameContainer.style.animation = 'moveBackground 60s linear infinite';

        // Contagem de pontos
        scoreInterval = setInterval(() => {
            if (!isGameOver) {
                score++;
                scoreDisplay.textContent = score;
            }
        }, 100);

        animateGame();
    }

    // -------------------------------------------------------
    // Loop do jogo
    // -------------------------------------------------------
    function animateGame() {
        if (isGameOver) return;

        const { w, h } = containerSize();

        // Posição atual do cacto em pixels (propriedade `right`)
        let cactusRight = parseFloat(window.getComputedStyle(cactus).getPropertyValue('right'));

        // Reposicionar quando sair pela esquerda
        if (cactusRight > w) {
            cactusRight = -(w * 0.0625); // -6.25 % da largura
        }

        // Velocidade proporcional ao container (≈ 5 px a 800 px)
        const speed = w * 0.00625;
        cactus.style.right = `${cactusRight + speed}px`;

        // ---- Detecção de colisão (todos os valores em px) ----
        const groundH    = h * 0.0571;          // 5.71 % = 20 / 350
        const dinoW      = w * 0.075;           // 7.5 %  = 60 / 800
        const dinoLeft   = w * 0.0625;          // 6.25 % = 50 / 800
        const dinoRight  = dinoLeft + dinoW;
        const dinoBottom = parseFloat(window.getComputedStyle(dino).getPropertyValue('bottom'));

        const cactusW     = w * 0.0375;         // 3.75 % = 30 / 800
        const cactusLeft  = w - cactusRight - cactusW;
        const cactusRight2 = cactusLeft + cactusW;
        const cactusH     = cactusW;            // fogo é aprox. quadrado

        if (
            dinoRight  > cactusLeft  &&
            dinoLeft   < cactusRight2 &&
            dinoBottom < groundH + cactusH
        ) {
            gameOver();
            return;
        }

        animationId = requestAnimationFrame(animateGame);
    }

    // -------------------------------------------------------
    // Pulo
    // -------------------------------------------------------
    function jump() {
        if (isJumping || isGameOver) return;

        isJumping = true;
        dino.classList.add('jumping');

        setTimeout(() => {
            dino.classList.remove('jumping');
            isJumping = false;
        }, 700);
    }

    // -------------------------------------------------------
    // Game Over
    // -------------------------------------------------------
    function gameOver() {
        isGameOver = true;
        clearInterval(scoreInterval);
        cancelAnimationFrame(animationId);

        gameMusic.pause();
        gameMusic.currentTime = 0;

        // Parar animação do fundo
        gameContainer.style.animation = 'stopBackground 60s linear infinite';

        // Atualizar recorde
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = `MAIOR: ${highScore}`;
        }

        gameOverDisplay.classList.remove('hidden');
        restartButton.hidden = false;
    }

    // -------------------------------------------------------
    // Entrada — Teclado
    // -------------------------------------------------------
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            event.preventDefault(); // impede scroll da página
            if (!isGameOver) {
                jump();
            } else {
                startGame();
            }
        }
    });

    // -------------------------------------------------------
    // Entrada — Toque / Tap (celular e tablet)
    // -------------------------------------------------------
    function handleTap(e) {
        if (e.target === restartButton) return; // botão cuida de si mesmo

        e.preventDefault();

        if (!isGameOver) {
            jump();
        } else {
            startGame();
        }
    }

    // touchstart: resposta imediata, sem delay de 300 ms
    gameContainer.addEventListener('touchstart', handleTap, { passive: false });
    // click: fallback para desktop
    gameContainer.addEventListener('click', handleTap);

    // -------------------------------------------------------
    // Botão Reiniciar
    // -------------------------------------------------------
    restartButton.addEventListener('click', (e) => {
        e.stopPropagation(); // evita acionar o click do container
        startGame();
    });

    // -------------------------------------------------------
    // Início
    // -------------------------------------------------------
    startGame();
});
