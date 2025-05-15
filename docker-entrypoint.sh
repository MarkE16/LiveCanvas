#!/usr/bin/env bash

# Array of available environments
Environments=(
	"development"
	"production"
)

print_environments() {
    echo "Available environments:"
    for env in "${Environments[@]}"; do
        echo "- $env"
    done
}

case $NODE_ENV in
development)
	echo "Running in development environment"
	exec pnpm run dev
	;;
production)
	echo "Running in production environment"
	exec pnpm run server:prod
	;;
*)
	echo "Invalid environment passed: $NODE_ENV. Rebuild the image with one of the available environments:" >&2
	print_environments >&2
	exit 1
	;;
esac
