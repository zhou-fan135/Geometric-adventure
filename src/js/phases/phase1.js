import { Platform, Player, Square, Spike, Pusher, Star, SpawnPoint } from '../gameObjects.js'; // Importa as classes de objetos do jogo

export default {
    start(canvas, context) {
        let keys = {}; // Armazena as teclas pressionadas
        let camera = { x: 0, y: 0 }; // Define a posição inicial da câmera
        const respawnPoint = { x: 100, y: canvas.height - 450 }; // Define o ponto de renascimento inicial
        let isGameOver = false; // Indica se o jogo terminou
        let spawnPoints = []; // Array para armazenar os pontos de renascimento
        // Variáveis da fase
        let player, platforms, spikes, square, pusher, star;
        let backgroundMusic, loseLifeSound, jumpSound, gameOverSound, levelCompleteSound;

        function loadSounds() {
            try {
                if (!backgroundMusic) {
                    backgroundMusic = new Audio('src/audio/background.mp3'); // Música de fundo
                    backgroundMusic.loop = true; // Define a música para tocar em loop
                    backgroundMusic.volume = 0.5; // Ajusta o volume
                }

                if (!loseLifeSound) {
                    loseLifeSound = new Audio('src/audio/lose_life.mp3'); // Som de perder vida
                    loseLifeSound.volume = 0.7;
                }

                if (!jumpSound) {
                    jumpSound = new Audio('src/audio/jump.mp3'); // Som de pulo
                    jumpSound.volume = 0.7;
                }

                if (!gameOverSound) {
                    gameOverSound = new Audio('src/audio/game_over.mp3'); // Som de game over
                    gameOverSound.volume = 0.8;
                }

                if (!levelCompleteSound) {
                    levelCompleteSound = new Audio('src/audio/level_complete.mp3'); // Som de completar fase
                    levelCompleteSound.volume = 0.8;
                }

                // Testa se os arquivos de áudio carregaram corretamente
                [backgroundMusic, loseLifeSound, jumpSound, gameOverSound, levelCompleteSound].forEach((audio, index) => {
                    audio.onerror = () => {
                        const audioNames = ['background.mp3', 'lose_life.mp3', 'jump.mp3', 'game_over.mp3', 'level_complete.mp3'];
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

            // Cria plataformas
            platforms = [
                new Platform(100, canvas.height - 350, 60, 10),
                new Platform(300, canvas.height - 400, 60, 10),
                new Platform(500, canvas.height - 450, 60, 10), // Terceira plataforma
                new Platform(700, canvas.height - 500, 180, 10), // Quarta plataforma
                new Platform(900, canvas.height - 550, 60, 10),
                new Platform(1100, canvas.height - 600, 60, 10),
                new Platform(1100, canvas.height - 650, 60, 10),
            ];

            // Cria spawn points
            spawnPoints = [
                new SpawnPoint(700, platforms[3].y - 5), // Novo spawn point no início da quarta plataforma
            ];

            // Reseta o ponto de renascimento inicial
            respawnPoint.x = 100;
            respawnPoint.y = canvas.height - 450;

            // Cria uma estrela na última plataforma
            star = new Star(platforms[5].x + platforms[5].width / 2 - 15, platforms[5].y - 10, 10);

            // Cria um quadrado na quarta plataforma
            square = new Square(710, platforms[3].y - 15, 15, 3, platforms[3]);

            // Cria um pusher na terceira plataforma
            pusher = new Pusher(510, platforms[2].y - 10, 10, 2, platforms[2]);

            // Cria os spikes
            spikes = [
                new Spike(320, platforms[1].y - 20, 20, 20),
                new Spike(platforms[6].x, platforms[6].y - 20, 20, 20),
                new Spike(platforms[6].x + 20, platforms[6].y - 20, 20, 20),
                new Spike(platforms[6].x + 40, platforms[6].y - 20, 20, 20),
            ];
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

        // Adicione os event listeners ao iniciar a fase
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
                console.log('Botão de reinício clicado'); // Verifica se o evento é disparado
                menu.remove(); // Remove o menu atual
                restart(); // Reinicia a fase
            });
            menu.appendChild(restartButton);

            // Botão de voltar ao menu principal
            const menuButton = document.createElement('button');
            menuButton.innerText = 'Menu';
            menuButton.addEventListener('click', () => {
                if (backgroundMusic) {
                    backgroundMusic.pause(); // Pausa a música de fundo
                    backgroundMusic.currentTime = 0; // Reinicia a música para o início
                }
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
            console.log('Reiniciando a fase'); // Verifica se o método é chamado
            isGameOver = false;

            // Pausa e reinicia a música de fundo
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            backgroundMusic.play();

            // Remove event listeners antigos
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            // Reseta o ponto de respawn inicial
            respawnPoint.x = 100;
            respawnPoint.y = canvas.height - 450;

            // Reinicia o estado da fase
            init();

            // Reseta os spawn points
            spawnPoints.forEach((spawnPoint) => spawnPoint.reset());

            // Adiciona event listeners novamente
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

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

            // Verifica se o player caiu abaixo do canvas ou colidiu com objetos perigosos
            if (
                player.y > canvas.height ||
                spikes.some((spike) => spike.isColliding(player)) || // Verifica colisão com qualquer spike
                square.isColliding(player)
            ) {
                if (!isGameOver) {
                    loseLifeSound.play(); // Toca o som de perder vida
                }
                player.lives -= 1; // Reduz uma vida
                if (checkGameOver()) return; // Verifica "Game Over"
            }

            // Reposiciona o player no ponto de respawn
            if (player.y > canvas.height) {
                player.x = respawnPoint.x;
                player.y = respawnPoint.y - player.height; // Ajusta a posição para ficar acima do ponto de respawn
                player.velocityY = 0; // Reseta a gravidade

                // Garante que o player não atravesse a plataforma no ponto de respawn
                platforms.forEach((platform) => {
                    const { collidingTop } = platform.isColliding(player);
                    if (collidingTop) {
                        player.y = platform.y - player.height; // Ajusta o player para ficar exatamente acima da plataforma
                        player.velocityY = 0; // Interrompe a gravidade
                        player.isJumping = false; // Permite pular novamente
                    }
                });
            }

            // Desenha os objetos visíveis na tela
            platforms.forEach((platform) => {
                context.save();
                context.translate(-camera.x, -camera.y);
                platform.draw(context);
                context.restore();

                const { collidingTop } = platform.isColliding(player);

                if (collidingTop) {
                    player.y = platform.y - player.height; // Ajusta a posição do player para ficar em cima da plataforma
                    player.velocityY = 0; // Interrompe a gravidade
                    player.isJumping = false; // Permite pular novamente
                }
            });

            // Atualiza e desenha os spikes
            spikes.forEach((spike) => {
                context.save();
                context.translate(-camera.x, -camera.y);
                spike.draw(context);
                context.restore();

                if (spike.isColliding(player)) {
                    if (checkGameOver()) return; // Verifica "Game Over"
                    player.velocityY = player.jumpStrength; // Joga o player para cima
                }
            });

            // Atualiza e desenha o quadrado
            square.move();
            context.save();
            context.translate(-camera.x, -camera.y);
            square.draw(context);
            context.restore();

            if (square.isColliding(player)) {
                player.lives -= 1; // Reduz uma vida
                if (checkGameOver()) return; // Verifica "Game Over"
                player.velocityY = player.jumpStrength; // Joga o player para cima
            }

            // Atualiza e desenha o pusher
            pusher.move(player);
            context.save();
            context.translate(-camera.x, -camera.y);
            pusher.draw(context);
            context.restore();

            if (pusher.isColliding(player)) {
                player.x += pusher.speed * pusher.direction; // Empurra o player
            }

            // Atualiza e desenha os spawn points
            spawnPoints.forEach((spawnPoint) => {
                context.save();
                context.translate(-camera.x, -camera.y);
                spawnPoint.draw(context);
                context.restore();

                if (spawnPoint.isColliding(player) && !spawnPoint.isActive) {
                    spawnPoint.activate(); // Ativa o spawn point
                    respawnPoint.x = spawnPoint.x; // Atualiza o ponto de renascimento
                    respawnPoint.y = spawnPoint.y; // Atualiza o ponto de renascimento
                }
            });

            // Atualiza e desenha a estrela
            context.save();
            context.translate(-camera.x, -camera.y);
            star.draw(context);
            context.restore();

            if (star.isColliding(player)) {
                if (backgroundMusic) {
                    backgroundMusic.pause(); // Pausa a música de fundo
                }
                levelCompleteSound.play(); // Toca o som de completar a fase
                showMenu('Fase Completa!'); // Exibe o menu de fase completa
                return;
            }

            // Desenha o player com base na câmera
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