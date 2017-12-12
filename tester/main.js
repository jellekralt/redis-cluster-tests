
const chalk = require('chalk');
const assert = require('assert');
const Cluster = require('./src/cluster');
const network = require('./src/network');
const test = require('./src/test');
const utils = require('./src/utils');
const config = require('./config');

(async () => {

  await test.beforeAll(async () => {
    let spinner = test.spinner(`Flushing iptables`);
    await network.flush();
    spinner.stop(true);
    
    await network.startAll();
    await test.sleep(5000, 'Waiting for Redis services to boot');
  });

  await test.set(async () => {
    let cluster;

    await test.beforeEach(async () => {
      let spinner;

      cluster = new Cluster(config.cluster, config.options);

      spinner = test.spinner(`Waiting for Redis connection`);
      await cluster.waitUntilReady();
      spinner.stop(true);

      spinner = test.spinner(`Resetting Redis cluster to original state`);      
      await cluster.flushMasters();
      await cluster.forceMasters([7000,7001,7002]);
      await test.sleep(5000);
      spinner.stop(true);
    });

    await test.afterEach(async () => {
      cluster.quit();
    });


    // 
    //  HEALTHY CLUSTER CASES
    // 

    // Testcase
    await test.case('Healthy cluster', async () => {
      let writeCount = 50;
      let written = await cluster.writeBatch(writeCount);
      let keyCount = await cluster.getKeyCount();
      let isHealthy = await cluster.isHealthy();
      
      assert.equal(keyCount, writeCount, 'Amount of written keys should be found');
      assert.ok(isHealthy, 'Cluster nodes should be healthy');
    });

    // Testcase
    await test.case('Healthy cluster: Single master down', async () => {
      let writeCount = 10;
      let written = await cluster.writeBatch(writeCount);
    
      await test.sleep(5000, `Waiting until batch is synced to slaves`);

      await network.stop(7001);

      await test.sleep(60000, `Waiting until master is stopped`);
      // Write another batch to force failover detection (ioredis specific)
      await await cluster.writeBatch(writeCount);

      await test.sleep(5000);
      
      let keyCount = await cluster.getKeyCount();
      let isHealthy = await cluster.isHealthy();
      let nodes = cluster.getNodes();

      assert.equal(keyCount, writeCount * 2, 'Amount of written keys should be found');
      assert.equal(nodes.length, config.cluster.length - 1, 'Amount of nodes should be one less then usual');
      assert.ok(isHealthy, 'Cluster nodes should be healthy');

      await network.start(7001); 
    });


    // 
    //  UNHEALTHY CLUSTER CASES
    // 

    // Testcase
    await test.case('Unhealthy cluster: Split Brain with connectivity from outside', async () => {
      // Cut network link, and wait
      await network.cutLink(); 
      await test.sleep(5000, 'Waiting for network link to have been cut');

      // Check if healthy
      let isHealthy = await cluster.isHealthy();

      assert.ok(!isHealthy, 'Cluster nodes should be unhealthy');

      // Fix network link
      await network.fixLink();
    });

    // 
    //  DATA LOSS CASES
    // 

    // Testcase
    await test.case('Data loss: Split Brain with connectivity from outside', async () => {
      // Cut network link, and wait
      await network.cutLink(); 
      await test.sleep(5000, 'Waiting for network link to have been cut');
      await test.sleep(5000, 'Waiting for recovery script to promote slaves to master');
      
      // 
      
      await network.fixLink();
    });


  });

  process.exit();  
})();