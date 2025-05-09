import { useState } from 'react';
import {
  Paper,
  Title,
  Stack,
  Grid,
  Card,
  Text,
  RingProgress,
  Group,
  Select,
  Button,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useStore } from '../store/useStore';
import { formatCurrency, getNepaliMonthName } from '../utils/formatters';
import 'dayjs/locale/ne';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const { transactions, settings } = useStore();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState<string>('monthly');

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVAT = transactions.reduce((sum, t) => sum + (t.vat || 0), 0);

  // Prepare chart data
  const lineChartData = {
    labels: Array.from({ length: 6 }, (_, i) => getNepaliMonthName(i + 1)),
    datasets: [
      {
        label: 'Income',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: [8000, 12000, 10000, 18000, 15000, 20000],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Other'],
    datasets: [
      {
        data: [30, 20, 25, 15, 10],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
        ],
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Income vs Expenses',
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Expense Distribution',
      },
    },
  };

  const handleGenerateReport = () => {
    console.log('Generating report:', {
      startDate,
      endDate,
      reportType,
    });
  };

  return (
    <Stack spacing="md">
      <Title order={2}>Reports</Title>

      <Paper p="md" radius="md" withBorder>
        <Stack spacing="md">
          <Group grow>
            <DateInput
              label="Start Date"
              placeholder="Select start date"
              value={startDate}
              onChange={setStartDate}
              locale="ne"
            />
            <DateInput
              label="End Date"
              placeholder="Select end date"
              value={endDate}
              onChange={setEndDate}
              locale="ne"
            />
            <Select
              label="Report Type"
              placeholder="Select report type"
              data={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              value={reportType}
              onChange={(value) => setReportType(value || 'monthly')}
            />
          </Group>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </Stack>
      </Paper>

      <Grid>
        <Grid.Col span={4}>
          <Card withBorder>
            <Stack align="center">
              <Text size="lg" weight={500}>
                Total Income
              </Text>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: 65, color: 'teal' }]}
                label={
                  <Text size="xl" align="center" weight={700}>
                    {formatCurrency(totalIncome, settings.currency)}
                  </Text>
                }
              />
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder>
            <Stack align="center">
              <Text size="lg" weight={500}>
                Total Expenses
              </Text>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: 45, color: 'red' }]}
                label={
                  <Text size="xl" align="center" weight={700}>
                    {formatCurrency(totalExpenses, settings.currency)}
                  </Text>
                }
              />
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder>
            <Stack align="center">
              <Text size="lg" weight={500}>
                VAT Collected
              </Text>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: 80, color: 'blue' }]}
                label={
                  <Text size="xl" align="center" weight={700}>
                    {formatCurrency(totalVAT, settings.currency)}
                  </Text>
                }
              />
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={8}>
          <Paper p="md" radius="md" withBorder>
            <Line data={lineChartData} options={lineChartOptions} />
          </Paper>
        </Grid.Col>
        <Grid.Col span={4}>
          <Paper p="md" radius="md" withBorder>
            <Pie data={pieChartData} options={pieChartOptions} />
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default Reports; 