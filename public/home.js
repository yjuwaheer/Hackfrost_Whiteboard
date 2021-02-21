var app = document.getElementById("usage");

var typewriter = new Typewriter(app, {
    loop: true,
    delay: 75,
});

typewriter
    .pauseFor(1000)
    .typeString("<strong>Draw</strong> <span>&#9997;</span>")
    .pauseFor(2000)
    .deleteChars(7)
    .typeString("<strong>Write</strong> <span>&#x1F4DD;</span>")
    .pauseFor(2000)
    .deleteChars(9)
    .typeString("<strong>Collaborate</strong> <span>&#x1F91D;</span>")
    .pauseFor(1000)
    .start();
