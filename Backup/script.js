const canvas = document.querySelector("#board");

window.addEventListener("load", () => {
    const ctx = canvas.getContext("2d");
    // Get all colors
    let colors = document.getElementById("colors").querySelectorAll(".color");

    // Adding event listeners for all colors
    colors.forEach(color => {
        color.addEventListener("click", () => {
            ctx.strokeStyle = color.getAttribute("value");
        })
    })

    // Resizing
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Variables
    let painting = false;

    function startPos(e) {
        painting = true;
        draw(e);
    }

    function endPos() {
        painting = false;
        ctx.beginPath()
    }

    function draw(e) {
        if (!painting) return;

        ctx.lineWidth = 10;
        ctx.lineCap = "round";

        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
    }

    // EventListeners
    canvas.addEventListener("mousedown", startPos);
    canvas.addEventListener("mouseup", endPos);
    canvas.addEventListener("mousemove", draw);
})

// Resizing the canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})