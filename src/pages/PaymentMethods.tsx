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
  Modal,
  Switch,
  ScrollArea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash,
  IconDeviceFloppy
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';

interface PaymentMethodFormValues {
  name: string;
  isActive: boolean;
  description: string;
}

const PaymentMethods = () => {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useStore();
  
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<PaymentMethodFormValues>({
    initialValues: {
      name: '',
      isActive: true,
      description: ''
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must have at least 2 characters' : null),
    }
  });

  const handleSubmit = (values: PaymentMethodFormValues) => {
    if (editingId) {
      // Update existing payment method
      updatePaymentMethod(editingId, values);
    } else {
      // Add new payment method
      addPaymentMethod(values);
    }
    
    // Close modal and reset form
    setOpened(false);
    setEditingId(null);
    form.reset();
  };

  const handleEdit = (id: string) => {
    const methodToEdit = paymentMethods.find(method => method.id === id);
    if (methodToEdit) {
      form.setValues({
        name: methodToEdit.name,
        isActive: methodToEdit.isActive,
        description: methodToEdit.description
      });
      setEditingId(id);
      setOpened(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      deletePaymentMethod(id);
    }
  };

  const handleToggleActive = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method) {
      updatePaymentMethod(id, { isActive: !method.isActive });
    }
  };

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={2}>Payment Methods</Title>
        <Button 
          leftIcon={<IconPlus size="1rem" />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setOpened(true);
          }}
        >
          Add Payment Method
        </Button>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="md">
        <ScrollArea>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <Text align="center" color="dimmed" py="md">
                      No payment methods found. Add one to get started.
                    </Text>
                  </td>
                </tr>
              ) : (
                paymentMethods.map((method) => (
                  <tr key={method.id}>
                    <td>{method.name}</td>
                    <td>{method.description}</td>
                    <td>
                      <Switch 
                        checked={method.isActive} 
                        onChange={() => handleToggleActive(method.id)}
                        size="md"
                        onLabel="ON"
                        offLabel="OFF"
                      />
                    </td>
                    <td>
                      <Group spacing={8}>
                        <ActionIcon color="blue" onClick={() => handleEdit(method.id)}>
                          <IconEdit size="1rem" />
                        </ActionIcon>
                        <ActionIcon color="red" onClick={() => handleDelete(method.id)}>
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setEditingId(null);
          form.reset();
        }}
        title={editingId ? "Edit Payment Method" : "Add Payment Method"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="Name"
              placeholder="e.g. Credit Card"
              required
              {...form.getInputProps('name')}
            />
            
            <TextInput
              label="Description"
              placeholder="Brief description of the payment method"
              {...form.getInputProps('description')}
            />
            
            <Switch
              label="Active"
              {...form.getInputProps('isActive', { type: 'checkbox' })}
            />
            
            <Group position="right" mt="md">
              <Button 
                variant="outline" 
                onClick={() => {
                  setOpened(false);
                  setEditingId(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" leftIcon={<IconDeviceFloppy size="1rem" />}>
                {editingId ? 'Update' : 'Save'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
};

export default PaymentMethods; 