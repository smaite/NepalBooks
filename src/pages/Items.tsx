import { useState } from 'react';
import {
  Paper,
  Title,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Table,
  ActionIcon,
  Text,
  Modal,
  Grid,
  Badge,
  Box,
  Card,
  Pagination,
  Tabs,
  Anchor,
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
  IconPackage,
  IconCategory
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

interface ItemFormValues {
  id?: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  vatRate: number;
  stockQuantity: number;
  minStockLevel: number;
  description: string;
}

interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  vatRate: number;
  stockQuantity: number;
  minStockLevel: number;
  description: string;
}

const Items = () => {
  const { items, categories, addItem, updateItem, deleteItem, addCategory, settings } = useStore();
  const [opened, setOpened] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const itemsPerPage = 8;

  const form = useForm<ItemFormValues>({
    initialValues: {
      code: '',
      name: '',
      category: '',
      unit: 'piece',
      costPrice: 0,
      sellingPrice: 0,
      vatRate: settings.vatRate || 13,
      stockQuantity: 0,
      minStockLevel: 5,
      description: '',
    },
    validate: {
      code: (value) => (value.length < 2 ? 'Code must have at least 2 characters' : null),
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      category: (value) => (value.length < 2 ? 'Category must have at least 2 characters' : null),
      costPrice: (value) => (value <= 0 ? 'Cost price must be greater than 0' : null),
      sellingPrice: (value) => (value <= 0 ? 'Selling price must be greater than 0' : null),
    },
  });

  const handleSubmit = (values: ItemFormValues) => {
    if (editingItem) {
      updateItem(editingItem, values);
    } else {
      addItem(values);
    }
    setOpened(false);
    form.reset();
    setEditingItem(null);
  };

  const handleEdit = (id: string) => {
    const item = items.find((i: Item) => i.id === id);
    if (item) {
      setEditingItem(id);
      form.setValues(item);
      setOpened(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
  };

  // Get categories from store
  const categoryOptions = categories.map(cat => ({
    value: cat.name,
    label: cat.name
  }));

  // Handle creating a new category
  const handleCreateCategory = (query: string) => {
    // Add the new category to the store
    addCategory({
      name: query,
      description: `Created while adding item on ${new Date().toLocaleDateString()}`
    });
    
    // Return the new option for the select
    return { value: query, label: query };
  };

  const units = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'g', label: 'Gram' },
    { value: 'l', label: 'Liter' },
    { value: 'ml', label: 'Milliliter' },
    { value: 'm', label: 'Meter' },
    { value: 'cm', label: 'Centimeter' },
  ];

  // Filter and paginate items
  const filteredItems = items
    .filter(
      (item: Item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    )
    .slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>Inventory Items</Title>
        <Group spacing="sm">
          <Button 
            variant="outline"
            leftIcon={<IconCategory size="1rem" />}
            component={Link}
            to="/items/categories"
          >
            Categories
          </Button>
          <Button 
            variant="outline"
            leftIcon={<IconPackage size="1rem" />}
            component={Link}
            to="/items/stock-adjustment"
          >
            Stock Adjustment
          </Button>
          <Button 
            leftIcon={<IconPlus size="1rem" />}
            onClick={() => {
              form.reset();
              setEditingItem(null);
              setOpened(true);
            }}
          >
            Add Item
          </Button>
        </Group>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder="Search items..."
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            icon={<IconSearch size="1rem" />}
            style={{ width: '60%' }}
          />
          <Group spacing="xs">
            <Button variant="outline" leftIcon={<IconFilter size="1rem" />}>Filter</Button>
            <Button variant="outline" leftIcon={<IconSortAscending size="1rem" />}>Sort</Button>
            <Button variant="outline" leftIcon={<IconDownload size="1rem" />}>Export</Button>
          </Group>
        </Group>

        <Table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item: Item) => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  {item.stockQuantity} {item.unit}
                  {item.stockQuantity <= item.minStockLevel && (
                    <Badge color="red" variant="filled" size="sm" ml={5}>
                      Low Stock
                    </Badge>
                  )}
                </td>
                <td>{formatCurrency(item.costPrice, settings.currency)}</td>
                <td>{formatCurrency(item.sellingPrice, settings.currency)}</td>
                <td>
                  <Badge 
                    color={item.stockQuantity > 0 ? "green" : "red"} 
                    variant="filled"
                  >
                    {item.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </td>
                <td>
                  <Group spacing={4}>
                    <ActionIcon color="blue" onClick={() => handleEdit(item.id)}>
                      <IconEdit size="1.125rem" />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => handleDelete(item.id)}>
                      <IconTrash size="1.125rem" />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <Text align="center" color="dimmed" my="md">
                    No items found. Add your first item to get started.
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Group position="center" mt="md">
          <Pagination 
            total={Math.ceil(items.length / itemsPerPage)} 
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
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Item Code"
                placeholder="Enter unique item code"
                {...form.getInputProps('code')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Item Name"
                placeholder="Enter item name"
                {...form.getInputProps('name')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                required
                label="Category"
                placeholder="Select or type to search category"
                data={categoryOptions}
                searchable
                creatable
                getCreateLabel={(query) => `+ Create category "${query}"`}
                onCreate={handleCreateCategory}
                {...form.getInputProps('category')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                required
                label="Unit"
                placeholder="Select unit"
                data={units}
                {...form.getInputProps('unit')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                required
                label="Cost Price"
                placeholder="Enter cost price"
                min={0}
                precision={2}
                {...form.getInputProps('costPrice')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                required
                label="Selling Price"
                placeholder="Enter selling price"
                min={0}
                precision={2}
                {...form.getInputProps('sellingPrice')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                required
                label="VAT Rate (%)"
                placeholder="Enter VAT rate"
                min={0}
                max={100}
                precision={2}
                {...form.getInputProps('vatRate')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                required
                label="Stock Quantity"
                placeholder="Enter stock quantity"
                min={0}
                {...form.getInputProps('stockQuantity')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <NumberInput
                required
                label="Minimum Stock Level"
                placeholder="Enter minimum stock level"
                min={0}
                {...form.getInputProps('minStockLevel')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Description"
                placeholder="Enter item description"
                {...form.getInputProps('description')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group position="right" mt="md">
                <Button type="submit">{editingItem ? 'Update' : 'Add'}</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
    </Stack>
  );
};

export default Items; 