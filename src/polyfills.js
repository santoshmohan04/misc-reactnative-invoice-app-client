console.log('Polyfills starting...');
const RN = require('react-native');
const React = require('react');

const dummyValidator = () => null;
dummyValidator.isRequired = dummyValidator;

const propTypePolyfill = {
  style: dummyValidator,
};
Object.defineProperty(dummyValidator, 'style', { get: () => dummyValidator });

const defineProp = (name, value) => {
  try {
    Object.defineProperty(RN, name, {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: () => {},
    });
  } catch (e) {}
};

// Use Class components for dummy components to be safer with React 18
class DummyComponent extends React.Component {
  render() {
    return this.props.children || null;
  }
}

// 1. Picker polyfills
const DummyPicker = class extends React.Component {
  static Item = class extends React.Component { render() { return null; } };
  render() { return null; }
};
defineProp('Picker', DummyPicker);
defineProp('PickerIOS', DummyPicker);
global.Picker = DummyPicker;
global.PickerIOS = DummyPicker;

// 2. Date/Time Picker polyfills
const dummyPickerAPI = { open: () => Promise.reject() };
defineProp('DatePickerAndroid', dummyPickerAPI);
defineProp('TimePickerAndroid', dummyPickerAPI);

// 3. PropType polyfills
[
  'ViewPropTypes',
  'TextPropTypes',
  'ImagePropTypes',
  'ColorPropType',
  'EdgeInsetsPropType',
  'PointPropType',
].forEach(key => {
  defineProp(key, key.includes('PropTypes') ? propTypePolyfill : dummyValidator);
});

// 4. Component patch
const patchComponent = (name) => {
  try {
    const Comp = RN[name];
    if (Comp && !Comp.propTypes) {
      Comp.propTypes = propTypePolyfill;
    }
  } catch (e) {}
};

['View', 'Text', 'TextInput', 'Image', 'ScrollView', 'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'FlatList', 'SectionList'].forEach(patchComponent);

// 5. Linking polyfill
if (RN.Linking) {
    try {
        if (!RN.Linking.removeEventListener) {
            RN.Linking.removeEventListener = (type, handler) => {};
        }
        if (!RN.Linking.addEventListener) {
            RN.Linking.addEventListener = (type, handler) => ({ remove: () => {} });
        }
    } catch (e) {
        const originalLinking = RN.Linking;
        const patchedLinking = Object.create(originalLinking);
        patchedLinking.removeEventListener = () => {};
        patchedLinking.addEventListener = () => ({ remove: () => {} });
        defineProp('Linking', patchedLinking);
    }
}

global.ViewPropTypes = propTypePolyfill;
global.TextPropTypes = propTypePolyfill;
global.ImagePropTypes = propTypePolyfill;
global.ColorPropType = dummyValidator;
global.EdgeInsetsPropType = dummyValidator;
global.PointPropType = dummyValidator;

console.log('All polyfills applied successfully with Class components');
