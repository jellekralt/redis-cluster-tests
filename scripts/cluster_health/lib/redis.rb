require_relative './helpers'

class Redis
	def initialize(host, port)
		@host, @port = host, port
  end
  
  def run(cmd)
    return `/usr/local/bin/redis-cli -p #{@port} -a foobarbaz #{cmd}`;
  end

  def info()
    return Helpers.parse_info(run('INFO'))
  end

  def cluster_info()
    return Helpers.parse_info(run('CLUSTER INFO'))
  end

  def cluster_nodes() 
    return Helpers.parse_nodes(run('CLUSTER NODES'))
  end

  def node_cluster_info()
    return cluster_nodes().select { |node| node["flags"].include? "myself" }[0]
  end
end