const animation = {
    play: function(){
        if (setting.phase !== 'pause'){
            if (setting.tick > 0){
                background.rotate();
                background.draw();
                handleMove();
                ship.draw();
                drawPolygon(getContex(), ship.size.polygons, ship.position, ship.size.boundary);
                window.setTimeout(animation.play, setting.tick);
            }
        }
    },
    stop: function(){
        setting.tick = 0;
    }
}

const background = {
    color: {
        from: 0,
        to: 64,
        layer: 32,
        light: [ '#40ceff', '#ffefa0', '#effff1', '#403cff', '#ffffff' ]
    },
    stars: [
        {
            x: 0,
            y: 0,
            size: 1,
            light: 1
        }
    ],
    center: {
        x: 0,
        y: 0
    },
    base: {
        starRadius: 1
    },
    size: {
        initialize: function(){
            this.starRadius = background.base.starRadius * setting.scale;
            this.colorOffset = parseInt((background.color.to - background.color.from) / background.color.layer);
            this.gradientOffset = setting.size.boundary.height / background.color.layer;
            this.rotateAngle = Math.PI * 2 / setting.fps / 160;
            this.rotateCos = Math.cos(this.rotateAngle);
            this.rotateSin = Math.sin(this.rotateAngle);
        },
        starRadius: 1,
        colorOffset: 1,
        gradientOffset: 1,
        rotateAngle: 0,
        rotateCos: 0,
        rotateSin: 0

    },
    draw: function(){
        const ctx = getContex();
        // 畫黑影
        let bgCode = this.color.from;
        for (let i = 0; i < this.color.layer; i++){
            bgCode += this.size.colorOffset;
            ctx.fillStyle = `rgb(${bgCode},${bgCode},${bgCode})`;
            ctx.fillRect(0, this.size.gradientOffset * i, setting.size.boundary.width, this.size.gradientOffset + 1);
        }
        // 畫星星
        const pi2 = Math.PI * 2;
        for (const star of this.stars){
            ctx.fillStyle = this.color.light[star.light];
            ctx.beginPath();
            ctx.arc(star.x + background.center.x, star.y + background.center.y, star.size, 0, pi2);
            ctx.fill();
        }
    },
    initialize: function(){
        // 產生星星
        this.stars = [];
        const range = Math.max(setting.size.boundary.width, setting.size.boundary.height);
        for (let i = 0; i < 250; i++){
            // 小
            const radius =  Math.random() * range + setting.size.boundary.height / 4;
            const angle = 2 * Math.PI * Math.random();
            this.stars.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                size: 1,
                light: Math.floor(Math.random() * 5)
            });
        }
        for (let i = 0; i < 40; i++){
            // 中
            const radius =  Math.random() * range / 2 + setting.size.boundary.height / 2;
            const angle = 2 * Math.PI * Math.random();
            this.stars.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                size: 1.5,
                light: Math.floor(Math.random() * 5)
            });
        }
        for (let i = 0; i < 10; i++){
            // 大
            const radius =  Math.random() * range + setting.size.boundary.height / 4;
            const angle = 2 * Math.PI * Math.random();
            this.stars.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                size: 2,
                light: Math.floor(Math.random() * 5)
            });
        }
        this.center.x = setting.size.boundary.width * 2 / 3;
        this.center.y = setting.size.boundary.height * 4 / 3;
    },
    rotate: function(){
        for (const star of this.stars){
            let x = star.x;
            let y = star.y;

            star.x = x * this.size.rotateCos - y * this.size.rotateSin;
            star.y = x * this.size.rotateSin + y * this.size.rotateCos;
        }
    }
};

const setting = {
    fps: 60,
    tick: 0,
    phase: 'menu', //menu, play, pause, gameover
    isPortrait: false,
    scale: 1,
    base: {
        boundary :{
            width: 800,
            height: 600
        }
    },
    size: {
        initialize: function(){
            setOrientation();
            let small = 0, large = 0;
            if (window.innerWidth < window.innerHeight){
                small = window.innerWidth;
                large = window.innerHeight;
            }
            else{
                small = window.innerHeight;
                large = window.innerWidth;
            }
            //console.log(window.innerWidth, window.innerHeight, small, large);
            if (setting.isPortrait){
                setting.size.boundary.width = small;
                setting.size.boundary.height = large;
                const padding = small * 0.03;
                setting.size.boundary.width -= padding;
                setting.size.boundary.height -= padding;
                setting.scale = setting.size.boundary.height / setting.base.boundary.height;
            }
            else{
                setting.size.boundary.width = large;
                setting.size.boundary.height = small;
                const padding = small * 0.03;
                setting.size.boundary.width -= padding;
                setting.size.boundary.height -= padding;
                setting.scale = setting.size.boundary.width / setting.base.boundary.width;
            }
            // console.log(window.innerWidth, window.innerHeight);
            // setting.size.boundary.width = window.innerWidth;
            // setting.size.boundary.height = window.innerHeight;
            // const padding = Math.min(setting.size.boundary.width, setting.size.boundary.height) * 0.03;
            // setting.size.boundary.width -= padding;
            // setting.size.boundary.height -= padding;
            // setting.scale = setting.isPortrait ? (setting.size.boundary.height / setting.base.boundary.height)  : (setting.size.boundary.width / setting.base.boundary.width);

            //console.log(setting.size.boundary.width, setting.size.boundary.height);
            const canvas = document.getElementById('canvas');
            canvas.width = setting.size.boundary.width;
            canvas.height = setting.size.boundary.height;
            canvas.style.width = `${setting.size.boundary.width}px`;
            canvas.style.height = `${setting.size.boundary.height}px`;
        },
        boundary: {
            width: 1,
            height: 1
        }
    }
};

const ship = {
    position: {
        x: 0,
        y: 0
    },
    lives: 3,
    power: 10,
    speed: {
        move: 5,
        shoot: 10
    },
    base: {
        boundary: {
            // width: 40,
            // height: 30
            width: 160,
            height: 120
        },
        polygons: [
            {
                color: 'rgb(255, 204, 0)',
                points: [
                    [23, 94], [20, 81], [140, 81], [137, 94], [104, 101], [56, 101]
                ]
            },
            {
                color: 'rgb(222, 83, 44)',
                points: [
                    [80, 35], [138, 64], [152, 56], [151, 89], [134, 97], [134, 85], [106, 90], [106, 102], [80, 105], [54, 102], [54, 90], [26, 85], [26, 97], [22, 96], [9, 89], [8, 56], [22, 64]
                ]
            },
            {
                color: 'rgb(215, 215, 215)',
                points :[
                    [68, 1], [92, 1], [100, 65], [100, 102], [91, 120], [69, 120], [60, 102], [60, 65]
                ]
            },
            {
                color: 'rgb(215, 215, 215)',
                points: [
                    [1, 40], [8, 42], [12, 46], [13, 98], [4, 99], [1, 73]
                ]
            },
            {
                color: 'rgb(215, 215, 215)',
                points: [
                    [159, 40], [152, 42], [148, 46], [147, 98], [156, 99], [159, 73]
                ]
            },
            {
                color: 'rgb(74, 60, 85)',
                points: [
                    [68, 56], [92, 56], [94, 70], [66, 70]
                ]
            }
        ],
        scale: 0.25
    },
    size: {
        boundary: {
            width: 0,
            height: 0
        },
        polygons: [
            {
                color: '',
                points: [
                    [0, 0]
                ]
            }
        ]
    },
    draw: function(){
        const ctx = getContex();
        // 畫邊框
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(this.position.x - this.size.boundary.width / 2, this.position.y - this.size.boundary.height / 2, this.size.boundary.width, this.size.boundary.height);

    },
    initialize: function(){
        this.position.x = setting.size.boundary.width / 2;
        this.position.y = setting.size.boundary.height * 3 / 4;
        this.size.boundary.width = this.base.boundary.width * this.base.scale * setting.scale,
        this.size.boundary.height = this.base.boundary.height * this.base.scale * setting.scale
        this.size.polygons = [];
        for (const polygon of this.base.polygons){
            const data = {};
            data['color'] = polygon['color'];
            data['points'] = [];
            for (const point of polygon.points){
                data.points.push([point[0] / this.base.boundary.width * this.size.boundary.width, point[1] / this.base.boundary.height * this.size.boundary.height]);
            }
            this.size.polygons.push(data);
        }
    }
};

const score = {
    now: 0,
    top: 0,
    difficulty: 1
};

const explosion = {

};

const borders = [

];

const bullets = [

];

const stones = [

];

const items = [
    {
        type: 'speed',// speed, power, life,
        speed: 10
    }
];

const keyPressed = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    touch: false
};

const keyWeight = {
    KeyW: 0,
    KeyA: 0,
    KeyS: 0,
    KeyD: 0,
    touchX: 0,
    touchY: 0
};

window.addEventListener('load', initializeBody);

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} datas 
 * @param {*} center 
 * @param {*} boundary 
 */
function drawPolygon(ctx, datas, center, boundary){
    const offset = {
        x: center.x - boundary.width / 2,
        y: center.y - boundary.height / 2
    };
    for (const data of datas){
        ctx.fillStyle = data['color'];
        const points = data['points'];
        ctx.beginPath();
        ctx.moveTo(offset.x + points[0][0], offset.y + points[0][1]);
        for (let i = 1, n = points.length; i < n; i++){
            ctx.lineTo(offset.x + points[i][0], offset.y + points[i][1]);
        }
        ctx.lineTo(offset.x + points[0][0], offset.y + points[0][1]);
        ctx.fill();
    }
}

function getContex(){
    return document.getElementById('canvas').getContext('2d');
}

function handleMove(){
    try {
        let deltaX = 0, deltaY = 0;
        if (keyPressed['touch']){
            // 觸碰螢幕時 ship 向觸碰點移動
            deltaX = keyWeight['touchX'] - ship.position.x;
            deltaY = keyWeight['touchY'] - ship.position.y;
            const len = Math.floor(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
            // 避免離觸碰點太近時抖動，夠近時座標直接等於觸碰點
            if (len > ship.speed.move){
                ship.position.x += deltaX * ship.speed.move / len;
                ship.position.y += deltaY * ship.speed.move / len;
            }
            else{
                ship.position.x = keyWeight['touchX'];
                ship.position.y = keyWeight['touchY'];
            }
        }
        else{
            // 沒有觸碰螢幕就看有無按鍵盤
            const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
            for (let i = 0; i < 4; i++){
                const key = keys[i];
                if (keyPressed[key]){
                    // 有按且還按不夠，權重就增加
                    if (keyWeight[key] < 10){
                        keyWeight[key]++;
                    }
                }
                else {
                    // 沒按時看垂直方向有沒有按，垂直方向有按則這個方向權重減少，垂直方向也沒按就清空權重
                    if (keyPressed[(i + 1) % 4] || keyPressed[(i + 3) % 4]){
                        if (keyWeight[key] > 0){
                            keyWeight[key]--;
                        }
                    }
                    else{
                        keyWeight[key] = 0;
                    }
                }
            }
        
            deltaY -= keyWeight['KeyW'];
            deltaX -= keyWeight['KeyA'];
            deltaY += keyWeight['KeyS'];
            deltaX += keyWeight['KeyD'];
        
            if (deltaX != 0 || deltaY != 0){
                // 處理斜向走
                const len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                ship.position.x += (deltaX * ship.speed.move / len);
                ship.position.y += (deltaY * ship.speed.move / len);
            }
        }
        
        // 邊界處理
        const halfShipWidth = ship.size.boundary.width / 2, halfShipHeight = ship.size.boundary.height / 2;
        ship.position.x = Math.max(halfShipWidth, Math.min(ship.position.x, setting.size.boundary.width - halfShipWidth));
        ship.position.y = Math.max(halfShipHeight, Math.min(ship.position.y, setting.size.boundary.height - halfShipHeight));
    } catch (error) {
        alert(error);
    }
}

function initializeBody(){
    setting.tick = 1000 / setting.fps;
    resetCanvas();
    
    ship.initialize();

    animation.play();
    initializeEvent();
}

function initializeEvent(){
    document.addEventListener('keydown', pressDocument);
    document.addEventListener('keyup', liftDocument);
    window.addEventListener('resize', resetCanvas);

    const canvas = document.getElementById('canvas');
    canvas.addEventListener('touchmove', touchCanvas);
    canvas.addEventListener('touchstart', touchCanvas);
    canvas.addEventListener('touchend', liftCanvas);
   
}

function liftCanvas(){
    keyPressed['touch'] = false;
}

function liftDocument(event){
    const key = event.code;
    if (key in keyPressed && keyPressed[key]){
        keyPressed[key] = false;
    }
}

function pressDocument(event){
    const key = event.code;
    if (key in keyPressed && !keyPressed[key]){
        keyPressed[key] = true;
    }
    
    switch(key){
        case 'KeyP':
            setting.tick = 0;
            break;
    }
    
}

function setOrientation(){
    if (screen.orientation){
        setting.isPortrait = screen.orientation.type === 'portrait-primary' || screen.orientation.type === 'portrait-secondary';
    }
    // else if (window.orientation){
    //     setting.isPortrait = window.matchMedia('(orientation: portrait)').matches;
    //     //window.addEventListener('orientationchange', setting.size.initialize);
    // }
    else{
        setting.isPortrait = window.matchMedia('(orientation: portrait)').matches;
    }
}

function resetCanvas(){
    setting.size.initialize();
    background.size.initialize();
    background.initialize();
}

function touchCanvas(event){
    event.preventDefault();
    if (event.targetTouches){
        //const canvas = document.getElementById('canvas');
        const rect = document.getElementById('canvas').getBoundingClientRect();
        const touch = event.targetTouches[0];

        keyPressed['touch'] = true;
        keyWeight['touchX'] = touch.clientX - rect.left;
        keyWeight['touchY'] = touch.clientY - rect.top;
        //keyWeight['touchX'] = (touch.clientX - rect.left) * canvas.width / rect.width;
        //keyWeight['touchY'] = (touch.clientY - rect.top) * canvas.width / rect.width;
    }
}

