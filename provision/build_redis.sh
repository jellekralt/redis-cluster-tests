#!/usr/bin/env bash

source /vagrant/provision/redis_vars.sh


# download, unpack and build redis
rm -rf $REDIS_BUILD_DIR
git clone --depth 1 -b 3.2.11 https://github.com/antirez/redis.git $REDIS_BUILD_DIR

pushd $REDIS_BUILD_DIR
make
sudo make install
cp /vagrant/redis/redis-trib.rb /usr/local/bin/redis-trib.rb
cp /vagrant/redis/redis.conf /etc/redis.conf

popd
