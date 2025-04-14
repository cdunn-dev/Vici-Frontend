#!/bin/bash

# Script to rename FixedFiles one by one and test the build
# This allows us to safely identify which files the project still depends on

PROJECT_DIR="/Users/chrisdunn/Documents/GitHub/Vici-App/packages/vici-native/ViciMVP_New"
FIXED_FILES_DIR="${PROJECT_DIR}/ViciMVP/FixedFiles"
BACKUP_DIR="${PROJECT_DIR}/FixedFiles_Backup"

# Make sure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Function to test the build
function test_build() {
  echo "Testing build..."
  xcodebuild -project "${PROJECT_DIR}/ViciMVP.xcodeproj" \
    -scheme ViciMVP \
    -configuration Debug \
    -destination "platform=iOS Simulator,id=F6D36FFB-9AB5-45C5-9200-7F18C13E9C1C" \
    clean build > /tmp/build_log.txt 2>&1
  
  local result=$?
  if [ $result -eq 0 ]; then
    echo "✅ Build successful"
    return 0
  else
    echo "❌ Build failed. Check /tmp/build_log.txt for details"
    return 1
  fi
}

# Function to rename a file and test build
function try_rename_file() {
  local file=$1
  local path="${FIXED_FILES_DIR}/${file}"
  
  if [ ! -f "${path}" ]; then
    echo "File ${path} doesn't exist, skipping"
    return 0
  fi
  
  echo "Renaming ${file} to ${file}.bak"
  mv "${path}" "${path}.bak"
  
  test_build
  local build_result=$?
  
  if [ $build_result -eq 0 ]; then
    echo "File ${file} can be safely removed"
    # Copy to backup but don't restore
    cp "${path}.bak" "${BACKUP_DIR}/${file}"
    # Remove the .bak file
    rm "${path}.bak"
    return 0
  else
    echo "File ${file} is still needed, restoring"
    # Restore the file
    mv "${path}.bak" "${path}"
    return 1
  fi
}

# Main script
echo "Starting fixed files removal test..."
echo "Testing initial build state..."
test_build

if [ $? -ne 0 ]; then
  echo "Initial build failed. Fix build issues before continuing."
  exit 1
fi

# Test each file one by one
for file in "ImportFix.swift" "ViciResponseModel.swift" "TrainingPlanView_Fixed.swift" "AuthenticationView_Fixed.swift" "AuthViewModel_Fixed.swift"; do
  echo "===== Testing removal of ${file} ====="
  try_rename_file "${file}"
  echo ""
done

echo "Process complete. Files that couldn't be removed are still in the FixedFiles directory."
echo "Backup copies of removed files are in ${BACKUP_DIR}" 