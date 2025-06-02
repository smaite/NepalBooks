import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  Text,
  TextInput,
  Title,
  Stack,
  Table,
  ActionIcon,
  Modal,
  Textarea,
  Divider,
  Menu,
  LoadingOverlay,
  Select,
  NumberInput,
  Badge,
  Image,
  Grid,
  Tabs,
  FileInput,
  Switch
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconDots, 
  IconPackage, 
  IconSearch,
  IconPhoto,
  IconFilter,
  IconX,
  IconUpload
} from '@tabler/icons-react';

interface Item {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  minQuantity: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

export function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<string | null>(null);

  // Form for adding/editing items
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      categoryId: '',
      sku: '',
      price: 0,
      costPrice: 0,
      quantity: 0,
      minQuantity: 0,
      image: null as File | null,
      isActive: true,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Item name must be at least 2 characters' : null),
      categoryId: (value) => (!value ? 'Category is required' : null),
      price: (value) => (value < 0 ? 'Price cannot be negative' : null),
      costPrice: (value) => (value < 0 ? 'Cost price cannot be negative' : null),
    },
  });

  // Load items and categories on mount
  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  // Filter items when search query or filters change
  useEffect(() => {
    filterItems();
  }, [searchQuery, categoryFilter, stockFilter, items]);

  // Load items from database/API
  const loadItems = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await api.getItems();
      // setItems(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setItems([
          {
            id: '1',
            name: 'Mathematics Textbook',
            description: 'Grade 10 Mathematics textbook',
            categoryId: '1',
            categoryName: 'Books',
            sku: 'BOOK-MATH-001',
            price: 450,
            costPrice: 350,
            quantity: 25,
            minQuantity: 10,
            imageUrl: null,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Ballpoint Pen (Blue)',
            description: 'Blue ballpoint pen',
            categoryId: '2',
            categoryName: 'Stationery',
            sku: 'STAT-PEN-001',
            price: 15,
            costPrice: 10,
            quantity: 150,
            minQuantity: 50,
            imageUrl: null,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Scientific Calculator',
            description: 'Scientific calculator with 240 functions',
            categoryId: '3',
            categoryName: 'Electronics',
            sku: 'ELEC-CALC-001',
            price: 750,
            costPrice: 550,
            quantity: 5,
            minQuantity: 10,
            imageUrl: null,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading items:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load items. Please try again.',
        color: 'red',
      });
      setLoading(false);
    }
  };

  // Load categories from database/API
  const loadCategories = async () => {
    try {
      // Replace with actual API call
      // const response = await api.getCategories();
      // setCategories(response.data);
      
      // Mock data for now
      setCategories([
        { id: '1', name: 'Books' },
        { id: '2', name: 'Stationery' },
        { id: '3', name: 'Electronics' },
      ]);
    } catch (error) {
      console.error('Error loading categories:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load categories. Please try again.',
        color: 'red',
      });
    }
  };

  // Filter items based on search query and filters
  const filterItems = () => {
    let filtered = [...items];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.sku.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(item => item.categoryId === categoryFilter);
    }
    
    // Apply stock filter
    if (stockFilter) {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(item => item.quantity <= item.minQuantity);
          break;
        case 'out':
          filtered = filtered.filter(item => item.quantity === 0);
          break;
        case 'in':
          filtered = filtered.filter(item => item.quantity > 0);
          break;
      }
    }
    
    setFilteredItems(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter(null);
    setStockFilter(null);
  };

  // Open modal for adding a new item
  const openAddModal = () => {
    form.reset();
    setEditingItem(null);
    setModalOpen(true);
  };

  // Open modal for editing an item
  const openEditModal = (item: Item) => {
    form.setValues({
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      sku: item.sku,
      price: item.price,
      costPrice: item.costPrice,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      image: null,
      isActive: item.isActive,
    });
    setEditingItem(item);
    setModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (item: Item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  // Handle form submission (add/edit)
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      
      if (editingItem) {
        // Edit existing item
        // await api.updateItem(editingItem.id, values);
        
        // Update local state
        setItems(items.map(item => 
          item.id === editingItem.id 
            ? { 
                ...item, 
                ...values, 
                categoryName: categories.find(c => c.id === values.categoryId)?.name || '',
                updatedAt: new Date().toISOString() 
              } 
            : item
        ));
        
        showNotification({
          title: 'Success',
          message: 'Item updated successfully',
          color: 'green',
        });
      } else {
        // Add new item
        // const response = await api.createItem(values);
        
        // Add to local state with mock ID
        const newItem: Item = {
          id: Math.random().toString(36).substring(2, 9),
          name: values.name,
          description: values.description,
          categoryId: values.categoryId,
          categoryName: categories.find(c => c.id === values.categoryId)?.name || '',
          sku: values.sku,
          price: values.price,
          costPrice: values.costPrice,
          quantity: values.quantity,
          minQuantity: values.minQuantity,
          imageUrl: null, // Would handle image upload in a real app
          isActive: values.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setItems([...items, newItem]);
        
        showNotification({
          title: 'Success',
          message: 'Item added successfully',
          color: 'green',
        });
      }
      
      setModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving item:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to save item. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle item deletion
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      
      // Delete item
      // await api.deleteItem(itemToDelete.id);
      
      // Update local state
      setItems(items.filter(item => item.id !== itemToDelete.id));
      
      showNotification({
        title: 'Success',
        message: 'Item deleted successfully',
        color: 'green',
      });
      
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to delete item. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get stock status badge
  const getStockStatusBadge = (item: Item) => {
    if (item.quantity === 0) {
      return <Badge color="red">Out of Stock</Badge>;
    } else if (item.quantity <= item.minQuantity) {
      return <Badge color="orange">Low Stock</Badge>;
    } else {
      return <Badge color="green">In Stock</Badge>;
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Group position="apart" mb="md">
        <Title order={2}>Inventory Items</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={openAddModal}
        >
          Add Item
        </Button>
      </Group>
      
      {/* Search and Filters */}
      <Card withBorder mb="md">
        <Grid>
          <Grid.Col xs={12} sm={6} md={4}>
            <TextInput
              icon={<IconSearch size={16} />}
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              rightSection={
                searchQuery ? (
                  <ActionIcon onClick={() => setSearchQuery('')}>
                    <IconX size={16} />
                  </ActionIcon>
                ) : null
              }
            />
          </Grid.Col>
          
          <Grid.Col xs={12} sm={6} md={3}>
            <Select
              placeholder="Filter by category"
              clearable
              icon={<IconFilter size={16} />}
              data={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
          </Grid.Col>
          
          <Grid.Col xs={12} sm={6} md={3}>
            <Select
              placeholder="Filter by stock"
              clearable
              icon={<IconFilter size={16} />}
              data={[
                { value: 'low', label: 'Low Stock' },
                { value: 'out', label: 'Out of Stock' },
                { value: 'in', label: 'In Stock' },
              ]}
              value={stockFilter}
              onChange={setStockFilter}
            />
          </Grid.Col>
          
          <Grid.Col xs={12} sm={6} md={2}>
            <Button 
              variant="subtle" 
              onClick={clearFilters}
              disabled={!searchQuery && !categoryFilter && !stockFilter}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid.Col>
        </Grid>
      </Card>
      
      <Card withBorder>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Group spacing="sm">
                      <IconPackage size={16} />
                      <div>
                        <Text weight={500}>{item.name}</Text>
                        <Text size="xs" color="dimmed" lineClamp={1}>
                          {item.description}
                        </Text>
                      </div>
                    </Group>
                  </td>
                  <td>
                    <Text size="sm">{item.sku}</Text>
                  </td>
                  <td>
                    <Text size="sm">{item.categoryName}</Text>
                  </td>
                  <td>
                    <Text size="sm">Rs. {item.price.toFixed(2)}</Text>
                  </td>
                  <td>
                    <Text size="sm">{item.quantity}</Text>
                  </td>
                  <td>
                    {getStockStatusBadge(item)}
                  </td>
                  <td>
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon>
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item 
                          icon={<IconEdit size={16} />}
                          onClick={() => openEditModal(item)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item 
                          icon={<IconTrash size={16} />}
                          color="red"
                          onClick={() => openDeleteModal(item)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <Text align="center" py="md">No items found</Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
      
      {/* Add/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Item" : "Add Item"}
        centered
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs defaultValue="basic">
            <Tabs.List>
              <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
              <Tabs.Tab value="pricing">Pricing & Stock</Tabs.Tab>
              <Tabs.Tab value="image">Image</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="basic" pt="md">
              <Stack spacing="md">
                <TextInput
                  required
                  label="Item Name"
                  placeholder="Enter item name"
                  {...form.getInputProps('name')}
                />
                
                <Textarea
                  label="Description"
                  placeholder="Enter item description (optional)"
                  minRows={3}
                  {...form.getInputProps('description')}
                />
                
                <Select
                  required
                  label="Category"
                  placeholder="Select a category"
                  data={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  {...form.getInputProps('categoryId')}
                />
                
                <TextInput
                  label="SKU"
                  placeholder="Enter SKU (Stock Keeping Unit)"
                  {...form.getInputProps('sku')}
                />
                
                <Switch
                  label="Item is active"
                  checked={form.values.isActive}
                  onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="pricing" pt="md">
              <Stack spacing="md">
                <NumberInput
                  required
                  label="Selling Price"
                  placeholder="Enter selling price"
                  min={0}
                  precision={2}
                  {...form.getInputProps('price')}
                />
                
                <NumberInput
                  label="Cost Price"
                  placeholder="Enter cost price"
                  min={0}
                  precision={2}
                  {...form.getInputProps('costPrice')}
                />
                
                <NumberInput
                  required
                  label="Current Quantity"
                  placeholder="Enter current quantity"
                  min={0}
                  {...form.getInputProps('quantity')}
                />
                
                <NumberInput
                  label="Minimum Stock Level"
                  placeholder="Enter minimum stock level"
                  description="You'll be alerted when stock falls below this level"
                  min={0}
                  {...form.getInputProps('minQuantity')}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="image" pt="md">
              <Stack spacing="md" align="center">
                {editingItem?.imageUrl ? (
                  <Image
                    src={editingItem.imageUrl}
                    width={200}
                    height={200}
                    fit="contain"
                  />
                ) : (
                  <Box
                    sx={(theme) => ({
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
                      width: 200,
                      height: 200,
                      borderRadius: theme.radius.md,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    })}
                  >
                    <IconPhoto size={48} stroke={1.5} />
                  </Box>
                )}
                
                <FileInput
                  label="Upload Image"
                  accept="image/png,image/jpeg"
                  icon={<IconUpload size={16} />}
                  {...form.getInputProps('image')}
                />
                
                <Text size="sm" color="dimmed">
                  Recommended image size: 800x800 pixels (square)
                </Text>
              </Stack>
            </Tabs.Panel>
          </Tabs>
          
          <Divider my="md" />
          
          <Group position="right">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingItem ? 'Update' : 'Add'}</Button>
          </Group>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Item"
        centered
      >
        <Stack spacing="md">
          <Text>
            Are you sure you want to delete the item "{itemToDelete?.name}"?
            This action cannot be undone.
          </Text>
          
          <Divider />
          
          <Group position="right">
            <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button color="red" onClick={handleDelete}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
} 