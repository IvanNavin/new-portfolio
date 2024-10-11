#!/bin/sh

# function for recursive cleaning of directories
cleanup() {
  local dir="$1"

  # Clean the current directory
  echo "Cleaning up in $dir"
  rm -rf "$dir/node_modules" "$dir/yarn.lock" "$dir/yarn-error.log" "$dir/.turbo" "$dir/.next" "$dir/package-lock.json"

  # we recursively go through all subdirectories
  for subdir in "$dir"/*/; do
    if [ -d "$subdir" ]; then
      cleanup "$subdir"
    fi
  done
}

# Start cleaning from the root directory
cleanup "."

# Встановлення залежностей
yarn install
