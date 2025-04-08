import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Select } from '../Select';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      text: '#11182C',
      background: '#FFFFFF',
    },
    typography: {
      fontSize: {
        bodyMedium: 14,
      },
    },
  }),
}));

describe('Select', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByTestId, getByText } = render(
      <Select options={options} onChange={onChange} />
    );
    const select = getByTestId('select');
    expect(select).toBeTruthy();
    expect(getByText('Select an option')).toBeTruthy();
  });

  it('renders with selected value', () => {
    const { getByText } = render(
      <Select options={options} onChange={onChange} value="1" />
    );
    expect(getByText('Option 1')).toBeTruthy();
  });

  it('opens modal when pressed', async () => {
    const { getByTestId, getByText } = render(
      <Select options={options} onChange={onChange} />
    );
    const select = getByTestId('select');
    fireEvent.press(select);
    await waitFor(() => {
      expect(getByText('Option 1')).toBeTruthy();
      expect(getByText('Option 2')).toBeTruthy();
      expect(getByText('Option 3')).toBeTruthy();
    });
  });

  it('calls onChange when option is selected', async () => {
    const { getByTestId, getByText } = render(
      <Select options={options} onChange={onChange} />
    );
    const select = getByTestId('select');
    fireEvent.press(select);
    await waitFor(() => {
      const option = getByText('Option 1');
      fireEvent.press(option);
      expect(onChange).toHaveBeenCalledWith('1');
    });
  });

  it('closes modal when option is selected', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <Select options={options} onChange={onChange} />
    );
    const select = getByTestId('select');
    fireEvent.press(select);
    await waitFor(() => {
      const option = getByText('Option 1');
      fireEvent.press(option);
      expect(queryByText('Option 2')).toBeNull();
    });
  });

  it('does not open when disabled', () => {
    const { getByTestId, queryByText } = render(
      <Select options={options} onChange={onChange} disabled />
    );
    const select = getByTestId('select');
    fireEvent.press(select);
    expect(queryByText('Option 1')).toBeNull();
  });

  it('renders with custom placeholder', () => {
    const { getByText } = render(
      <Select
        options={options}
        onChange={onChange}
        placeholder="Choose an option"
      />
    );
    expect(getByText('Choose an option')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <Select options={options} onChange={onChange} style={customStyle} />
    );
    const select = getByTestId('select');
    expect(select.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('renders with different sizes', () => {
    const { getByTestId } = render(
      <Select options={options} onChange={onChange} size="small" />
    );
    const select = getByTestId('select');
    expect(select).toBeTruthy();
  });
}); 