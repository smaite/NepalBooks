import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  Text,
  Title,
  Stack,
  Table,
  ActionIcon,
  Modal,
  Divider,
  LoadingOverlay,
  Select,
  NumberInput,
  Badge,
  Textarea,
  Grid,
  TextInput,
  Tabs
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { 
  IconPlus, 
  IconPackage, 
  IconSearch,
  IconFilter,
  IconX,
  IconArrowUp,
  IconArrowDown,
  IconAlertTriangle,
  IconHistory
} from '@tabler/icons-react';
import { useStore } from '../../store/useStore';
import { v4 as uuidv4 } from 'uuid';

interface StockAdjustment {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  notes: string;
  date: string;
}

export function StockManagement() {
  const { items: storeItems, updateItem } = useStore();
  const [items, setItems] = useState(storeItems);
  const [filteredItems, setFilteredItems] = useState(storeItems);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof storeItems[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('inventory');

  // Form for stock adjustments
  const form = useForm({
    initialValues: {
      itemId: '',
      type: 'in' as 'in' | 'out',
      quantity: 1,
      reason: '',
      notes: '',
    },
    validate: {
      itemId: (value) => (!value ? 'Item is required' : null),
      quantity: (value) => (value <= 0 ? 'Quantity must be greater than 0' : null),
      reason: (value) => (!value ? 'Reason is required' : null),
    },
  });

  // Update local items when store items change
  useEffect(() => {
    setItems(storeItems);
  }, [storeItems]);

  // Load stock adjustments from localStorage on mount
  useEffect(() => {
    const savedAdjustments = localStorage.getItem('stockAdjustments');
    if (savedAdjustments) {
      try {
        setStockAdjustments(JSON.parse(savedAdjustments));
      } catch (error) {
        console.error('Error loading stock adjustments:', error);
      }
    }
  }, []);

  // Filter items when search query or filters change
  useEffect(() => {
    filterItems();
  }, [searchQuery, stockFilter, items]);

  // Filter items based on search query and filters
  const filterItems = () => {
    let filtered = [...items];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.code.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }
    
    // Apply stock filter
    if (stockFilter) {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(item => item.stockQuantity <= item.minStockLevel);
          break;
        case 'out':
          filtered = filtered.filter(item => item.stockQuantity === 0);
          break;
        case 'in':
          filtered = filtered.filter(item => item.stockQuantity > 0);
          break;
      }
    }
    
    setFilteredItems(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStockFilter(null);
  };

  // Open modal for adding a stock adjustment
  const openAdjustmentModal = (item: typeof storeItems[0] | null = null) => {
    form.reset();
    
    if (item) {
      form.setFieldValue('itemId', item.id);
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
    
    setModalOpen(true);
  };

  // Handle form submission for stock adjustment
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      
      // Get the selected item
      const item = items.find(i => i.id === values.itemId);
      if (!item) {
        showNotification({
          title: 'Error',
          message: 'Selected item not found.',
          color: 'red',
        });
        return;
      }
      
      // Calculate new quantity
      const newQuantity = values.type === 'in' 
        ? item.stockQuantity + values.quantity 
        : item.stockQuantity - values.quantity;
      
      // Validate quantity for outgoing adjustments
      if (values.type === 'out' && newQuantity < 0) {
        showNotification({
          title: 'Error',
          message: `Cannot remove more than available quantity (${item.stockQuantity} available).`,
          color: 'red',
        });
        setLoading(false);
        return;
      }
      
      // Create new adjustment record
      const newAdjustment: StockAdjustment = {
        id: uuidv4(),
        itemId: values.itemId,
        itemName: item.name,
        type: values.type,
        quantity: values.quantity,
        reason: values.reason,
        notes: values.notes,
        date: new Date().toISOString(),
      };
      
      // Update stock adjustments
      const updatedAdjustments = [newAdjustment, ...stockAdjustments];
      setStockAdjustments(updatedAdjustments);
      
      // Save to localStorage
      localStorage.setItem('stockAdjustments', JSON.stringify(updatedAdjustments));
      
      // Update item quantity in store
      updateItem(item.id, { stockQuantity: newQuantity });
      
      showNotification({
        title: 'Success',
        message: `Stock ${values.type === 'in' ? 'added to' : 'removed from'} ${item.name}.`,
        color: 'green',
      });
      
      setModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to adjust stock. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get badge for stock status
  const getStockStatusBadge = (item: typeof storeItems[0]) => {
    if (item.stockQuantity <= 0) {
      return <Badge color="red">Out of Stock</Badge>;
    } else if (item.stockQuantity <= item.minStockLevel) {
      return <Badge color="orange">Low Stock</Badge>;
    } else {
      return <Badge color="green">In Stock</Badge>;
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="inventory" icon={<IconPackage size={16} />}>Inventory</Tabs.Tab>
          <Tabs.Tab value="history" icon={<IconHistory size={16} />}>Adjustment History</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="inventory" pt="md">
          <Group position="apart" mb="md">
            <Title order={2}>Inventory Management</Title>
            <Button
              leftIcon={<IconPlus size={16} />}
              onClick={() => openAdjustmentModal()}
            >
              New Adjustment
            </Button>
          </Group>
          
          {/* Search and Filters */}
          <Card withBorder mb="md">
            <Grid>
              <Grid.Col xs={12} sm={6} md={5}>
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
              
              <Grid.Col xs={12} sm={6} md={5}>
                <Select
                  placeholder="Filter by stock status"
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
              
              <Grid.Col xs={12} md={2}>
                <Button 
                  variant="subtle" 
                  onClick={clearFilters}
                  disabled={!searchQuery && !stockFilter}
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
                  <th>Current Stock</th>
                  <th>Min. Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Group spacing="sm">
                          <IconPackage size={16} />
                          <Text weight={500}>{item.name}</Text>
                        </Group>
                      </td>
                      <td>
                        <Text size="sm">{item.code}</Text>
                      </td>
                      <td>
                        <Text size="sm">{item.category}</Text>
                      </td>
                      <td>
                        <Text size="sm">{item.stockQuantity}</Text>
                      </td>
                      <td>
                        <Text size="sm">{item.minStockLevel}</Text>
                      </td>
                      <td>
                        {getStockStatusBadge(item)}
                      </td>
                      <td>
                        <Group spacing="xs">
                          <ActionIcon 
                            color="green" 
                            variant="light"
                            onClick={() => {
                              form.setValues({
                                itemId: item.id,
                                type: 'in',
                                quantity: 1,
                                reason: '',
                                notes: '',
                              });
                              setSelectedItem(item);
                              setModalOpen(true);
                            }}
                            title="Add Stock"
                          >
                            <IconArrowUp size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            color="red" 
                            variant="light"
                            onClick={() => {
                              form.setValues({
                                itemId: item.id,
                                type: 'out',
                                quantity: 1,
                                reason: '',
                                notes: '',
                              });
                              setSelectedItem(item);
                              setModalOpen(true);
                            }}
                            title="Remove Stock"
                            disabled={item.stockQuantity <= 0}
                          >
                            <IconArrowDown size={16} />
                          </ActionIcon>
                        </Group>
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
          
          {/* Show low stock warning */}
          {items.some(item => item.stockQuantity <= item.minStockLevel) && (
            <Card withBorder mt="md" sx={(theme) => ({
              backgroundColor: theme.colorScheme === 'dark' 
                ? theme.fn.rgba(theme.colors.orange[7], 0.2) 
                : theme.fn.rgba(theme.colors.orange[1], 0.7),
              borderColor: theme.colors.orange[theme.colorScheme === 'dark' ? 7 : 3]
            })}>
              <Group>
                <IconAlertTriangle color="orange" size={24} />
                <div>
                  <Text weight={500}>Low Stock Alert</Text>
                  <Text size="sm">
                    Some items are running low on stock. Consider restocking soon.
                  </Text>
                </div>
              </Group>
            </Card>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <Title order={2} mb="md">Stock Adjustment History</Title>
          
          <Card withBorder>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {stockAdjustments.length > 0 ? (
                  stockAdjustments.map((adjustment) => (
                    <tr key={adjustment.id}>
                      <td>
                        <Text size="sm">
                          {new Date(adjustment.date).toLocaleDateString()}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {new Date(adjustment.date).toLocaleTimeString()}
                        </Text>
                      </td>
                      <td>
                        <Text size="sm">{adjustment.itemName}</Text>
                      </td>
                      <td>
                        {adjustment.type === 'in' ? (
                          <Badge color="green">Stock In</Badge>
                        ) : (
                          <Badge color="red">Stock Out</Badge>
                        )}
                      </td>
                      <td>
                        <Text size="sm">{adjustment.quantity}</Text>
                      </td>
                      <td>
                        <Text size="sm">{adjustment.reason}</Text>
                      </td>
                      <td>
                        <Text size="sm" lineClamp={2}>{adjustment.notes}</Text>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <Text align="center" py="md">No stock adjustments found</Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </Tabs.Panel>
      </Tabs>
      
      {/* Stock Adjustment Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Stock Adjustment"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <Select
              required
              label="Item"
              placeholder="Select an item"
              data={items.map(item => ({ value: item.id, label: item.name }))}
              disabled={!!selectedItem}
              {...form.getInputProps('itemId')}
            />
            
            {selectedItem && (
              <Group spacing="xs">
                <Text size="sm">Current Stock:</Text>
                <Text size="sm" weight={500}>{selectedItem.stockQuantity}</Text>
              </Group>
            )}
            
            <Select
              required
              label="Adjustment Type"
              placeholder="Select adjustment type"
              data={[
                { value: 'in', label: 'Stock In' },
                { value: 'out', label: 'Stock Out' },
              ]}
              {...form.getInputProps('type')}
            />
            
            <NumberInput
              required
              label="Quantity"
              placeholder="Enter quantity"
              min={1}
              {...form.getInputProps('quantity')}
            />
            
            <Select
              required
              label="Reason"
              placeholder="Select reason"
              data={
                form.values.type === 'in' 
                  ? [
                      { value: 'purchase', label: 'Purchase' },
                      { value: 'return', label: 'Customer Return' },
                      { value: 'correction', label: 'Inventory Correction' },
                      { value: 'other', label: 'Other' },
                    ]
                  : [
                      { value: 'sale', label: 'Sale' },
                      { value: 'damage', label: 'Damaged/Expired' },
                      { value: 'loss', label: 'Lost/Stolen' },
                      { value: 'correction', label: 'Inventory Correction' },
                      { value: 'other', label: 'Other' },
                    ]
              }
              {...form.getInputProps('reason')}
            />
            
            <Textarea
              label="Notes"
              placeholder="Enter additional notes (optional)"
              minRows={3}
              {...form.getInputProps('notes')}
            />
            
            <Divider />
            
            <Group position="right">
              <Button variant="subtle" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Adjustment</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
} 