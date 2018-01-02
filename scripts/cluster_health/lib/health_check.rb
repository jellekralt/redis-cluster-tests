require_relative 'log'
require_relative 'redis'

$current_step = 1

module HealthCheck
  def HealthCheck.run(port)

    logger = Logger.new()
    redis = Redis.new("localhost", $port)
    
    logger.log("-------------------------------------------------------------------")
    logger.log("> Starting Redis Node Health Script...")
    logger.log("")

    logger.step('Check if this node is a SLAVE')

    node_info = redis.info()
    cluster_info = redis.cluster_info()
    cluster_nodes = redis.cluster_nodes()
    node_cluster_info = redis.node_cluster_info()

    cluster_masters = cluster_nodes.select { |node| node["flags"].include? "master" }
    cluster_masters_fail = cluster_masters.select { |node| node["flags"].include? "fail" }

    node_role = node_info['role']
    cluster_state = cluster_info['cluster_state']

    logger.info("Role: #{node_role}")
    logger.info("Addr: #{node_cluster_info['ip_port']}")

    if node_role == 'slave'
      logger.step("Node is SLAVE, checking health of the cluster, according to node")

      if cluster_state != 'ok'
        logger.info("Cluster seems to be DOWN, from this nodes perspective")
        logger.info("Failing master count: #{cluster_masters_fail.length}")
        
        if cluster_masters_fail.length >= 2
          logger.info("Majority of masters is down, the cluster will not come back up again by itself")
          logger.step("Forcing current node to master")

          force_failover = redis.run('CLUSTER FAILOVER TAKEOVER')

          puts force_failover
        end

      else     
        logger.info("Cluster seems to be OK, from this nodes perspective, nothing to do")
      end
    else
      logger.info("Node is already master, nothing to do...")
    end

  end
end









