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
        return mouseIsPressed && mouseX > this.x - this.w / 2 && mouseX < this.x + this.w / 2 && mouseY > this.y - this.h / 2 && mouseY < this.y + this.h / 2;
    }
}

let state = "ready";
let time = 0;
let canPressButton = true;
let buttonStroke = 12;
let startButton;
let pauseButton;

function setup() {
    createCanvas(windowWidth, windowHeight);
    startButton = new Button(width / 2, height * 5 / 8, width - buttonStroke, height / 6, 70, buttonStroke, color(0, 140, 200), color(0, 120, 170), "Start", height / 10, false, true);
    pauseButton = new Button(width / 2, height * 5 / 8, width - buttonStroke, height / 6, 30, buttonStroke, color(255, 55, 90), color(200, 50, 88), "Stop", height / 10, false, true);
}

function draw() {
    background(30, 50, 55);
    if (state === "ready") {
        drawTime(true);
        startButton.show();
        if (startButton.isPressed() && canPressButton) {
            canPressButton = false;
            time = 0;
            state = "timing";
        }
    }
    if (state === "timing") {
        time += deltaTime;
        drawTime(false);
        pauseButton.show();
        if (pauseButton.isPressed() && canPressButton) {
            canPressButton = false;
            state = "ready";
        }
    }
    if (state === "waiting") {

    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    startButton = new Button(width / 2, height * 5 / 8, width - buttonStroke, height / 6, 70, buttonStroke, color(0, 140, 200), color(0, 120, 170), "Start", height / 10, false, true);
    pauseButton = new Button(width / 2, height * 5 / 8, width - buttonStroke, height / 6, 30, buttonStroke, color(255, 55, 90), color(200, 50, 88), "Stop", height / 10, false, true);
}

function mousePressed() {
    return false;
}

function mouseReleased() {
    canPressButton = true;
}

function drawTime(isUsingMilli) {
    push();
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(height / 6);
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
        if (hour > 0) {
            timeString = `${hour}:${min}:${sec}.${dec}${milli}`;
        } else if (min > 0) {
            timeString = `${min}:${sec}.${dec}${milli}`;
        } else {
            timeString = `${sec}.${dec}${milli}`;
        }
    } else {
        if (hour > 0) {
            timeString = `${hour}:${min}:${sec}.${dec}`;
        } else if (min > 0) {
            timeString = `${min}:${sec}.${dec}`;
        } else {
            timeString = `${sec}.${dec}`;
        }
    }
    text(timeString, width / 2, height * 13 / 48);
    pop();
}