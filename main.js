/// <reference types="p5/global" />
class Button {
    constructor(x, y, w, h, rad, strokeAmt, bodyCol, lineCol, message, blackText, boldText) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.rad = rad;
        this.strokeAmt = strokeAmt;
        this.bodyCol = bodyCol;
        this.lineCol = lineCol;
        this.message = message;
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
        textAlign(CENTER, CENTER);
        text(this.message, 0, 2);
        pop();
    }

    isPressed() {
        return mouseIsPressed && mouseX > this.x - this.w / 2 && mouseX < this.x + this.w / 2 && mouseY > this.y - this.h / 2 && mouseY < this.y + this.h / 2;
    }
}

let state = "ready";
let startButton;

function setup() {
    createCanvas(windowWidth, windowHeight);
    startButton = new Button(width / 2, height * 5 / 8, width, width, height / 6, 70, 8, color(0, 140, 200), color(0, 120, 170), "Start", false, true);
}

function draw() {
    background(50);
    if (state === "ready") {
        startButton.show();
        if (startButton.isPressed()) {
            state = "timing";
        }
    }
    if (state === "timing") {
        fill(255, 55, 90);
        rect(0, height / 2, width, height / 6, 30);
    }
    if (state === "waiting") {

    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    startButton = new Button(width / 2, height * 5 / 8, width, width, height / 6, 70, 8, color(0, 140, 200), color(0, 120, 170), "Start", false, true);
}