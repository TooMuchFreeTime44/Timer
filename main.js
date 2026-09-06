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
        startButton.show();
        if (startButton.isPressed() && canPressButton) {
            canPressButton = false;
            state = "timing";
        }
    }
    if (state === "timing") {
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