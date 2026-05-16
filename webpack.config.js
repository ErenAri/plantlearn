const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  if (!config.resolve) {
    config.resolve = {};
  }

  config.resolve.extensions = config.resolve.extensions || [];
  if (!config.resolve.extensions.includes('.wasm')) {
    config.resolve.extensions.push('.wasm');
  }

  config.module = config.module || {};
  config.module.rules = config.module.rules || [];

  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/resource',
  });

  config.experiments = config.experiments || {};
  config.experiments.asyncWebAssembly = true;
  config.experiments.syncWebAssembly = true;

  return config;
};