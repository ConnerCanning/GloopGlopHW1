window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

class GameEngine {
    constructor() {
        this.right = null;
        this.left = null;
        this.entities = [];
        this.ctx = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;
        this.mapHeight = null;
        this.left = false;
        this.right = false;
        this.up = false;
        this.attack = false;
        this.placeAngled = false;
        this.placeFlat = false;
        this.started = false;
        this.clockTick = 0;
    }
    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new Timer();
        //console.log(this.timer.gameTime);
        console.log('game initialized');
    }
    start() {
        console.log("starting game");
        var that = this;
        this.started = true;
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();
    }
    startInput() {
        var keyArr = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyF',
            'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'KeyR'];
        console.log('Starting input');
        var that = this;
        this.ctx.canvas.addEventListener("click", function (e) {
            if (!that.started) {
                that.start();
            }
        }, false);
        this.ctx.canvas.addEventListener("keydown", function (e) {
            if (e.code === keyArr[0] || e.code === keyArr[6])
                that.up = true;
            if (e.code === keyArr[1] || e.code === keyArr[7])
                that.left = true;
            /*if (e.code === keyArr[2] || e.code === keyArr[8])
                that.down = true;*/
            if (e.code === keyArr[3] || e.code === keyArr[9])
                that.right = true;
            if (e.code === keyArr[4])
                that.placeAngled = true;
            if (e.code === keyArr[5])
                that.placeFlat = true;
            if (e.code === keyArr[10])
                that.attack = true;

            e.preventDefault();
        }, false);

        this.ctx.canvas.addEventListener("keyup", function (e) {
            if (e.code === keyArr[0] || e.code === keyArr[6])
                that.up = false;
            if (e.code === keyArr[1] || e.code === keyArr[7])
                that.left = false;
            /*if (e.code === keyArr[2] || e.code === keyArr[8])
                that.down = false;*/
            if (e.code === keyArr[3] || e.code === keyArr[9])
                that.right = false;
            if (e.code === keyArr[4])
                that.placeAngled = false;
            if (e.code === keyArr[5])
                that.placeFlat = false;
            if (e.code === keyArr[10])
                that.attack = false;
            e.preventDefault();
        }, false);
        console.log('Input started');
    }
    addEntity(entity) {
        console.log('added entity');
        this.entities.push(entity);
        this.moveRight = null;
        this.moveLeft = null;
    }
    draw() {
        this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
        this.ctx.save();
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw();
        }
        this.ctx.restore();
    }
    update() {
        var entitiesCount = this.entities.length;
        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];
            if (!entity.removeFromWorld) {
                entity.update();
            }
        }
        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
        //console.log(this.timer.gameTime);
    }
    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
        this.up = false; // jump and placements only happen once
        this.attack = false;
        this.placeAngled = false;
        this.placeFlat = false;
    }
}

class Timer {
    constructor() {
        this.gameTime = 0;
        this.maxStep = 0.05;
        this.wallLastTimestamp = 0;
    }
    tick() {
        var wallCurrent = Date.now();
        var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
        this.wallLastTimestamp = wallCurrent;
        var gameDelta = Math.min(wallDelta, this.maxStep);
        this.gameTime += gameDelta;
        return gameDelta;
    }
}

class Entity {
    constructor(scope, game, x, y) { // pretty sure "scope" here should be refactored out, will do later
        this.game = game;
        this.x = x;
        this.y = y;
        this.removeFromWorld = false;
    }
    update() {
    }
    draw() {
        if (this.game.showOutlines && this.radius) {
            this.game.ctx.beginPath();
            this.game.ctx.strokeStyle = "green";
            this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.game.ctx.stroke();
            this.game.ctx.closePath();
        }
    }
    
    rotateAndCache(image, angle) {
        var offscreenCanvas = document.createElement('canvas');
        var size = Math.max(image.width, image.height);
        offscreenCanvas.width = size;
        offscreenCanvas.height = size;
        var offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.save();
        offscreenCtx.translate(size / 2, size / 2);
        offscreenCtx.rotate(angle);
        offscreenCtx.translate(0, 0);
        offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
        offscreenCtx.restore();
        //offscreenCtx.strokeStyle = "red";
        //offscreenCtx.strokeRect(0,0,size,size);
        return offscreenCanvas;
    }
}