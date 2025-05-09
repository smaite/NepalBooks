import { Text, Title, Group, Stack, Card, SimpleGrid, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { IconArrowUpRight, IconArrowDownRight, IconCurrency, IconReceiptTax, IconCash } from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';
import { useEffect, useState } from 'react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { settings } = useStore();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const [chartReady, setChartReady] = useState(false);

  // Calculate statistics
  const currentMonthIncome = 220000;
  const lastMonthIncome = 200000;
  const incomeChange = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
  const incomeIncreased = incomeChange > 0;

  const currentMonthExpenses = 160000;
  const lastMonthExpenses = 150000;
  const expensesChange = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
  const expensesIncreased = expensesChange > 0;

  const vatCollected = 33000;
  const lastMonthVat = 30000;
  const vatChange = ((vatCollected - lastMonthVat) / lastMonthVat) * 100;
  const vatIncreased = vatChange > 0;

  // Sample data for the line chart
  const chartData = {
    labels: ['बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज'],
    datasets: [
      {
        label: 'Income',
        data: [120000, 150000, 180000, 160000, 200000, 220000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: [100000, 120000, 140000, 130000, 150000, 160000],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: dark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        },
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses',
        color: dark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value, settings.currency).replace(/\.00$/, '');
          },
          color: dark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        },
        grid: {
          color: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: dark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        },
        grid: {
          color: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  useEffect(() => {
    // Make sure Chart.js is initialized and ready
    setChartReady(true);
  }, []);

  return (
    <Stack spacing="lg">
      <Title order={2} mb="md">Dashboard</Title>
      
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 2, spacing: 'md' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}
      >
        <Card withBorder radius="md" p="md" shadow="sm">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Total Income
              </Text>
              <Text size="xl" weight={700} mt="xs">
                {formatCurrency(currentMonthIncome, settings.currency)}
              </Text>
            </div>
            <ThemeIcon
              color="teal"
              variant="light"
              sx={(theme) => ({
                color: incomeIncreased ? theme.colors.teal[6] : theme.colors.red[6],
              })}
              size={38}
              radius="md"
            >
              <IconCash size="1.8rem" stroke={1.5} />
            </ThemeIcon>
          </Group>
          <Group position="apart" mt="xs">
            <Text size="sm" color={incomeIncreased ? 'teal' : 'red'}>
              <span>{incomeIncreased ? '+' : ''}{incomeChange.toFixed(1)}%</span>
              <Text span color="dimmed" size="xs"> compared to last month</Text>
            </Text>
            <ThemeIcon
              color={incomeIncreased ? 'teal' : 'red'}
              variant="light"
              radius="xl"
              size="sm"
            >
              {incomeIncreased ? (
                <IconArrowUpRight size="0.9rem" stroke={1.5} />
              ) : (
                <IconArrowDownRight size="0.9rem" stroke={1.5} />
              )}
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder radius="md" p="md" shadow="sm">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                Total Expenses
              </Text>
              <Text size="xl" weight={700} mt="xs">
                {formatCurrency(currentMonthExpenses, settings.currency)}
              </Text>
            </div>
            <ThemeIcon
              color={!expensesIncreased ? 'teal' : 'red'}
              variant="light"
              size={38}
              radius="md"
            >
              <IconCurrency size="1.8rem" stroke={1.5} />
            </ThemeIcon>
          </Group>
          <Group position="apart" mt="xs">
            <Text size="sm" color={!expensesIncreased ? 'teal' : 'red'}>
              <span>{expensesIncreased ? '+' : ''}{expensesChange.toFixed(1)}%</span>
              <Text span color="dimmed" size="xs"> compared to last month</Text>
            </Text>
            <ThemeIcon
              color={!expensesIncreased ? 'teal' : 'red'}
              variant="light"
              radius="xl"
              size="sm"
            >
              {!expensesIncreased ? (
                <IconArrowDownRight size="0.9rem" stroke={1.5} />
              ) : (
                <IconArrowUpRight size="0.9rem" stroke={1.5} />
              )}
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder radius="md" p="md" shadow="sm">
          <Group position="apart">
            <div>
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                VAT Collected
              </Text>
              <Text size="xl" weight={700} mt="xs">
                {formatCurrency(vatCollected, settings.currency)}
              </Text>
            </div>
            <ThemeIcon
              color="blue"
              variant="light"
              size={38}
              radius="md"
            >
              <IconReceiptTax size="1.8rem" stroke={1.5} />
            </ThemeIcon>
          </Group>
          <Group position="apart" mt="xs">
            <Text size="sm" color={vatIncreased ? 'blue' : 'red'}>
              <span>{vatIncreased ? '+' : ''}{vatChange.toFixed(1)}%</span>
              <Text span color="dimmed" size="xs"> compared to last month</Text>
            </Text>
            <ThemeIcon
              color={vatIncreased ? 'blue' : 'red'}
              variant="light"
              radius="xl"
              size="sm"
            >
              {vatIncreased ? (
                <IconArrowUpRight size="0.9rem" stroke={1.5} />
              ) : (
                <IconArrowDownRight size="0.9rem" stroke={1.5} />
              )}
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="md" p="md" shadow="sm">
        {chartReady && <Line options={chartOptions} data={chartData} />}
      </Card>
    </Stack>
  );
};

export default Dashboard; 