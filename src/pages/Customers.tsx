import { useState } from 'react';
import {
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  Table,
  ActionIcon,
  Text,
  Modal,
  Grid,
  Card,
  Pagination,
  Badge,
  Avatar,
  Anchor,
  NumberInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconEdit,
  IconTrash,
  IconSearch,
  IconPlus,
  IconFilter,
  IconSortAscending,
  IconDownload,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

interface CustomerFormValues {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vatNumber?: string;
  balance: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vatNumber?: string;
  balance: number;
}

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, settings } = useStore();
  const [opened, setOpened] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const customersPerPage = 8;

  const form = useForm<CustomerFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      vatNumber: '',
      balance: 0,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phone: (value) => (value.length < 5 ? 'Phone must have at least 5 characters' : null),
      address: (value) => (value.length < 5 ? 'Address must have at least 5 characters' : null),
    },
  });

  const handleSubmit = (values: CustomerFormValues) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer, values);
    } else {
      addCustomer(values);
    }
    setOpened(false);
    form.reset();
    setEditingCustomer(null);
  };

  const handleEdit = (id: string) => {
    const customer = customers.find((c: Customer) => c.id === id);
    if (customer) {
      setEditingCustomer(id);
      form.setValues(customer);
      setOpened(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
  };

  // Filter and paginate customers
  const filteredCustomers = customers
    .filter(
      (customer: Customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search) ||
        (customer.vatNumber && customer.vatNumber.includes(search))
    )
    .slice((activePage - 1) * customersPerPage, activePage * customersPerPage);

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate random colors for avatars
  const getAvatarColor = (name: string) => {
    const colors = ['red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>Customers</Title>
        <Button
          leftIcon={<IconPlus size="1rem" />}
          onClick={() => {
            form.reset();
            setEditingCustomer(null);
            setOpened(true);
          }}
        >
          Add Customer
        </Button>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder="Search customers..."
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            icon={<IconSearch size="1rem" />}
            style={{ width: '60%' }}
          />
          <Group spacing="xs">
            <Button variant="outline" leftIcon={<IconFilter size="1rem" />}>
              Filter
            </Button>
            <Button variant="outline" leftIcon={<IconSortAscending size="1rem" />}>
              Sort
            </Button>
            <Button variant="outline" leftIcon={<IconDownload size="1rem" />}>
              Export
            </Button>
          </Group>
        </Group>

        <Table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Address</th>
              <th>VAT Number</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer: Customer) => (
              <tr key={customer.id}>
                <td>
                  <Group spacing="sm">
                    <Avatar color={getAvatarColor(customer.name)} radius="xl">
                      {getInitials(customer.name)}
                    </Avatar>
                    <Text size="sm" weight={500}>
                      {customer.name}
                    </Text>
                  </Group>
                </td>
                <td>
                  <Group spacing={5} direction="column" noWrap>
                    <Group spacing={5}>
                      <IconMail size="0.9rem" />
                      <Anchor size="sm" href={`mailto:${customer.email}`}>
                        {customer.email}
                      </Anchor>
                    </Group>
                    <Group spacing={5}>
                      <IconPhone size="0.9rem" />
                      <Text size="sm">{customer.phone}</Text>
                    </Group>
                  </Group>
                </td>
                <td>
                  <Text size="sm">{customer.address}</Text>
                </td>
                <td>
                  {customer.vatNumber ? (
                    <Text size="sm">{customer.vatNumber}</Text>
                  ) : (
                    <Badge color="gray">Not Registered</Badge>
                  )}
                </td>
                <td>
                  <Text
                    size="sm"
                    weight={500}
                    color={customer.balance < 0 ? 'red' : customer.balance > 0 ? 'teal' : undefined}
                  >
                    {formatCurrency(customer.balance, settings.currency)}
                  </Text>
                </td>
                <td>
                  <Group spacing={4}>
                    <ActionIcon color="blue" onClick={() => handleEdit(customer.id)}>
                      <IconEdit size="1.125rem" />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => handleDelete(customer.id)}>
                      <IconTrash size="1.125rem" />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <Text align="center" color="dimmed" my="md">
                    No customers found. Add your first customer to get started.
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Group position="center" mt="md">
          <Pagination
            total={Math.ceil(customers.length / customersPerPage)}
            value={activePage}
            onChange={setActivePage}
          />
        </Group>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          form.reset();
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                required
                label="Customer Name"
                placeholder="Enter customer name"
                {...form.getInputProps('name')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Email"
                placeholder="Enter email address"
                {...form.getInputProps('email')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Phone"
                placeholder="Enter phone number"
                {...form.getInputProps('phone')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                required
                label="Address"
                placeholder="Enter address"
                {...form.getInputProps('address')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="VAT Number (optional)"
                placeholder="Enter VAT number if applicable"
                {...form.getInputProps('vatNumber')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Outstanding Balance"
                placeholder="Enter balance"
                precision={2}
                {...form.getInputProps('balance')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group position="right" mt="md">
                <Button type="submit">{editingCustomer ? 'Update' : 'Add'}</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
    </Stack>
  );
};

export default Customers; 