#!/bin/bash

# Vici MVP iOS Simulator Testing Script
# This script automates UI testing across multiple iOS simulator devices

# Bold colors for output
BOLD="\033[1m"
RESET="\033[0m"
GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"

# Configuration
PROJECT_PATH="./ViciMVP.xcodeproj"
SCHEME="ViciMVP"
TEST_PLAN="ViciMVPTests"
DEVICES=(
  "iPhone 12" 
  "iPhone 14" 
  "iPhone 14 Pro Max" 
  "iPhone 15" 
  "iPhone 15 Pro"
)
IOS_VERSION="latest"
LOG_DIR="./test_logs"

# Create logs directory if it doesn't exist
mkdir -p $LOG_DIR

echo -e "${BOLD}Vici MVP iOS Simulator Testing${RESET}"
echo -e "Running tests on multiple iPhone simulators"
echo "----------------------------------------"

# Clean the project first
echo -e "${BOLD}Cleaning project...${RESET}"
xcodebuild clean -project "$PROJECT_PATH" -scheme "$SCHEME" | grep -v "note:" || true

# Track overall success
OVERALL_SUCCESS=true

# Test on each device
for DEVICE in "${DEVICES[@]}"; do
  echo -e "\n${BOLD}Testing on $DEVICE${RESET}"
  
  # Create log file name
  SAFE_DEVICE_NAME=$(echo "$DEVICE" | tr " " "_")
  LOG_FILE="$LOG_DIR/${SAFE_DEVICE_NAME}_test_log.txt"
  
  # Run the tests
  echo "Running tests... (detailed logs in $LOG_FILE)"
  
  # Use xcrun simctl to boot the simulator if not already running
  SIMULATOR_ID=$(xcrun simctl list | grep "$DEVICE" | grep -E '^\s*[A-F0-9-]+\s' | head -n 1 | sed -E 's/^\s*([A-F0-9-]+).*/\1/')
  
  if [ -z "$SIMULATOR_ID" ]; then
    echo -e "${YELLOW}Device $DEVICE not found. Creating simulator...${RESET}"
    SIMULATOR_ID=$(xcrun simctl create "$DEVICE" "com.apple.CoreSimulator.SimDeviceType.$SAFE_DEVICE_NAME" "com.apple.CoreSimulator.SimRuntime.iOS-$IOS_VERSION")
    if [ -z "$SIMULATOR_ID" ]; then
      echo -e "${RED}Failed to create simulator for $DEVICE. Skipping.${RESET}"
      OVERALL_SUCCESS=false
      continue
    fi
  fi
  
  # Boot the simulator
  echo "Booting simulator..."
  xcrun simctl boot "$SIMULATOR_ID" 2>/dev/null || true
  
  # Run tests
  xcodebuild test \
    -project "$PROJECT_PATH" \
    -scheme "$SCHEME" \
    -destination "platform=iOS Simulator,id=$SIMULATOR_ID" \
    -testPlan "$TEST_PLAN" > "$LOG_FILE" 2>&1
  
  # Check for test failure
  if grep -q "Test session exited with error" "$LOG_FILE" || grep -q "** TEST FAILED **" "$LOG_FILE"; then
    echo -e "${RED}✗ Tests failed on $DEVICE${RESET}"
    # Extract failure details
    grep -A 3 "failed with error" "$LOG_FILE" | head -n 4
    OVERALL_SUCCESS=false
  else
    echo -e "${GREEN}✓ Tests passed on $DEVICE${RESET}"
  fi
  
  # Shutdown the simulator to free resources
  echo "Shutting down simulator..."
  xcrun simctl shutdown "$SIMULATOR_ID" 2>/dev/null || true
done

echo -e "\n----------------------------------------"
if $OVERALL_SUCCESS; then
  echo -e "${GREEN}${BOLD}✓ All tests passed on all devices${RESET}"
  exit 0
else
  echo -e "${RED}${BOLD}✗ Tests failed on one or more devices${RESET}"
  echo -e "See logs in $LOG_DIR for details"
  exit 1
fi 