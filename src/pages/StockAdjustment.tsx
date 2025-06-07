import { Box, Title, Breadcrumbs, Anchor, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconHome, IconPackage } from '@tabler/icons-react';
import { StockManagement } from '../components/items/StockManagement';

export default function StockAdjustment() {
  const items = [
    { title: 'Home', href: '/', icon: <IconHome size={16} /> },
    { title: 'Items', href: '/items', icon: null },
    { title: 'Stock Adjustment', href: '#', icon: <IconPackage size={16} /> },
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
        <Title order={2} mt="md">Stock Adjustment</Title>
        <Text color="dimmed" size="sm">Manage inventory levels and track stock changes</Text>
      </Box>
      
      <StockManagement />
    </Box>
  );
} 