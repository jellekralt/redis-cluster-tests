#!/usr/bin/ruby

require_relative 'lib/health_check'

$port = ARGV[0] || 6379

HealthCheck.run($port)










