#!/bin/bash
set -e

export NODE_BINARY=$(command -v node)

# Monorepo path fix
WITH_ENVIRONMENT="../../../node_modules/react-native/scripts/xcode/with-environment.sh"
REACT_NATIVE_XCODE="../../../node_modules/react-native/scripts/react-native-xcode.sh"

if [ -f "$WITH_ENVIRONMENT" ]; then
  echo "Using React Native scripts from: $WITH_ENVIRONMENT"
  /bin/bash -c "$WITH_ENVIRONMENT $REACT_NATIVE_XCODE"
else
  echo "Error: React Native scripts not found at $WITH_ENVIRONMENT"
  exit 1
fi
