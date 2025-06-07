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
  Badge
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconDots, IconCategory, IconSearch } from '@tabler/icons-react';
import { useStore } from '../../store/useStore';

interface CategoryWithItemCount {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export function CategoryManagement() {
  const { categories, items, addCategory, updateCategory, deleteCategory } = useStore();
  const [categoriesWithCount, setCategoriesWithCount] = useState<CategoryWithItemCount[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithItemCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithItemCount | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithItemCount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form for adding/editing categories
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => {
        if (value.trim().length < 2) return 'Category name must be at least 2 characters';
        if (editingCategory && editingCategory.name !== value) {
          // Check if name already exists (only when creating new or changing name)
          const exists = categories.some(cat => 
            cat.id !== (editingCategory?.id || '') && 
            cat.name.toLowerCase() === value.toLowerCase()
          );
          if (exists) return 'A category with this name already exists';
        }
        return null;
      },
    },
  });

  // Calculate item counts for each category
  useEffect(() => {
    const withCounts = categories.map(category => {
      const count = items.filter(item => item.category === category.name).length;
      return { ...category, itemCount: count };
    });
    setCategoriesWithCount(withCounts);
  }, [categories, items]);

  // Filter categories when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categoriesWithCount);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCategories(
        categoriesWithCount.filter(cat => 
          cat.name.toLowerCase().includes(query) || 
          cat.description.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, categoriesWithCount]);

  // Open modal for adding a new category
  const openAddModal = () => {
    form.reset();
    setEditingCategory(null);
    setModalOpen(true);
  };

  // Open modal for editing a category
  const openEditModal = (category: CategoryWithItemCount) => {
    form.setValues({
      name: category.name,
      description: category.description,
    });
    setEditingCategory(category);
    setModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (category: CategoryWithItemCount) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Handle form submission (add/edit)
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      
      if (editingCategory) {
        // Edit existing category
        updateCategory(editingCategory.id, values);
        
        showNotification({
          title: 'Success',
          message: 'Category updated successfully',
          color: 'green',
        });
      } else {
        // Add new category
        addCategory(values);
        
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
      deleteCategory(categoryToDelete.id);
      
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
        <TextInput
          placeholder="Search categories..."
          icon={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: '300px' }}
        />
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
              <th>Items</th>
              <th>Last Updated</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
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
                    <Badge>{category.itemCount}</Badge>
                  </td>
                  <td>{formatDate(category.updatedAt)}</td>
                  <td>
                    <Group spacing={0} position="right">
                      <ActionIcon color="blue" onClick={() => openEditModal(category)}>
                        <IconEdit size={16} />
                      </ActionIcon>
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
                            color="red" 
                            icon={<IconTrash size={16} />}
                            onClick={() => openDeleteModal(category)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <Text align="center" py="md" color="dimmed">
                    {categoriesWithCount.length === 0 
                      ? 'No categories found. Add your first category to get started.' 
                      : 'No categories match your search criteria.'}
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
      
      {/* Add/Edit Category Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
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
            
            <Divider my="sm" />
            
            <Group position="right">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingCategory ? 'Update' : 'Add'} Category</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Category"
        size="sm"
      >
        <Stack>
          <Text>Are you sure you want to delete the category "{categoryToDelete?.name}"?</Text>
          
          {categoryToDelete?.itemCount && categoryToDelete.itemCount > 0 && (
            <Text color="red">
              Warning: This category contains {categoryToDelete.itemCount} items. 
              Deleting it may affect those items.
            </Text>
          )}
          
          <Divider my="sm" />
          
          <Group position="right">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button color="red" onClick={handleDelete}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
} 