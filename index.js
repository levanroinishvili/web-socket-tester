import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import readline from 'node:readline';

/* Ask user for the TCP port */
const DEFAULT_PORT = 8080
const port = await prompt(`Select port: ${chalk.grey(8080)} `) || DEFAULT_PORT

const wss = new WebSocketServer({
    port,
    handleProtocols: protocols => { // Only called if has at least one element
        const ps = Array.from(protocols) // Must have at least one element
        const chosen = ps.at(-1)
        console.log(chalk.yellow(`Chose protocol "${chosen}" from`), ps.map(p => `"${p}"`).join(', '))
        return chosen
    },
});
console.log(chalk.green(`Listening on port`), port)

let connectedSockets = []

wss.on('connection', ws => {
    connectedSockets = [...connectedSockets, ws]
    console.log(chalk.green(`Connection on port ${port}`))
    ws.on('message', data => {
        console.log()
        console.log('Message:\n%s', chalk.yellow(data));
    });
    ws.onclose = () => {
        console.log(chalk.red(`Closed connection on port`), port)
        connectedSockets = connectedSockets.filter(w => w !== ws)
    }
});

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

reader.on('line', line => connectedSockets.forEach(socket => socket.send(line)))

/** Will ask a question to user on console and await for a single line or reply */
async function prompt(question) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(question, response => {
            rl.close()
            resolve(response)
        })
    })
}
