const net = require("net");


// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  // Handles multiple connections due to event loop in Javascript
  // Already has an inbuilt event loop for concurrent connections
  // handling ECHO as RESP Bulk String format -> $<length>\r\n<data>\r\n
    connection.on("data", (data) => {
        if (data.toString().startsWith("ECHO")) {
            const echoMessage = data.toString().split(" ")[1];
            connection.write(`$${echoMessage.length}\r\n${echoMessage}\r\n`);
        }
        connection.write("+PONG\r\n")
    });
});

server.listen(6379, "127.0.0.1");
