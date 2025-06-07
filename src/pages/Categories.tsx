import { Box, Title, Breadcrumbs, Anchor, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconHome, IconCategory } from '@tabler/icons-react';
import { CategoryManagement } from '../components/items/CategoryManagement';

export default function Categories() {
  const items = [
    { title: 'Home', href: '/', icon: <IconHome size={16} /> },
    { title: 'Items', href: '/items', icon: null },
    { title: 'Categories', href: '#', icon: <IconCategory size={16} /> },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {item.icon && <Box mr={5}>{item.icon}</Box>}
        <Text>{item.title}</Text>
      </Box>
    </Anchor>
  ));

  return (
    <Box>
      <Box mb="lg">
        <Breadcrumbs separator="→">{items}</Breadcrumbs>
        <Title order={2} mt="md">Item Categories</Title>
        <Text color="dimmed" size="sm">Manage product categories and classifications</Text>
      </Box>
      
      <CategoryManagement />
    </Box>
  );
} 