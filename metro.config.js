const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Metro configuration for Expo.
 * https://docs.expo.dev/guides/customizing-metro/
 */
const config = getDefaultConfig(__dirname);

// Reduce file crawling and watcher load by excluding the embedded Next.js app.
config.resolver.blockList = exclusionList([
	/web-app\/.*$/,
	/web-app\\.*$/,
]);

module.exports = config;
