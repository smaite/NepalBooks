import { useState, useEffect } from 'react';
import { Paper, Text, Button, Group, Stack, Title, Modal, List, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { IconDownload, IconCircleCheck } from '@tabler/icons-react';
import { updateService } from '../services/UpdateService';

interface UpdateInfo {
  version: string;
  notes: string;
  publishedAt: string;
  url: string;
  mandatory: boolean;
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  useEffect(() => {
    // Check for updates when the component mounts
    checkForUpdates();

    // Set up periodic update checking (every 2 hours)
    const intervalId = setInterval(() => {
      checkForUpdates();
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const checkForUpdates = async () => {
    try {
      setChecking(true);
      const updateInfo = await updateService.checkForUpdates();
      
      if (updateInfo) {
        setUpdateAvailable({
          version: updateInfo.version,
          notes: updateInfo.notes,
          publishedAt: new Date(updateInfo.publishedAt).toLocaleDateString(),
          url: updateInfo.url,
          mandatory: updateInfo.mandatory
        });
        
        // If it's a mandatory update, immediately show the modal
        if (updateInfo.mandatory) {
          setModalOpen(true);
        }
      } else {
        setUpdateAvailable(null);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleDownload = async () => {
    if (!updateAvailable) return;
    
    try {
      setDownloading(true);
      await updateService.downloadUpdate(updateAvailable.url);
      // Note: If the download is successful, the app will restart,
      // so we don't need to handle the "completed" state here
    } catch (error) {
      console.error('Error downloading update:', error);
      setDownloading(false);
    }
  };

  // Parse release notes from markdown to display as list items
  const parseReleaseNotes = (notes: string): string[] => {
    return notes
      .split('\n')
      .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
      .map(line => line.trim().replace(/^[*-] /, ''));
  };

  if (!updateAvailable) return null;

  return (
    <>
      <Paper
        p="md"
        radius="md"
        withBorder
        sx={(theme) => ({
          backgroundColor: dark 
            ? theme.fn.rgba(theme.colors.blue[9], 0.25)
            : theme.fn.rgba(theme.colors.blue[0], 0.7),
          borderColor: theme.colors.blue[dark ? 7 : 3],
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          maxWidth: 300,
          backdropFilter: 'blur(8px)',
        })}
      >
        <Stack spacing="xs">
          <Title order={5}>New Update Available!</Title>
          <Text size="sm">Version {updateAvailable.version}</Text>
          <Group position="apart" mt="md">
            <Button 
              size="xs" 
              leftIcon={<IconDownload size={16} />}
              onClick={() => setModalOpen(true)}
              variant="light"
            >
              View Details
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => updateAvailable.mandatory ? null : setModalOpen(false)}
        title={`Update to version ${updateAvailable.version}`}
        closeButtonProps={{ disabled: updateAvailable.mandatory }}
        centered
        trapFocus
        withCloseButton={!updateAvailable.mandatory}
      >
        <Stack spacing="md">
          <Text size="sm" color="dimmed">Published: {updateAvailable.publishedAt}</Text>
          
          <Title order={5}>What's New</Title>
          <List 
            spacing="xs" 
            icon={
              <ThemeIcon color="blue" size={20} radius="xl">
                <IconCircleCheck size={12} />
              </ThemeIcon>
            }
          >
            {parseReleaseNotes(updateAvailable.notes).map((note, index) => (
              <List.Item key={index}>{note}</List.Item>
            ))}
          </List>

          {updateAvailable.mandatory && (
            <Text color="red" size="sm" weight={500}>
              This is a mandatory update and must be installed to continue using the application.
            </Text>
          )}
          
          <Group position="right" mt="md">
            {!updateAvailable.mandatory && (
              <Button variant="subtle" onClick={() => setModalOpen(false)}>
                Later
              </Button>
            )}
            <Button 
              onClick={handleDownload} 
              loading={downloading}
              leftIcon={<IconDownload size={16} />}
            >
              {downloading ? 'Downloading...' : 'Update Now'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
} 