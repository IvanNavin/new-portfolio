const path = require('path')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = '/'
      return webpackConfig
    },
    alias: {
      '@src': path.resolve(__dirname, 'src/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@pages': path.resolve(__dirname, 'src/pages/'),
      '@store': path.resolve(__dirname, 'src/store/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@src(.*)$': '<rootDir>/src$1',
        '^@components(.*)$': '<rootDir>/src/components$1',
        '^@pages(.*)$': '<rootDir>/src/pages$1',
        '^@store(.*)$': '<rootDir>/src/store$1',
        '^@utils(.*)$': '<rootDir>/src/utils$1',
      },
      clearMocks: true,
      coverageReporters: ['lcov', 'text-summary'],
      moduleFileExtensions: ['ts', 'tsx', 'js'],
    },
  },
}
