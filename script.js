document.fonts.ready.then(() => {
    document.documentElement.style.visibility = "visible";
});

// 🔥 RANKING GLOBAL
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

document.addEventListener('DOMContentLoaded', () => {

    const gameMusic = document.getElementById('game-music');
    const dino = document.getElementById('dino');
    const cactus = document.getElementById('cactus');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const gameOverDisplay = document.getElementById('game-over');
    const restartButton = document.getElementById('restart-button');
    const gameContainer = document.querySelector('.game-container');
    const instructions = document.querySelector(".instructions");
    const input = document.getElementById("player-name");
    const jumpSound = new Audio("audios/jump.mp3");


    let isJumping = false;
    let isGameOver = false;
    let score = 0;
    let animationId;
    let scoreInterval;
    let gameStarted = false;
    let jogadorAtual = "";
    let proximoSpawn = 0;
    let gameOverCount = 0;
    let isAdVisible = false;
    let lastTimestamp = null;

    const adOverlay = document.getElementById('ad-overlay');
    const adClose = document.getElementById('ad-close');
    const jumpArea = document.getElementById('jump-area');
    const jumpButton = document.getElementById('jump-button');

    gameMusic.volume = 0.5;

    // ----------------------------
    // INPUT FORMAT
    // ----------------------------
    input.addEventListener("input", () => {
        let valor = input.value;

        if (valor.length > 0) {
            input.value =
                valor.charAt(0).toUpperCase() +
                valor.slice(1).toLowerCase();
        }
    });

    // ----------------------------
    // SPRITES
    // ----------------------------
    const dinoFrames = [
        "images/run01.png",
        "images/run02.png",
        "images/run03.png",
        "images/run04.png"
    ];
    const dinoDeadImage = "images/gameover.png";

    let frameIndex = 0;
    let runInterval = null;

    gameContainer.style.animation = 'none';
    setIdle();

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

    function containerSize() {
        return {
            w: gameContainer.offsetWidth,
            h: gameContainer.offsetHeight,
        };
    }

    // ----------------------------
    // DONO DA FOGUEIRA
    // ----------------------------
    function atualizarPlacarDono() {
        const top = ranking[0];

        if (top) {
            highScoreDisplay.textContent = `🔥 Dono da fogueira: ${top.nome} - ${top.pontos}`;
        } else {
            highScoreDisplay.textContent = `🔥 Dono da fogueira: 0`;
        }
    }

    // ----------------------------
    // START GAME
    // ----------------------------
    function startGame() {

        const playerName = input.value.trim();

        if (!playerName || !nomeValido(playerName)) {
            alert("Nome inválido! Use apenas letras!");
            return;
        }

        jogadorAtual = playerName;
        gameStarted = true;

        gameMusic.play().catch(() => { });

        isGameOver = false;
        dino.classList.remove('dead');
        setIdle();

        frameIndex = 0;
        startRunAnimation();

        score = 0;
        scoreDisplay.textContent = score;

        gameOverDisplay.classList.add('hidden');
        restartButton.hidden = true;

        cactus.classList.remove('hidden');
        cactus.style.right = '-6.25%';
        cactus.style.transform = "scale(1)";

        gameContainer.style.animation = 'moveBackground 30s linear infinite';

        scoreInterval = setInterval(() => {
            if (!isGameOver) {
                score++;
                scoreDisplay.textContent = score;
            }
        }, 100);

        lastTimestamp = null;
        requestAnimationFrame(animateGame);
        instructions.style.display = "none";
        jumpArea.classList.remove('hidden');
    }

    // ----------------------------
    // GAME LOOP
    // ----------------------------
    function animateGame(timestamp) {
        if (isGameOver) return;

        // 🔥 Delta time: normaliza para 60fps em qualquer dispositivo
        if (lastTimestamp === null) lastTimestamp = timestamp;
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        const delta = Math.min(elapsed / 16.667, 3); // cap: evita salto após alt-tab

        const { w, h } = containerSize();

        let cactusRight = parseFloat(
            window.getComputedStyle(cactus).getPropertyValue('right')
        );

        // 🔥 velocidade dinâmica
        let speed;

        if (score <= 250) {
            speed = w * (0.0125 + score * 0.00005);
        } else {
            speed = w * 0.010;
        }

        cactusRight += speed * delta;

        // 🔥 reaparecimento com dificuldade
        if (cactusRight > w) {

            let proximoSpawn;

            if (score > 200) {
                proximoSpawn = Math.random() * 40 + 20;
            } else {
                proximoSpawn = Math.random() * 120 + 60;
            }

            const escala = 1 + Math.random() * 0.3;
            cactus.style.transform = `scale(${escala})`;

            cactusRight = -(w * 0.0625) - proximoSpawn;
        }

        cactus.style.right = `${cactusRight}px`;



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

        jumpSound.currentTime = 0;
        jumpSound.play();

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
        dino.style.backgroundImage = `url(${dinoDeadImage})`;

        atualizarRanking(jogadorAtual, score);
        renderRanking();
        atualizarPlacarDono();

        gameOverDisplay.classList.remove('hidden');
        restartButton.hidden = false;
        cactus.classList.add('hit');

        instructions.style.display = "flex";
        jumpArea.classList.add('hidden');

        // 🔥 Ad every 3 game overs
        gameOverCount++;
        if (gameOverCount % 5 === 0) {
            showAd();
        }
    }

    // ----------------------------
    // AD OVERLAY
    // ----------------------------
    function showAd() {
        isAdVisible = true;
        adOverlay.classList.remove('hidden');
        adClose.classList.add('hidden');

        setTimeout(() => {
            adClose.classList.remove('hidden');
        }, 1500);

        adClose.onclick = () => {
            adOverlay.classList.add('hidden');
            isAdVisible = false;
        };
    }

    // ----------------------------
    // RANKING
    // ----------------------------
    function nomeValido(nome) {
        const regex = /^[a-zA-Z0-9._-]+$/;
        return regex.test(nome);
    }

    function renderRanking() {
        const div = document.getElementById("ranking");

        div.innerHTML = "<h3>🏆 Ranking</h3>";

        ranking.forEach((j, i) => {
            div.innerHTML += `<p>${i + 1}. ${j.nome} - ${j.pontos}</p>`;
        });
    }

    renderRanking();
    atualizarPlacarDono();

    // ----------------------------
    // CONTROLES
    // ----------------------------
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            event.preventDefault();

            if (isAdVisible) return;

            if (gameStarted && !isGameOver) {
                jump();
            } else if (isGameOver) {
                startGame();
            }
        }
    });

    function handleTap(e) {
        if (isAdVisible) return;
        if (e.target === restartButton) return;

        e.preventDefault();

        if (gameStarted && !isGameOver) {
            jump();
        }
    }

    gameContainer.addEventListener('touchstart', handleTap, { passive: false });
    gameContainer.addEventListener('click', handleTap);

    restartButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAdVisible) return;
        startGame();
    });

    jumpButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAdVisible) return;
        jump();
    });

    jumpButton.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isAdVisible) return;
        jump();
    }, { passive: false });
});

// ----------------------------
// ATUALIZAR RANKING
// ----------------------------
function atualizarRanking(nome, pontos) {

    // procura se o jogador já existe
    const jogadorExistente = ranking.find(j => j.nome === nome);

    if (jogadorExistente) {
        // 🔥 só atualiza se a nova pontuação for MAIOR
        if (pontos > jogadorExistente.pontos) {
            jogadorExistente.pontos = pontos;
        }
    } else {
        // jogador novo
        ranking.push({ nome, pontos });
    }

    // ordena do maior para o menor
    ranking.sort((a, b) => b.pontos - a.pontos);

    // mantém só top 3
    ranking = ranking.slice(0, 3);

    // salva
    localStorage.setItem("ranking", JSON.stringify(ranking));
}