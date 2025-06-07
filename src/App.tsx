import { AppShell, Navbar, Header, Burger, Group, Title, ActionIcon, useMantineColorScheme, Box, ThemeIcon, Text, Collapse, UnstyledButton, Image } from '@mantine/core';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  IconSun, 
  IconMoonStars, 
  IconDashboard, 
  IconReceipt, 
  IconChartBar, 
  IconSettings,
  IconPackage,
  IconShoppingCart,
  IconShoppingBag,
  IconTruck,
  IconUsers,
  IconUser,
  IconReceipt2,
  IconChevronDown,
  IconChevronRight,
  IconMinus,
  IconSquare,
  IconX
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/ne'; // Nepali locale
import { useStore } from './store/useStore';
import { electronService } from './services/ElectronService';
import { UpdateNotification } from './components/common/UpdateNotification';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { appConfig } from './config/appConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Suppliers from './pages/Suppliers';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import StockAdjustment from './pages/StockAdjustment';
import { ReleaseManager } from './components/admin/ReleaseManager';

// Menu items types
interface NavLinkItem {
  icon: React.ReactNode;
  color: string;
  label: string;
  path: string;
}

interface NavLinkGroup {
  icon: React.ReactNode;
  color: string;
  label: string;
  initiallyOpened?: boolean;
  links: { label: string; path: string }[];
}

type NavItem = NavLinkItem | NavLinkGroup;

// Custom NavLink component
const NavLink = ({ to, icon, color, label }: { to: string; icon: React.ReactNode; color: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing.sm,
          paddingLeft: theme.spacing.md,
          borderRadius: theme.radius.md,
          backgroundColor: isActive ? theme.fn.rgba(theme.colors[color][9], 0.1) : 'transparent',
          color: isActive ? theme.colors[color][4] : theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
          '&:hover': {
            backgroundColor: theme.fn.rgba(theme.colors[color][9], 0.05),
          },
          transition: 'background-color 200ms ease, color 200ms ease',
        })}
      >
        <ThemeIcon
          variant={isActive ? 'filled' : 'light'}
          color={color}
          size={30}
          radius="md"
        >
          {icon}
        </ThemeIcon>
        <Text ml="md" size="sm" weight={isActive ? 600 : 400}>
          {label}
        </Text>
      </Box>
    </Link>
  );
};

// Custom NavGroup component
const NavGroup = ({ icon, color, label, links, initiallyOpened = false }: NavLinkGroup) => {
  const [opened, setOpened] = useState(initiallyOpened);
  const location = useLocation();
  const hasActiveLink = links.some(link => location.pathname === link.path);

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: theme.spacing.sm,
          paddingLeft: theme.spacing.md,
          borderRadius: theme.radius.md,
          color: hasActiveLink ? theme.colors[color][4] : theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
          '&:hover': {
            backgroundColor: theme.fn.rgba(theme.colors[color][9], 0.05),
          },
        })}
      >
        <ThemeIcon color={color} variant={hasActiveLink ? 'filled' : 'light'} size={30} radius="md">
          {icon}
        </ThemeIcon>
        <Box sx={{ flexGrow: 1, marginLeft: 16 }}>
          <Text size="sm" weight={hasActiveLink ? 600 : 400}>{label}</Text>
        </Box>
        {opened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
      </UnstyledButton>
      <Collapse in={opened}>
        <Box ml={38} mt={5} mb={5}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 5 }}
            >
              <Box
                sx={(theme) => ({
                  display: 'block',
                  padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
                  borderRadius: theme.radius.md,
                  color: location.pathname === link.path 
                    ? theme.colors[color][4] 
                    : theme.colorScheme === 'dark' 
                    ? theme.colors.dark[0] 
                    : theme.colors.gray[7],
                  backgroundColor: location.pathname === link.path 
                    ? theme.fn.rgba(theme.colors[color][9], 0.1)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.fn.rgba(theme.colors[color][9], 0.05),
                  },
                })}
              >
                <Text size="sm" weight={location.pathname === link.path ? 600 : 400}>
                  {link.label}
                </Text>
              </Box>
            </Link>
          ))}
        </Box>
      </Collapse>
    </>
  );
};

function AppContent() {
  const [opened, setOpened] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const { initDatabase, exportData, importData } = useStore();

  // Window control functions
  const handleMinimize = () => {
    if (electronService.isElectron) {
      window.electron?.ipcRenderer?.send('window-minimize');
    }
  };

  const handleMaximize = () => {
    if (electronService.isElectron) {
      window.electron?.ipcRenderer?.send('window-maximize');
    }
  };

  const handleClose = () => {
    if (electronService.isElectron) {
      window.electron?.ipcRenderer?.send('window-close');
    } else {
      window.close();
    }
  };

  // Initialize database and set up Electron event listeners
  useEffect(() => {
    // Initialize database connection
    initDatabase().catch(console.error);

    // Set up Electron event listeners if running in Electron
    if (electronService.isElectron) {
      // Export data when triggered from the menu
      electronService.on('menu-export-data', () => {
        const { items, categories, customers, suppliers, transactions } = useStore.getState();
        exportData({ items, categories, customers, suppliers, transactions })
          .then((message) => {
            if (message) {
              alert(message);
            }
          })
          .catch((error) => {
            console.error('Export failed:', error);
            alert('Failed to export data.');
          });
      });

      // Import data when triggered from the menu
      electronService.on('menu-import-data', () => {
        importData()
          .then((data) => {
            if (data) {
              alert('Data imported successfully.');
            }
          })
          .catch((error) => {
            console.error('Import failed:', error);
            alert('Failed to import data.');
          });
      });

      // Backup data when triggered from the menu
      electronService.on('menu-backup', () => {
        const { items, categories, customers, suppliers, transactions } = useStore.getState();
        exportData({ items, categories, customers, suppliers, transactions }, true)
          .then((message) => {
            if (message) {
              alert(message);
            }
          })
          .catch((error) => {
            console.error('Backup failed:', error);
            alert('Failed to backup data.');
          });
      });

      // Restore data when triggered from the menu
      electronService.on('menu-restore', () => {
        importData(true)
          .then((data) => {
            if (data) {
              alert('Data restored successfully.');
            }
          })
          .catch((error) => {
            console.error('Restore failed:', error);
            alert('Failed to restore data.');
          });
      });
    }
  }, [initDatabase, exportData, importData]);

  const mainNavItems: NavItem[] = [
    {
      icon: <IconDashboard size={18} />,
      color: 'indigo',
      label: 'Dashboard',
      path: '/',
    },
    {
      icon: <IconPackage size={18} />,
      color: 'blue',
      label: 'Items',
      initiallyOpened: false,
      links: [
        { label: 'All Items', path: '/items' },
        { label: 'Categories', path: '/items/categories' },
        { label: 'Stock Adjustment', path: '/items/stock-adjustment' },
      ],
    },
    {
      icon: <IconShoppingCart size={18} />,
      color: 'teal',
      label: 'Purchase',
      initiallyOpened: false,
      links: [
        { label: 'New Purchase', path: '/purchase/new' },
        { label: 'Purchase List', path: '/purchase/list' },
        { label: 'Return', path: '/purchase/return' },
      ],
    },
    {
      icon: <IconShoppingBag size={18} />,
      color: 'green',
      label: 'Sales',
      initiallyOpened: false,
      links: [
        { label: 'New Sale', path: '/sales/new' },
        { label: 'Sales List', path: '/sales/list' },
        { label: 'Return', path: '/sales/return' },
      ],
    },
    {
      icon: <IconTruck size={18} />,
      color: 'yellow',
      label: 'Suppliers',
      path: '/suppliers',
    },
    {
      icon: <IconUsers size={18} />,
      color: 'orange',
      label: 'Customers',
      path: '/customers',
    },
    {
      icon: <IconUser size={18} />,
      color: 'pink',
      label: 'Staff',
      path: '/staff',
    },
    {
      icon: <IconReceipt2 size={18} />,
      color: 'red',
      label: 'Expenses',
      path: '/expenses',
    },
    {
      icon: <IconChartBar size={18} />,
      color: 'grape',
      label: 'Reports',
      path: '/reports',
    },
    {
      icon: <IconSettings size={18} />,
      color: 'gray',
      label: 'Settings',
      path: '/settings',
    },
  ];

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item, index) => {
      if ('path' in item) {
        return (
          <NavLink
            key={index}
            to={item.path}
            icon={item.icon}
            color={item.color}
            label={item.label}
          />
        );
      } else {
        return (
          <NavGroup
            key={index}
            icon={item.icon}
            color={item.color}
            label={item.label}
            links={item.links}
            initiallyOpened={item.initiallyOpened}
          />
        );
      }
    });
  };

  return (
    <AppShell
      padding="md"
      navbarOffsetBreakpoint="sm"
      styles={() => ({
        main: {
          background: dark
            ? 'linear-gradient(135deg, rgba(18, 19, 22, 0.95) 0%, rgba(26, 27, 30, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(240, 240, 250, 0.95) 0%, rgba(250, 250, 255, 0.85) 100%)',
          backdropFilter: 'blur(12px)',
          minHeight: '100vh',
        },
      })}
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 250, lg: 300 }}
          sx={(theme) => ({
            backgroundColor: dark 
              ? theme.fn.rgba(theme.colors.dark[8], 0.7) 
              : theme.fn.rgba(theme.colors.gray[0], 0.7),
            backdropFilter: 'blur(10px)',
            borderRight: `1px solid ${dark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
          })}
        >
          <Navbar.Section>
            <Group position="apart" mb={30}>
              <Group>
                <Image src={appConfig.logo.src} alt={appConfig.logo.alt} width={30} height={30} />
                <Title order={3} sx={(theme) => ({ 
                  color: dark ? theme.colors.blue[4] : theme.colors.blue[8],
                  fontWeight: 600
                })}>
                  {appConfig.name}
                </Title>
              </Group>
            </Group>
          </Navbar.Section>

          <Navbar.Section grow sx={{ overflowY: 'auto' }}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {renderNavItems(mainNavItems)}
            </Box>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header
          height={70}
          p="md"
          sx={(theme) => ({
            backgroundColor: dark 
              ? theme.fn.rgba(theme.colors.dark[8], 0.85) 
              : theme.fn.rgba(theme.colors.gray[0], 0.85),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${dark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
          })}
        >
          <Group position="apart" sx={{ height: '100%' }}>
            <Group>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={dark ? 'white' : 'black'}
              />
              <Title order={3} sx={(theme) => ({ 
                color: dark ? theme.colors.blue[4] : theme.colors.blue[8],
                fontWeight: 600,
                [theme.fn.smallerThan('sm')]: {
                  display: 'none',
                },
              })}>
                {appConfig.name} <Text span size="xs" color="dimmed">v{appConfig.version}</Text>
              </Title>
            </Group>
            
            <Group>
              <ActionIcon
                variant="light"
                color={dark ? 'yellow' : 'blue'}
                onClick={() => toggleColorScheme()}
                title="Toggle color scheme"
                size="lg"
                radius="md"
              >
                {dark ? <IconSun size="1.2rem" /> : <IconMoonStars size="1.2rem" />}
              </ActionIcon>
            </Group>
          </Group>
        </Header>
      }
    >
      <Box 
        p="md" 
        sx={(theme) => ({
          backgroundColor: dark 
            ? theme.fn.rgba(theme.colors.dark[7], 0.5)
            : theme.fn.rgba(theme.white, 0.7),
          borderRadius: theme.radius.lg,
          boxShadow: dark 
            ? '0 8px 32px rgba(0, 0, 0, 0.1)'
            : '0 8px 32px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(8px)',
          minHeight: 'calc(100vh - 120px)',
        })}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/items" element={<Items />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/expenses" element={<Expenses />} />
          {/* Item management routes */}
          <Route path="/items/categories" element={<Categories />} />
          <Route path="/items/stock-adjustment" element={<StockAdjustment />} />
          {/* Placeholder routes for new sections */}
          <Route path="/purchase/new" element={<div><Title order={2}>New Purchase</Title></div>} />
          <Route path="/purchase/list" element={<div><Title order={2}>Purchases List</Title></div>} />
          <Route path="/purchase/return" element={<div><Title order={2}>Purchase Returns</Title></div>} />
          <Route path="/sales/new" element={<div><Title order={2}>New Sale</Title></div>} />
          <Route path="/sales/list" element={<div><Title order={2}>Sales List</Title></div>} />
          <Route path="/sales/return" element={<div><Title order={2}>Sales Returns</Title></div>} />
          <Route path="/staff" element={<div><Title order={2}>Staff Management</Title></div>} />
          {/* Admin routes */}
          {electronService.isDev && (
            <Route path="/admin/release-manager" element={<ReleaseManager />} />
          )}
          {/* Public routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  {/* Add other admin routes here */}
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </AppShell>
  );
}

function App() {
  return (
    <Router>
      <DatesProvider settings={{ locale: 'ne' }}>
        <ModalsProvider>
          <Notifications position="top-right" />
          <UpdateNotification />
          <AppContent />
        </ModalsProvider>
      </DatesProvider>
    </Router>
  );
}

export default App;
