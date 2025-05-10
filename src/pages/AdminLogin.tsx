import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextInput, PasswordInput, Button, Text, Paper, Title, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        notifications.show({
          title: 'Success',
          message: 'Login successful',
          color: 'green',
        });
        navigate('/admin/dashboard');
      } else {
        notifications.show({
          title: 'Error',
          message: 'Invalid credentials',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to connect to server',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper
        shadow="md"
        p="xl"
        radius="md"
        style={{
          width: '100%',
          background: 'rgba(26, 27, 30, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Title order={2} align="center" mb="xl" style={{ color: '#fff' }}>
          NepalBooks Admin
        </Title>

        <form onSubmit={handleLogin}>
          <TextInput
            required
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            styles={{
              label: { color: '#fff' },
              input: {
                backgroundColor: 'rgba(37, 38, 43, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:focus': {
                  borderColor: '#1c7ed6',
                },
              },
            }}
            mb="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            styles={{
              label: { color: '#fff' },
              input: {
                backgroundColor: 'rgba(37, 38, 43, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:focus': {
                  borderColor: '#1c7ed6',
                },
              },
            }}
            mb="xl"
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            style={{
              backgroundColor: '#1c7ed6',
              '&:hover': {
                backgroundColor: '#1971c2',
              },
            }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AdminLogin; 