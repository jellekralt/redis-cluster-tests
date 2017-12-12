#!/usr/bin/env bash

cd $(dirname $0)

declare -i current_step=1
declare PASSWORD="foobarbaz"

step () 
{
  current_step=$current_step+1

  if [ -n "$1" ]; then
    sleep $1;
  fi
}

log ()
{
  echo "> Step $current_step:  $1"
}

######################################################################################################

# SCRIPT START

log "PREPARE (re)instating connection between servers"
./fix_connection.sh

step 10

./force_failover.sh 7000 7001 7002

step 20

set_result=$(redis-cli -p 7000 -a $PASSWORD DEL fooz)
log "PREPARE Clearing fooz: $set_result"

step 5

# set_result=$(redis-cli -p 7000 -a $PASSWORD SET fooz aaaaaaaaaaaaaaaaaaaaaaaaaa)
# log "Written fooz: $set_result"

# step

# get_result=$(redis-cli -p 7000 -a $PASSWORD GET fooz)
# log "Read fooz=$get_result"

# step

log "Cutting connection between servers"
./cut_connection.sh

step 30

set_result=$(redis-cli -p 7000 -a $PASSWORD SET fooz aaaaaaaaaaaaaaaaaaaaaaaaaa)
log "Written fooz: $set_result"

step 30

log "Forcing failover on slaves"
./force_failover.sh 7003 7004 7005

step 30

get_result=$(redis-cli -p 7000 -a $PASSWORD GET fooz)
log "Read fooz=$get_result"

step 10

set_result=$(redis-cli -p 7000 -a $PASSWORD SET fooz bbbbbbbbbbbbbbbbbbbbbbbbbb)
log "Written fooz: $set_result"

step 10

get_result=$(redis-cli -p 7000 -a $PASSWORD GET fooz)
log "Read fooz=$get_result"

step 10 

get_result=$(redis-cli -p 7004 -a $PASSWORD GET fooz)
log "Read fooz=$get_result"

step 10

log "Bringing connection back between servers"
./fix_connection.sh

step 30

get_result=$(redis-cli -p 7000 -a $PASSWORD GET fooz)
log "Read fooz=$get_result"

step 30

get_result=$(redis-cli -p 7000 -a $PASSWORD GET fooz)
log "Read fooz=$get_result"

step 30

get_result=$(redis-cli -p 7000 -a $PASSWORD GET fooz)
log "Read fooz=$get_result"