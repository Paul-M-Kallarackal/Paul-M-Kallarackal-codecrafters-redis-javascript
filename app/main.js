const net = require("net");

const server = net.createServer((connection) => {
  // Handles multiple connections due to event loop in Javascript
  // Already has an inbuilt event loop for concurrent connections
  // handling ECHO as RESP Bulk String both input and output format, case insensitive -> $<length>\r\n<data>\r\n
  const Store = {}
  //Need to refactor the arguments
    connection.on("data", (data) => {
        const DataString = Decoder(data.toString())
        if(DataString[2].toUpperCase()==='PING'){
          connection.write("+PONG\r\n");
        }
        if(DataString[2].toUpperCase()==='ECHO'){
            connection.write(Encoder(DataString[4]));
        }
        if(DataString[2].toUpperCase()==='SET'){
            Store[DataString[4]] = DataString[6];
            connection.write(Encoder('OK'))
        }
        if(DataString[2].toUpperCase()==='GET'){
            connection.write(Encoder(Store[DataString[4]]));
        }
    });
});

const Encoder = (data) => {
    return `$${data.length}\r\n${data}\r\n`;
}

const Decoder = (data) => {
    return  data.split('\r\n')
}



server.listen(6379, "127.0.0.1");
