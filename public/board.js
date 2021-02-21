"use strict";

(function () {
    let socket = io();
    let canvas = document.getElementsByClassName("whiteboard")[0];
    let colors = document.getElementsByClassName("color");
    // Slider to change size
    let slider = document.getElementById("slider");
    let sliderText = document.getElementById("sliderText");
    // Eraser button
    let eraser = document.getElementById("eraser");
    // Reset button
    let reset = document.getElementById("reset");
    // FullScreen button
    let fullScreen = document.getElementById("fullScreen");
    // Canvas context
    let context = canvas.getContext("2d");

    let current = {
        color: "black",
        lineWidth: "5",
    };
    let drawing = false;
    let resetCanvas = false;
    let fullScreenMode = false;

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    //Touch support for mobile devices
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    // Adding event listeners to each color button
    for (let i = 0; i < colors.length; i++) {
        colors[i].addEventListener("click", onColorUpdate, false);
    }
    eraser.addEventListener("click", onColorUpdate, false); // Adding event listener for eraser

    // Update line width value based on slider
    slider.addEventListener("mouseup", function () {
        current.lineWidth = this.value;
        sliderText.innerText = this.value;
    });
    slider.addEventListener("mousemove", function () {
        sliderText.innerText = this.value;
    });

    // Export canvas as png
    let save = document.createElement("a");
    save.className = "save";
    save.innerHTML = "Save Board";
    save.addEventListener(
        "click",
        function () {
            save.href = canvas.toDataURL();
            save.download = "board.png";
            save.preventDefault();
        },
        false
    );
    document.getElementById("save").appendChild(save);

    // To reset the canvas to default
    reset.addEventListener("click", resetToBlank, false);

    // To open board in fullscreen mode
    fullScreen.addEventListener(
        "click",
        () => {
            if (!fullScreenMode) {
                fullScreenMode = true;
                document.documentElement.requestFullscreen();
                fullScreen.className = fullScreen.className.replace(
                    /\bfa-expand\b/g,
                    "fa-compress"
                );
            } else {
                fullScreenMode = false;
                document.exitFullscreen();
                document.cancelFullscreen();
                fullScreen.className = fullScreen.className.replace(
                    /\bfa-compress\b/g,
                    "fa-expand"
                );
            }
        },
        false
    );

    // Socket.io watching for drawing in canvas
    socket.on("drawing", onDrawingEvent);

    window.addEventListener("resize", onResize, false);
    onResize();

    function resetBlank() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        resetCanvas = false;
    }

    function resetToBlank() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        resetCanvas = true;

        socket.emit("drawing", {
            resetCanvas: resetCanvas,
        });
    }

    function drawLine(x0, y0, x1, y1, color, lineWidth, emit) {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.stroke();
        context.closePath();

        if (!emit) {
            return;
        }
        let w = canvas.width;
        let h = canvas.height;

        socket.emit("drawing", {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color,
            lineWidth: lineWidth,
        });
    }

    function onMouseDown(e) {
        drawing = true;
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    function onMouseUp(e) {
        if (!drawing) {
            return;
        }
        drawing = false;
        drawLine(
            current.x,
            current.y,
            e.clientX || e.touches[0].clientX,
            e.clientY || e.touches[0].clientY,
            current.color,
            current.lineWidth,
            true
        );
    }

    function onMouseMove(e) {
        if (!drawing) {
            return;
        }
        drawLine(
            current.x,
            current.y,
            e.clientX || e.touches[0].clientX,
            e.clientY || e.touches[0].clientY,
            current.color,
            current.lineWidth,
            true
        );
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    function onColorUpdate(e) {
        current.color = e.target.className.split(" ")[1];
    }

    // Limit the number of events per second
    function throttle(callback, delay) {
        let previousCall = new Date().getTime();
        return function () {
            let time = new Date().getTime();

            if (time - previousCall >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    function onDrawingEvent(data) {
        if (data.resetCanvas) {
            resetBlank();
            return;
        }

        let w = canvas.width;
        let h = canvas.height;

        drawLine(
            data.x0 * w,
            data.y0 * h,
            data.x1 * w,
            data.y1 * h,
            data.color,
            data.lineWidth
        );
    }

    // make the canvas fill its parent
    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
})();
