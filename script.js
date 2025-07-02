// http://api:5000/chatbot/webhook/

document.addEventListener('DOMContentLoaded', () => {
    const gameMusic = document.getElementById('game-music');
    const dino = document.getElementById('dino');
    const cactus = document.getElementById('cactus');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const gameOverDisplay = document.getElementById('game-over');
    const restartButton = document.getElementById('restart-button');
    
    let isJumping = false;
    let isGameOver = false;
    let score = 0;
    let highScore = 0;
    let animationId;
    let scoreInterval;
    let gameStarted = false;
    
    gameMusic.volume = 0.5;
    
    // Função para iniciar o jogo
    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            document.addEventListener('keydown', () => {
                gameMusic.play();
            }, { once: true });
        } else {
            gameMusic.play();
        }

        isGameOver = false;
        score = 0;
        scoreDisplay.textContent = score;
        gameOverDisplay.classList.add('hidden');
        cactus.classList.remove('hidden');
        cactus.style.right = '-50px';
        
        // Reset background animation
        document.querySelector('.game-container').style.animation = 'moveBackground 60s linear infinite';
        
        // Iniciar a contagem de pontos
        scoreInterval = setInterval(() => {
            if (!isGameOver) {
                score++;
                scoreDisplay.textContent = score;
            }
        }, 100);
        
        // Iniciar a animação do jogo
        animateGame();
    }
    
    
    // Função para animar o jogo
    function animateGame() {
        if (isGameOver) return;
        
        // Mover o cacto
        let cactusPosition = parseInt(window.getComputedStyle(cactus).getPropertyValue('right'));
        
        // Se o cacto sair da tela, reposicioná-lo
        if (cactusPosition > 800) {
            cactusPosition = -50;
            // Velocidade aleatória para o cacto
            const speed = Math.random() * 2 + 3; // Velocidade entre 3 e 5
            cactus.style.animationDuration = `${speed}s`;
        }
        
        cactus.style.right = `${cactusPosition + 5}px`;
        
        // Verificar colisão
        const dinoTop = parseInt(window.getComputedStyle(dino).getPropertyValue('bottom'));
        const dinoLeft = parseInt(window.getComputedStyle(dino).getPropertyValue('left'));
        const dinoRight = dinoLeft + 60; // Largura do dino
        
        const cactusLeft = 800 - cactusPosition - 30; // Posição esquerda do cacto
        const cactusRight = cactusLeft + 30; // Largura do cacto
        
        // Colisão: quando o dino está próximo do cacto e não está pulando alto o suficiente
        // Ajustado para considerar o pulo mais alto
        if (
            dinoRight > cactusLeft && 
            dinoLeft < cactusRight && 
            dinoTop < 80 // Altura do cacto
        ) {
            gameOver();
            return;
        }
        
        animationId = requestAnimationFrame(animateGame);
    }
    
    // Função para fazer o dinossauro pular
    function jump() {
        if (isJumping || isGameOver) return;
        
        isJumping = true;
        dino.classList.add('jumping');
        
        // Remover a classe após a animação terminar
        // Aumentado de 500ms para 700ms para corresponder à duração da animação
        setTimeout(() => {
            dino.classList.remove('jumping');
            isJumping = false;
        }, 700);
    }
    
    // Função para encerrar o jogo
    function gameOver() {
        isGameOver = true;
        clearInterval(scoreInterval);
        cancelAnimationFrame(animationId);
        
        // Parar a música
        gameMusic.pause();
        gameMusic.currentTime = 0;
        
        // Stop background animation
        document.querySelector('.game-container').style.animation = 'stopBackground 60s linear infinite';
        
        // Atualizar o high score
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = `MAIOR: ${highScore}`;
        }
        
        gameOverDisplay.classList.remove('hidden');
    }
    
    
    // Event listeners
    document.addEventListener('keydown', (event) => {
        if ((event.code === 'Space' || event.code === 'ArrowUp') && !isGameOver) {
            jump();
        } else if ((event.code === 'Space' || event.code === 'ArrowUp') && isGameOver) {
            startGame();
        }
    });
    
    restartButton.addEventListener('click', startGame);
    
    // Iniciar o jogo
    startGame();
});
