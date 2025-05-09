import { useState } from 'react';
import {
  Title,
  Stack,
  Card,
  Group,
  TextInput,
  NumberInput,
  Select,
  Button,
  Divider,
  Text,
  Switch,
  Grid,
  Tabs,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconDatabase, 
  IconBrandMongodb, 
  IconCurrencyRupee,
  IconPercentage,
  IconDeviceFloppy,
  IconAlertCircle,
  IconSettings,
  IconCloud,
  IconUser,
  IconReceipt,
  IconDownload,
  IconTerminal
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { UpdateSettings } from '../components/settings/UpdateSettings';
import { electronService } from '../services/ElectronService';
import { showAdminPanel } from '../admin';

interface SettingsFormValues {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  vatNumber: string;
  currency: string;
  vatRate: number;
  dateFormat: string;
  dbType: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  cloudSync: boolean;
  autoBakup: boolean;
}

const Settings = () => {
  const { settings, updateSettings } = useStore();
  const [dbTestStatus, setDbTestStatus] = useState<null | 'success' | 'error'>(null);

  const form = useForm<SettingsFormValues>({
    initialValues: {
      businessName: settings.businessName || '',
      address: settings.address || '',
      phone: settings.phone || '',
      email: settings.email || '',
      vatNumber: settings.vatNumber || '',
      currency: settings.currency || 'NPR',
      vatRate: settings.vatRate || 13,
      dateFormat: settings.dateFormat || 'YYYY-MM-DD',
      dbType: settings.dbType || 'local',
      dbHost: settings.dbHost || 'localhost',
      dbPort: settings.dbPort || '27017',
      dbName: settings.dbName || 'nepalbooks',
      dbUser: settings.dbUser || '',
      dbPassword: settings.dbPassword || '',
      cloudSync: settings.cloudSync || false,
      autoBakup: settings.autoBakup || true,
    },
  });

  const handleSubmit = (values: SettingsFormValues) => {
    updateSettings(values);
    alert('Settings saved successfully!');
  };

  const testDatabaseConnection = () => {
    // Simulate database connection test
    setTimeout(() => {
      if (form.values.dbHost && form.values.dbName) {
        setDbTestStatus('success');
      } else {
        setDbTestStatus('error');
      }
    }, 1000);
  };

  return (
    <Stack spacing="md">
      <Title order={2}>Settings</Title>

      <Tabs defaultValue="business">
        <Tabs.List>
          <Tabs.Tab value="business" icon={<IconUser size="0.8rem" />}>Business Info</Tabs.Tab>
          <Tabs.Tab value="system" icon={<IconSettings size="0.8rem" />}>System</Tabs.Tab>
          <Tabs.Tab value="database" icon={<IconDatabase size="0.8rem" />}>Database</Tabs.Tab>
          <Tabs.Tab value="backup" icon={<IconCloud size="0.8rem" />}>Backup & Sync</Tabs.Tab>
          <Tabs.Tab value="receipt" icon={<IconReceipt size="0.8rem" />}>Receipt</Tabs.Tab>
          {electronService.isElectron && (
            <Tabs.Tab value="updates" icon={<IconDownload size="0.8rem" />}>Updates</Tabs.Tab>
          )}
          {electronService.isDev && (
            <Tabs.Tab value="admin" icon={<IconSettings size="0.8rem" />}>Admin</Tabs.Tab>
          )}
        </Tabs.List>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Card withBorder mt="md" p="md">
            <Tabs.Panel value="business" pt="xs">
              <Stack spacing="md">
                <TextInput
                  label="Business Name"
                  placeholder="Enter your business name"
                  {...form.getInputProps('businessName')}
                />
                <TextInput
                  label="Address"
                  placeholder="Enter your business address"
                  {...form.getInputProps('address')}
                />
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Phone"
                      placeholder="Enter contact phone"
                      {...form.getInputProps('phone')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Email"
                      placeholder="Enter contact email"
                      {...form.getInputProps('email')}
                    />
                  </Grid.Col>
                </Grid>
                <TextInput
                  label="VAT/PAN Number"
                  placeholder="Enter VAT/PAN registration number"
                  {...form.getInputProps('vatNumber')}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="system" pt="xs">
              <Stack spacing="md">
                <Select
                  label="Currency"
                  placeholder="Select currency"
                  data={[
                    { value: 'NPR', label: 'Nepali Rupee (Rs.)' },
                    { value: 'USD', label: 'US Dollar ($)' },
                    { value: 'INR', label: 'Indian Rupee (₹)' },
                  ]}
                  icon={<IconCurrencyRupee size="1rem" />}
                  {...form.getInputProps('currency')}
                />
                
                <NumberInput
                  label="Default VAT Rate (%)"
                  placeholder="Enter default VAT rate"
                  min={0}
                  max={100}
                  precision={2}
                  icon={<IconPercentage size="1rem" />}
                  {...form.getInputProps('vatRate')}
                />
                
                <Select
                  label="Date Format"
                  placeholder="Select date format"
                  data={[
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
                    { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
                    { value: 'BS', label: 'Nepali Date (BS)' },
                  ]}
                  {...form.getInputProps('dateFormat')}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="database" pt="xs">
              <Stack spacing="md">
                <Select
                  label="Database Type"
                  placeholder="Select database type"
                  data={[
                    { value: 'local', label: 'Local Storage (Default)' },
                    { value: 'mongodb', label: 'MongoDB' },
                    { value: 'mysql', label: 'MySQL' },
                  ]}
                  icon={<IconDatabase size="1rem" />}
                  {...form.getInputProps('dbType')}
                />
                
                {form.values.dbType !== 'local' && (
                  <>
                    <Divider label="Database Connection" />
                    
                    <Grid>
                      <Grid.Col span={8}>
                        <TextInput
                          label="Database Host"
                          placeholder="Enter database host"
                          {...form.getInputProps('dbHost')}
                        />
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <TextInput
                          label="Port"
                          placeholder="Enter port number"
                          {...form.getInputProps('dbPort')}
                        />
                      </Grid.Col>
                    </Grid>
                    
                    <TextInput
                      label="Database Name"
                      placeholder="Enter database name"
                      {...form.getInputProps('dbName')}
                    />
                    
                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput
                          label="Username"
                          placeholder="Enter database username"
                          {...form.getInputProps('dbUser')}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput
                          label="Password"
                          type="password"
                          placeholder="Enter database password"
                          {...form.getInputProps('dbPassword')}
                        />
                      </Grid.Col>
                    </Grid>
                    
                    <Group position="right">
                      <Button 
                        variant="outline" 
                        onClick={testDatabaseConnection}
                        leftIcon={<IconBrandMongodb size="1rem" />}
                      >
                        Test Connection
                      </Button>
                    </Group>
                    
                    {dbTestStatus === 'success' && (
                      <Alert title="Connection Successful" color="green" icon={<IconAlertCircle size="1rem" />}>
                        Successfully connected to the database.
                      </Alert>
                    )}
                    
                    {dbTestStatus === 'error' && (
                      <Alert title="Connection Failed" color="red" icon={<IconAlertCircle size="1rem" />}>
                        Failed to connect to the database. Please check your credentials.
                      </Alert>
                    )}
                  </>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="backup" pt="xs">
              <Stack spacing="md">
                <Switch
                  label="Enable Cloud Synchronization"
                  description="Sync your data across multiple devices"
                  checked={form.values.cloudSync}
                  onChange={(event) => form.setFieldValue('cloudSync', event.currentTarget.checked)}
                />
                
                <Switch
                  label="Automatic Backup"
                  description="Create automatic backups of your data"
                  checked={form.values.autoBakup}
                  onChange={(event) => form.setFieldValue('autoBakup', event.currentTarget.checked)}
                />
                
                <Divider />
                
                <Group>
                  <Button variant="outline">Create Backup Now</Button>
                  <Button variant="outline" color="blue">Restore from Backup</Button>
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="receipt" pt="xs">
              <Stack spacing="md">
                <Text>Receipt customization options will be added in a future update.</Text>
              </Stack>
            </Tabs.Panel>

            {electronService.isElectron && (
              <Tabs.Panel value="updates" pt="xs">
                <UpdateSettings />
              </Tabs.Panel>
            )}

            {electronService.isDev && (
              <Tabs.Panel value="admin" pt="xs">
                <Stack spacing="md">
                  <Title order={4}>Admin Tools</Title>
                  <Divider />
                  <Text>These tools are only available in development mode.</Text>
                  <Group>
                    <Button 
                      component="a" 
                      href="#/admin/release-manager" 
                      variant="filled"
                    >
                      Release Manager
                    </Button>
                    
                    <Button 
                      variant="filled"
                      color="green"
                      leftIcon={<IconTerminal size="1rem" />}
                      onClick={() => {
                        // Use the showAdminPanel function from our admin module
                        showAdminPanel();
                      }}
                    >
                      Open Admin Panel
                    </Button>
                  </Group>
                </Stack>
              </Tabs.Panel>
            )}

            <Group position="right" mt="md">
              <Button 
                type="submit" 
                leftIcon={<IconDeviceFloppy size="1rem" />}
              >
                Save Settings
              </Button>
            </Group>
          </Card>
        </form>
      </Tabs>
    </Stack>
  );
};

export default Settings; 