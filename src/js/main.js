class MainMenu {
    constructor() {
        this.createInitialScreen(); // Cria a tela inicial do menu
        this.currentPhase = null; // Armazena a fase atual (inicialmente nula)
    }

    createInitialScreen() {
        const initialScreen = document.createElement('div'); // Cria um contêiner para a tela inicial
        initialScreen.classList.add('initial-screen'); // Adiciona a classe CSS para estilização

        const title = document.createElement('h1'); // Cria o título do jogo
        title.innerText = '2D Platformer Game'; // Define o texto do título
        initialScreen.appendChild(title); // Adiciona o título ao contêiner da tela inicial

        const startButton = document.createElement('button'); // Cria o botão de iniciar o jogo
        startButton.id = 'startButton'; // Define o ID do botão
        startButton.innerText = 'Start Game'; // Define o texto do botão
        startButton.addEventListener('click', () => {
            initialScreen.style.display = 'none'; // Oculta a tela inicial
            this.showLevelSelection(); // Mostra a seleção de níveis
        });
        initialScreen.appendChild(startButton); // Adiciona o botão ao contêiner da tela inicial

        document.body.appendChild(initialScreen); // Adiciona a tela inicial ao corpo do documento
    }

    static loadPhase(phaseNumber) {
        const phasePath = `./phases/phase${phaseNumber}.js?t=${Date.now()}`; // Define o caminho do arquivo da fase com um timestamp para evitar cache
        import(phasePath) // Importa dinamicamente o módulo da fase
            .then((module) => {
                if (!module.default || typeof module.default.start !== 'function') {
                    throw new Error(`Phase ${phaseNumber} is not properly exported.`); // Lança um erro se a fase não estiver exportada corretamente
                }

                const canvas = document.getElementById('gameCanvas'); // Obtém o elemento canvas
                canvas.style.display = 'block'; // Exibe o canvas
                canvas.setAttribute('data-phase', phaseNumber); // Define o número da fase como atributo do canvas

                const context = canvas.getContext('2d'); // Obtém o contexto 2D do canvas
                const levelContainer = document.querySelector('.level-container'); // Obtém o contêiner de seleção de níveis
                if (levelContainer) levelContainer.style.display = 'none'; // Oculta o contêiner de seleção de níveis

                module.default.start(canvas, context); // Inicia a fase chamando a função `start` do módulo importado
            })
            .catch((error) => {
                console.error(`Error loading phase ${phaseNumber}:`, error); // Exibe um erro no console se a fase não puder ser carregada
                alert(`Phase ${phaseNumber} could not be loaded.`); // Mostra um alerta ao usuário
            });
    }

    showLevelSelection() {
        const canvas = document.getElementById('gameCanvas'); // Obtém o elemento canvas
        canvas.style.display = 'none'; // Oculta o canvas

        const levelContainer = document.createElement('div'); // Cria o contêiner para a seleção de níveis
        levelContainer.classList.add('level-container'); // Adiciona a classe CSS para estilização

        const titleSection = document.createElement('div'); // Cria uma seção para o título
        titleSection.classList.add('title-section'); // Adiciona a classe CSS para estilização

        const title = document.createElement('h2'); // Cria o título da seleção de níveis
        title.textContent = 'Select a Level:'; // Define o texto do título
        titleSection.appendChild(title); // Adiciona o título à seção

        const levelMenu = document.createElement('div'); // Cria o contêiner para os botões de níveis
        levelMenu.classList.add('level-menu'); // Adiciona a classe CSS para estilização

        for (let i = 1; i <= 15; i++) { // Cria 15 botões de níveis
            const levelButton = document.createElement('div'); // Cria um botão de nível
            levelButton.classList.add('level-button'); // Adiciona a classe CSS para estilização
            levelButton.textContent = i; // Define o número do nível como texto do botão

            levelButton.addEventListener('click', () => MainMenu.loadPhase(i)); // Adiciona um evento de clique para carregar a fase correspondente
            levelMenu.appendChild(levelButton); // Adiciona o botão ao contêiner de níveis
        }

        levelContainer.appendChild(titleSection); // Adiciona a seção de título ao contêiner de níveis
        levelContainer.appendChild(levelMenu); // Adiciona o menu de níveis ao contêiner de níveis
        document.body.appendChild(levelContainer); // Adiciona o contêiner de níveis ao corpo do documento
    }
}

window.onload = () => {
    new MainMenu(); // Inicializa o menu principal quando a página é carregada
};