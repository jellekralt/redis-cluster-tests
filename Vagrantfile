# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  port = 7000
  hosts = "10.0.0.11:7000 10.0.0.11:7001 10.0.0.11:7002 10.0.0.12:7003 10.0.0.12:7004 10.0.0.12:7005"

  (1..2).each do |i|
    config.vm.define "redis#{i}" do |redis|
      redis.vm.box = "ubuntu-trusty"
      redis.vm.box_url = "https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"
      redis.vm.network :private_network, ip: "10.0.0.1#{i}"
      redis.vm.hostname = "redis#{i}"

      vm_ports = ((0..2).map do |i| port + i end).join(' ')

      # install the redis server
      redis.vm.provision :shell, :path => "provision/bootstrap.sh"
      redis.vm.provision :shell, :path => "provision/build_redis.sh"
      redis.vm.provision :shell, :path => "provision/install_redis.sh", :env => {"PORTS" => vm_ports, "HOSTS" => hosts}
      
      if (i == 2) 
        redis.vm.provision :shell, :path => "provision/init_cluster.sh", :env => {"PORTS" => vm_ports, "HOSTS" => hosts}
      end
      
      redis.vm.provision :shell, :inline => "mkdir -p /vagrant/logs", :privileged => false
      redis.vm.provision :shell, :inline => "echo '' | crontab -", :privileged => false
      
      (1..3).each do |i|
        # redis.vm.provision :shell, :inline => "{ crontab -l; cat /vagrant/provision/crontab | envsubst; } | crontab -", :env => {"REDIS_PORT" => port}, :privileged => false
        redis.vm.network "forwarded_port", guest: port, host: port
        port = port + 1
      end

    end
  end
end
