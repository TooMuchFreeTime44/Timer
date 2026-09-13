/// <reference types="p5/global" />
class Button {
    constructor(
        x,
        y,
        w,
        h,
        rad,
        strokeAmt,
        bodyCol,
        lineCol,
        message,
        textHeight,
        blackText,
        boldText
    ) {
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
        text(this.message, 0, 5);
        pop();
    }

    isPressed() {
        return (
            this.activated &&
            mouseX > this.x - this.w / 2 &&
            mouseX < this.x + this.w / 2 &&
            mouseY > this.y - this.h / 2 &&
            mouseY < this.y + this.h / 2
        );
    }
}

let state = "readyTimeZero";
let overallTimeMultiplier = 1;
let time = 0;
let laps = [0];
let isScrolling = false;
let lapScrollOffset = 0;
let lapScrollVel = 0;
let lapScrollFrictionPerSec = 0.01;
let slideAnimTotalTime = 220;
let buttonSwitchTotalTime = 300;
let buttonSwitchAnimTime = 1000;
let buttonSwitchPressX;
let buttonSwitchPressY;
let resetSlideAnimTime = 1000;
let lapSlideAnimTime = 1000;
let lapDisplaySlideAnimTime = 1000;
let lapDisplaySlideTotalTime = 450;
let lapsDisplayTimeDiff = 50;
let topMaskingGradient;
let bottomMaskingGradient;
let buttonStroke = 12;
let startButton;
let pauseButton;
let resetButton;
let lapButton;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(1000);
    textFont("Varela Round");
    textAlign(CENTER, CENTER);
    noStroke();
    setButtons();
    topMaskingGradient = drawingContext.createLinearGradient(0, height / 6, 0, height / 5);
    topMaskingGradient.addColorStop(0, color(30, 50, 55, 255).toString());
    topMaskingGradient.addColorStop(1, color(30, 50, 55, 0).toString());
    bottomMaskingGradient = drawingContext.createLinearGradient(
        0,
        (height * 7) / 15,
        0,
        height / 2
    );
    bottomMaskingGradient.addColorStop(0, color(30, 50, 55, 0).toString());
    bottomMaskingGradient.addColorStop(1, color(30, 50, 55, 255).toString());
}

function draw() {
    background(30, 50, 55);
    if (state === "timing" || state === "readyTimeNonzero") {
        let frictionThisFrame =
            lapScrollFrictionPerSec ** (deltaTime / overallTimeMultiplier / 1000);
        lapScrollVel *= frictionThisFrame;
        lapScrollOffset += lapScrollVel;
        let extraScrollMargin = height / 60;
        let maxScroll =
            (height * 4) / 15 - ((laps.length - 1) * height * 4) / 75 + extraScrollMargin;
        if (lapScrollOffset < maxScroll) {
            lapScrollOffset = maxScroll;
            lapScrollVel = 0;
        }
        if (lapScrollOffset > -extraScrollMargin * 1.5) {
            lapScrollOffset = -extraScrollMargin * 1.5;
            lapScrollVel = 0;
        }
    }
    if (state === "readyTimeZero") {
        buttonSwitchAnimTime += deltaTime / overallTimeMultiplier;
        resetSlideAnimTime += deltaTime / overallTimeMultiplier;
        lapSlideAnimTime += deltaTime / overallTimeMultiplier;
        lapDisplaySlideAnimTime += deltaTime / overallTimeMultiplier;
        if (resetSlideAnimTime < (slideAnimTotalTime * 8) / 15) {
            resetButton.y =
                (height * 38) / 48 -
                (height / 6 / ((slideAnimTotalTime * 8) / 15)) * resetSlideAnimTime -
                buttonStroke;
            resetButton.show();
        } else {
            resetButton.y = (height * 38) / 48 - buttonStroke;
        }
        if (lapSlideAnimTime < slideAnimTotalTime) {
            lapButton.y =
                (height * 45) / 48 -
                ((height * 15) / 48 / slideAnimTotalTime) * lapSlideAnimTime -
                buttonStroke;
            lapButton.show();
        } else {
            lapButton.y = (height * 30) / 48 - buttonStroke;
        }
        if (lapDisplaySlideAnimTime < lapDisplaySlideTotalTime) {
            drawLaps();
        } else {
            laps = [0];
            lapScrollOffset = 0;
        }
        drawTime(true);
        if (buttonSwitchAnimTime < buttonSwitchTotalTime) {
            startButton.rad = (buttonSwitchAnimTime * 40) / buttonSwitchTotalTime + 30;
            pauseButton.rad = (buttonSwitchAnimTime * 40) / buttonSwitchTotalTime + 30;
            pauseButton.show();
            push();
            drawingContext.beginPath();
            drawingContext.roundRect(
                startButton.x - startButton.w / 2 - buttonStroke / 2,
                startButton.y - startButton.h / 2 - buttonStroke / 2,
                startButton.w + buttonStroke,
                startButton.h + buttonStroke,
                startButton.rad + buttonStroke / 2
            );
            drawingContext.clip();
            let localX = buttonSwitchPressX - startButton.x + startButton.w / 2;
            let localY = buttonSwitchPressY - startButton.y + startButton.h / 2;
            let dist1 = dist(0, 0, localX, localY);
            let dist2 = dist(startButton.w, 0, localX, localY);
            let dist3 = dist(0, startButton.h, localX, localY);
            let dist4 = dist(startButton.w, startButton.h, localX, localY);
            let maxDist = dist1;
            if (dist2 > maxDist) maxDist = dist2;
            if (dist2 > maxDist) maxDist = dist3;
            if (dist4 > maxDist) maxDist = dist4;
            let growthRate = maxDist / buttonSwitchTotalTime;
            let growthAmt = growthRate * buttonSwitchAnimTime;
            drawingContext.beginPath();
            drawingContext.arc(buttonSwitchPressX, buttonSwitchPressY, growthAmt, 0, PI * 2);
            drawingContext.clip();
            startButton.show();
            pop();
        } else {
            startButton.rad = 70;
            pauseButton.rad = 70;
            startButton.show();
        }
    } else if (state === "readyTimeNonzero") {
        buttonSwitchAnimTime += deltaTime / overallTimeMultiplier;
        lapSlideAnimTime += deltaTime / overallTimeMultiplier;
        drawLaps();
        if (lapSlideAnimTime < (slideAnimTotalTime * 7) / 15) {
            lapButton.y =
                (height * 45) / 48 -
                ((height * 7) / 48 / ((slideAnimTotalTime * 7) / 15)) * lapSlideAnimTime -
                buttonStroke;
            lapButton.show();
        } else {
            lapButton.y = (height * 38) / 48 - buttonStroke;
        }
        drawTime(true);
        resetButton.show();
        if (buttonSwitchAnimTime < buttonSwitchTotalTime) {
            startButton.rad = (buttonSwitchAnimTime * 40) / buttonSwitchTotalTime + 30;
            pauseButton.rad = (buttonSwitchAnimTime * 40) / buttonSwitchTotalTime + 30;
            pauseButton.show();
            push();
            drawingContext.beginPath();
            drawingContext.roundRect(
                startButton.x - startButton.w / 2 - buttonStroke / 2,
                startButton.y - startButton.h / 2 - buttonStroke / 2,
                startButton.w + buttonStroke,
                startButton.h + buttonStroke,
                startButton.rad + buttonStroke / 2
            );
            drawingContext.clip();
            let localX = buttonSwitchPressX - startButton.x + startButton.w / 2;
            let localY = buttonSwitchPressY - startButton.y + startButton.h / 2;
            let dist1 = dist(0, 0, localX, localY);
            let dist2 = dist(startButton.w, 0, localX, localY);
            let dist3 = dist(0, startButton.h, localX, localY);
            let dist4 = dist(startButton.w, startButton.h, localX, localY);
            let maxDist = dist1;
            if (dist2 > maxDist) maxDist = dist2;
            if (dist2 > maxDist) maxDist = dist3;
            if (dist4 > maxDist) maxDist = dist4;
            let growthRate = maxDist / buttonSwitchTotalTime;
            let growthAmt = growthRate * buttonSwitchAnimTime;
            drawingContext.beginPath();
            drawingContext.arc(buttonSwitchPressX, buttonSwitchPressY, growthAmt, 0, PI * 2);
            drawingContext.clip();
            startButton.show();
            pop();
        } else {
            startButton.rad = 70;
            pauseButton.rad = 70;
            startButton.show();
        }
    } else if (state === "timing") {
        time += deltaTime / overallTimeMultiplier;
        buttonSwitchAnimTime += deltaTime / overallTimeMultiplier;
        resetSlideAnimTime += deltaTime / overallTimeMultiplier;
        lapSlideAnimTime += deltaTime / overallTimeMultiplier;
        if (resetSlideAnimTime < slideAnimTotalTime) {
            if (resetSlideAnimTime > (slideAnimTotalTime * 8) / 15) {
                resetButton.y =
                    (height * 30) / 48 +
                    (height / 6 / ((slideAnimTotalTime * 7) / 15)) *
                        (resetSlideAnimTime - (slideAnimTotalTime * 8) / 15) -
                    buttonStroke;
            } else {
                resetButton.y = (height * 30) / 48 - buttonStroke;
            }
        } else {
            resetButton.y = (height * 38) / 48 - buttonStroke;
        }
        if (lapSlideAnimTime < slideAnimTotalTime) {
            lapButton.y =
                (height * 30) / 48 +
                ((height * 15) / 48 / slideAnimTotalTime) * lapSlideAnimTime -
                buttonStroke;
        } else {
            lapButton.y = (height * 45) / 48 - buttonStroke;
        }
        drawLaps();
        drawTime(false);
        lapButton.show();
        resetButton.show();
        if (buttonSwitchAnimTime < buttonSwitchTotalTime) {
            startButton.rad = 70 - (buttonSwitchAnimTime * 40) / buttonSwitchTotalTime;
            pauseButton.rad = 70 - (buttonSwitchAnimTime * 40) / buttonSwitchTotalTime;
            startButton.show();
            push();
            drawingContext.beginPath();
            drawingContext.roundRect(
                startButton.x - startButton.w / 2 - buttonStroke / 2,
                startButton.y - startButton.h / 2 - buttonStroke / 2,
                startButton.w + buttonStroke,
                startButton.h + buttonStroke,
                startButton.rad + buttonStroke / 2
            );
            drawingContext.clip();
            let localX = buttonSwitchPressX - startButton.x + startButton.w / 2;
            let localY = buttonSwitchPressY - startButton.y + startButton.h / 2;
            let dist1 = dist(0, 0, localX, localY);
            let dist2 = dist(startButton.w, 0, localX, localY);
            let dist3 = dist(0, startButton.h, localX, localY);
            let dist4 = dist(startButton.w, startButton.h, localX, localY);
            let maxDist = dist1;
            if (dist2 > maxDist) maxDist = dist2;
            if (dist2 > maxDist) maxDist = dist3;
            if (dist4 > maxDist) maxDist = dist4;
            let growthRate = maxDist / buttonSwitchTotalTime;
            let growthAmt = growthRate * buttonSwitchAnimTime;
            drawingContext.beginPath();
            drawingContext.arc(buttonSwitchPressX, buttonSwitchPressY, growthAmt, 0, PI * 2);
            drawingContext.clip();
            pauseButton.show();
            pop();
        } else {
            startButton.rad = 30;
            pauseButton.rad = 30;
            pauseButton.show();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setButtons();
}

function touchStarted() {
    if (
        (state === "readyTimeNonzero" || state === "timing") &&
        mouseY > height / 5 &&
        mouseY < (height * 7) / 15
    ) {
        isScrolling = true;
    }
    if (state === "readyTimeZero" && startButton.isPressed()) {
        state = "timing";
        laps = [0];
        lapScrollOffset = 0;
        buttonSwitchAnimTime = 0;
        buttonSwitchPressX = mouseX;
        buttonSwitchPressY = mouseY;
        resetSlideAnimTime = 0;
        lapSlideAnimTime = 0;
    } else if (state === "readyTimeNonzero" && startButton.isPressed()) {
        state = "timing";
        buttonSwitchAnimTime = 0;
        buttonSwitchPressX = mouseX;
        buttonSwitchPressY = mouseY;
        lapSlideAnimTime = (slideAnimTotalTime * 8) / 15;
    } else if (state === "timing" && pauseButton.isPressed()) {
        state = "readyTimeNonzero";
        resetButton.y = (height * 38) / 48 - buttonStroke;
        resetSlideAnimTime = slideAnimTotalTime;
        buttonSwitchAnimTime = 0;
        buttonSwitchPressX = mouseX;
        buttonSwitchPressY = mouseY;
        lapSlideAnimTime = 0;
    } else if (state === "timing" && resetButton.isPressed()) {
        time = 0;
        lapScrollVel = 0;
        state = "readyTimeZero";
        buttonSwitchAnimTime = 0;
        buttonSwitchPressX = pauseButton.x;
        buttonSwitchPressY = pauseButton.y;
        resetSlideAnimTime = 0;
        lapSlideAnimTime = 0;
        lapDisplaySlideAnimTime = 0;
    } else if (state === "readyTimeNonzero" && resetButton.isPressed()) {
        time = 0;
        lapScrollVel = 0;
        state = "readyTimeZero";
        resetSlideAnimTime = 0;
        lapDisplaySlideAnimTime = 0;
    } else if (state === "timing" && lapButton.isPressed()) {
        laps.push(time);
    }
    return false;
}

function touchMoved() {
    if (isScrolling) {
        let deltaY = mouseY - pmouseY;
        lapScrollVel += (deltaY - lapScrollVel) / 2;
    }
}

function touchEnded() {
    isScrolling = false;
}

function setButtons() {
    startButton = new Button(
        width / 2,
        (height * 30) / 48 - buttonStroke,
        width - buttonStroke,
        height / 6,
        70,
        buttonStroke,
        color(0, 140, 200),
        color(0, 120, 170),
        "Start",
        height / 10,
        false,
        true
    );
    pauseButton = new Button(
        width / 2,
        (height * 30) / 48 - buttonStroke,
        width - buttonStroke,
        height / 6,
        30,
        buttonStroke,
        color(255, 55, 90),
        color(200, 50, 88),
        "Stop",
        height / 10,
        false,
        true
    );
    resetButton = new Button(
        width / 2,
        (height * 38) / 48 - buttonStroke,
        width - buttonStroke,
        height / 8,
        height / 16,
        buttonStroke,
        color(45, 75, 83),
        color(45, 75, 83),
        "Reset",
        height / 12,
        false,
        true
    );
    lapButton = new Button(
        width / 2,
        (height * 45) / 48 - buttonStroke,
        width - buttonStroke,
        height / 8,
        height / 16,
        buttonStroke,
        color(45, 75, 83),
        color(45, 75, 83),
        "Lap",
        height / 12,
        false,
        true
    );
}

function drawTime(isUsingMilli) {
    push();
    fill(255);
    textSize(height / 12);
    textStyle(BOLD);
    let tempTime = time;
    let min = floor(tempTime / 60000);
    tempTime -= min * 60000;
    let sec = floor(tempTime / 1000);
    tempTime -= sec * 1000;
    let dec = floor(tempTime / 100);
    tempTime -= dec * 100;
    let milli = floor(tempTime);
    let timeString;
    if (isUsingMilli) {
        if (sec < 10) {
            if (min < 10) {
                if (milli < 10) {
                    timeString = `0${min}:0${sec}.${dec}0${milli}`;
                } else {
                    timeString = `0${min}:0${sec}.${dec}${milli}`;
                }
            } else {
                if (milli < 10) {
                    timeString = `${min}:0${sec}.${dec}0${milli}`;
                } else {
                    timeString = `${min}:0${sec}.${dec}${milli}`;
                }
            }
        } else {
            if (min < 10) {
                if (milli < 10) {
                    timeString = `0${min}:${sec}.${dec}0${milli}`;
                } else {
                    timeString = `0${min}:${sec}.${dec}${milli}`;
                }
            } else {
                if (milli < 10) {
                    timeString = `${min}:${sec}.${dec}0${milli}`;
                } else {
                    timeString = `${min}:${sec}.${dec}${milli}`;
                }
            }
        }
    } else {
        if (sec < 10) {
            if (min < 10) {
                timeString = `0${min}:0${sec}.${dec}`;
            } else {
                timeString = `${min}:0${sec}.${dec}`;
            }
        } else {
            if (min < 10) {
                timeString = `0${min}:${sec}.${dec}`;
            } else {
                timeString = `${min}:${sec}.${dec}`;
            }
        }
    }
    text(timeString, width / 2, height / 8);
    pop();
}

function drawLaps() {
    if (laps.length > 1) {
        push();
        fill(255);
        textSize((height * 4) / 125);
        textStyle(BOLD);
        textAlign(LEFT, CENTER);
        push();
        translate(0, lapScrollOffset);
        if (state === "readyTimeZero") {
            for (let i = 1; i < laps.length; i++) {
                push();
                let y =
                    height / 5 +
                    ((i - 1) * height * 4) / 75 +
                    (height * 2) / 75 +
                    (height * 4) / 375;
                let lapDisplaySingleSlideTime = lapDisplaySlideTotalTime - lapsDisplayTimeDiff * 5;
                let screenY = -(y + lapScrollOffset - (height * 7) / 15) / height;
                let columnsFromBottom = (screenY * 75) / 4;
                let totalOffsetTime = columnsFromBottom * lapsDisplayTimeDiff;
                let localAnimTime = lapDisplaySlideAnimTime - totalOffsetTime;
                if (laps.length < 7) {
                    localAnimTime += (7 - laps.length) * lapsDisplayTimeDiff;
                }
                if (localAnimTime < 0) localAnimTime = 0;
                let slideAnimOffset = (width * localAnimTime) / lapDisplaySingleSlideTime;
                translate(slideAnimOffset, 0);
                let ii = laps.length - i;
                text(ii, (width * 3) / 32, y);
                let tempTime = laps[ii] - laps[ii - 1];
                let min = floor(tempTime / 60000);
                tempTime -= min * 60000;
                let sec = floor(tempTime / 1000);
                tempTime -= sec * 1000;
                let dec = floor(tempTime / 10);
                let timeString;
                if (min < 1) {
                    if (dec < 10) {
                        timeString = `${sec}.0${dec}`;
                    } else {
                        timeString = `${sec}.${dec}`;
                    }
                } else {
                    if (sec < 10) {
                        if (dec < 10) {
                            timeString = `${min}:0${sec}.0${dec}`;
                        } else {
                            timeString = `${min}:0${sec}.${dec}`;
                        }
                    } else {
                        if (dec < 10) {
                            timeString = `${min}:${sec}.0${dec}`;
                        } else {
                            timeString = `${min}:${sec}.${dec}`;
                        }
                    }
                }
                text(timeString, width / 4, y);
                tempTime = laps[ii];
                min = floor(tempTime / 60000);
                tempTime -= min * 60000;
                sec = floor(tempTime / 1000);
                tempTime -= sec * 1000;
                dec = floor(tempTime / 10);
                if (min < 1) {
                    if (dec < 10) {
                        timeString = `${sec}.0${dec}`;
                    } else {
                        timeString = `${sec}.${dec}`;
                    }
                } else {
                    if (sec < 10) {
                        if (dec < 10) {
                            timeString = `${min}:0${sec}.0${dec}`;
                        } else {
                            timeString = `${min}:0${sec}.${dec}`;
                        }
                    } else {
                        if (dec < 10) {
                            timeString = `${min}:${sec}.0${dec}`;
                        } else {
                            timeString = `${min}:${sec}.${dec}`;
                        }
                    }
                }
                text(timeString, (width * 5) / 8, y);
                pop();
            }
        } else {
            for (let i = 1; i < laps.length; i++) {
                let ii = laps.length - i;
                let y =
                    height / 5 +
                    ((i - 1) * height * 4) / 75 +
                    (height * 2) / 75 +
                    (height * 4) / 375;
                text(ii, (width * 3) / 32, y);
                let tempTime = laps[ii] - laps[ii - 1];
                let min = floor(tempTime / 60000);
                tempTime -= min * 60000;
                let sec = floor(tempTime / 1000);
                tempTime -= sec * 1000;
                let dec = floor(tempTime / 10);
                let timeString;
                if (min < 1) {
                    if (dec < 10) {
                        timeString = `${sec}.0${dec}`;
                    } else {
                        timeString = `${sec}.${dec}`;
                    }
                } else {
                    if (sec < 10) {
                        if (dec < 10) {
                            timeString = `${min}:0${sec}.0${dec}`;
                        } else {
                            timeString = `${min}:0${sec}.${dec}`;
                        }
                    } else {
                        if (dec < 10) {
                            timeString = `${min}:${sec}.0${dec}`;
                        } else {
                            timeString = `${min}:${sec}.${dec}`;
                        }
                    }
                }
                text(timeString, width / 4, y);
                tempTime = laps[ii];
                min = floor(tempTime / 60000);
                tempTime -= min * 60000;
                sec = floor(tempTime / 1000);
                tempTime -= sec * 1000;
                dec = floor(tempTime / 10);
                if (min < 1) {
                    if (dec < 10) {
                        timeString = `${sec}.0${dec}`;
                    } else {
                        timeString = `${sec}.${dec}`;
                    }
                } else {
                    if (sec < 10) {
                        if (dec < 10) {
                            timeString = `${min}:0${sec}.0${dec}`;
                        } else {
                            timeString = `${min}:0${sec}.${dec}`;
                        }
                    } else {
                        if (dec < 10) {
                            timeString = `${min}:${sec}.0${dec}`;
                        } else {
                            timeString = `${min}:${sec}.${dec}`;
                        }
                    }
                }
                text(timeString, (width * 5) / 8, y);
            }
        }
        pop();
        drawingContext.fillStyle = topMaskingGradient;
        rect(0, height / 6, width, height / 30);
        drawingContext.fillStyle = bottomMaskingGradient;
        rect(0, (height * 7) / 15, width, height / 30);
        fill(30, 50, 55);
        rect(0, 0, width, height / 6);
        rect(0, height / 2, width, height / 2);
        pop();
    }
}

function dist(x1, y1, x2, y2) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}
