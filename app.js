const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/join", (req, res) => {
    res.render("join");
});

app.get("/create", (req, res) => {
    res.render("create");
});

app.get("/trial", (req, res) => {
    io.on("connection", (socket) => {
        socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
    });
    res.render("board");
});

app.get("*", (req, res) => {
    res.render("404");
});

// app.get("/trial", function onConnection(socket) {
//     socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
// });

// io.on("connection", onConnection);

// io.on("connection", (socket) => {
//     socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
// });

http.listen(port, () => console.log("listening on port " + port));
