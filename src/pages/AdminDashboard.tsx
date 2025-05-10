import React from 'react';
import { Container, Title, Paper, Grid, Text, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  return (
    <Container size="lg" py="xl">
      <Group position="apart" mb="xl">
        <Title order={2} style={{ color: '#fff' }}>
          Admin Dashboard
        </Title>
        <Button
          variant="outline"
          color="red"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={4}>
          <Paper
            p="md"
            radius="md"
            style={{
              background: 'rgba(26, 27, 30, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Title order={3} mb="md" style={{ color: '#fff' }}>
              Quick Stats
            </Title>
            <Text color="dimmed" size="sm">
              Total Users: 0
            </Text>
            <Text color="dimmed" size="sm">
              Active Sessions: 0
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={8}>
          <Paper
            p="md"
            radius="md"
            style={{
              background: 'rgba(26, 27, 30, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Title order={3} mb="md" style={{ color: '#fff' }}>
              Recent Activity
            </Title>
            <Text color="dimmed" size="sm">
              No recent activity
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 