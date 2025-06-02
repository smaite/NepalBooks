import { useState, useEffect } from 'react';
import { Box, Group, Text, Radio, Button, Divider, Paper, Stack, Title, Alert, Loader, Badge, Code } from '@mantine/core';
import { updateService } from '../../services/UpdateService';
import type { UpdateChannel } from '../../services/UpdateService';
import { IconInfoCircle, IconDownload, IconRefresh } from '@tabler/icons-react';
import { electronService } from '../../services/ElectronService';
import { appConfig } from '../../config/appConfig';

interface ReleaseInfo {
  version: string;
  url: string;
  notes: string;
  publishedAt: string;
  mandatory: boolean;
  channel: string;
}

export function UpdateSettings() {
  const [channel, setChannel] = useState<UpdateChannel>(updateService.getCurrentChannel());
  const [checking, setChecking] = useState(false);
  const [update, setUpdate] = useState<ReleaseInfo | null>(null);
  const [releases, setReleases] = useState<ReleaseInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  // Handle channel change
  const handleChannelChange = (value: UpdateChannel) => {
    setChannel(value);
    updateService.setChannel(value);
    checkForUpdates();
  };

  // Check for updates
  const checkForUpdates = async () => {
    try {
      setChecking(true);
      setError(null);
      const updateInfo = await updateService.checkForUpdates();
      setUpdate(updateInfo);
    } catch (err) {
      setError('Failed to check for updates. Please try again later.');
      console.error('Error checking for updates:', err);
    } finally {
      setChecking(false);
    }
  };

  // Load all releases
  const loadReleases = async () => {
    try {
      setLoading(true);
      setError(null);
      const releasesList = await updateService.getAllReleases();
      setReleases(releasesList);
    } catch (err) {
      setError('Failed to load release history. Please try again later.');
      console.error('Error loading releases:', err);
    } finally {
      setLoading(false);
    }
  };

  // Download and install update
  const downloadUpdate = async () => {
    if (!update || !update.url) return;
    
    try {
      setDownloadingUpdate(true);
      setError(null);
      
      const success = await updateService.downloadUpdate(update.url);
      
      if (!success) {
        setError('Failed to download update. Please try again later.');
      }
    } catch (err) {
      setError('Error downloading update. Please try again later.');
      console.error('Error downloading update:', err);
    } finally {
      setDownloadingUpdate(false);
    }
  };

  // Get current version on mount
  useEffect(() => {
    const getAppInfo = async () => {
      try {
        const appInfo = electronService.getAppInfo();
        setCurrentVersion(appInfo.appVersion);
      } catch (err) {
        console.error('Error getting app info:', err);
        setCurrentVersion(appConfig.version);
      }
    };
    
    getAppInfo();
  }, []);

  // Check for updates on mount and when channel changes
  useEffect(() => {
    checkForUpdates();
    loadReleases();
  }, [channel]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (err) {
      return dateString;
    }
  };

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={3}>Update Settings</Title>
        <Group spacing="xs">
          <Text size="sm" color="dimmed">Current Version:</Text>
          <Code>{currentVersion}</Code>
        </Group>
      </Group>
      <Divider />
      
      <Paper p="md" withBorder>
        <Stack spacing="md">
          <Title order={4}>Update Channel</Title>
          
          <Radio.Group
            value={channel}
            onChange={(value) => handleChannelChange(value as UpdateChannel)}
            name="updateChannel"
            label="Choose which updates you receive:"
          >
            <Group mt="xs">
              <Radio value="stable" label="Stable - Only fully-tested updates ready for production" />
              <Radio value="beta" label="Beta - Early updates with new features, may have some bugs" />
            </Group>
          </Radio.Group>
          
          <Group position="apart">
            <Text size="sm">
              {channel === 'stable' 
                ? 'You are currently on the stable channel.' 
                : 'You are currently on the beta channel.'}
            </Text>
            <Button 
              leftIcon={<IconRefresh size={16} />} 
              variant="light" 
              onClick={checkForUpdates}
              loading={checking}
            >
              Check for Updates
            </Button>
          </Group>
        </Stack>
      </Paper>
      
      {error && (
        <Alert color="red" icon={<IconInfoCircle />} title="Error">
          {error}
        </Alert>
      )}
      
      {update && (
        <Paper p="md" withBorder>
          <Stack spacing="sm">
            <Group position="apart">
              <Title order={4}>New Update Available!</Title>
              <Badge color={update.channel === 'beta' ? 'orange' : 'blue'}>
                {update.channel === 'beta' ? 'Beta' : 'Stable'}
              </Badge>
            </Group>
            
            <Text weight={500}>{appConfig.name} {update.version}</Text>
            <Text size="sm">Published: {formatDate(update.publishedAt)}</Text>
            
            <Divider />
            
            <Box>
              <Text weight={500} mb="xs">Changes:</Text>
              <Paper p="xs" withBorder style={{ whiteSpace: 'pre-line' }}>
                {update.notes}
              </Paper>
            </Box>
            
            <Button
              fullWidth
              leftIcon={<IconDownload size={16} />}
              onClick={downloadUpdate}
              loading={downloadingUpdate}
              disabled={!update.url}
            >
              Download and Install Update
            </Button>
            
            {update.mandatory && (
              <Alert color="red" title="Mandatory Update">
                This update is mandatory and must be installed to continue using the software.
              </Alert>
            )}
          </Stack>
        </Paper>
      )}
      
      {!update && !checking && (
        <Paper p="md" withBorder>
          <Text align="center" py="md">
            You are already using the latest version.
          </Text>
        </Paper>
      )}
      
      {/* Release History */}
      <Title order={4} mt="lg">Update History</Title>
      <Divider />
      
      {loading ? (
        <Box py="xl" ta="center">
          <Loader />
          <Text mt="md">Loading release history...</Text>
        </Box>
      ) : releases.length > 0 ? (
        <Stack spacing="md">
          {releases.map((release) => (
            <Paper key={release.version} p="md" withBorder>
              <Group position="apart">
                <Text weight={500}>{appConfig.name} {release.version}</Text>
                <Badge color={release.channel === 'beta' ? 'orange' : 'blue'}>
                  {release.channel === 'beta' ? 'Beta' : 'Stable'}
                </Badge>
              </Group>
              <Text size="sm">Published: {formatDate(release.publishedAt)}</Text>
              <Divider my="xs" />
              <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{release.notes}</Text>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper p="md" withBorder>
          <Text align="center" py="md">
            No release history available.
          </Text>
        </Paper>
      )}
    </Stack>
  );
} 