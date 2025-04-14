#!/bin/bash

# Cleanup script for removing duplicate iOS implementations
# This script removes the duplicate iOS implementations that are no longer needed
# after consolidating to the ViciMVP project

echo "Starting iOS implementation cleanup..."

# Create backup directory
BACKUP_DIR="./ios-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR
echo "Created backup directory: $BACKUP_DIR"

# Backup ViciNative implementation
echo "Backing up packages/vici-native/ios/ViciNative..."
mkdir -p $BACKUP_DIR/vici-native/ios
cp -R packages/vici-native/ios/ViciNative $BACKUP_DIR/vici-native/ios/

# Backup ViciApp implementation
echo "Backing up packages/vici-native/ios/ViciApp..."
cp -R packages/vici-native/ios/ViciApp $BACKUP_DIR/vici-native/ios/

# Backup mobile HelloWorld implementation
echo "Backing up packages/mobile/ios/HelloWorld..."
mkdir -p $BACKUP_DIR/mobile/ios
cp -R packages/mobile/ios/HelloWorld $BACKUP_DIR/mobile/ios/

# Backup mobile vicimobile implementation
echo "Backing up packages/mobile/ios/vicimobile..."
cp -R packages/mobile/ios/vicimobile $BACKUP_DIR/mobile/ios/

# Preserve any important files from ios directories
echo "Preserving important files..."
mkdir -p $BACKUP_DIR/important-files
cp packages/vici-native/ios/MockData.swift $BACKUP_DIR/important-files/ 2>/dev/null || :
cp packages/vici-native/ios/README.md $BACKUP_DIR/important-files/ 2>/dev/null || :

# Remove the duplicate implementations
echo "Removing duplicate implementations..."
rm -rf packages/vici-native/ios/ViciNative
rm -rf packages/vici-native/ios/ViciApp
rm -rf packages/mobile/ios/HelloWorld
rm -rf packages/mobile/ios/vicimobile

echo "Creating placeholder README files to document removed implementations..."

# Create placeholder in vici-native/ios
cat > packages/vici-native/ios/README.md << 'READMETEXT'
# Deprecated iOS Implementations

The iOS implementations that were previously in this directory have been consolidated 
into the primary ViciMVP project located at:

`packages/vici-native/ViciMVP/`

The following implementations were removed as part of the consolidation:
- ViciNative (removed)
- ViciApp (removed)

These implementations are backed up in the project's backup directory if needed.
READMETEXT

# Create placeholder in mobile/ios
mkdir -p packages/mobile/ios
cat > packages/mobile/ios/README.md << 'READMETEXT'
# Deprecated iOS Implementations

The iOS implementations that were previously in this directory have been consolidated 
into the primary ViciMVP project located at:

`packages/vici-native/ViciMVP/`

The following implementations were removed as part of the consolidation:
- HelloWorld (removed)
- vicimobile (removed)

These implementations are backed up in the project's backup directory if needed.
READMETEXT

echo "iOS cleanup completed successfully!"
echo "Backups are available at: $BACKUP_DIR" 