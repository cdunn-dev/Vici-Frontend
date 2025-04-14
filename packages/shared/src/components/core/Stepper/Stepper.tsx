import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from "@/theme/useTheme";

export interface Step {
  id: string;
  label: string;
  completed?: boolean;
  disabled?: boolean;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepPress?: (step: number) => void;
  style?: any;
  testID?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepPress,
  style,
  testID = 'stepper',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...style,
    },
    step: {
      flex: 1,
      alignItems: 'center',
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepCircleActive: {
      backgroundColor: theme.colors.primary,
    },
    stepCircleCompleted: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    stepCircleDisabled: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.text,
      opacity: 0.5,
    },
    stepNumber: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    stepNumberActive: {
      color: theme.colors.background,
    },
    stepNumberCompleted: {
      color: theme.colors.background,
    },
    stepNumberDisabled: {
      color: theme.colors.text,
    },
    stepLabel: {
      marginTop: 8,
      color: theme.colors.text,
      fontSize: 12,
      textAlign: 'center',
    },
    stepLabelActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    stepLabelCompleted: {
      color: theme.colors.success,
    },
    stepLabelDisabled: {
      color: theme.colors.text,
      opacity: 0.5,
    },
    connector: {
      flex: 1,
      height: 2,
      backgroundColor: theme.colors.primary,
      marginHorizontal: 8,
    },
    connectorCompleted: {
      backgroundColor: theme.colors.success,
    },
    connectorDisabled: {
      backgroundColor: theme.colors.text,
      opacity: 0.5,
    },
  });

  const renderStep = (step: Step, index: number) => {
    const isActive = index === currentStep;
    const isCompleted = step.completed || index < currentStep;
    const isDisabled = step.disabled || index > currentStep;

    const stepCircleStyle = [
      styles.stepCircle,
      isActive && styles.stepCircleActive,
      isCompleted && styles.stepCircleCompleted,
      isDisabled && styles.stepCircleDisabled,
    ];

    const stepNumberStyle = [
      styles.stepNumber,
      isActive && styles.stepNumberActive,
      isCompleted && styles.stepNumberCompleted,
      isDisabled && styles.stepNumberDisabled,
    ];

    const stepLabelStyle = [
      styles.stepLabel,
      isActive && styles.stepLabelActive,
      isCompleted && styles.stepLabelCompleted,
      isDisabled && styles.stepLabelDisabled,
    ];

    const handlePress = () => {
      if (onStepPress && !isDisabled) {
        onStepPress(index);
      }
    };

    return (
      <React.Fragment key={step.id}>
        {index > 0 && (
          <View
            style={[
              styles.connector,
              isCompleted && styles.connectorCompleted,
              isDisabled && styles.connectorDisabled,
            ]}
          />
        )}
        <TouchableOpacity
          style={styles.step}
          onPress={handlePress}
          disabled={isDisabled}
          testID={`${testID}-step-${index}`}
        >
          <View style={stepCircleStyle}>
            <Text style={stepNumberStyle}>
              {isCompleted ? '✓' : index + 1}
            </Text>
          </View>
          <Text style={stepLabelStyle}>{step.label}</Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      {steps.map((step, index) => renderStep(step, index))}
    </View>
  );
}; 