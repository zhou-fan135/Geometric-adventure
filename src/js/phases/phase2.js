import { Platform, Player } from '../gameObjects.js';

export default {
    start(canvas, context) {
        let keys = {}; // Armazena as teclas pressionadas
        let camera = { x: 0, y: 0 }; // Define a posição inicial da câmera
        const respawnPoint = { x: 100, y: canvas.height - 150 }; // Ponto de renascimento
        let isGameOver = false; // Estado do jogo
        let player, platform;
        let backgroundMusic, loseLifeSound, jumpSound, gameOverSound;

        // Carrega os sons
        function loadSounds() {
            try {
                if (!backgroundMusic) {
                    backgroundMusic = new Audio('src/audio/background.mp3');
                    backgroundMusic.loop = true; // Música de fundo em loop
                    backgroundMusic.volume = 0.5; // Volume ajustado
                }

                if (!loseLifeSound) {
                    loseLifeSound = new Audio('src/audio/lose_life.mp3');
                    loseLifeSound.volume = 0.7;
                }

                if (!jumpSound) {
                    jumpSound = new Audio('src/audio/jump.mp3');
                    jumpSound.volume = 0.7;
                }

                if (!gameOverSound) {
                    gameOverSound = new Audio('src/audio/game_over.mp3');
                    gameOverSound.volume = 0.8;
                }

                // Testa se os arquivos de áudio carregaram corretamente
                [backgroundMusic, loseLifeSound, jumpSound, gameOverSound].forEach((audio, index) => {
                    audio.onerror = () => {
                        const audioNames = ['background.mp3', 'lose_life.mp3', 'jump.mp3', 'game_over.mp3'];
                        console.error(`Erro ao carregar o arquivo de áudio: ${audioNames[index]}`);
                        alert(`Erro ao carregar o arquivo de áudio: ${audioNames[index]}`);
                    };
                });
            } catch (error) {
                console.error('Erro ao carregar os sons:', error);
                alert('Erro ao carregar os sons. Verifique os arquivos de áudio.');
            }
        }

        // Inicializa o estado da fase
        function init() {
            loadSounds(); // Carrega os sons

            // Aguarda interação do usuário para tocar a música de fundo
            document.body.addEventListener('keydown', () => {
                if (backgroundMusic.paused) {
                    backgroundMusic.currentTime = 0; // Reinicia a música
                    backgroundMusic.play();
                }
            }, { once: true });

            // Cria o player
            player = new Player(respawnPoint.x, respawnPoint.y, 30, 30, jumpSound);

            // Cria uma única plataforma
            platform = new Platform(50, canvas.height - 100, 200, 10);
        }

        // Função para verificar "Game Over"
        function checkGameOver() {
            if (player.lives <= 0 && !isGameOver) {
                isGameOver = true;
                if (backgroundMusic) {
                    backgroundMusic.pause(); // Pausa a música de fundo
                }
                gameOverSound.play(); // Toca o som de game over
                showMenu('Game Over', false); // Exibe o menu de Game Over
                return true;
            }
            return false;
        }

        // Funções para capturar teclas
        function handleKeyDown(e) {
            keys[e.key.toLowerCase()] = true;
        }

        function handleKeyUp(e) {
            keys[e.key.toLowerCase()] = false;
        }

        // Adiciona os event listeners ao iniciar a fase
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        function drawLives() {
            context.save();
            context.resetTransform(); // Garante que as vidas sejam desenhadas na posição fixa
            context.fillStyle = 'black';
            context.font = '20px Arial';
            context.fillText(`Lives: ${player.lives}`, 10, 30); // Exibe as vidas no canto superior esquerdo
            context.restore();
        }

        function showMenu(title, showNextButton = true) {
            // Pausa a música de fundo
            if (backgroundMusic) {
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0; // Reinicia a música para o início
            }

            const menu = document.createElement('div');
            menu.classList.add('menu-overlay');

            const titleElement = document.createElement('h1');
            titleElement.innerText = title;
            menu.appendChild(titleElement);

            // Botão de reiniciar a fase
            const restartButton = document.createElement('button');
            restartButton.innerHTML = '⟳'; // Símbolo de seta circular
            restartButton.addEventListener('click', () => {
                menu.remove(); // Remove o menu atual
                restart(); // Reinicia a fase
            });
            menu.appendChild(restartButton);

            // Botão de voltar ao menu principal
            const menuButton = document.createElement('button');
            menuButton.innerText = 'Menu';
            menuButton.addEventListener('click', () => {
                menu.remove(); // Remove o menu atual
                canvas.style.display = 'none'; // Oculta o canvas
                const levelContainer = document.querySelector('.level-container');
                if (levelContainer) {
                    levelContainer.style.display = 'block'; // Exibe o menu principal
                }
            });
            menu.appendChild(menuButton);

            // Botão de próxima fase (opcional)
            if (showNextButton) {
                const nextButton = document.createElement('button');
                nextButton.innerHTML = '→'; // Símbolo de seta para a direita
                nextButton.addEventListener('click', () => {
                    menu.remove(); // Remove o menu atual
                    const currentPhase = parseInt(canvas.getAttribute('data-phase'), 10) || 1; // Obtém a fase atual
                    MainMenu.loadPhase(currentPhase + 1); // Carrega a próxima fase
                });
                menu.appendChild(nextButton);
            }

            document.body.appendChild(menu);
        }

        function restart() {
            isGameOver = false;

            // Pausa e reinicia a música de fundo
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            backgroundMusic.play();

            // Reinicia o estado da fase
            init();

            // Reinicia o loop do jogo
            gameLoop();
        }

        function gameLoop() {
            if (isGameOver) return;

            context.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

            // Atualiza a posição do player
            player.applyGravity(canvas);
            player.move(keys);

            // Atualiza a posição da câmera para seguir o player
            camera.x = player.x - canvas.width / 2 + player.width / 2;
            camera.y = player.y - canvas.height / 2 + player.height / 2;

            // Verifica se o player caiu abaixo do canvas
            if (player.y > canvas.height) {
                player.lives -= 1; // Reduz uma vida
                loseLifeSound.play(); // Toca o som de perder vida
                if (checkGameOver()) return; // Verifica "Game Over"
                player.x = respawnPoint.x;
                player.y = respawnPoint.y - player.height; // Ajusta a posição para ficar acima do ponto de respawn
                player.velocityY = 0; // Reseta a gravidade
            }

            // Verifica colisão do player com a plataforma
            if (
                player.y + player.height >= platform.y && // Parte inferior do player toca a parte superior da plataforma
                player.y + player.height - player.velocityY <= platform.y && // Evita atravessar por baixo
                player.x + player.width > platform.x && // Colisão horizontal (lado direito do player)
                player.x < platform.x + platform.width // Colisão horizontal (lado esquerdo do player)
            ) {
                player.y = platform.y - player.height; // Ajusta a posição do player para ficar em cima da plataforma
                player.velocityY = 0; // Interrompe a gravidade
                player.isJumping = false; // Permite pular novamente
            }

            // Desenha a plataforma
            context.save();
            context.translate(-camera.x, -camera.y);
            platform.draw(context);
            context.restore();

            // Desenha o player
            context.save();
            context.translate(-camera.x, -camera.y);
            player.draw(context);
            context.restore();

            // Desenha as vidas no canto superior esquerdo
            drawLives();

            requestAnimationFrame(gameLoop); // Loop do jogo
        }

        // Inicializa a fase
        init();
        gameLoop();
    }
};