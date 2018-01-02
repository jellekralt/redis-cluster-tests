const Redis = require('ioredis');
const uuidV4 = require('uuid/v4');
const randomstring = require('randomstring');
const { parseInfo, parseNodes } = require('./utils');

module.exports = class Cluster {
  constructor(nodes, options) {
    this.nodes = nodes;
    this.redis = new Redis.Cluster(nodes, options);
  }

  on(...args) {
    return this.redis.on(...args);
  }

  disconnect(...args) {
    return this.redis.disconnect(...args);
  }

  connect(...args) {
    return this.redis.connect(...args);
  }

  quit(...args) {
    return this.redis.quit(...args);
  }

  set(...args) { return this.redis.set(...args) }
  get(...args) { return this.redis.get(...args) }
  del(...args) { return this.redis.del(...args) }
  
  async writeBatch(count) { 
    return Promise.all([...Array(count).keys()].map(i => this.redis.set(`tester:${uuidV4()}`, randomstring.generate())));
  }

  async getKeyCount() {
    let masters = this.redis.nodes('master');

    return Promise.all(masters.map((node) => node.keys('*'))).then(keys => keys.reduce( (acc,arr) => [...acc, ...arr], []).length);
  }

  async flushMasters() {
    let masters = this.redis.nodes('master');

    return Promise.all(masters.map((node) => node.flushdb())).catch(() => {
      console.error('Something went wrong with flushing masters...');
    });
  }

  async forceMasters(ports) {
    let masters = this.redis.nodes('all');

    return Promise.all(masters.map(async (node) => {
      let info = parseInfo(await node.info());

      if (info.get('role') === 'slave' && ports.indexOf(parseInt(info.get('tcp_port'))) > -1) {    
        // Pulling my hairs out, don't know why multiple forces are necessary
        await node.cluster(['failover', 'takeover'])
      }
    })).catch((e) => {
      console.error('Something went wrong with forcing failover to masters...', e);
    });
  }

  async isHealthy() {
    let nodes = this.redis.nodes();

    let info = await Promise.all(nodes.map((node) => {
      return new Promise((resolve, reject) => {
        // Dirty fix to overcome CLUSTER INFO not timing out
        let timeout = setTimeout(() => {
          resolve('');
        }, 5000);

        node.cluster('INFO').then((info) => {
          clearTimeout(timeout);
          resolve(info);
        });
      });
    }));

    let clusterNodes = info
      .map(node => parseInfo(node))
      .filter(node => node.get('cluster_state'));
    let clusterFails = clusterNodes
      .some(node => node.get('cluster_state') !== 'ok');

    return clusterNodes.length > 0 && !clusterFails;
  }

  async getMaster() {
    return (await this.redis.nodes('master'))[1];

    // this.redis.getInfoFromNode(randomMaster, (err, info) => {
    //   console.log('info', info);
      
    // })

    // let nodes = parseNodes(await randomMaster.cluster('NODES'));
    // let master = nodes.filter(node => node.flags.indexOf('myself'))[0];
    // let slave = nodes.filter(node => node.master === master.id)[0];

    // console.log('randomMaster', await randomMaster.id());
    
    
    // console.log(master);
    // console.log(slave);
  }

  async waitUntilReady() {
    return new Promise((resolve, reject) => {
      this.redis.on('ready', resolve);
    });
  }

  async connectAndWaitUntilReady() {
    return new Promise((resolve, reject) => {
      this.redis.on('ready', resolve);

      this.redis.connect();
    });
  }
  
  getNodes() {
    return this.redis.nodes();
  }

  async getNodesInfo() {
    return Promise.all(this.redis.nodes()
      .map(async node => {
        let info = parseInfo(await node.info());
        let currentNode = parseNodes(await node.cluster('NODES')).filter(n => n.flags.indexOf('myself') > -1)[0];

        return { info, currentNode }
      })
    );
  }
}
