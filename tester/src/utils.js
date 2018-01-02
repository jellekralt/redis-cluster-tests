const NODE_COLUMNS = ['id', 'ip_port', 'flags', 'master', 'ping_sent', 'pong_recv', 'config_epoch', 'link_state'];
const NODE_COLUMNS_OTHER = 'slot';

function parseInfo(info) {
  return new Map(
    info.split('\r\n')
        .filter(row => row.indexOf(':') > -1)
        .map(row => row.split(':'))
  );
}

function parseNodes(nodes) {
  return nodes.trim().split(/\r?\n/).map(row => row.trim().split(' ').reduce((obj, col, index) => {
    let key = NODE_COLUMNS[index] || NODE_COLUMNS_OTHER;
    obj[key] = col;
    return obj;
  }, {}));
}

function printBasicNodeInfo(nodes) {
  nodes.forEach(node => {
    console.log(`
- NODE INFO ---------------------------
address: ${node.currentNode.ip_port}
role: ${node.info.get('role')}
connected slaves: ${node.info.get('connected_slaves')}`)
  });
};

module.exports = {
  parseInfo,
  parseNodes,
  printBasicNodeInfo
}