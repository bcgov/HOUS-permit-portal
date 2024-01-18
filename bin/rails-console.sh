#!/bin/sh
# start_rails_console.sh

sh -c 'set -a; . /vault/secrets/secrets.env; set +a; RAILS_ENV=production bundle exec rails c'