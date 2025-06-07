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
  Card,
  Divider,
  Textarea,
  SimpleGrid,
  NumberInput,
  Select,
  ScrollArea
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { 
  IconSearch,
  IconPlus,
  IconDeviceFloppy,
  IconX
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

interface ReturnItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  returnQuantity: number;
  reason: string;
  total: number;
}

interface ReturnFormValues {
  date: Date;
  returnNumber: string;
  purchaseInvoice: string;
  supplier: string;
  items: ReturnItem[];
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  notes: string;
}

// Mock purchase data for demonstration
const mockPurchases = [
  { value: 'PUR-123456-001', label: 'PUR-123456-001 (ABC Suppliers)' },
  { value: 'PUR-123789-002', label: 'PUR-123789-002 (XYZ Distributors)' },
  { value: 'PUR-124567-003', label: 'PUR-124567-003 (Global Imports)' },
  { value: 'PUR-125678-004', label: 'PUR-125678-004 (Local Traders)' },
  { value: 'PUR-126789-005', label: 'PUR-126789-005 (ABC Suppliers)' },
];

// Mock purchase items
const mockPurchaseItems: Record<string, Array<{id: string; name: string; quantity: number; unitPrice: number; vatRate: number}>> = {
  'PUR-123456-001': [
    { id: '1', name: 'Laptop', quantity: 2, unitPrice: 1200, vatRate: 13 },
    { id: '2', name: 'Mouse', quantity: 5, unitPrice: 25, vatRate: 13 },
    { id: '3', name: 'Keyboard', quantity: 5, unitPrice: 45, vatRate: 13 }
  ],
  'PUR-123789-002': [
    { id: '4', name: 'Monitor', quantity: 3, unitPrice: 350, vatRate: 13 },
    { id: '5', name: 'Headphones', quantity: 5, unitPrice: 75, vatRate: 13 }
  ]
};

const returnReasons = [
  { value: 'damaged', label: 'Damaged Goods' },
  { value: 'wrong-item', label: 'Wrong Item Received' },
  { value: 'quality', label: 'Quality Issues' },
  { value: 'expired', label: 'Expired Product' },
  { value: 'other', label: 'Other' }
];

const PurchaseReturn = () => {
  const { settings } = useStore();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);

  const form = useForm<ReturnFormValues>({
    initialValues: {
      date: new Date(),
      returnNumber: generateReturnNumber(),
      purchaseInvoice: '',
      supplier: '',
      items: [],
      subtotal: 0,
      vatTotal: 0,
      grandTotal: 0,
      notes: '',
    },
    validate: {
      purchaseInvoice: (value) => (value ? null : 'Purchase invoice is required'),
    },
  });

  // Generate a unique return number
  function generateReturnNumber() {
    const prefix = 'RET';
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  // Handle purchase invoice selection
  const handleInvoiceSelect = (invoice: string) => {
    setSelectedInvoice(invoice);
    
    // In a real app, you would fetch the purchase details from your store
    // For now, we'll use mock data
    if (mockPurchaseItems[invoice]) {
      setPurchaseItems(mockPurchaseItems[invoice]);
      
      // Set supplier based on the invoice (in a real app, this would come from your store)
      const supplierName = mockPurchases.find(p => p.value === invoice)?.label.split('(')[1].replace(')', '');
      form.setValues({
        ...form.values,
        purchaseInvoice: invoice,
        supplier: supplierName || '',
      });
    } else {
      setPurchaseItems([]);
    }
  };

  // Add item to return list
  const addItemToReturn = (item: any) => {
    const existingItem = returnItems.find(ri => ri.id === item.id);
    
    if (existingItem) {
      // Update existing item
      setReturnItems(returnItems.map(ri => 
        ri.id === item.id 
          ? { ...ri, returnQuantity: Math.min(ri.returnQuantity + 1, ri.quantity) }
          : ri
      ));
    } else {
      // Add new item
      const newReturnItem: ReturnItem = {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        returnQuantity: 1,
        reason: 'damaged',
        total: item.unitPrice
      };
      setReturnItems([...returnItems, newReturnItem]);
    }
    
    // Update form values
    calculateTotals([...returnItems, { ...item, returnQuantity: 1, reason: 'damaged', total: item.unitPrice }]);
  };

  // Update return quantity
  const updateReturnQuantity = (id: string, quantity: number) => {
    const item = returnItems.find(ri => ri.id === id);
    if (item) {
      const updatedItems = returnItems.map(ri => 
        ri.id === id 
          ? { ...ri, returnQuantity: Math.min(quantity, ri.quantity), total: ri.unitPrice * Math.min(quantity, ri.quantity) }
          : ri
      );
      setReturnItems(updatedItems);
      calculateTotals(updatedItems);
    }
  };

  // Update return reason
  const updateReturnReason = (id: string, reason: string) => {
    setReturnItems(returnItems.map(ri => 
      ri.id === id ? { ...ri, reason } : ri
    ));
  };

  // Remove item from return list
  const removeReturnItem = (id: string) => {
    const updatedItems = returnItems.filter(item => item.id !== id);
    setReturnItems(updatedItems);
    calculateTotals(updatedItems);
  };

  // Calculate totals
  const calculateTotals = (items: ReturnItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.returnQuantity), 0);
    const vatTotal = items.reduce((sum, item) => {
      // Find the original item to get the VAT rate
      const originalItem = purchaseItems.find(pi => pi.id === item.id);
      const vatRate = originalItem?.vatRate || 0;
      return sum + ((item.unitPrice * item.returnQuantity * vatRate) / 100);
    }, 0);
    const grandTotal = subtotal + vatTotal;
    
    form.setValues({
      ...form.values,
      items,
      subtotal,
      vatTotal,
      grandTotal
    });
  };

  // Handle form submission
  const handleSubmit = (values: ReturnFormValues) => {
    console.log('Return submitted:', values);
    // Here you would save the return to your store
    
    // Reset the form
    setReturnItems([]);
    setPurchaseItems([]);
    setSelectedInvoice(null);
    form.reset();
    form.setValues({
      date: new Date(),
      returnNumber: generateReturnNumber(),
      purchaseInvoice: '',
      supplier: '',
      items: [],
      subtotal: 0,
      vatTotal: 0,
      grandTotal: 0,
      notes: '',
    });
  };

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>Purchase Return</Title>
        <Button 
          leftIcon={<IconDeviceFloppy size="1rem" />}
          type="submit"
          form="return-form"
          disabled={returnItems.length === 0}
        >
          Save Return
        </Button>
      </Group>

      <form id="return-form" onSubmit={form.onSubmit(handleSubmit)}>
        <Card withBorder shadow="sm" radius="md" p="md" mb="md">
          <SimpleGrid cols={3}>
            <DatePickerInput
              label="Return Date"
              required
              {...form.getInputProps('date')}
            />
            <TextInput
              label="Return Number"
              required
              readOnly
              {...form.getInputProps('returnNumber')}
            />
            <Select
              label="Purchase Invoice"
              placeholder="Select purchase invoice"
              data={mockPurchases}
              searchable
              required
              onChange={handleInvoiceSelect}
            />
            <TextInput
              label="Supplier"
              readOnly
              {...form.getInputProps('supplier')}
            />
          </SimpleGrid>
        </Card>

        {selectedInvoice && (
          <>
            <Card withBorder shadow="sm" radius="md" p="md" mb="md">
              <Title order={4} mb="md">Purchase Items</Title>
              <ScrollArea>
                <Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseItems.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <Text align="center" color="dimmed" py="md">
                            No items found for this purchase.
                          </Text>
                        </td>
                      </tr>
                    ) : (
                      purchaseItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unitPrice, settings.currency)}</td>
                          <td>
                            <Button 
                              size="xs" 
                              variant="light"
                              leftIcon={<IconPlus size="0.8rem" />}
                              onClick={() => addItemToReturn(item)}
                              disabled={returnItems.some(ri => ri.id === item.id && ri.returnQuantity >= item.quantity)}
                            >
                              Add to Return
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </ScrollArea>
            </Card>

            <Card withBorder shadow="sm" radius="md" p="md" mb="md">
              <Title order={4} mb="md">Return Items</Title>
              <ScrollArea>
                <Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style={{ width: 100 }}>Quantity</th>
                      <th style={{ width: 180 }}>Reason</th>
                      <th style={{ width: 120 }}>Unit Price</th>
                      <th style={{ width: 120 }}>Total</th>
                      <th style={{ width: 80 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <Text align="center" color="dimmed" py="md">
                            No items added for return.
                          </Text>
                        </td>
                      </tr>
                    ) : (
                      returnItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            <NumberInput
                              value={item.returnQuantity}
                              onChange={(value) => updateReturnQuantity(item.id, Number(value))}
                              min={1}
                              max={item.quantity}
                              step={1}
                              styles={{ input: { width: '100%' } }}
                            />
                          </td>
                          <td>
                            <Select
                              data={returnReasons}
                              value={item.reason}
                              onChange={(value) => updateReturnReason(item.id, value || 'damaged')}
                              styles={{ input: { width: '100%' } }}
                            />
                          </td>
                          <td>{formatCurrency(item.unitPrice, settings.currency)}</td>
                          <td>{formatCurrency(item.unitPrice * item.returnQuantity, settings.currency)}</td>
                          <td>
                            <ActionIcon color="red" onClick={() => removeReturnItem(item.id)}>
                              <IconX size="1rem" />
                            </ActionIcon>
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
                    placeholder="Add notes about this return"
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
                  <Divider my="sm" />
                  <Group position="apart">
                    <Text weight={700} size="lg">Grand Total:</Text>
                    <Text weight={700} size="lg">{formatCurrency(form.values.grandTotal, settings.currency)}</Text>
                  </Group>
                </Stack>
              </Group>
            </Card>
          </>
        )}
      </form>
    </Stack>
  );
};

export default PurchaseReturn; 