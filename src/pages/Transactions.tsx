import { useState } from 'react';
import {
  Paper,
  Title,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Table,
  ActionIcon,
  Text,
  Modal,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ne';
import { useStore } from '../store/useStore';

type TransactionFormValues = {
  date: Date;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  vat: number;
  description: string;
};

const Transactions = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const [opened, setOpened] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);

  const form = useForm<TransactionFormValues>({
    initialValues: {
      date: new Date(),
      type: 'income',
      category: '',
      amount: 0,
      vat: 0,
      description: '',
    },
    validate: {
      category: (value) => (value.length < 2 ? 'Category must have at least 2 characters' : null),
      amount: (value) => (value <= 0 ? 'Amount must be greater than 0' : null),
    },
  });

  const handleSubmit = (values: TransactionFormValues) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction, values);
    } else {
      addTransaction(values);
    }
    setOpened(false);
    form.reset();
    setEditingTransaction(null);
  };

  const handleEdit = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setEditingTransaction(id);
      form.setValues(transaction);
      setOpened(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
  };

  const categories = [
    { value: 'Sales', label: 'Sales' },
    { value: 'Purchase', label: 'Purchase' },
    { value: 'Salary', label: 'Salary' },
    { value: 'Rent', label: 'Rent' },
    { value: 'Utilities', label: 'Utilities' },
  ];

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>Transactions</Title>
        <Button onClick={() => setOpened(true)}>Add Transaction</Button>
      </Group>

      <Paper p="md" radius="md" withBorder>
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>VAT</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{dayjs(transaction.date).locale('ne').format('YYYY-MM-DD')}</td>
                <td>
                  <Text color={transaction.type === 'income' ? 'green' : 'red'}>
                    {transaction.type}
                  </Text>
                </td>
                <td>{transaction.category}</td>
                <td>रू {transaction.amount.toLocaleString()}</td>
                <td>रू {transaction.vat.toLocaleString()}</td>
                <td>{transaction.description}</td>
                <td>
                  <Group spacing={4}>
                    <ActionIcon color="blue" onClick={() => handleEdit(transaction.id)}>
                      <IconEdit size="1.125rem" />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => handleDelete(transaction.id)}>
                      <IconTrash size="1.125rem" />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          form.reset();
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <DateInput
              label="Date"
              placeholder="Select date"
              valueFormat="YYYY-MM-DD"
              locale="ne"
              {...form.getInputProps('date')}
            />
            <Select
              label="Type"
              placeholder="Select type"
              data={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
              {...form.getInputProps('type')}
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={categories}
              {...form.getInputProps('category')}
            />
            <NumberInput
              label="Amount"
              placeholder="Enter amount"
              min={0}
              parser={(value) => value.replace(/रू\s?|(,*)/g, '')}
              formatter={(value) =>
                !Number.isNaN(parseFloat(value))
                  ? `रू ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : 'रू '
              }
              {...form.getInputProps('amount')}
            />
            <NumberInput
              label="VAT"
              placeholder="Enter VAT amount"
              min={0}
              parser={(value) => value.replace(/रू\s?|(,*)/g, '')}
              formatter={(value) =>
                !Number.isNaN(parseFloat(value))
                  ? `रू ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : 'रू '
              }
              {...form.getInputProps('vat')}
            />
            <Textarea
              label="Description"
              placeholder="Enter description"
              {...form.getInputProps('description')}
            />
            <Button type="submit">{editingTransaction ? 'Update' : 'Add'}</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
};

export default Transactions; 