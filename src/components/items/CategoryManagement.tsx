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
  LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconDots, IconCategory } from '@tabler/icons-react';

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form for adding/editing categories
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Category name must be at least 2 characters' : null),
    },
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories from database/API
  const loadCategories = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await api.getCategories();
      // setCategories(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setCategories([
          {
            id: '1',
            name: 'Books',
            description: 'Educational and reference books',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Stationery',
            description: 'Pens, pencils, notebooks, etc.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Electronics',
            description: 'Calculators, computers, etc.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading categories:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load categories. Please try again.',
        color: 'red',
      });
      setLoading(false);
    }
  };

  // Open modal for adding a new category
  const openAddModal = () => {
    form.reset();
    setEditingCategory(null);
    setModalOpen(true);
  };

  // Open modal for editing a category
  const openEditModal = (category: Category) => {
    form.setValues({
      name: category.name,
      description: category.description,
    });
    setEditingCategory(category);
    setModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Handle form submission (add/edit)
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      
      if (editingCategory) {
        // Edit existing category
        // await api.updateCategory(editingCategory.id, values);
        
        // Update local state
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...values, updatedAt: new Date().toISOString() } 
            : cat
        ));
        
        showNotification({
          title: 'Success',
          message: 'Category updated successfully',
          color: 'green',
        });
      } else {
        // Add new category
        // const response = await api.createCategory(values);
        
        // Add to local state with mock ID
        const newCategory: Category = {
          id: Math.random().toString(36).substring(2, 9),
          name: values.name,
          description: values.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setCategories([...categories, newCategory]);
        
        showNotification({
          title: 'Success',
          message: 'Category added successfully',
          color: 'green',
        });
      }
      
      setModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving category:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to save category. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setLoading(true);
      
      // Delete category
      // await api.deleteCategory(categoryToDelete.id);
      
      // Update local state
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      
      showNotification({
        title: 'Success',
        message: 'Category deleted successfully',
        color: 'green',
      });
      
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to delete category. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Group position="apart" mb="md">
        <Title order={2}>Categories</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={openAddModal}
        >
          Add Category
        </Button>
      </Group>
      
      <Card withBorder>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Last Updated</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <Group spacing="sm">
                      <IconCategory size={16} />
                      <Text weight={500}>{category.name}</Text>
                    </Group>
                  </td>
                  <td>
                    <Text lineClamp={1}>{category.description}</Text>
                  </td>
                  <td>
                    <Text size="sm" color="dimmed">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </Text>
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
                          onClick={() => openEditModal(category)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item 
                          icon={<IconTrash size={16} />}
                          color="red"
                          onClick={() => openDeleteModal(category)}
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
                <td colSpan={4}>
                  <Text align="center" py="md">No categories found</Text>
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
        title={editingCategory ? "Edit Category" : "Add Category"}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              required
              label="Category Name"
              placeholder="Enter category name"
              {...form.getInputProps('name')}
            />
            
            <Textarea
              label="Description"
              placeholder="Enter category description (optional)"
              minRows={3}
              {...form.getInputProps('description')}
            />
            
            <Group position="right" mt="md">
              <Button variant="subtle" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingCategory ? 'Update' : 'Add'}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Category"
        centered
      >
        <Stack spacing="md">
          <Text>
            Are you sure you want to delete the category "{categoryToDelete?.name}"?
            This action cannot be undone.
          </Text>
          
          <Text size="sm" color="red">
            Note: Deleting a category will not delete the items in that category.
            Those items will no longer be associated with any category.
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