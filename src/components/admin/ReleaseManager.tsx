import { useState } from 'react';
import { 
  TextInput, Textarea, Select, Checkbox, Button, 
  Paper, Title, Group, Stack, Alert, Text, Divider, 
  FileInput, Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconDeviceFloppy, IconAlertCircle } from '@tabler/icons-react';

// Update server URL
const API_URL = import.meta.env.PROD 
  ? 'https://nepalbooks-updates.netlify.app/.netlify/functions/updates' 
  : 'http://localhost:3005/api/updates';

interface DownloadUrls {
  win?: string;
  mac?: string;
  linux?: string;
}

interface ReleaseFormValues {
  version: string;
  notes: string;
  channel: 'stable' | 'beta';
  mandatory: boolean;
  downloadUrls: DownloadUrls;
  winFile: File | null;
  macFile: File | null;
  linuxFile: File | null;
}

export function ReleaseManager() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ReleaseFormValues>({
    initialValues: {
      version: '',
      notes: '',
      channel: 'stable' as const,
      mandatory: false,
      downloadUrls: {
        win: '',
        mac: '',
        linux: '',
      },
      winFile: null,
      macFile: null,
      linuxFile: null,
    },
    validate: {
      version: (value: string) => (!value ? 'Version is required' : null),
      notes: (value: string) => (!value ? 'Release notes are required' : null),
      downloadUrls: {
        win: (value: string | undefined, values: ReleaseFormValues) => 
          (!value && !values.winFile ? 'Windows download URL or file is required' : null),
      },
    },
  });

  // Simulate upload files - in a real app, upload to S3, Cloudinary, etc.
  const uploadFiles = async (): Promise<DownloadUrls> => {
    setUploading(true);
    
    try {
      // In a real app, this would be an upload to a file server
      // For this example, we'll just pretend we uploaded and return URLs
      const baseUrl = 'https://example.com/downloads/';
      const urls: DownloadUrls = {};
      
      // Use existing URLs if provided
      if (form.values.downloadUrls.win) urls.win = form.values.downloadUrls.win;
      if (form.values.downloadUrls.mac) urls.mac = form.values.downloadUrls.mac;
      if (form.values.downloadUrls.linux) urls.linux = form.values.downloadUrls.linux;
      
      // Add "uploaded" files
      if (form.values.winFile) {
        urls.win = `${baseUrl}NepalBooks-${form.values.version}-win.exe`;
      }
      
      if (form.values.macFile) {
        urls.mac = `${baseUrl}NepalBooks-${form.values.version}-mac.dmg`;
      }
      
      if (form.values.linuxFile) {
        urls.linux = `${baseUrl}NepalBooks-${form.values.version}-linux.AppImage`;
      }
      
      // Wait to simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return urls;
    } finally {
      setUploading(false);
    }
  };

  const publishRelease = async (values: ReleaseFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Upload files first (if any)
      const downloadUrls = await uploadFiles();
      
      // Prepare release data
      const releaseData = {
        version: values.version,
        notes: values.notes,
        channel: values.channel,
        mandatory: values.mandatory,
        downloadUrls,
      };
      
      // Call API to publish release
      const response = await fetch(`${API_URL}/admin/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(releaseData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish release');
      }
      
      const result = await response.json();
      setSuccess(`Successfully published version ${values.version} to ${values.channel} channel`);
      form.reset();
    } catch (err) {
      console.error('Error publishing release:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish release');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Title order={3} mb="md">Publish New Release</Title>
      <Divider mb="xl" />
      
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert title="Success" color="green" mb="md">
          {success}
        </Alert>
      )}
      
      <form onSubmit={form.onSubmit(publishRelease)}>
        <Stack spacing="md">
          <Group grow>
            <TextInput
              required
              label="Version"
              placeholder="1.0.0"
              {...form.getInputProps('version')}
            />
            
            <Select
              label="Channel"
              required
              data={[
                { value: 'stable', label: 'Stable' },
                { value: 'beta', label: 'Beta' },
              ]}
              {...form.getInputProps('channel')}
            />
          </Group>
          
          <Textarea
            required
            label="Release Notes"
            placeholder="Enter release notes, changes, features, etc."
            minRows={5}
            {...form.getInputProps('notes')}
          />
          
          <Checkbox
            mt="xs"
            label="Mandatory update (users must install this update)"
            {...form.getInputProps('mandatory', { type: 'checkbox' })}
          />
          
          <Divider label="Download URLs" labelPosition="center" mt="md" />
          
          <Box>
            <Text size="sm" weight={500} mb="xs">
              Provide direct download URLs or upload installation files
            </Text>
            
            <Group grow mb="md">
              <Stack spacing="xs">
                <TextInput
                  label="Windows Download URL"
                  placeholder="https://example.com/app-win.exe"
                  {...form.getInputProps('downloadUrls.win')}
                />
                <FileInput
                  label="Windows executable"
                  accept=".exe"
                  {...form.getInputProps('winFile')}
                />
              </Stack>
            </Group>
            
            <Group grow mb="md">
              <Stack spacing="xs">
                <TextInput
                  label="macOS Download URL"
                  placeholder="https://example.com/app-mac.dmg"
                  {...form.getInputProps('downloadUrls.mac')}
                />
                <FileInput
                  label="macOS disk image"
                  accept=".dmg"
                  {...form.getInputProps('macFile')}
                />
              </Stack>
            </Group>
            
            <Group grow>
              <Stack spacing="xs">
                <TextInput
                  label="Linux Download URL"
                  placeholder="https://example.com/app-linux.AppImage"
                  {...form.getInputProps('downloadUrls.linux')}
                />
                <FileInput
                  label="Linux AppImage"
                  accept=".AppImage"
                  {...form.getInputProps('linuxFile')}
                />
              </Stack>
            </Group>
          </Box>
          
          <Button
            mt="xl"
            type="submit"
            leftIcon={<IconDeviceFloppy size={16} />}
            loading={loading || uploading}
          >
            Publish Release
          </Button>
        </Stack>
      </form>
    </Paper>
  );
} 