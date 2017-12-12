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

  async forceMasters() {
    let masters = this.redis.nodes('all');

    return Promise.all(masters.map(async (node) => {
      let info = parseInfo(await node.info());

      if (info.get('role') === 'slave' && [7000,7001,7002].indexOf(parseInt(info.get('tcp_port'))) > -1) {    
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

    info = info.map(node => new Map(node.split('\r\n').map(row => row.split(':'))));
    
    let clusterFails = info.some((node) => { 
      return node.get('cluster_state') !== 'ok';
    });

    return !clusterFails;
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
  
  getNodes() {
    return this.redis.nodes();
  }
}
