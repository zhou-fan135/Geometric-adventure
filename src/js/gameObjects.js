class Platform {
    constructor(x, y, width, height) {
        this.x = x; // Posição X da plataforma
        this.y = y; // Posição Y da plataforma
        this.width = width; // Largura da plataforma
        this.height = height; // Altura da plataforma
    }

    draw(context) {
        context.fillStyle = 'gray'; // Define a cor da plataforma
        context.fillRect(this.x, this.y, this.width, this.height); // Desenha a plataforma no canvas
    }

    isColliding(player) {
        // Verifica colisão com a parte superior da plataforma
        const collidingTop = 
            player.y + player.height >= this.y && // Parte inferior do player toca a parte superior da plataforma
            player.y + player.height - player.velocityY <= this.y && // Evita atravessar por baixo
            player.x + player.width > this.x && // Colisão horizontal (lado direito do player)
            player.x < this.x + this.width; // Colisão horizontal (lado esquerdo do player)

        // Verifica colisão com a parte inferior da plataforma
        const collidingBottom = 
            player.y <= this.y + this.height && // Parte superior do player toca a parte inferior da plataforma
            player.y - player.velocityY >= this.y + this.height && // Evita atravessar por cima
            player.x + player.width > this.x && // Colisão horizontal (lado direito do player)
            player.x < this.x + this.width; // Colisão horizontal (lado esquerdo do player)

        // Verifica colisão com a lateral esquerda da plataforma
        const collidingLeft = 
            player.x + player.width >= this.x && // Lado direito do player toca a lateral esquerda da plataforma
            player.x + player.width - player.speed <= this.x && // Evita atravessar pela lateral esquerda
            player.y + player.height > this.y && // Dentro da altura da plataforma
            player.y < this.y + this.height; // Dentro da altura da plataforma

        // Verifica colisão com a lateral direita da plataforma
        const collidingRight = 
            player.x <= this.x + this.width && // Lado esquerdo do player toca a lateral direita da plataforma
            player.x + player.speed >= this.x + this.width && // Evita atravessar pela lateral direita
            player.y + player.height > this.y && // Dentro da altura da plataforma
            player.y < this.y + this.height; // Dentro da altura da plataforma

        // Impede o player de atravessar a plataforma por baixo
        if (collidingBottom) {
            player.y = this.y + this.height; // Ajusta a posição do player para ficar abaixo da plataforma
            player.velocityY = 0; // Interrompe o movimento vertical
        }

        // Impede o player de atravessar a lateral esquerda
        if (collidingLeft) {
            player.x = this.x - player.width; // Ajusta a posição do player para ficar à esquerda da plataforma
        }

        // Impede o player de atravessar a lateral direita
        if (collidingRight) {
            player.x = this.x + this.width; // Ajusta a posição do player para ficar à direita da plataforma
        }

        return { collidingTop, collidingBottom, collidingLeft, collidingRight }; // Retorna os estados de colisão
    }
}

class Player {
    constructor(x, y, width, height, jumpSound) {
        this.x = x; // Posição X do player
        this.y = y; // Posição Y do player
        this.width = width; // Largura do player
        this.height = height; // Altura do player
        this.velocityY = 5; // Velocidade vertical inicial
        this.gravity = 1; // Gravidade aplicada ao player
        this.jumpStrength = -15; // Força do pulo
        this.isJumping = false; // Indica se o player está pulando
        this.speed = 5; // Velocidade horizontal do player
        this.lives = 5; // Número de vidas do player
        this.jumpSound = jumpSound; // Som de pulo
    }

    jump() {
        if (!this.isJumping) { // Verifica se o player pode pular
            this.velocityY = this.jumpStrength; // Aplica a força do pulo
            this.isJumping = true; // Define que o player está pulando
            if (this.jumpSound) {
                this.jumpSound.play(); // Toca o som de pulo
            }
        }
    }

    applyGravity(canvas) {
        this.y += this.velocityY; // Atualiza a posição vertical do player
        this.velocityY += this.gravity; // Aplica a gravidade

        if (this.y + this.height >= canvas.height) { // Verifica se o player tocou o chão
            this.isJumping = false; // Permite pular novamente
        }
    }

    move(keys) {
        if (keys['a']) this.x -= this.speed; // Move para a esquerda
        if (keys['d']) this.x += this.speed; // Move para a direita
        if (keys['w'] && !this.isJumping) {
            this.jump(); // Chama o método de pulo
        }
    }

    draw(context) {
        context.fillStyle = 'blue'; // Define a cor do player
        context.fillRect(this.x, this.y, this.width, this.height); // Desenha o player no canvas
    }
}

class Square {
    constructor(x, y, size, speed, platform) {
        this.x = x; // Posição X do quadrado
        this.y = y; // Posição Y do quadrado
        this.size = size; // Tamanho do quadrado
        this.speed = speed; // Velocidade de movimento
        this.direction = 1; // Direção inicial (1 = direita, -1 = esquerda)
        this.platform = platform; // Plataforma onde o quadrado está
    }

    move() {
        this.x += this.speed * this.direction; // Move o quadrado na direção atual

        // Verifica se o quadrado atingiu as bordas da plataforma
        if (this.x <= this.platform.x || this.x + this.size >= this.platform.x + this.platform.width) {
            this.direction *= -1; // Inverte a direção
        }
    }

    isColliding(player) {
        // Verifica colisão com o player
        return (
            player.x < this.x + this.size &&
            player.x + player.width > this.x &&
            player.y < this.y + this.size &&
            player.y + player.height > this.y
        );
    }

    draw(context) {
        context.fillStyle = 'black'; // Define a cor do quadrado
        context.fillRect(this.x, this.y, this.size, this.size); // Desenha o quadrado no canvas
    }
}

class Spike {
    constructor(x, y, base, height) {
        this.x = x; // Posição X do spike
        this.y = y; // Posição Y do spike
        this.base = base; // Largura da base do triângulo
        this.height = height; // Altura do triângulo
    }

    isColliding(player) {
        // Verifica colisão com o player (bounding box do triângulo)
        return (
            player.x < this.x + this.base &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }

    draw(context) {
        context.fillStyle = 'red'; // Define a cor do spike
        context.beginPath();
        context.moveTo(this.x, this.y + this.height); // Ponta inferior esquerda
        context.lineTo(this.x + this.base / 2, this.y); // Ponta superior
        context.lineTo(this.x + this.base, this.y + this.height); // Ponta inferior direita
        context.closePath();
        context.fill(); // Preenche o triângulo
    }
}

class Pusher {
    constructor(x, y, size, speed, platform) {
        this.x = x; // Posição X do pusher
        this.y = y; // Posição Y do pusher
        this.size = size; // Tamanho do quadrado
        this.speed = speed; // Velocidade de movimento
        this.direction = 1; // Direção inicial (1 = direita, -1 = esquerda)
        this.platform = platform; // Plataforma onde o pusher está
    }

    move(player) {
        // Verifica se o player está na mesma plataforma
        const playerOnPlatform =
            player.y + player.height >= this.platform.y &&
            player.y <= this.platform.y + this.platform.height &&
            player.x + player.width > this.platform.x &&
            player.x < this.platform.x + this.platform.width;

        if (playerOnPlatform) {
            // Move na direção do player
            if (player.x + player.width / 2 < this.x + this.size / 2) {
                this.direction = -1; // Vai para a esquerda
            } else {
                this.direction = 1; // Vai para a direita
            }
        } else {
            // Move de um lado ao outro da plataforma
            this.x += this.speed * this.direction;

            // Verifica se o pusher atingiu as bordas da plataforma
            if (this.x <= this.platform.x || this.x + this.size >= this.platform.x + this.platform.width) {
                this.direction *= -1; // Inverte a direção
            }
        }

        // Atualiza a posição com base na direção
        this.x += this.speed * this.direction;
    }

    isColliding(player) {
        // Verifica colisão com o player
        return (
            player.x < this.x + this.size &&
            player.x + player.width > this.x &&
            player.y < this.y + this.size &&
            player.y + player.height > this.y
        );
    }

    draw(context) {
        context.fillStyle = 'black'; // Define a cor do pusher
        context.fillRect(this.x, this.y, this.size, this.size); // Desenha o pusher no canvas
    }
}

class Star {
    constructor(x, y, size) {
        this.x = x; // Posição X da estrela
        this.y = y; // Posição Y da estrela
        this.size = size; // Tamanho da estrela
    }

    isColliding(player) {
        // Verifica colisão com o player (bounding box da estrela)
        return (
            player.x < this.x + this.size &&
            player.x + player.width > this.x &&
            player.y < this.y + this.size &&
            player.y + player.height > this.y
        );
    }

    draw(context) {
        context.save();
        context.fillStyle = 'crimson'; // Define a cor da estrela
        context.strokeStyle = 'black'; // Define a borda da estrela
        context.lineWidth = 2;

        // Desenha a estrela
        context.beginPath();
        const spikes = 5; // Número de pontas da estrela
        const outerRadius = this.size / 2; // Raio externo
        const innerRadius = this.size / 4; // Raio interno
        const centerX = this.x + this.size / 2; // Centro X
        const centerY = this.y + this.size / 2; // Centro Y

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius; // Alterna entre raio externo e interno
            const angle = (i * Math.PI) / spikes; // Calcula o ângulo
            const x = centerX + radius * Math.cos(angle); // Calcula a posição X
            const y = centerY + radius * Math.sin(angle); // Calcula a posição Y
            if (i === 0) {
                context.moveTo(x, y); // Move para o primeiro ponto
            } else {
                context.lineTo(x, y); // Desenha uma linha até o próximo ponto
            }
        }
        context.closePath();
        context.fill(); // Preenche a estrela
        context.stroke(); // Desenha a borda
        context.restore();
    }
}

class SpawnPoint {
    constructor(x, y) {
        this.x = x; // Posição X do ponto de renascimento
        this.y = y; // Posição Y do ponto de renascimento
        this.width = 30; // Largura do ponto de renascimento
        this.height = 5; // Altura do ponto de renascimento
        this.isActive = false; // Define se o ponto de renascimento foi ativado
    }

    isColliding(player) {
        // Verifica colisão com o player
        return (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }

    activate() {
        this.isActive = true; // Ativa o ponto de renascimento
    }

    reset() {
        this.isActive = false; // Reseta o ponto de renascimento
    }

    draw(context) {
        context.fillStyle = this.isActive ? 'blue' : 'green'; // Azul se ativo, verde se inativo
        context.fillRect(this.x, this.y, this.width, this.height); // Desenha o ponto de renascimento no canvas
    }
}

export { Platform, Player, Square, Spike, Pusher, Star, SpawnPoint }; // Exporta as classes para uso em outros arquivos