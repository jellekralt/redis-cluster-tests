#!/usr/bin/env bash

source /vagrant/provision/redis_vars.sh

echo "======================================"
echo "INITIALIZING REDIS CLUSTER            "
echo "======================================"

sleep 2

redis_host_list=""

PASSWORD="foobarbaz"

for host in $REDIS_HOSTS
do
    redis_host_list="$redis_host_list $host"
done

echo "REDIS_HOSTS: $REDIS_HOSTS"
echo "REDIS HOST LIST: $redis_host_list"

yes "yes" | /usr/local/bin/redis-trib.rb create --password $PASSWORD --replicas 1 $redis_host_list
