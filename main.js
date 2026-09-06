/// <reference types="p5/global" />
class Button {
    constructor(x, y, w, h, rad, strokeAmt, bodyCol, lineCol, message, blackText) {
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
    }
    
    show() {
        push();
        translate(this.x, this.y);
        fill(bodyCol);
        strokeWeight(strokeAmt);
        stroke(lineCol);
        rect(-this.w / 2, -this.h / 2, this.w, this.h, this.rad);
        if (this.blackText) {
            fill(0);
        } else {
            fill(255);
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
    startButton = new Button();
}

function draw() {
    background(50);
    if (state === "ready") {
        fill(0, 140, 200);
        rect(0, height / 2, width, height / 6, 70);
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
}