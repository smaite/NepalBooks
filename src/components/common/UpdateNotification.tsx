import { useState, useEffect } from 'react';
import { Modal, Text, Button, Group, Stack, Badge, Paper, Divider } from '@mantine/core';
import { updateService } from '../../services/UpdateService';
import { IconDownload, IconX } from '@tabler/icons-react';

interface ReleaseInfo {
  version: string;
  url: string;
  notes: string;
  publishedAt: string;
  mandatory: boolean;
  channel: string;
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState<ReleaseInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [open, setOpen] = useState(false);

  // Check for updates
  const checkForUpdates = async () => {
    try {
      setChecking(true);
      const updateInfo = await updateService.checkForUpdates();
      
      if (updateInfo) {
        setUpdateAvailable(updateInfo);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  // Download and install update
  const downloadUpdate = async () => {
    if (!updateAvailable) return;
    
    try {
      setDownloading(true);
      await updateService.downloadUpdate(updateAvailable.url);
    } catch (error) {
      console.error('Error downloading update:', error);
    } finally {
      setDownloading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ne-NP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  // Check for updates on mount
  useEffect(() => {
    // Wait for the app to fully load before checking
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle close for non-mandatory updates
  const handleClose = () => {
    if (updateAvailable?.mandatory) {
      // Don't allow closing mandatory updates
      return;
    }
    
    setOpen(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      title={
        <Group>
          <Text>नयाँ अपडेट उपलब्ध छ</Text>
          <Badge color={updateAvailable.channel === 'beta' ? 'orange' : 'blue'}>
            {updateAvailable.channel === 'beta' ? 'Beta' : 'Stable'}
          </Badge>
        </Group>
      }
      closeButtonProps={{ 
        disabled: updateAvailable.mandatory,
        'aria-label': 'Close',
      }}
      centered
      size="md"
    >
      <Stack>
        <Text weight={500}>NepalBooks {updateAvailable.version}</Text>
        <Text size="sm">प्रकाशित: {formatDate(updateAvailable.publishedAt)}</Text>
        
        <Divider my="xs" />
        
        <Text weight={500} mb="xs">परिवर्तनहरू:</Text>
        <Paper p="xs" withBorder style={{ whiteSpace: 'pre-line', maxHeight: '200px', overflow: 'auto' }}>
          {updateAvailable.notes}
        </Paper>
        
        {updateAvailable.mandatory && (
          <Text color="red" size="sm" weight={500}>
            यो अपडेट अनिवार्य छ र सफ्टवेयर प्रयोग गर्न जारी राख्न स्थापना गर्नुपर्छ।
          </Text>
        )}
        
        <Group position="apart" mt="md">
          {!updateAvailable.mandatory && (
            <Button
              leftIcon={<IconX size={16} />}
              variant="subtle"
              onClick={handleClose}
            >
              पछि अपडेट गर्नुहोस्
            </Button>
          )}
          
          <Button
            leftIcon={<IconDownload size={16} />}
            loading={downloading}
            onClick={downloadUpdate}
            ml={!updateAvailable.mandatory ? 'auto' : undefined}
          >
            अहिले अपडेट गर्नुहोस्
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
} 