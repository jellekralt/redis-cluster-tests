
const { promisify } = require('util');
const chalk = require('chalk');
const assert = require('assert');
const exec = promisify(require('child_process').exec);
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

      cluster.on('error', (err) => { console.log(err); });
      // cluster.on('ready', () => { console.log(chalk`{magenta ℹ︎ Cluster ready}`) });
      
      spinner = test.spinner(`Waiting for Redis connection`);
      await cluster.waitUntilReady();
      spinner.stop(true);

      spinner = test.spinner(`Resetting Redis cluster to original state`);      
      await cluster.flushMasters();
      await cluster.forceMasters([7000,7001,7002]);
      await test.sleep(5000);
      spinner.stop(true);
    });

    // await test.afterEach(async () => {
    //   await test.sleep(5000, 'Waiting for network to come back up');
    //   cluster.quit();
    // });


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
    await test.case('Unhealthy cluster: Brutal DC loss', async () => {
      // Move the masters to the other DC
      await cluster.forceMasters([7003,7004,7005]);
      await test.sleep(5000, 'Waiting for masters to switch to dc 2');
      
      // Cut network link, and wait
      await network.cutLink(); 
      await test.sleep(20000, 'Waiting for network link to have been cut');

      // Check if healthy
      let isHealthy = await cluster.isHealthy();

      assert.ok(!isHealthy, 'Cluster nodes should be unhealthy');

      // Fix network link
      await network.fixLink();
    });


    // 
    //  RECOVERY CASES
    //


    // Testcase
    await test.case('Unhealthy cluster: Brutal DC loss, with recovery script', async () => {
      let spinner;

      // Move the masters to the other DC
      await cluster.forceMasters([7003,7004,7005]);
      await test.sleep(5000, 'Waiting for masters to switch to dc 2');
      
      // Cut network link, and wait
      await network.cutLink(); 
      await test.sleep(20000, 'Waiting for network link to have been cut');

      // Check if healthy
      let isHealthy = await cluster.isHealthy();

      assert.ok(!isHealthy, 'Cluster nodes should be unhealthy');

      // Simulate recovery script
      spinner = test.spinner(`Running recovery scripts`);
      await exec('/usr/bin/ruby /vagrant/scripts/cluster_health/main.rb 7000');
      await exec('/usr/bin/ruby /vagrant/scripts/cluster_health/main.rb 7001');
      await exec('/usr/bin/ruby /vagrant/scripts/cluster_health/main.rb 7002');
      spinner.stop();

      await test.sleep(10000, 'Waiting for health scrips to have any effect');

      // Reconnect, to force recognicion of new setup (seems to be an ioredis issue)
      await cluster.disconnect();
      await test.sleep(5000, 'Disconnecting cluster');

      spinner = test.spinner(`Connecting to cluster`);
      await cluster.connectAndWaitUntilReady();
      spinner.stop();
      
      spinner = test.spinner(`Writing some data`);
      await cluster.writeBatch(10);
      await test.sleep(5000);
      spinner.stop();
      
      isHealthy = await cluster.isHealthy();

      assert.ok(isHealthy, 'Cluster nodes should be healthy');
      
      // Fix network link
      await network.fixLink();
    });

  });

  process.exit();  
})();