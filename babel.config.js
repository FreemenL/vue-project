module.exports = {
  presets: [
    [
      env,
      {
        targets: {
          browsers: ['last 2 versions'],
        },
        modules: false,
        useBuiltIns: true,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk',
      },
    ],
  ],
};
