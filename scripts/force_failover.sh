#!/usr/bin/env bash

for i do
  echo "Forcing failover on port $i"
  redis-cli -p $i -a foobarbaz CLUSTER FAILOVER TAKEOVER
done