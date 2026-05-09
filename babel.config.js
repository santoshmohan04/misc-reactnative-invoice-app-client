module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      [
        'module-resolver',
        {
          alias: {
            '^react-native$': 'react-native-web',
          },
        },
      ],
      'react-native-reanimated/plugin', // This must be last
    ],
  };
};
