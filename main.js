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
        fill(this.lineCol);
        rect(-this.w / 2, -this.h / 2, this.w, this.h, this.rad);
        fill(this.bodyCol);
        rect(
            -this.w / 2 + this.strokeAmt,
            -this.h / 2 + this.strokeAmt,
            this.w - 2 * this.strokeAmt,
            this.h - 2 * this.strokeAmt,
            this.rad - this.strokeAmt
        );
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
let defaultBgColor;
let timingBgColor;
let buttonColor;
let isScrolling = false;
let lapScrollOffset = 0;
let lapScrollVel = 0;
let lapScrollFrictionPerSec = 0.01;
let timeOnStartForMilli = 0;
let slideAnimTotalTime = 220;
let majorSwitchTotalTime = 300;
let majorSwitchAnimTime = 1000;
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
let buttonStop1;
let buttonStop2;
let buttonStop3;
let buttonTravel1;
let buttonTravel2;
let buttonTravel3;
let mainButtonBlueCorners;
let mainButtonRedCorners;
let mainTimerOpacity = 1;
let mainBlueColor;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(1000);
    textFont("Varela Round");
    textAlign(CENTER, CENTER);
    noStroke();
    defaultBgColor = color(30, 50, 55);
    timingBgColor = color(35, 60, 73);
    buttonColor = color(47, 75, 83);
    mainBlueColor = color(10, 175, 255);
    setButtons();
}

function draw() {
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
    if (state === "timing" || state === "readyTimeZero") {
        mainTimerOpacity += (1 - mainTimerOpacity) * 0.04;
    }
    if (state === "readyTimeZero") {
        majorSwitchAnimTime += deltaTime / overallTimeMultiplier;
        resetSlideAnimTime += deltaTime / overallTimeMultiplier;
        lapSlideAnimTime += deltaTime / overallTimeMultiplier;
        lapDisplaySlideAnimTime += deltaTime / overallTimeMultiplier;
        background(
            lerpColor(
                timingBgColor,
                defaultBgColor,
                majorSwitchAnimTime / (majorSwitchTotalTime * 2)
            )
        );
        if (lapDisplaySlideAnimTime < lapDisplaySlideTotalTime) {
            drawLaps();
        } else {
            laps = [0];
            lapScrollOffset = 0;
        }
        if (lapSlideAnimTime < slideAnimTotalTime) {
            lapButton.y = buttonStop3 - (buttonTravel3 / slideAnimTotalTime) * lapSlideAnimTime;
            lapButton.show();
        } else {
            lapButton.y = buttonStop1;
        }
        if (resetSlideAnimTime < (slideAnimTotalTime * buttonTravel1) / buttonTravel3) {
            resetButton.y =
                buttonStop2 -
                (((buttonStop1 / slideAnimTotalTime) * buttonTravel1) / buttonTravel3) *
                    resetSlideAnimTime;
            resetButton.show();
        } else {
            resetButton.y = buttonStop2;
        }
        drawTime();
        if (majorSwitchAnimTime < majorSwitchTotalTime) {
            startButton.rad =
                (majorSwitchAnimTime * (mainButtonBlueCorners - mainButtonRedCorners)) /
                    majorSwitchTotalTime +
                mainButtonRedCorners;
            pauseButton.rad =
                (majorSwitchAnimTime * (mainButtonBlueCorners - mainButtonRedCorners)) /
                    majorSwitchTotalTime +
                mainButtonRedCorners;
            pauseButton.show();
            push();
            drawingContext.beginPath();
            drawingContext.roundRect(
                startButton.x - startButton.w / 2,
                startButton.y - startButton.h / 2,
                startButton.w,
                startButton.h,
                startButton.rad
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
            let growthRate = maxDist / majorSwitchTotalTime;
            let growthAmt = growthRate * majorSwitchAnimTime;
            drawingContext.beginPath();
            drawingContext.arc(buttonSwitchPressX, buttonSwitchPressY, growthAmt, 0, PI * 2);
            drawingContext.clip();
            startButton.show();
            pop();
        } else {
            startButton.rad = mainButtonBlueCorners;
            pauseButton.rad = mainButtonBlueCorners;
            startButton.show();
        }
    } else if (state === "readyTimeNonzero") {
        majorSwitchAnimTime += deltaTime / overallTimeMultiplier;
        lapSlideAnimTime += deltaTime / overallTimeMultiplier;
        mainTimerOpacity = cos(majorSwitchAnimTime / 1000) / 2 + 0.5;
        background(
            lerpColor(
                timingBgColor,
                defaultBgColor,
                majorSwitchAnimTime / (majorSwitchTotalTime * 2)
            )
        );
        drawLaps();
        if (lapSlideAnimTime < (slideAnimTotalTime * buttonTravel2) / buttonTravel3) {
            lapButton.y =
                buttonStop3 -
                (buttonTravel2 / ((slideAnimTotalTime * buttonTravel2) / buttonTravel3)) *
                    lapSlideAnimTime;
            lapButton.show();
        } else {
            lapButton.y = buttonStop1;
        }
        drawTime();
        resetButton.show();
        if (majorSwitchAnimTime < majorSwitchTotalTime) {
            startButton.rad =
                (majorSwitchAnimTime * (mainButtonBlueCorners - mainButtonRedCorners)) /
                    majorSwitchTotalTime +
                mainButtonRedCorners;
            pauseButton.rad =
                (majorSwitchAnimTime * (mainButtonBlueCorners - mainButtonRedCorners)) /
                    majorSwitchTotalTime +
                mainButtonRedCorners;
            pauseButton.show();
            push();
            drawingContext.beginPath();
            drawingContext.roundRect(
                startButton.x - startButton.w / 2,
                startButton.y - startButton.h / 2,
                startButton.w,
                startButton.h,
                startButton.rad
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
            let growthRate = maxDist / majorSwitchTotalTime;
            let growthAmt = growthRate * majorSwitchAnimTime;
            drawingContext.beginPath();
            drawingContext.arc(buttonSwitchPressX, buttonSwitchPressY, growthAmt, 0, PI * 2);
            drawingContext.clip();
            startButton.show();
            pop();
        } else {
            startButton.rad = mainButtonBlueCorners;
            pauseButton.rad = mainButtonBlueCorners;
            startButton.show();
        }
    } else if (state === "timing") {
        time += deltaTime / overallTimeMultiplier;
        majorSwitchAnimTime += deltaTime / overallTimeMultiplier;
        resetSlideAnimTime += deltaTime / overallTimeMultiplier;
        lapSlideAnimTime += deltaTime / overallTimeMultiplier;
        background(
            lerpColor(
                defaultBgColor,
                timingBgColor,
                majorSwitchAnimTime / (majorSwitchTotalTime * 2)
            )
        );
        if (resetSlideAnimTime < slideAnimTotalTime) {
            if (resetSlideAnimTime > (slideAnimTotalTime * buttonTravel1) / buttonTravel3) {
                resetButton.y =
                    buttonStop1 +
                    (buttonTravel1 / ((slideAnimTotalTime * buttonTravel1) / buttonTravel3)) *
                        (resetSlideAnimTime - (slideAnimTotalTime * buttonTravel2) / buttonTravel3);
            } else {
                resetButton.y = buttonStop1;
            }
        } else {
            resetButton.y = buttonStop2;
        }
        if (lapSlideAnimTime < slideAnimTotalTime) {
            lapButton.y = buttonStop1 + (buttonTravel3 / slideAnimTotalTime) * lapSlideAnimTime;
        } else {
            lapButton.y = buttonStop3;
        }
        drawLaps();
        drawTime();
        lapButton.show();
        resetButton.show();
        if (majorSwitchAnimTime < majorSwitchTotalTime) {
            startButton.rad =
                mainButtonBlueCorners -
                (majorSwitchAnimTime * (mainButtonBlueCorners - mainButtonRedCorners)) /
                    majorSwitchTotalTime;
            pauseButton.rad =
                mainButtonBlueCorners -
                (majorSwitchAnimTime * (mainButtonBlueCorners - mainButtonRedCorners)) /
                    majorSwitchTotalTime;
            startButton.show();
            push();
            drawingContext.beginPath();
            drawingContext.roundRect(
                startButton.x - startButton.w / 2,
                startButton.y - startButton.h / 2,
                startButton.w,
                startButton.h,
                startButton.rad
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
            let growthRate = maxDist / majorSwitchTotalTime;
            let growthAmt = growthRate * majorSwitchAnimTime;
            drawingContext.beginPath();
            drawingContext.arc(buttonSwitchPressX, buttonSwitchPressY, growthAmt, 0, PI * 2);
            drawingContext.clip();
            pauseButton.show();
            pop();
        } else {
            startButton.rad = mainButtonRedCorners;
            pauseButton.rad = mainButtonRedCorners;
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
        majorSwitchAnimTime = 0;
        timeOnStartForMilli = 0;
        buttonSwitchPressX = mouseX;
        buttonSwitchPressY = mouseY;
        resetSlideAnimTime = 0;
        lapSlideAnimTime = 0;
    } else if (state === "readyTimeNonzero" && startButton.isPressed()) {
        state = "timing";
        majorSwitchAnimTime = 0;
        timeOnStartForMilli = time;
        buttonSwitchPressX = mouseX;
        buttonSwitchPressY = mouseY;
        lapSlideAnimTime = (slideAnimTotalTime * buttonTravel1) / buttonTravel3;
    } else if (state === "timing" && pauseButton.isPressed()) {
        state = "readyTimeNonzero";
        resetButton.y = buttonStop2;
        resetSlideAnimTime = slideAnimTotalTime;
        majorSwitchAnimTime = 0;
        buttonSwitchPressX = mouseX;
        buttonSwitchPressY = mouseY;
        lapSlideAnimTime = 0;
    } else if (state === "timing" && resetButton.isPressed()) {
        time = 0;
        lapScrollVel = 0;
        state = "readyTimeZero";
        majorSwitchAnimTime = 0;
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
        lapSlideAnimTime = slideAnimTotalTime;
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
    buttonStop1 = (height * 63) / 96;
    buttonStop2 = (height * 76) / 96;
    buttonStop3 = (height * 89) / 96;
    buttonTravel1 = buttonStop2 - buttonStop1;
    buttonTravel2 = buttonStop3 - buttonStop2;
    buttonTravel3 = buttonStop3 - buttonStop1;
    mainButtonBlueCorners = (height * 19) / 192;
    mainButtonRedCorners = height / 20;
    startButton = new Button(
        width / 2,
        (height * 119) / 192,
        width,
        (height * 19) / 96,
        mainButtonBlueCorners,
        buttonStroke,
        color(0, 140, 200),
        color(0, 120, 170),
        "Start",
        height / 8,
        false,
        true
    );
    pauseButton = new Button(
        width / 2,
        (height * 119) / 192,
        width,
        (height * 19) / 96,
        mainButtonRedCorners,
        buttonStroke,
        color(255, 55, 90),
        color(200, 50, 88),
        "Stop",
        height / 8,
        false,
        true
    );
    resetButton = new Button(
        width / 2,
        buttonStop2,
        width - height / 48,
        height / 8,
        height / 16,
        0,
        buttonColor,
        buttonColor,
        "Reset",
        height / 12,
        false,
        true
    );
    lapButton = new Button(
        width / 2,
        buttonStop3,
        width - height / 48,
        height / 8,
        height / 16,
        0,
        buttonColor,
        buttonColor,
        "Lap",
        height / 12,
        false,
        true
    );
}

function drawTime() {
    push();
    let tempTime = time;
    let min = floor(tempTime / 60000);
    tempTime -= min * 60000;
    let sec = floor(tempTime / 1000);
    tempTime -= sec * 1000;
    let dec = floor(tempTime / 100);
    tempTime -= dec * 100;
    let milli = floor(tempTime);
    let timeString;
    let milliString;
    textSize(height / 12);
    textStyle(BOLD);
    if (state !== "timing") {
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
        if (milli < 10) {
            milliString = `0${milli}`;
        } else {
            milliString = `${milli}`;
        }
        if (majorSwitchAnimTime < majorSwitchTotalTime / 2) {
            let xOffset = ((-height / 19) * majorSwitchAnimTime) / (majorSwitchTotalTime / 2);
            fill(red(mainBlueColor), green(mainBlueColor), blue(mainBlueColor), 255);
            text(timeString, width / 2 + xOffset, height / 8);
            fill(255, 255, 255, 255 * mainTimerOpacity);
            text(timeString, width / 2 + xOffset, height / 8);
            let alphaVal = (255 * majorSwitchAnimTime) / (majorSwitchTotalTime / 2);
            fill(red(mainBlueColor), green(mainBlueColor), blue(mainBlueColor), alphaVal);
            fill(255, 255, 255, alphaVal * mainTimerOpacity);
            text(milliString, width / 2 + height / 6.6, height / 8);
        } else {
            fill(red(mainBlueColor), green(mainBlueColor), blue(mainBlueColor), 255);
            text(timeString, width / 2 - height / 19, height / 8);
            text(milliString, width / 2 + height / 6.6, height / 8);
            fill(255, 255, 255, 255 * mainTimerOpacity);
            text(timeString, width / 2 - height / 19, height / 8);
            text(milliString, width / 2 + height / 6.6, height / 8);
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
        milli = floor(timeOnStartForMilli) % 100;
        if (milli < 10) {
            milliString = `0${milli}`;
        } else {
            milliString = `${milli}`;
        }
        if (majorSwitchAnimTime < majorSwitchTotalTime / 2) {
            let xOffset = ((height / 19) * majorSwitchAnimTime) / (majorSwitchTotalTime / 2);
            fill(
                red(mainBlueColor),
                green(mainBlueColor),
                blue(mainBlueColor),
                255 * mainTimerOpacity
            );
            text(timeString, width / 2 + xOffset - height / 19, height / 8);
            fill(255, 255, 255, 255 * mainTimerOpacity);
            text(timeString, width / 2 + xOffset - height / 19, height / 8);
            fill(128);
            if (min < 1) {
                text("00:", width / 2 - height / 7.05 + xOffset, height / 8);
            }
            textSize(height / 12);
            let alphaVal = 255 - (255 * majorSwitchAnimTime) / (majorSwitchTotalTime / 2);
            fill(red(mainBlueColor), green(mainBlueColor), blue(mainBlueColor), alphaVal);
            fill(255, 255, 255, alphaVal * mainTimerOpacity);
            text(milliString, width / 2 + height / 6.6, height / 8);
        } else {
            fill(red(mainBlueColor), green(mainBlueColor), blue(mainBlueColor), 255);
            text(timeString, width / 2, height / 8);
            fill(255, 255, 255, 255 * mainTimerOpacity);
            text(timeString, width / 2, height / 8);
            if (min < 1) {
                push();
                rectMode(CENTER);
                fill(
                    lerpColor(
                        defaultBgColor,
                        timingBgColor,
                        majorSwitchAnimTime / (majorSwitchTotalTime * 2)
                    )
                );
                rect(width / 2 - height / 11, height / 8.5, height / 8.08, height / 11.5);
                fill(128);
                text("00:", width / 2 - height / 11.22, height / 8);
                pop();
            }
        }
    }
    pop();
}

function drawLaps() {
    if (laps.length > 1) {
        let currBgColor;
        if (state === "timing") {
            currBgColor = lerpColor(
                defaultBgColor,
                timingBgColor,
                majorSwitchAnimTime / (majorSwitchTotalTime * 2)
            );
        } else {
            currBgColor = lerpColor(
                timingBgColor,
                defaultBgColor,
                majorSwitchAnimTime / (majorSwitchTotalTime * 2)
            );
        }
        topMaskingGradient = drawingContext.createLinearGradient(0, height / 6, 0, height / 5);
        topMaskingGradient.addColorStop(0, color(currBgColor).toString());
        topMaskingGradient.addColorStop(
            1,
            color(red(currBgColor), green(currBgColor), blue(currBgColor), 0).toString()
        );
        bottomMaskingGradient = drawingContext.createLinearGradient(
            0,
            (height * 7) / 15,
            0,
            height / 2
        );
        bottomMaskingGradient.addColorStop(
            0,
            color(red(currBgColor), green(currBgColor), blue(currBgColor), 0).toString()
        );
        bottomMaskingGradient.addColorStop(1, color(currBgColor).toString());
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
        fill(currBgColor);
        rect(0, 0, width, height / 6);
        rect(0, height / 2, width, height / 2);
        pop();
    }
}

function dist(x1, y1, x2, y2) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}
