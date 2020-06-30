const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const connectDB = require('./db/mongoose');
const {
    fillStations,
    updateStations,
    getDesiredAvailability
} = require('./services/station');




const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();
connectDB();

app.use(cors());
app.use(index);

const server = http.createServer(app);
const io = socketIo(server); // < Interesting!

async function init() {
    await fillStations();

    let interval = setInterval(async() => {
        await updateStations();
        io.sockets.emit('info', await getDesiredAvailability(-1));
    }, 60000);

    io.on("connection", async socket => {
        const socketId = socket.id;
        const clientIp = socket.request.connection.remoteAddress;

        socket.emit('info', await getDesiredAvailability(-1));
        console.log('New connection ' + socketId + ' from ' + clientIp);
        socket.on("disconnect", () => {
          console.log("Client disconnected");
        });
    });
}

init();

server.listen(port, () => console.log(`Listening on port ${port}`));



