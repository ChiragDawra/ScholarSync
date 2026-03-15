const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '../shared');

const config = getDefaultConfig(projectRoot);

// Watch the shared directory for changes
config.watchFolders = [sharedRoot];

// Allow importing from shared/
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(projectRoot, '..', 'node_modules'),
];

// Ensure shared code can resolve its dependencies through mobile's node_modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'firebase': path.resolve(projectRoot, 'node_modules/firebase'),
  'firebase/app': path.resolve(projectRoot, 'node_modules/firebase/app'),
  'firebase/auth': path.resolve(projectRoot, 'node_modules/firebase/auth'),
  'firebase/firestore': path.resolve(projectRoot, 'node_modules/firebase/firestore'),
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

module.exports = config;
