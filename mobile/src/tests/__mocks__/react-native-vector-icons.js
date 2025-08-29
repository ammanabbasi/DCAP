import React from 'react';
import { Text } from 'react-native';

const MockIcon = (props) => {
  return React.createElement(Text, props, props.name);
};

MockIcon.getImageSource = jest.fn().mockResolvedValue('test-icon');
MockIcon.loadFont = jest.fn().mockResolvedValue();

export default MockIcon;