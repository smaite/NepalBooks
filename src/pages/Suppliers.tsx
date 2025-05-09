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
  IconTruck,
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

interface SupplierFormValues {
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  vatNumber?: string;
  balance: number;
}

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, settings } = useStore();
  const [opened, setOpened] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const suppliersPerPage = 8;

  const form = useForm<SupplierFormValues>({
    initialValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      vatNumber: '',
      balance: 0,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      contactPerson: (value) => (value.length < 2 ? 'Contact person must have at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phone: (value) => (value.length < 5 ? 'Phone must have at least 5 characters' : null),
      address: (value) => (value.length < 5 ? 'Address must have at least 5 characters' : null),
    },
  });

  const handleSubmit = (values: SupplierFormValues) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier, values);
    } else {
      addSupplier(values);
    }
    setOpened(false);
    form.reset();
    setEditingSupplier(null);
  };

  const handleEdit = (id: string) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (supplier) {
      setEditingSupplier(id);
      form.setValues(supplier);
      setOpened(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteSupplier(id);
  };

  // Filter and paginate suppliers
  const filteredSuppliers = suppliers
    .filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.email.toLowerCase().includes(search.toLowerCase()) ||
        supplier.phone.includes(search) ||
        (supplier.vatNumber && supplier.vatNumber.includes(search))
    )
    .slice((activePage - 1) * suppliersPerPage, activePage * suppliersPerPage);

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
        <Title order={2}>Suppliers</Title>
        <Button
          leftIcon={<IconPlus size="1rem" />}
          onClick={() => {
            form.reset();
            setEditingSupplier(null);
            setOpened(true);
          }}
        >
          Add Supplier
        </Button>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder="Search suppliers..."
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
              <th>Supplier</th>
              <th>Contact Person</th>
              <th>Contact</th>
              <th>Address</th>
              <th>VAT Number</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>
                  <Group spacing="sm">
                    <Avatar color={getAvatarColor(supplier.name)} radius="xl">
                      {getInitials(supplier.name)}
                    </Avatar>
                    <div>
                      <Text size="sm" weight={500}>
                        {supplier.name}
                      </Text>
                      <Group spacing={5}>
                        <IconTruck size="0.9rem" />
                        <Text size="xs" color="dimmed">
                          Supplier
                        </Text>
                      </Group>
                    </div>
                  </Group>
                </td>
                <td>
                  <Text size="sm">{supplier.contactPerson}</Text>
                </td>
                <td>
                  <Stack spacing={5}>
                    <Group spacing={5}>
                      <IconMail size="0.9rem" />
                      <Anchor size="sm" href={`mailto:${supplier.email}`}>
                        {supplier.email}
                      </Anchor>
                    </Group>
                    <Group spacing={5}>
                      <IconPhone size="0.9rem" />
                      <Text size="sm">{supplier.phone}</Text>
                    </Group>
                  </Stack>
                </td>
                <td>
                  <Text size="sm">{supplier.address}</Text>
                </td>
                <td>
                  {supplier.vatNumber ? (
                    <Text size="sm">{supplier.vatNumber}</Text>
                  ) : (
                    <Badge color="gray">Not Registered</Badge>
                  )}
                </td>
                <td>
                  <Text
                    size="sm"
                    weight={500}
                    color={supplier.balance < 0 ? 'red' : supplier.balance > 0 ? 'teal' : undefined}
                  >
                    {formatCurrency(supplier.balance, settings.currency)}
                  </Text>
                </td>
                <td>
                  <Group spacing={4}>
                    <ActionIcon color="blue" onClick={() => handleEdit(supplier.id)}>
                      <IconEdit size="1.125rem" />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => handleDelete(supplier.id)}>
                      <IconTrash size="1.125rem" />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <Text align="center" color="dimmed" my="md">
                    No suppliers found. Add your first supplier to get started.
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Group position="center" mt="md">
          <Pagination
            total={Math.ceil(suppliers.length / suppliersPerPage)}
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
          setEditingSupplier(null);
        }}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Supplier Name"
                placeholder="Enter supplier company name"
                {...form.getInputProps('name')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Contact Person"
                placeholder="Enter contact person name"
                {...form.getInputProps('contactPerson')}
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
                placeholder="Enter supplier address"
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
                <Button type="submit">{editingSupplier ? 'Update' : 'Add'}</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
    </Stack>
  );
};

export default Suppliers; 