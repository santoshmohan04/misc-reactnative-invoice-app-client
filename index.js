/**
 * @format
 */
console.log('Index.js started');
// Use require here to be absolutely sure it runs before anything else
require('./src/polyfills');

const {AppRegistry} = require('react-native');
const {name: appName} = require('./app.json');

let App;
try {
  console.log('Loading App...');
  // We use require().default because App.js uses export default
  App = require('./App').default;
  console.log('App loaded');
} catch (e) {
  console.error('Failed to load App:', e);
  const React = require('react');
  const {View, Text, ScrollView} = require('react-native');
  App = () => (
    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20}}>
      <Text style={{color: 'red', fontSize: 20, fontWeight: 'bold'}}>Failed to load App</Text>
      <Text style={{color: 'black', marginTop: 10}}>{e.message}</Text>
      <Text style={{color: 'gray', marginTop: 10, fontSize: 12}}>{e.stack}</Text>
    </ScrollView>
  );
}

AppRegistry.registerComponent(appName, () => App);
