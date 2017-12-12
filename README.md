Redis Cluster Tests
=====================

*A collection of tests that run on an (emulated) multi-dc Redis cluster setup*

The cluster contains 6 Redis instances running with 3 master & 3 slaves, one slave for each master.
The cluster is split over two virtual machines to simulate a dual datacenter setup, for testing brutal DC loss, and split-brain.

## Tech
* Vagrant, to boot up and provision the VMs
* Redis (obviously)
* Node.js, for running the tests

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

## Running the tests

1. Access one of the two VMs: `vagrant ssh redis1`
1. Go to the tester folder: `cd /vagrant/tester`
1. Run the test cases: `node main.js`
