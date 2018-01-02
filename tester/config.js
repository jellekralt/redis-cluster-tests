module.exports = {
  cluster: [
    {
      port: 7000,
      host: '10.0.0.11'
    },
    {
      port: 7001,
      host: '10.0.0.11'
    },
    {
      port: 7002,
      host: '10.0.0.11'
    },
    {
      port: 7003,
      host: '10.0.0.12'
    },
    {
      port: 7004,
      host: '10.0.0.12'
    },
    {
      port: 7005,
      host: '10.0.0.12'
    }
  ],
  options: {
    enableReadyCheck: false,
    enableOfflineQueue: false,
    redisOptions: {
      password: 'foobarbaz'
    }
  }
}