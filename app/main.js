const net = require("net");
const fs = require("fs");
const server = net.createServer((connection) => {
  const Store = new Map()
  const arguments = process.argv;
  const fileExists = fs.existsSync(arguments[3]);
  if (fileExists) {
    console.log(arguments[3]+arguments[5]);
    const fileBuffer = fs.readFileSync(arguments[3]+'/'+arguments[5]);
    console.log('fileBuffer',fileBuffer);
  }
    
  //Need to refactor the arguments
    connection.on("data", (data) => {
        const commandList = Decoder(data.toString().toLowerCase());
        const command = commandList[2];
        switch(command){
            case 'ping': connection.write("+PONG\r\n"); break;
            case 'echo': connection.write(Encoder(commandList[4])); break;
            case 'set': 
                Store[commandList[4]] = [commandList[6],Date.now(),commandList[10]];
                connection.write(Encoder('OK'));
                break;
            case 'get':
                if(Store[commandList[4]][1]){
                    const timeDifference = (Date.now() - Store[commandList[4]][1])
                    const setTime = Store[commandList[4]][2];
                    const condition = timeDifference > setTime;
                    const data =  condition?  null: Store[commandList[4]][0];
                    connection.write(Encoder(data));
                    break;
                } else {
                    connection.write(Encoder(Store[commandList[4]][0]))
                    break;
                }
            case 'config':
                if(commandList[6]==='dir'){
                    connection.write(Encoder(['dir',process.argv[3]]));;   
                };
                if(commandList[6]==='dbfilename'){
                    connection.write(Encoder(['dbfilename',process.argv[5]]));;  
                }
            case 'keys':
                if(commandList[4]==='*'){
                    const keys = Object.keys(Store);
                    connection.write(Encoder(keys));
                }
        }
    });
});

const Encoder = (data) => {
    const dataType = Array.isArray(data) ? 'list' : typeof data ;
    switch(dataType){
        case 'string': return `$${data.length}\r\n${data}\r\n`; 
        case 'list': 
            let dataValues = '';
            data.forEach(element => {
                dataValues += `$${element.length}\r\n${element}\r\n`;
            });
            return `*${data.length}\r\n${dataValues}`;
        default:
            return `$-1\r\n`;
    }
}

const Decoder = (data) => {
    return  data.split('\r\n')
}



server.listen(6379, "127.0.0.1");
