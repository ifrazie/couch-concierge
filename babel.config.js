module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // @amazon-devices/react-native-w3cmedia requires the automatic JSX runtime,
  // otherwise it throws `ReferenceError: Property 'React' doesn't exist` at
  // runtime. See the Vega media player docs.
  plugins: [['@babel/plugin-transform-react-jsx', {runtime: 'automatic'}]],
};
