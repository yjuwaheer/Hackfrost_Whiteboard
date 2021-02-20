"use strict";

(function () {
    let socket = io();
    let canvas = document.getElementsByClassName("whiteboard")[0];
    let colors = document.getElementsByClassName("color");
    let slider = document.getElementById("slider");
    // Reset button
    let reset = document.getElementById("reset");
    let context = canvas.getContext("2d");

    let current = {
        color: "black",
        lineWidth: "5",
    };
    let drawing = false;

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    //Touch support for mobile devices
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    // Update line width value based on slider
    slider.addEventListener("mouseup", function () {
        current.lineWidth = this.value;
    });

    // // Export canvas as png
    let save = document.createElement("a");
    save.className = "save";
    save.innerHTML = "Save Board";
    save.addEventListener(
        "click",
        function (ev) {
            save.href = canvas.toDataURL();
            save.download = "board.png";
            save.preventDefault();
        },
        false
    );
    document.getElementById("save").appendChild(save);

    // Adding event listeners to each color button
    for (let i = 0; i < colors.length; i++) {
        colors[i].addEventListener("click", onColorUpdate, false);
    }

    socket.on("drawing", onDrawingEvent);

    window.addEventListener("resize", onResize, false);
    onResize();

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
        let w = canvas.width;
        let h = canvas.height;
        // console.log(data);
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
