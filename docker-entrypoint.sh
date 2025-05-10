#!/usr/bin/env bash

# Array of available environments
Environments=(
	"dev"
	"prod"
)

# Display available environments
usage() {
	echo "Run $0 in what environment?"
	for env in "${Environments[@]}"; do
		echo "  $env"
	done
}

# $# represents the number of arguments passed to the script
if [ ! $# -eq 1 ]; then
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
dev)
	echo "Running in development environment"
	exec pnpm run dev
	;;
prod)
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
