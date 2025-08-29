import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface SalesData {
  month: string;
  sales: number;
  leads: number;
}

interface SalesChartProps {
  data?: SalesData[];
  loading?: boolean;
  title?: string;
  type?: 'line' | 'area';
}

const mockData: SalesData[] = [
  { month: 'Jan', sales: 45, leads: 120 },
  { month: 'Feb', sales: 52, leads: 135 },
  { month: 'Mar', sales: 48, leads: 128 },
  { month: 'Apr', sales: 61, leads: 142 },
  { month: 'May', sales: 55, leads: 138 },
  { month: 'Jun', sales: 67, leads: 158 },
  { month: 'Jul', sales: 63, leads: 145 },
  { month: 'Aug', sales: 71, leads: 162 },
  { month: 'Sep', sales: 58, leads: 140 },
  { month: 'Oct', sales: 64, leads: 150 },
  { month: 'Nov', sales: 69, leads: 155 },
  { month: 'Dec', sales: 75, leads: 168 },
];

export const SalesChart: React.FC<SalesChartProps> = ({
  data = mockData,
  loading = false,
  title = 'Sales & Leads Overview',
  type = 'area',
}) => {
  const theme = useTheme();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ height: 400 }}>
        <CardHeader title={<Skeleton width={200} />} />
        <CardContent>
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: 400 }}>
      <CardHeader 
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
      />
      <CardContent sx={{ height: '100%', pt: 0 }}>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="url(#salesGradient)"
                strokeWidth={2}
                name="Sales"
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke={theme.palette.secondary.main}
                fillOpacity={1}
                fill="url(#leadsGradient)"
                strokeWidth={2}
                name="Leads"
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                name="Sales"
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke={theme.palette.secondary.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: theme.palette.secondary.main, strokeWidth: 2 }}
                name="Leads"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};