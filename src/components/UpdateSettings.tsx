import { useState, useEffect } from 'react';
import { Card, Text, Radio, Group, TextInput, Button, Switch, Stack, Title } from '@mantine/core';
import { updateService } from '../services/UpdateService';
import { electronService } from '../services/ElectronService';

export function UpdateSettings() {
  const [serverType, setServerType] = useState<'github' | 'custom'>('custom');
  const [customUrl, setCustomUrl] = useState('http://localhost:3005/api/updates/latest');
  const [githubOwner, setGithubOwner] = useState('yourusername');
  const [githubRepo, setGithubRepo] = useState('nepalbooks');
  const [autoCheck, setAutoCheck] = useState(true);
  const [currentVersion, setCurrentVersion] = useState('');
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    // Load the current app version
    if (electronService.isElectron) {
      const appInfo = electronService.getAppInfo();
      setCurrentVersion(appInfo.appVersion);
    }
  }, []);

  const handleSaveSettings = () => {
    // Save the settings
    if (serverType === 'github') {
      updateService.setServerType('github');
      updateService.setGitHubRepo(githubOwner, githubRepo);
    } else {
      updateService.setServerType('custom');
      updateService.setCustomServerUrl(customUrl);
    }

    setUpdateMessage('Update settings saved.');
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setUpdateMessage('');
    }, 3000);
  };

  const handleCheckForUpdates = async () => {
    setUpdateMessage('');
    setCheckingForUpdates(true);
    
    try {
      const updateInfo = await updateService.checkForUpdates();
      
      if (updateInfo) {
        setUpdateMessage(`Update available: v${updateInfo.version}`);
      } else {
        setUpdateMessage('No updates available. You have the latest version.');
      }
    } catch (error) {
      setUpdateMessage(`Error checking for updates: ${error}`);
    } finally {
      setCheckingForUpdates(false);
    }
  };

  return (
    <Card withBorder p="md">
      <Stack spacing="md">
        <Title order={3}>Update Settings</Title>
        
        <Text size="sm">Current Version: {currentVersion}</Text>
        
        <Radio.Group
          label="Update Server"
          description="Choose where to check for updates"
          value={serverType}
          onChange={(value: 'github' | 'custom') => setServerType(value)}
        >
          <Group mt="xs">
            <Radio value="github" label="GitHub Releases" />
            <Radio value="custom" label="Custom Server" />
          </Group>
        </Radio.Group>

        {serverType === 'github' ? (
          <Stack spacing="xs">
            <TextInput
              label="GitHub Owner"
              value={githubOwner}
              onChange={(e) => setGithubOwner(e.target.value)}
            />
            <TextInput
              label="Repository Name"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
            />
          </Stack>
        ) : (
          <TextInput
            label="Custom Server URL"
            description="The URL to your update server API"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        )}

        <Switch
          label="Automatically check for updates"
          checked={autoCheck}
          onChange={(e) => setAutoCheck(e.currentTarget.checked)}
        />

        <Group position="apart">
          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCheckForUpdates}
            loading={checkingForUpdates}
          >
            Check for Updates
          </Button>
        </Group>

        {updateMessage && (
          <Text color={updateMessage.includes('Error') ? 'red' : updateMessage.includes('available') ? 'blue' : 'green'}>
            {updateMessage}
          </Text>
        )}
      </Stack>
    </Card>
  );
} 