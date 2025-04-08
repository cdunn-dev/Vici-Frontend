import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Stepper } from '../Stepper';

jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      background: '#FFFFFF',
      text: '#11182C',
      success: '#16A34A',
    },
  }),
}));

describe('Stepper', () => {
  const mockSteps = [
    { id: '1', label: 'Step 1' },
    { id: '2', label: 'Step 2' },
    { id: '3', label: 'Step 3' },
  ];

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Stepper steps={mockSteps} currentStep={0} />
    );
    expect(getByTestId('stepper')).toBeTruthy();
  });

  it('renders correct number of steps', () => {
    const { getByTestId } = render(
      <Stepper steps={mockSteps} currentStep={0} />
    );
    expect(getByTestId('stepper-step-0')).toBeTruthy();
    expect(getByTestId('stepper-step-1')).toBeTruthy();
    expect(getByTestId('stepper-step-2')).toBeTruthy();
  });

  it('handles step press events', () => {
    const onStepPress = jest.fn();
    const { getByTestId } = render(
      <Stepper steps={mockSteps} currentStep={0} onStepPress={onStepPress} />
    );
    fireEvent.press(getByTestId('stepper-step-1'));
    expect(onStepPress).toHaveBeenCalledWith(1);
  });

  it('disables future steps', () => {
    const onStepPress = jest.fn();
    const { getByTestId } = render(
      <Stepper steps={mockSteps} currentStep={0} onStepPress={onStepPress} />
    );
    fireEvent.press(getByTestId('stepper-step-2'));
    expect(onStepPress).not.toHaveBeenCalled();
  });

  it('marks completed steps', () => {
    const { getByTestId } = render(
      <Stepper steps={mockSteps} currentStep={1} />
    );
    const step0 = getByTestId('stepper-step-0');
    expect(step0.props.style.backgroundColor).toBe('#16A34A');
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Stepper steps={mockSteps} currentStep={0} style={{ marginTop: 10 }} />
    );
    const stepper = getByTestId('stepper');
    expect(stepper.props.style.marginTop).toBe(10);
  });

  it('handles disabled steps', () => {
    const steps = [
      { id: '1', label: 'Step 1' },
      { id: '2', label: 'Step 2', disabled: true },
      { id: '3', label: 'Step 3' },
    ];
    const onStepPress = jest.fn();
    const { getByTestId } = render(
      <Stepper steps={steps} currentStep={0} onStepPress={onStepPress} />
    );
    fireEvent.press(getByTestId('stepper-step-1'));
    expect(onStepPress).not.toHaveBeenCalled();
  });
}); 