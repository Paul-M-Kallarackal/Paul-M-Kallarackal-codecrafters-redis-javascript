const { connect } = require("http2");
const net = require("net");

const server = net.createServer((connection) => {
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
            if(DataString[8]?.toUpperCase()==='PX'){
                Store[DataString[4]] = [DataString[6],Date.now(),DataString[10]];
            } else {
                Store[DataString[4]] = [DataString[6],"",""];
            }          
            connection.write(Encoder('OK'))
        }
        if(DataString[2].toUpperCase()==='GET'){
            if(Store[DataString[4]][1]){
                const timeDifference = (Date.now() - Store[DataString[4]][1])
                const setTime = Store[DataString[4]][2];
                const condition = timeDifference > setTime;
                const data =  condition?  null: Store[DataString[4]][0];
                data ? connection.write(Encoder(data)) : connection.write("$-1\r\n");
            } else {
                connection.write(Encoder(Store[DataString[4]][0]))
            }
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
