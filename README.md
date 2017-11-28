Redis Cluster in Vagrant
=====================

*Configures a redis cluster in vagrant, with multi-machine setup*

The cluster is 6 redis instances running with 3 master & 3 slaves, one slave for each master.
The cluster is split over two virtual machines to simulate a dual datacenter setup, for split-brain testing

It will allways run on the latest in the 3.0 branch of redis git repo (https://github.com/antirez/redis). To change this, change the git clone command inside `./build_redis.sh`.

When redis 3.0 will be stable and released this repo will update to use master branch.

## Setup
How to set up vagrant and start the cluster image.

1. Install [Vagrant](http://www.vagrantup.com/)
1. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
1. Clone this repo
1. Provision the virtual machine using Vagrant: `vagrant up`

You should now have 6 redis servers running locally. They are accessible from the host at:

* `127.0.0.1:7000`
* `127.0.0.1:7001`
* `127.0.0.1:7002`
* `127.0.0.1:7003`
* `127.0.0.1:7004`
* `127.0.0.1:7005`

Internally, the two VM's run in a private network, at:

* `10.0.0.11:7000`
* `10.0.0.11:7001`
* `10.0.0.11:7002`
* `10.0.0.12:7003`
* `10.0.0.12:7004`
* `10.0.0.12:7005`
