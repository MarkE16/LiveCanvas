#!/usr/bin/env bash

# Array of available environments
Environments=(
	"development"
	"production"
)

# Display available environments
usage() {
	echo "Run $0 in what environment?"
	for env in "${Environments[@]}"; do
		echo "  $env"
	done
}

# First check if there is already an environement passed
if [ -n "$NODE_ENV" ]; then
    env=$NODE_ENV
# $# represents the number of arguments passed to the script
elif [ ! $# -eq 1 ]; then
	usage
	exit 1
else
	env=$1
fi

# Check if the provided environment is valid
# >&2 redirects the output to stderr
# Where:
# > is the redirection operator
# &2 is the file descriptor channel for stderr
if [[ ! " ${Environments[*]} " =~ " ${env} " ]]; then
	echo "Invalid environment: $env" >&2
	usage
	exit 1
fi

case $env in
development)
	echo "Running in development environment"
	exec pnpm run dev
	;;
production)
	echo "Running in production environment"
	pnpm run build
	exec pnpm run server:prod
	;;
*)
	echo "Invalid environment: $env" >&2
	usage
	exit 1
	;;
esac
