import { useState, useEffect } from 'react';
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
  Divider,
  Textarea,
  SimpleGrid,
  Autocomplete,
  Tooltip,
  ScrollArea
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { 
  IconEdit,
  IconTrash,
  IconPlus,
  IconDeviceFloppy,
  IconPrinter,
  IconX,
  IconSearch,
  IconCalculator
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

interface PurchaseItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  discount: number;
  total: number;
}

interface PurchaseFormValues {
  date: Date;
  invoiceNumber: string;
  supplier: string;
  paymentMethod: string;
  status: string;
  items: PurchaseItem[];
  subtotal: number;
  vatTotal: number;
  discountTotal: number;
  grandTotal: number;
  notes: string;
}

const NewPurchase = () => {
  const { items, suppliers, settings } = useStore();
  const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
  const [itemSearchValue, setItemSearchValue] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  // Debug logs
  console.log('Items from store:', items);
  console.log('Suppliers from store:', suppliers);
  console.log('Settings from store:', settings);

  // Mock data for testing if store is empty
  const mockItems = items.length > 0 ? items : [
    { id: 'item1', name: 'Laptop', code: 'LAP001', category: 'Electronics', unit: 'piece', costPrice: 1200, sellingPrice: 1500, vatRate: 13, stockQuantity: 10, minStockLevel: 2, description: 'High-end laptop' },
    { id: 'item2', name: 'Mouse', code: 'MOU001', category: 'Electronics', unit: 'piece', costPrice: 25, sellingPrice: 35, vatRate: 13, stockQuantity: 20, minStockLevel: 5, description: 'Wireless mouse' }
  ];

  const mockSuppliers = suppliers.length > 0 ? suppliers : [
    { id: 'sup1', name: 'ABC Suppliers', contactPerson: 'John Doe', email: 'john@abc.com', phone: '123-456-7890', address: 'Kathmandu', vatNumber: '123456', balance: 0 },
    { id: 'sup2', name: 'XYZ Distributors', contactPerson: 'Jane Smith', email: 'jane@xyz.com', phone: '987-654-3210', address: 'Pokhara', vatNumber: '654321', balance: 0 }
  ];

  // Use mock data if store is empty
  const itemsToUse = mockItems;
  const suppliersToUse = mockSuppliers;

  const form = useForm<PurchaseFormValues>({
    initialValues: {
      date: new Date(),
      invoiceNumber: generateInvoiceNumber(),
      supplier: '',
      paymentMethod: 'cash',
      status: 'completed',
      items: [],
      subtotal: 0,
      vatTotal: 0,
      discountTotal: 0,
      grandTotal: 0,
      notes: '',
    },
    validate: {
      supplier: (value) => (value ? null : 'Supplier is required'),
      invoiceNumber: (value) => (value ? null : 'Invoice number is required'),
    },
  });

  // Generate a unique invoice number
  function generateInvoiceNumber() {
    const prefix = 'PUR';
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  // Calculate totals whenever selected items change
  useEffect(() => {
    if (selectedItems.length > 0) {
      const subtotal = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const vatTotal = selectedItems.reduce((sum, item) => sum + item.vatAmount, 0);
      const discountTotal = selectedItems.reduce((sum, item) => sum + item.discount, 0);
      const grandTotal = subtotal + vatTotal - discountTotal;
      
      form.setValues({
        ...form.values,
        items: selectedItems,
        subtotal,
        vatTotal,
        discountTotal,
        grandTotal
      });
    }
  }, [selectedItems]);

  const handleItemSelect = (itemName: string) => {
    const selectedItem = itemsToUse.find(item => item.name === itemName);
    if (selectedItem) {
      setAddingItem(true);
      const newItem: PurchaseItem = {
        id: crypto.randomUUID(),
        itemId: selectedItem.id,
        name: selectedItem.name,
        quantity: 1,
        unitPrice: selectedItem.costPrice,
        vatRate: selectedItem.vatRate,
        vatAmount: calculateVat(selectedItem.costPrice, 1, selectedItem.vatRate),
        discount: 0,
        total: selectedItem.costPrice
      };
      setSelectedItems([...selectedItems, newItem]);
      setItemSearchValue('');
      setAddingItem(false);
    }
  };

  const calculateVat = (price: number, quantity: number, vatRate: number) => {
    return (price * quantity * vatRate) / 100;
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const vatAmount = calculateVat(item.unitPrice, quantity, item.vatRate);
        const total = (item.unitPrice * quantity) + vatAmount - item.discount;
        return { ...item, quantity, vatAmount, total };
      }
      return item;
    }));
  };

  const updateItemPrice = (id: string, unitPrice: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const vatAmount = calculateVat(unitPrice, item.quantity, item.vatRate);
        const total = (unitPrice * item.quantity) + vatAmount - item.discount;
        return { ...item, unitPrice, vatAmount, total };
      }
      return item;
    }));
  };

  const updateItemDiscount = (id: string, discount: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const total = (item.unitPrice * item.quantity) + item.vatAmount - discount;
        return { ...item, discount, total };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleSubmit = (values: PurchaseFormValues) => {
    console.log('Purchase submitted:', values);
    // Here you would save the purchase to your store
    // Reset the form
    setSelectedItems([]);
    form.reset();
    form.setValues({
      date: new Date(),
      invoiceNumber: generateInvoiceNumber(),
      supplier: '',
      paymentMethod: 'cash',
      status: 'completed',
      items: [],
      subtotal: 0,
      vatTotal: 0,
      discountTotal: 0,
      grandTotal: 0,
      notes: '',
    });
  };

  // Get supplier options
  const supplierOptions = suppliersToUse.map(supplier => ({
    value: supplier.id,
    label: supplier.name
  }));

  // Payment method options
  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'credit', label: 'Credit' },
    { value: 'cheque', label: 'Cheque' }
  ];

  // Status options
  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>New Purchase</Title>
        <Group>
          <Button 
            variant="outline" 
            leftIcon={<IconPrinter size="1rem" />}
            onClick={() => console.log('Print purchase')}
          >
            Print
          </Button>
          <Button 
            leftIcon={<IconDeviceFloppy size="1rem" />}
            type="submit"
            form="purchase-form"
          >
            Save Purchase
          </Button>
        </Group>
      </Group>

      {/* Test element to check rendering */}
      <Card withBorder shadow="sm" radius="md" p="md" mb="md" style={{ backgroundColor: 'red' }}>
        <Text size="xl" weight={700} color="white">TEST ELEMENT - If you can see this, the component is rendering</Text>
      </Card>

      <form id="purchase-form" onSubmit={form.onSubmit(handleSubmit)}>
        <Card withBorder shadow="sm" radius="md" p="md" mb="md">
          <SimpleGrid cols={3}>
            <DatePickerInput
              label="Date"
              required
              {...form.getInputProps('date')}
            />
            <TextInput
              label="Invoice Number"
              placeholder="Invoice number"
              required
              {...form.getInputProps('invoiceNumber')}
            />
            <Select
              label="Supplier"
              placeholder="Select supplier"
              data={supplierOptions}
              searchable
              required
              {...form.getInputProps('supplier')}
            />
            <Select
              label="Payment Method"
              placeholder="Select payment method"
              data={paymentMethodOptions}
              {...form.getInputProps('paymentMethod')}
            />
            <Select
              label="Status"
              placeholder="Select status"
              data={statusOptions}
              {...form.getInputProps('status')}
            />
          </SimpleGrid>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="md" mb="md">
          <Group position="apart" mb="md">
            <Title order={4}>Items</Title>
            <Autocomplete
              placeholder="Search and add items..."
              value={itemSearchValue}
              onChange={setItemSearchValue}
              data={itemsToUse.map(item => item.name)}
              onItemSubmit={({ value }) => handleItemSelect(value)}
              icon={<IconSearch size="1rem" />}
              style={{ width: '60%' }}
              disabled={addingItem}
            />
          </Group>

          <ScrollArea>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ width: 100 }}>Quantity</th>
                  <th style={{ width: 120 }}>Unit Price</th>
                  <th style={{ width: 100 }}>VAT %</th>
                  <th style={{ width: 120 }}>VAT Amount</th>
                  <th style={{ width: 120 }}>Discount</th>
                  <th style={{ width: 120 }}>Total</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <Text align="center" color="dimmed" py="md">
                        No items added. Search and add items above.
                      </Text>
                    </td>
                  </tr>
                ) : (
                  selectedItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <NumberInput
                          value={item.quantity}
                          onChange={(value) => updateItemQuantity(item.id, Number(value))}
                          min={1}
                          step={1}
                          styles={{ input: { width: '100%' } }}
                        />
                      </td>
                      <td>
                        <NumberInput
                          value={item.unitPrice}
                          onChange={(value) => updateItemPrice(item.id, Number(value))}
                          min={0}
                          precision={2}
                          styles={{ input: { width: '100%' } }}
                        />
                      </td>
                      <td>{item.vatRate}%</td>
                      <td>{formatCurrency(item.vatAmount, settings.currency)}</td>
                      <td>
                        <NumberInput
                          value={item.discount}
                          onChange={(value) => updateItemDiscount(item.id, Number(value))}
                          min={0}
                          precision={2}
                          styles={{ input: { width: '100%' } }}
                        />
                      </td>
                      <td>{formatCurrency(item.total, settings.currency)}</td>
                      <td>
                        <Tooltip label="Remove">
                          <ActionIcon color="red" onClick={() => removeItem(item.id)}>
                            <IconX size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </ScrollArea>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="md" mb="md">
          <Group position="apart">
            <Stack spacing={5} style={{ width: '50%' }}>
              <Textarea
                label="Notes"
                placeholder="Add notes about this purchase"
                minRows={3}
                maxRows={5}
                {...form.getInputProps('notes')}
              />
            </Stack>
            <Stack spacing={5} style={{ width: '40%' }}>
              <Group position="apart">
                <Text>Subtotal:</Text>
                <Text weight={500}>{formatCurrency(form.values.subtotal, settings.currency)}</Text>
              </Group>
              <Group position="apart">
                <Text>VAT Total:</Text>
                <Text weight={500}>{formatCurrency(form.values.vatTotal, settings.currency)}</Text>
              </Group>
              <Group position="apart">
                <Text>Discount Total:</Text>
                <Text weight={500}>{formatCurrency(form.values.discountTotal, settings.currency)}</Text>
              </Group>
              <Divider my="sm" />
              <Group position="apart">
                <Text weight={700} size="lg">Grand Total:</Text>
                <Text weight={700} size="lg">{formatCurrency(form.values.grandTotal, settings.currency)}</Text>
              </Group>
            </Stack>
          </Group>
        </Card>
      </form>
    </Stack>
  );
};

export default NewPurchase; 