/// <reference types="p5/global" />
class Button {
    constructor(x, y, w, h, rad, strokeAmt, bodyCol, lineCol, message, textHeight, blackText, boldText) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.rad = rad;
        this.strokeAmt = strokeAmt;
        this.bodyCol = bodyCol;
        this.lineCol = lineCol;
        this.message = message;
        this.textHeight = textHeight;
        this.blackText = blackText;
        this.boldText = boldText;
        this.activated = true;
    }
    
    show() {
        push();
        translate(this.x, this.y);
        fill(this.bodyCol);
        strokeWeight(this.strokeAmt);
        stroke(this.lineCol);
        rect(-this.w / 2, -this.h / 2, this.w, this.h, this.rad);
        if (this.blackText) {
            fill(0);
        } else {
            fill(255);
        }
        if (this.boldText) {
            textStyle(BOLD);
        } else {
            textStyle(NORMAL);
        }
        noStroke();
        textSize(this.textHeight);
        textAlign(CENTER, CENTER);
        text(this.message, 0, 5);
        pop();
    }

    isPressed() {
        return this.activated && mouseX > this.x - this.w / 2 && mouseX < this.x + this.w / 2 && mouseY > this.y - this.h / 2 && mouseY < this.y + this.h / 2;
    }
}

let state = "readyTimeZero";
let time = 0;
let laps = [];
let buttonCornerAnimTime = 1000;
let resetSlideAnimTime = 1000;
let buttonAnimTime = 160;
let buttonStroke = 12;
let startButton;
let pauseButton;
let resetButton;
let lapButton;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(1000);
    textFont("Varela Round");
    setButtons();
}

function draw() {
    background(30, 50, 55);
    if (state === "readyTimeZero") {
        buttonCornerAnimTime += deltaTime;
        resetSlideAnimTime += deltaTime;
        if (buttonCornerAnimTime < 160) {
            startButton.rad = buttonCornerAnimTime / 4 + 30;
        } else {
            startButton.rad = 70;
        }
        if (resetSlideAnimTime < 200) {
            resetButton.y = height * 38 / 48 - (height / 6 / 200 * resetSlideAnimTime) - buttonStroke;
            resetButton.show();
        } else {
            resetButton.y = height * 38 / 48 - buttonStroke;
        }
        drawTime(true);
        startButton.show();
    } else if (state === "readyTimeNonzero") {
        buttonCornerAnimTime += deltaTime;
        if (buttonCornerAnimTime < 160) {
            startButton.rad = buttonCornerAnimTime / 4 + 30;
        } else {
            startButton.rad = 70;
        }
        drawTime(true);
        resetButton.show();
        startButton.show();
    } else if (state === "timing") {
        time += deltaTime;
        buttonCornerAnimTime += deltaTime;
        resetSlideAnimTime += deltaTime;
        if (buttonCornerAnimTime < 160) {
            pauseButton.rad = 70 - buttonCornerAnimTime / 4;
        } else {
            pauseButton.rad = 30;
        }
        if (resetSlideAnimTime < 200) {
            resetButton.y = height * 30 / 48 + (height / 6 / 200 * resetSlideAnimTime) - buttonStroke;
        } else {
            resetButton.y = height * 38 / 48 - buttonStroke;
        }
        drawTime(false);
        lapButton.show();
        resetButton.show();
        pauseButton.show();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setButtons();
}

function mousePressed() {
    if (state === "readyTimeZero" && startButton.isPressed()) {
        state = "timing";
        buttonCornerAnimTime = 0;
        resetSlideAnimTime = 0;
    } else if (state === "readyTimeNonzero" && startButton.isPressed()) {
        state = "timing";
        buttonCornerAnimTime = 0;
    } else if (state === "timing" && pauseButton.isPressed()) {
        state = "readyTimeNonzero";
        buttonCornerAnimTime = 0;
    } else if (state === "timing" && resetButton.isPressed()) {
        time = 0;
        laps = [];
        state = "readyTimeZero";
        buttonCornerAnimTime = 0;
        resetSlideAnimTime = 0;
    } else if (state === "readyTimeNonzero" && resetButton.isPressed()) {
        time = 0;
        laps = [];
        state = "readyTimeZero";
        resetSlideAnimTime = 0;
    } else if (state === "timing" && lapButton.isPressed()) {
        laps.push(time);
    }
    return false;
}

function setButtons() {
    startButton = new Button(width / 2, height * 30 / 48 - buttonStroke, width - buttonStroke, height / 6, 70, buttonStroke, color(0, 140, 200), color(0, 120, 170), "Start", height / 10, false, true);
    pauseButton = new Button(width / 2, height * 30 / 48 - buttonStroke, width - buttonStroke, height / 6, 30, buttonStroke, color(255, 55, 90), color(200, 50, 88), "Stop", height / 10, false, true);
    resetButton = new Button(width / 2, height * 38 / 48 - buttonStroke, width - buttonStroke, height / 8, height / 16, buttonStroke, color(45, 75, 83), color(45, 75, 83), "Reset", height / 12, false, true);
    lapButton = new Button(width / 2, height * 45 / 48 - buttonStroke, width - buttonStroke, height / 8, height / 16, buttonStroke, color(45, 75, 83), color(45, 75, 83), "Lap", height / 12, false, true);
}

function drawTime(isUsingMilli) {
    push();
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(height / 12);
    textStyle(BOLD);
    let tempTime = time;
    let hour = floor(tempTime / 3600000);
    tempTime -= hour * 3600000;
    let min = floor(tempTime / 60000);
    tempTime -= min * 60000;
    let sec = floor(tempTime / 1000);
    tempTime -= sec * 1000;
    let dec = floor(tempTime / 100);
    tempTime -= dec * 100;
    let milli = floor(tempTime);
    let timeString;
    if (isUsingMilli) {
        timeString = `${hour}:${min}:${sec}.${dec}${milli}`;
    } else {
        timeString = `${hour}:${min}:${sec}.${dec}`;
    }
    text(timeString, width / 2, height / 8);
    pop();
}