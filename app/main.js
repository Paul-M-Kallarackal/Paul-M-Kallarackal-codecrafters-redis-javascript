const net = require("net");


// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  // Handles multiple connections due to event loop in Javascript
    connection.on("data", (data) => {
        connection.write("+PONG\r\n")
    });
});

server.listen(6379, "127.0.0.1");
