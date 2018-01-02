const { exec } = require('child_process');

const PORTS = [7000,7001,7002,7003,7004,7005];

async function cutLink() {
  return Promise.all([
    iptables('-A INPUT -s 10.0.0.12 -j REJECT'),
    iptables('-A OUTPUT -d 10.0.0.12 -j REJECT')
  ]);
}

async function fixLink() {
  return Promise.all([
    iptables('-D INPUT -s 10.0.0.12 -j REJECT'),
    iptables('-D OUTPUT -d 10.0.0.12 -j REJECT')
  ]);
}

async function killNode(id) {
  let port = PORTS[id];
  return iptables(`-A INPUT -p tcp --destination-port ${port} -j DROP`);
}

async function fixNode(id) {
  let port = PORTS[id];
  return iptables(`-D INPUT -p tcp --destination-port ${port} -j DROP`);
}

async function start(id) {
  return service(`redis-${id}`, 'start');
}

async function startAll() {
  return Promise.all(PORTS.map(port => start(port)));
}

async function stop(id) {
  return service(`redis-${id}`, 'stop');
}

async function flush() {
  return Promise.all([
    iptables('-F'),
    iptables('-X')
  ]);
}

function iptables(rule) {
  return new Promise((resolve, reject) => {

    exec(`sudo iptables ${rule}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout);
    });
    
  });
}

function service(name, action) {
  return new Promise((resolve, reject) => {

    exec(`sudo supervisorctl ${action} ${name}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout);
    });
    
  });
}

module.exports = {
  cutLink,
  fixLink,
  killNode,
  flush,
  start,
  startAll,
  stop
}