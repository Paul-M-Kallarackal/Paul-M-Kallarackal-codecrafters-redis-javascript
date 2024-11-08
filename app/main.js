const net = require("net");
const fs = require("fs");
const server = net.createServer((connection) => {
  const Store = new Map()
  const arguments = process.argv;



  function hexToASCII(hex) {
    var ascii = "";
    for (var i = 0; i < hex.length; i += 2) {
      var part = hex.substring(i, i + 2);
      var ch = String.fromCharCode(parseInt(part, 16));
      ascii = ascii + ch;
    }
    return ascii;
  }

  const fileExists = fs.existsSync(arguments[3]+'/'+arguments[5]);
  if (fileExists) {
    const fileBuffer = fs.readFileSync(arguments[3]+'/'+arguments[5]).toString("hex");
    let stringData = fileBuffer.split('fb')[1]
    // hacky way to get the key and value
    const numberofKeyValuePairs = parseInt(stringData.substring(0, 2),16);
    stringData = stringData.substring(2, stringData.length).split('ff')[0];
    let start = 4;
    let end =6;
    for (let i = 0; i < numberofKeyValuePairs; i++) {
        const keyLength = parseInt(stringData.substring(start, end),16);
        start = end;
        end = end + (keyLength*2);
        const key = hexToASCII(stringData.substring(start, end));
        start = end;
        end = end + 2;
        const valueLength = parseInt(stringData.substring(start,end),16);
        start = end;
        end = end + (valueLength*2);
        const value = hexToASCII(stringData.substring(start, end));
        console.log(key, value);
        Store[key] = [value,null,null];
        start = end;
        end = end + 4;
    }
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
