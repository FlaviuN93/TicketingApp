module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 60000;
    return config;
  },
};
