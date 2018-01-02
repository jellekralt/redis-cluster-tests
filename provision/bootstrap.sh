#!/usr/bin/env bash

# need make to build redis
sudo apt-get install -y git ruby make supervisor

curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo gem install redis -v 3.3.3