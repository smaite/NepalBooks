import { useState } from 'react';
import {
  Title,
  Card,
  Table,
  Group,
  Text,
  Badge,
  ActionIcon,
  Menu,
  TextInput,
  Button,
  Select,
  Stack,
  Pagination,
  ScrollArea,
  Alert
} from '@mantine/core';
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconPrinter,
  IconSearch,
  IconFilter,
  IconPlus,
  IconAlertCircle
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';

// Mock purchase return data structure (in a real app, you'd have this in your store)
interface PurchaseReturn {
  id: string;
  returnNumber: string;
  date: Date;
  supplier: {
    id: string;
    name: string;
  };
  purchaseInvoice: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const PurchaseReturnList = () => {
  const { suppliers } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // In a real app, this would come from your store
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);

  // Filter purchase returns based on search term, date range, supplier, and status
  const filteredReturns = purchaseReturns.filter(returnItem => {
    // Search term filter
    const matchesSearch = 
      returnItem.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.purchaseInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date range filter
    const matchesDateRange = 
      !dateRange[0] || 
      !dateRange[1] || 
      (returnItem.date >= dateRange[0] && returnItem.date <= dateRange[1]);
    
    // Supplier filter
    const matchesSupplier = 
      !supplierFilter || 
      returnItem.supplier.id === supplierFilter;
    
    // Status filter
    const matchesStatus = 
      !statusFilter || 
      returnItem.status === statusFilter;
    
    return matchesSearch && matchesDateRange && matchesSupplier && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReturns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);

  // Get supplier options for filter
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.name
  }));

  // Status options for filter
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this purchase return?')) {
      setPurchaseReturns(purchaseReturns.filter(returnItem => returnItem.id !== id));
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateRange([null, null]);
    setSupplierFilter(null);
    setStatusFilter(null);
    setCurrentPage(1);
  };

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>Purchase Returns</Title>
        <Button 
          component={Link}
          to="/purchase/return"
          leftIcon={<IconPlus size="1rem" />}
        >
          New Return
        </Button>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder="Search by return #, invoice # or supplier"
            icon={<IconSearch size="1rem" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '40%' }}
          />
          <Group spacing="xs">
            <DatePickerInput
              type="range"
              label="Date range"
              value={dateRange}
              onChange={setDateRange}
              clearable
              style={{ width: '220px' }}
            />
            <Select
              placeholder="Supplier"
              data={supplierOptions}
              value={supplierFilter}
              onChange={setSupplierFilter}
              clearable
              style={{ width: '150px' }}
            />
            <Select
              placeholder="Status"
              data={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              style={{ width: '120px' }}
            />
            <Button 
              variant="outline" 
              onClick={resetFilters}
              disabled={!searchTerm && !dateRange[0] && !supplierFilter && !statusFilter}
            >
              Reset Filters
            </Button>
          </Group>
        </Group>

        {purchaseReturns.length === 0 ? (
          <Alert icon={<IconAlertCircle size="1rem" />} title="No purchase returns found" color="blue">
            There are no purchase returns in the system yet. Click the "New Return" button to create one.
          </Alert>
        ) : filteredReturns.length === 0 ? (
          <Alert icon={<IconAlertCircle size="1rem" />} title="No matching results" color="yellow">
            No purchase returns match your search criteria. Try adjusting your filters.
          </Alert>
        ) : (
          <>
            <ScrollArea>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>Return #</th>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th>Purchase Invoice</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((returnItem) => (
                    <tr key={returnItem.id}>
                      <td>{returnItem.returnNumber}</td>
                      <td>{returnItem.date.toLocaleDateString()}</td>
                      <td>{returnItem.supplier.name}</td>
                      <td>{returnItem.purchaseInvoice}</td>
                      <td>{formatCurrency(returnItem.totalAmount, 'NPR')}</td>
                      <td>
                        <Badge color={getStatusColor(returnItem.status)} variant="filled">
                          {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <Menu position="bottom-end" shadow="md" width={140}>
                          <Menu.Target>
                            <ActionIcon>
                              <IconDotsVertical size="1rem" />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item 
                              icon={<IconEye size="1rem" />}
                              component={Link}
                              to={`/purchase/return/${returnItem.id}`}
                            >
                              View
                            </Menu.Item>
                            <Menu.Item 
                              icon={<IconEdit size="1rem" />}
                              component={Link}
                              to={`/purchase/return/edit/${returnItem.id}`}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item 
                              icon={<IconPrinter size="1rem" />}
                              onClick={() => console.log('Print return', returnItem.id)}
                            >
                              Print
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              icon={<IconTrash size="1rem" />} 
                              color="red"
                              onClick={() => handleDelete(returnItem.id)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ScrollArea>

            {totalPages > 1 && (
              <Group position="center" mt="md">
                <Pagination 
                  total={totalPages} 
                  value={currentPage} 
                  onChange={setCurrentPage} 
                />
              </Group>
            )}
          </>
        )}
      </Card>
    </Stack>
  );
};

export default PurchaseReturnList; 