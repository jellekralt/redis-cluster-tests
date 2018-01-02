module Helpers
  def Helpers.parse_info(info)
    info = info
      .split("\r\n")
      .select do |row|
        !row.empty? && row.index('#').nil?
      end
  
    info = info.map do |row|
      row.split(":")
    end
    
    return Hash[info]
  end
  
  def Helpers.parse_nodes(nodes)
    nodes = nodes.split("\n")
  
    nodes = nodes.map do |node|
      Hash[['id', 'ip_port', 'flags', 'master', 'ping_sent', 'pong_recv', 'config_epoch', 'link_state', 'slots'].zip(node.split(' '))]
    end
    
    return nodes
  end
  
  def Helpers.redis_cmd(cmd)
   return `redis-cli -p #{$port} -a foobarbaz #{cmd}`;
  end
end