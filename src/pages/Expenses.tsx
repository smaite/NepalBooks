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
  Select,
  NumberInput,
  Textarea,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePicker } from '@mantine/dates';
import {
  IconEdit,
  IconTrash,
  IconSearch,
  IconPlus,
  IconFilter,
  IconSortAscending,
  IconDownload,
  IconCalendar,
  IconCoin,
  IconCategory,
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

interface ExpenseFormValues {
  id?: string;
  date: Date;
  category: string;
  amount: number;
  vat: number;
  reference: string;
  description: string;
}

const Expenses = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, settings } = useStore();
  const [opened, setOpened] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const expensesPerPage = 8;

  // Filter expenses from transactions
  const expenses = transactions.filter(t => t.type === 'expense');

  const form = useForm<ExpenseFormValues>({
    initialValues: {
      date: new Date(),
      category: '',
      amount: 0,
      vat: settings.vatRate || 13,
      reference: '',
      description: '',
    },
    validate: {
      category: (value) => (value.length < 2 ? 'Category must have at least 2 characters' : null),
      amount: (value) => (value <= 0 ? 'Amount must be greater than 0' : null),
    },
  });

  const handleSubmit = (values: ExpenseFormValues) => {
    const transactionData = {
      ...values,
      type: 'expense' as const,
    };

    if (editingExpense) {
      updateTransaction(editingExpense, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setOpened(false);
    form.reset();
    setEditingExpense(null);
  };

  const handleEdit = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (expense) {
      setEditingExpense(id);
      form.setValues({
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        vat: expense.vat || 0,
        reference: expense.reference || '',
        description: expense.description || '',
      });
      setOpened(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
  };

  // Filter and paginate expenses
  const filteredExpenses = expenses
    .filter(
      (expense) =>
        expense.category.toLowerCase().includes(search.toLowerCase()) ||
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        (expense.reference && expense.reference.toLowerCase().includes(search.toLowerCase()))
    )
    .slice((activePage - 1) * expensesPerPage, activePage * expensesPerPage);

  // Expense categories
  const expenseCategories = [
    { value: 'Rent', label: 'Rent' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Salaries', label: 'Salaries' },
    { value: 'Office Supplies', label: 'Office Supplies' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Taxes', label: 'Taxes' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>Expenses</Title>
        <Button
          leftIcon={<IconPlus size="1rem" />}
          onClick={() => {
            form.reset();
            setEditingExpense(null);
            setOpened(true);
          }}
        >
          Add Expense
        </Button>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder="Search expenses..."
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
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>VAT</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                <td>
                  <Group spacing={5}>
                    <IconCalendar size="0.9rem" />
                    <Text size="sm">
                      {expense.date instanceof Date
                        ? expense.date.toLocaleDateString()
                        : new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </Group>
                </td>
                <td>
                  <Badge color="blue">{expense.category}</Badge>
                </td>
                <td>
                  <Text size="sm">{expense.description}</Text>
                </td>
                <td>
                  <Text size="sm">{expense.reference || '-'}</Text>
                </td>
                <td>
                  <Text size="sm" weight={500} color="red">
                    {formatCurrency(expense.amount, settings.currency)}
                  </Text>
                </td>
                <td>
                  <Text size="sm">
                    {formatCurrency(expense.vat || 0, settings.currency)}
                  </Text>
                </td>
                <td>
                  <Group spacing={4}>
                    <ActionIcon color="blue" onClick={() => handleEdit(expense.id)}>
                      <IconEdit size="1.125rem" />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => handleDelete(expense.id)}>
                      <IconTrash size="1.125rem" />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <Text align="center" color="dimmed" my="md">
                    No expenses found. Add your first expense to get started.
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Group position="center" mt="md">
          <Pagination
            total={Math.ceil(expenses.length / expensesPerPage)}
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
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={6}>
              <DatePicker
                label="Date"
                placeholder="Select date"
                locale="ne"
                icon={<IconCalendar size="1rem" />}
                {...form.getInputProps('date')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                required
                label="Category"
                placeholder="Select category"
                data={expenseCategories}
                icon={<IconCategory size="1rem" />}
                {...form.getInputProps('category')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                required
                label="Amount"
                placeholder="Enter amount"
                min={0}
                precision={2}
                icon={<IconCoin size="1rem" />}
                {...form.getInputProps('amount')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="VAT Amount"
                placeholder="Enter VAT amount"
                min={0}
                precision={2}
                {...form.getInputProps('vat')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Reference Number"
                placeholder="Enter receipt or invoice number"
                {...form.getInputProps('reference')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Description"
                placeholder="Enter expense description"
                minRows={3}
                {...form.getInputProps('description')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group position="right" mt="md">
                <Button type="submit">{editingExpense ? 'Update' : 'Add'}</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
    </Stack>
  );
};

export default Expenses; 