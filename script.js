let nombre;
let puntaje;
let personaje=0;

function guardarJugador(nom, punt) {
    let jugadores = JSON.parse(localStorage.getItem("jugadores")) || [];

    // Buscar si el jugador ya existe
    let jugadorExistente = jugadores.find(j => j.nombre === nom);

    if (jugadorExistente) {
        // Si el puntaje es mayor, actualizamos
        if (punt > jugadorExistente.punt) {
            jugadorExistente.punt = punt;
        }
    } else {
        // Si no existe, lo agregamos
        jugadores.push({nom, punt});
    }

    // Guardar en localStorage
    localStorage.setItem("jugadores", JSON.stringify(jugadores));
}

function obtenerJugadores() {
    return JSON.parse(localStorage.getItem("jugadores")) || [];
}

class Menu extends Phaser.Scene{
    constructor(){
        super("menu-scene")
    }
    preload(){
        this.load.image('menuBackground', 'img/ImgHero.jpg'); // Fondo del menú
        this.load.image('playButton', 'assets/btn.png'); // Botón jugar
        this.load.image('controlsButton', 'assets/btn.png'); // Botón controles
        this.load.image('creditsButton', 'assets/btn.png'); // Botón créditos
        this.load.audio('backgroundMusic', 'Sounds/MusicaPrincipal.mp3'); // Carga el archivo de audio
    }
    create(){
        // Agregar fondo
        let background = this.add.image(400, 300, 'menuBackground');
        background.setScale(
            this.sys.game.config.width / background.width,
            this.sys.game.config.height / background.height

        );


        var music = this.sound.add('backgroundMusic');
        music.play({
            loop: true
        });

        // Botón de jugar
        this.add.image(400, 300, 'playButton')
            .setScale(0.15)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('PlayerSetupScene'));

        // Botón de controles
        this.add.image(400, 400, 'controlsButton')
            .setScale(0.15)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('ControlsScene'));

        // Botón de créditos
        this.add.image(400, 500, 'creditsButton')
            .setScale(0.15)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('CreditsScene'));
    }

    update(){        
    }
}
class PlayerSetupScene extends Phaser.Scene{
    constructor(){
        super("PlayerSetupScene")
        
    }
    preload(){
        
    }
    create(){
        let input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Escribe tu nombre";
        input.style.position = "absolute";
        input.style.top = "45%";
        input.style.left = "40%";
        input.style.transform = "translate(-50%, -50%)";
        input.style.padding = "10px";
        input.style.fontSize = "20px";
        
        // Agregar input dentro del div que contiene el canvas
        document.getElementById("canvas").appendChild(input);

        // Crear botón de confirmación
        let button = document.createElement("button");
        button.innerText = "Confirmar";
        button.style.position = "absolute";
        button.style.top = "calc(50% + 40px)";
        button.style.left = "40%";
        button.style.transform = "translateX(-50%)";
        button.style.padding = "10px";
        
        document.getElementById("canvas").appendChild(button);

        button.onclick = () => {
            nombre=input.value;
            guardarJugador(nombre, 0);
            mostrarMejoresPuntuaciones();
            console.log("Jugador:", input.value);
            input.remove();
            button.remove(); // Elimina los elementos después de usarlos
        };
    }

    update(){        
    }
}
class ControlsScene extends Phaser.Scene{
    constructor(){
        super("menu-control")
    }
    preload(){
        
    }
    create(){
   
    }

    update(){        
    }
}
class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.player = null;
        this.stars = null;
        this.bombs = null;
        this.platforms = null;
        this.cursors = null;
        this.score = 0;
        this.gameOver = false;
        this.scoreText = null;
        this.spaceBar = null;
        this.bullets = null;
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        //cambiar entre escenas provicional
        this.input.keyboard.on("keydown", (event) => {
            if (event.key >= "0" && event.key <= "9") {
                console.log("Presionaste el número: " + event.key);
                this.handleNumberPress(event.key);
            }
        });
        let levelWidth = this.sys.game.config.width * 4;
        // Fondo
        this.add.image(400, 300, 'sky');

        // Plataformas
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        // Jugador
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.01);
        this.player.setCollideWorldBounds(true);

        // Animaciones del jugador
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        //barra espaciadora
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // Estrellas
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // Bombas
        this.bombs = this.physics.add.group();

        //balas
        this.bullets = this.physics.add.group();
        this.canShoot = true; 
        this.shootTimer = this.time.addEvent({
            delay: 300, // Tiempo entre disparos (en milisegundos)
            callback: () => { this.canShoot = true; },
            callbackScope: this,
            loop: true
        });

        // Puntuación
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Colisiones
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        // Verificar si el jugador recoge una estrella
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);


         // Hacer que la camara siga al jugador
         this.cameras.main.startFollow(this.player);
         this.cameras.main.setBounds(0, 0, levelWidth, this.sys.game.config.height);

         // Asegurar que la cámara cubra todo el nivel
         this.cameras.main.setBounds(0, 0, levelWidth, this.sys.game.config.height);

         // Asegurar que el jugador pueda moverse dentro de los límites del mundo
         this.physics.world.setBounds(0, 0, levelWidth, this.sys.game.config.height);
         this.lastSpawnX = this.player.x; // Inicializar la última posición de spawn
    }

    update() {
        if (this.gameOver) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
        if(this.spaceBar.isDown&&this.canShoot==true){
            this.Shoot();
            this.canShoot=false;
        }
        
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(child => {
                child.enableBody(true, child.x, 0, true, true);
            });

            let x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            let bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
    }

    Shoot(){
            let bullet = this.bullets.create(this.player.x, this.player.y, 'bomb');
            bullet.setScale(0.5);
            bullet.body.allowGravity = false;

            // Determinar la dirección del disparo
            let direction = this.player.anims.currentAnim.key === 'left' ? -1 : 1;
            bullet.setVelocityX(400 * direction);
    }

    handleNumberPress(number) {
        switch (number) {
            case "1":
                this.scene.start("scene-game")
                break;
            case "2":
                this.scene.start("scene-game2")
                break;
            default:
                console.log("Número sin acción asignada.");
                break;
        }
    }
}
class GameScene2 extends Phaser.Scene {
    constructor() {
        super("scene-game2");
        this.player = null;
        this.stars = null;
        this.bombs = null;
        this.platforms = null;
        this.cursors = null;
        this.score = 0;
        this.gameOver = false;
        this.scoreText = null;
        this.spaceBar = null;
        this.bullets = null;
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        //cambiar entre escenas provicional
        this.input.keyboard.on("keydown", (event) => {
            if (event.key >= "0" && event.key <= "9") {
                console.log("Presionaste el número: " + event.key);
                this.handleNumberPress(event.key);
            }
        });
        // Fondo
        this.add.image(400, 300, 'sky');

        // Plataformas
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        // Jugador
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.01);
        this.player.setCollideWorldBounds(true);

        // Animaciones del jugador
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        //barra espaciadora
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // Estrellas
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // Bombas
        this.bombs = this.physics.add.group();

        //balas
        this.bullets = this.physics.add.group();
        this.canShoot = true; 
        this.shootTimer = this.time.addEvent({
            delay: 300, // Tiempo entre disparos (en milisegundos)
            callback: () => { this.canShoot = true; },
            callbackScope: this,
            loop: true
        });

        // Puntuación
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Colisiones
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        // Verificar si el jugador recoge una estrella
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    }

    update() {
        if (this.gameOver) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
        if(this.spaceBar.isDown&&this.canShoot==true){
            this.Shoot();
            this.canShoot=false;
        }




        this.bullets.children.iterate(bullet => {
            if (bullet.x > 800 || bullet.x < 0) {
                bullet.destroy();
            }
        });
        
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(child => {
                child.enableBody(true, child.x, 0, true, true);
            });

            let x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            let bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
    }

    Shoot(){
            let bullet = this.bullets.create(this.player.x, this.player.y, 'bomb');
            bullet.setScale(0.5);
            bullet.body.allowGravity = false;

            // Determinar la dirección del disparo
            let direction = this.player.anims.currentAnim.key === 'left' ? -1 : 1;
            bullet.setVelocityX(400 * direction);
    }
    handleNumberPress(number) {
        switch (number) {
            case "1":
                this.scene.start("scene-game")
                break;
            case "2":
                this.scene.start("scene-game2")
                break;
            default:
                console.log("Número sin acción asignada.");
                break;
        }
    }
}
class Boss extends Phaser.Scene {
    constructor() {
        super("scene-boss");
        this.player = null;
        this.stars = null;
        this.bombs = null;
        this.platforms = null;
        this.cursors = null;
        this.score = 0;
        this.gameOver = false;
        this.scoreText = null;
        this.spaceBar = null;
        this.bullets = null;
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        //cambiar entre escenas provicional
        this.input.keyboard.on("keydown", (event) => {
            if (event.key >= "0" && event.key <= "9") {
                console.log("Presionaste el número: " + event.key);
                this.handleNumberPress(event.key);
            }
        });
        // Fondo
        this.add.image(400, 300, 'sky');

        // Plataformas
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        // Jugador
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.01);
        this.player.setCollideWorldBounds(true);

        // Animaciones del jugador
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        //barra espaciadora
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // Estrellas
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // Bombas
        this.bombs = this.physics.add.group();

        //balas
        this.bullets = this.physics.add.group();
        this.canShoot = true; 
        this.shootTimer = this.time.addEvent({
            delay: 300, // Tiempo entre disparos (en milisegundos)
            callback: () => { this.canShoot = true; },
            callbackScope: this,
            loop: true
        });

        // Puntuación
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Colisiones
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        // Verificar si el jugador recoge una estrella
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    }

    update() {
        if (this.gameOver) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
        if(this.spaceBar.isDown&&this.canShoot==true){
            this.Shoot();
            this.canShoot=false;
        }




        this.bullets.children.iterate(bullet => {
            if (bullet.x > 800 || bullet.x < 0) {
                bullet.destroy();
            }
        });
        
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(child => {
                child.enableBody(true, child.x, 0, true, true);
            });

            let x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            let bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
    }

    Shoot(){
            let bullet = this.bullets.create(this.player.x, this.player.y, 'bomb');
            bullet.setScale(0.5);
            bullet.body.allowGravity = false;

            // Determinar la dirección del disparo
            let direction = this.player.anims.currentAnim.key === 'left' ? -1 : 1;
            bullet.setVelocityX(400 * direction);
    }
    handleNumberPress(number) {
        switch (number) {
            case "1":
                this.scene.start("scene-game")
                break;
            case "2":
                this.scene.start("scene-game2")
                break;
            default:
                console.log("Número sin acción asignada.");
                break;
        }
    }
}
const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent:'canvas',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [Menu,GameScene,GameScene2,PlayerSetupScene],
    
};

window.onload = () => {
    const game = new Phaser.Game(config);
};