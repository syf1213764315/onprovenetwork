// actions/OrochiNetwork/index.js

const fs           = require('fs');
const path         = require('path');
const inquirer     = require('inquirer');
const colors       = require('colors');
const figlet       = require('figlet');
const clear        = require('console-clear');
const prompt       = require('prompt-sync')({ sigint: true });

const { getUserInfo, enableNode } = require('./scripts/apis.js');

const TOKENS_FILE  = path.join(__dirname, 'tokens.txt');
const PROXIES_FILE = path.join(__dirname, '..', '..', 'proxies.txt');

const readLines = (file) =>
  fs.existsSync(file)
    ? fs
        .readFileSync(file, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map((l) => l.trim())
    : [];

function readBearers() { return readLines(TOKENS_FILE); }
function readProxies() { return readLines(PROXIES_FILE); }

async function checkAccountPoints() {
  const tokens  = readBearers();
  const proxies = readProxies();

  for (let i = 0; i < tokens.length; i += 1) {
    const token  = tokens[i];
    const proxy  = proxies[i] || null;
    const reward = await getUserInfo(token, proxy);
    const points = reward.split('.')[0];
    console.log(
      `📊  Account ${i + 1} with Bearer [${token.slice(0, 10)}...] has currently ${points} ON`,
    );
  }
}

async function activateNodesOnce() {
  const tokens  = readBearers();
  const proxies = readProxies();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const proxy = proxies[i] || null;
    await enableNode(token, proxy);
    console.log(
      `🤖  Node Successfully Activated for Account with Bearer [${token.slice(
        0,
        10,
      )}...] - Please come back tomorrow to enable it again\n`,
    );
  }
}

async function activateNodes(daily) {
  await activateNodesOnce();
  if (daily) {
    console.log('⏰  Auto-execution scheduled in 24 h.\n');
    setTimeout(() => activateNodes(true), 86_400_000); // 24 h
  }
}

(async () => {
  clear();
  console.log(colors.green(figlet.textSync('OrochiNetwork')));

  const  action  = 'nodes';

  if (action === 'points') {
    await checkAccountPoints();
  } else if (action === 'nodes') {
    const answer = 'y';
    await activateNodes(answer === 'y');
  }
})();