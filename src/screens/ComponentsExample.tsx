import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '../utils/theme';
import Tabs from '../components/Tabs';
import Button from '../components/Button';
import Text from '../components/Text';
import Card from '../components/Card';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const ComponentsExample = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [inputValue, setInputValue] = useState('');

  const tabs = [
    { id: 'components', label: 'Components' },
    { id: 'forms', label: 'Forms' },
    { id: 'feedback', label: 'Feedback' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text variant="h1" style={styles.title}>Component Library</Text>
        
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          style={styles.tabs}
        />

        {activeTab === 'components' && (
          <View style={styles.components}>
            <Card style={styles.card}>
              <Text variant="h2">Buttons</Text>
              <View style={styles.buttonRow}>
                <Button variant="primary" onPress={() => {}}>Primary</Button>
                <Button variant="secondary" onPress={() => {}}>Secondary</Button>
                <Button variant="outline" onPress={() => {}}>Outline</Button>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text variant="h2">Badges</Text>
              <View style={styles.badgeRow}>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="warning">Warning</Badge>
              </View>
            </Card>
          </View>
        )}

        {activeTab === 'forms' && (
          <View style={styles.components}>
            <Card style={styles.card}>
              <Text variant="h2">Inputs</Text>
              <Input
                label="Text Input"
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Enter text..."
                style={styles.input}
              />
              <Input
                label="Password Input"
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Enter password..."
                secureTextEntry
                style={styles.input}
              />
            </Card>
          </View>
        )}

        {activeTab === 'feedback' && (
          <View style={styles.components}>
            <Card style={styles.card}>
              <Text variant="h2">Loading States</Text>
              <View style={styles.spinnerRow}>
                <Spinner size="small" />
                <Spinner size="medium" />
                <Spinner size="large" />
              </View>
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xl,
  },
  tabs: {
    marginBottom: theme.spacing.xl,
  },
  components: {
    gap: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  input: {
    marginTop: theme.spacing.md,
  },
  spinnerRow: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
});

export default ComponentsExample; 