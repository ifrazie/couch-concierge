import 'react-native';
import {render} from '@testing-library/react-native';
import * as React from 'react';

import {App} from '../src/App';

describe('App', () => {
  it('renders the home screen with the primary call to action', () => {
    const screen = render(<App />);
    expect(screen.getByTestId('btn-start')).toBeTruthy();
    expect(screen.getByText('Plan our evening')).toBeTruthy();
  });
});
