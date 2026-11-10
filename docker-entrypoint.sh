#!/bin/bash
set -euo pipefail

export BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-backend:8080}"
envsubst '${BACKEND_UPSTREAM}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

node_pid=''
nginx_pid=''
cleanup() {
    trap - EXIT INT TERM
    if [[ -n "$node_pid" ]]; then kill -TERM "$node_pid" 2>/dev/null || true; fi
    if [[ -n "$nginx_pid" ]]; then kill -TERM "$nginx_pid" 2>/dev/null || true; fi
    wait || true
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT

node dist/tech-blog/server/server.mjs &
node_pid=$!
nginx -g 'daemon off;' &
nginx_pid=$!

# Either process exiting makes this container unhealthy, even with exit code zero.
wait -n "$node_pid" "$nginx_pid" || exit $?
exit 1
