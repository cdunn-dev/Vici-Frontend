/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

// Define our own escapeRegExp function instead of using the escape-string-regexp package
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// List of all modules for which we need to add the assets resolving functionality
const potentialModules = ['@react-navigation/elements', '@react-navigation/bottom-tabs'];

// Filter to only include modules that actually exist
const modules = potentialModules.filter(module => {
  const modulePath = path.join(workspaceRoot, 'node_modules', module);
  return fs.existsSync(modulePath);
});

module.exports = (async () => {
  const { 
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig(projectRoot);

  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      // Ensure we have all asset extensions (especially PNG)
      assetExts: [...assetExts.filter(ext => ext !== 'svg'), 'png', 'jpg', 'jpeg', 'gif'],
      sourceExts: [...sourceExts, 'svg'],
      
      // This is needed for React Navigation assets
      extraNodeModules: modules.length > 0 ? {
        // Re-export each module with assets mapping
        ...modules.reduce((acc, name) => {
          acc[name] = path.join(workspaceRoot, 'node_modules', name);
          return acc;
        }, {}),
      } : {},
      
      // --- Monorepo specific configurations ---
      nodeModulesPaths: [
        path.resolve(projectRoot, 'node_modules'),
        path.resolve(workspaceRoot, 'node_modules'),
      ],
      // --- This helps finding modules in a monorepo ---
      disableHierarchicalLookup: false,
      
      // Add blacklist functionality to exclude problematic packages
      blacklistRE: modules.length
        ? new RegExp(`^(${escapeRegExp(path.join(workspaceRoot, 'node_modules'))}\\/(?!${modules.join('|')}\\/).*|\\/node_modules\\/(?!${modules.join('|')})\\/.*)$`)
        : /$^/,
    },
    // --- Monorepo specific configurations ---
    watchFolders: [
      workspaceRoot,
      ...modules.map(m => path.join(workspaceRoot, 'node_modules', m)),
    ],
  };
})(); 