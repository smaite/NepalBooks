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
  Card,
  Badge,
  Pagination,
  Select,
  Menu,
  Tooltip,
  ScrollArea
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconSearch, 
  IconFilter, 
  IconEye, 
  IconEdit, 
  IconTrash,
  IconPrinter,
  IconDownload,
  IconDots
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

// Mock purchase data for demonstration
const mockPurchases = [
  {
    id: '1',
    date: new Date('2023-06-15'),
    invoiceNumber: 'PUR-123456-001',
    supplier: 'ABC Suppliers',
    items: 5,
    amount: 12500,
    status: 'completed',
    paymentMethod: 'cash'
  },
  {
    id: '2',
    date: new Date('2023-06-18'),
    invoiceNumber: 'PUR-123789-002',
    supplier: 'XYZ Distributors',
    items: 8,
    amount: 18750,
    status: 'pending',
    paymentMethod: 'credit'
  },
  {
    id: '3',
    date: new Date('2023-06-20'),
    invoiceNumber: 'PUR-124567-003',
    supplier: 'Global Imports',
    items: 3,
    amount: 5200,
    status: 'completed',
    paymentMethod: 'bank'
  },
  {
    id: '4',
    date: new Date('2023-06-25'),
    invoiceNumber: 'PUR-125678-004',
    supplier: 'Local Traders',
    items: 12,
    amount: 32000,
    status: 'cancelled',
    paymentMethod: 'cheque'
  },
  {
    id: '5',
    date: new Date('2023-06-28'),
    invoiceNumber: 'PUR-126789-005',
    supplier: 'ABC Suppliers',
    items: 7,
    amount: 15800,
    status: 'completed',
    paymentMethod: 'cash'
  },
];

const PurchaseList = () => {
  const { settings } = useStore();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  // Filter purchases based on search, date range, and status
  const filteredPurchases = mockPurchases.filter(purchase => {
    const matchesSearch = 
      purchase.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      purchase.supplier.toLowerCase().includes(search.toLowerCase());
    
    const matchesDateRange = 
      !dateRange[0] || !dateRange[1] || 
      (purchase.date >= dateRange[0] && purchase.date <= dateRange[1]);
    
    const matchesStatus = !statusFilter || purchase.status === statusFilter;
    
    const matchesSupplier = !supplierFilter || purchase.supplier === supplierFilter;
    
    return matchesSearch && matchesDateRange && matchesStatus && matchesSupplier;
  });

  // Paginate the filtered purchases
  const paginatedPurchases = filteredPurchases.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Get unique suppliers for filter
  const supplierOptions = Array.from(new Set(mockPurchases.map(p => p.supplier)))
    .map(supplier => ({ value: supplier, label: supplier }));
  
  // Status options for filter
  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setDateRange([null, null]);
    setStatusFilter(null);
    setSupplierFilter(null);
    setActivePage(1);
  };

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>Purchase List</Title>
        <Group>
          <Button 
            variant="outline" 
            leftIcon={<IconDownload size="1rem" />}
            onClick={() => console.log('Export purchases')}
          >
            Export
          </Button>
          <Button 
            leftIcon={<IconPrinter size="1rem" />}
            onClick={() => console.log('Print purchases')}
          >
            Print
          </Button>
        </Group>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder="Search by invoice number or supplier..."
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            icon={<IconSearch size="1rem" />}
            style={{ width: '40%' }}
          />
          <Group>
            <DatePickerInput
              type="range"
              value={dateRange}
              onChange={setDateRange}
              clearable
              style={{ width: 250 }}
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              data={statusOptions}
              clearable
              style={{ width: 150 }}
            />
            <Select
              placeholder="Filter by supplier"
              value={supplierFilter}
              onChange={setSupplierFilter}
              data={supplierOptions}
              clearable
              style={{ width: 200 }}
            />
            <Button 
              variant="subtle" 
              leftIcon={<IconFilter size="1rem" />}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </Group>
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice Number</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <Text align="center" color="dimmed" py="md">
                      No purchases found. Try adjusting your filters.
                    </Text>
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{purchase.date.toLocaleDateString()}</td>
                    <td>{purchase.invoiceNumber}</td>
                    <td>{purchase.supplier}</td>
                    <td>{purchase.items}</td>
                    <td>{formatCurrency(purchase.amount, settings.currency)}</td>
                    <td>
                      <Badge color={getStatusColor(purchase.status)}>
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </Badge>
                    </td>
                    <td>{purchase.paymentMethod.charAt(0).toUpperCase() + purchase.paymentMethod.slice(1)}</td>
                    <td>
                      <Group spacing={0} position="left">
                        <Menu withinPortal position="bottom-end" shadow="sm">
                          <Menu.Target>
                            <ActionIcon>
                              <IconDots size="1rem" stroke={1.5} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item icon={<IconEye size="1rem" stroke={1.5} />}>
                              View Details
                            </Menu.Item>
                            <Menu.Item icon={<IconEdit size="1rem" stroke={1.5} />}>
                              Edit
                            </Menu.Item>
                            <Menu.Item icon={<IconPrinter size="1rem" stroke={1.5} />}>
                              Print
                            </Menu.Item>
                            <Menu.Item 
                              color="red" 
                              icon={<IconTrash size="1rem" stroke={1.5} />}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </ScrollArea>

        {filteredPurchases.length > itemsPerPage && (
          <Group position="center" mt="md">
            <Pagination
              total={Math.ceil(filteredPurchases.length / itemsPerPage)}
              value={activePage}
              onChange={setActivePage}
              radius="md"
            />
          </Group>
        )}
      </Card>
    </Stack>
  );
};

export default PurchaseList; 