import { useState, useEffect } from 'react';
import { Box, Group, Text, Radio, Button, Divider, Paper, Stack, Title, Alert, Loader, Badge } from '@mantine/core';
import { updateService } from '../../services/UpdateService';
import type { UpdateChannel } from '../../services/UpdateService';
import { IconInfoCircle, IconDownload, IconRefresh } from '@tabler/icons-react';

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

  // Check for updates on mount and when channel changes
  useEffect(() => {
    checkForUpdates();
    loadReleases();
  }, [channel]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ne-NP', {
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
      <Title order={3}>अपडेट सेटिङहरू</Title>
      <Divider />
      
      <Paper p="md" withBorder>
        <Stack spacing="md">
          <Title order={4}>अपडेट च्यानल</Title>
          
          <Radio.Group
            value={channel}
            onChange={(value) => handleChannelChange(value as UpdateChannel)}
            name="updateChannel"
            label="तपाईंले प्राप्त गर्ने अपडेटहरू छनौट गर्नुहोस्:"
          >
            <Group mt="xs">
              <Radio value="stable" label="स्थिर (Stable) - पूर्ण-परीक्षण गरिएका, उत्पादनको लागि तयार अपडेटहरू मात्र" />
              <Radio value="beta" label="बिटा (Beta) - नयाँ सुविधाहरूसँग प्रारम्भिक अपडेटहरू, केही बगहरू हुन सक्छन्" />
            </Group>
          </Radio.Group>
          
          <Group position="apart">
            <Text size="sm">
              {channel === 'stable' 
                ? 'तपाईंले अहिले स्थिर च्यानलमा हुनुहुन्छ।' 
                : 'तपाईंले अहिले बिटा च्यानलमा हुनुहुन्छ।'}
            </Text>
            <Button 
              leftIcon={<IconRefresh size={16} />} 
              variant="light" 
              onClick={checkForUpdates}
              loading={checking}
            >
              अपडेटहरू जाँच्नुहोस्
            </Button>
          </Group>
        </Stack>
      </Paper>
      
      {error && (
        <Alert color="red" icon={<IconInfoCircle />} title="त्रुटि">
          {error}
        </Alert>
      )}
      
      {update && (
        <Paper p="md" withBorder>
          <Stack spacing="sm">
            <Group position="apart">
              <Title order={4}>नयाँ अपडेट उपलब्ध छ!</Title>
              <Badge color={update.channel === 'beta' ? 'orange' : 'blue'}>
                {update.channel === 'beta' ? 'Beta' : 'Stable'}
              </Badge>
            </Group>
            
            <Text weight={500}>NepalBooks {update.version}</Text>
            <Text size="sm">प्रकाशित: {formatDate(update.publishedAt)}</Text>
            
            <Divider />
            
            <Box>
              <Text weight={500} mb="xs">परिवर्तनहरू:</Text>
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
              अपडेट डाउनलोड र स्थापना गर्नुहोस्
            </Button>
            
            {update.mandatory && (
              <Alert color="red" title="अनिवार्य अपडेट">
                यो अपडेट अनिवार्य छ र सफ्टवेयर प्रयोग गर्न जारी राख्न स्थापना गर्नुपर्छ।
              </Alert>
            )}
          </Stack>
        </Paper>
      )}
      
      {!update && !checking && (
        <Paper p="md" withBorder>
          <Text align="center" py="md">
            तपाईं पहिले नै नवीनतम संस्करण प्रयोग गर्दै हुनुहुन्छ।
          </Text>
        </Paper>
      )}
      
      {/* Release History */}
      <Title order={4} mt="lg">अपडेट इतिहास</Title>
      <Divider />
      
      {loading ? (
        <Box py="xl" ta="center">
          <Loader />
          <Text mt="md">रिलिज इतिहास लोड हुँदैछ...</Text>
        </Box>
      ) : releases.length > 0 ? (
        <Stack spacing="md">
          {releases.map((release) => (
            <Paper key={release.version} p="md" withBorder>
              <Group position="apart">
                <Text weight={500}>NepalBooks {release.version}</Text>
                <Badge color={release.channel === 'beta' ? 'orange' : 'blue'}>
                  {release.channel === 'beta' ? 'Beta' : 'Stable'}
                </Badge>
              </Group>
              <Text size="sm">प्रकाशित: {formatDate(release.publishedAt)}</Text>
              <Divider my="xs" />
              <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{release.notes}</Text>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper p="md" withBorder>
          <Text align="center" py="md">
            कुनै रिलिज इतिहास उपलब्ध छैन।
          </Text>
        </Paper>
      )}
    </Stack>
  );
} 