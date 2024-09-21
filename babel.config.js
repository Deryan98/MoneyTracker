module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
        'react-native-reanimated/plugin', {
            relativeSourceLocation: true,
            loose: true
        },
    ],
    ['@babel/plugin-transform-private-methods', { loose: true }],
  ],
};
