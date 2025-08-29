import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useGetDashboardStatsQuery } from '@/store/api/baseApi';
import { KPICard } from '../components/KPICard';
import { SalesChart } from '../components/SalesChart';
import { RecentActivity } from '../components/RecentActivity';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading, error } = useGetDashboardStatsQuery();

  // Mock data for demonstration
  const mockStats = {
    totalVehicles: 142,
    activeLeads: 23,
    monthlySales: 18,
    revenue: 450000,
    changes: {
      vehicles: 5.2,
      leads: -2.1,
      sales: 12.8,
      revenue: 8.4,
    },
  };

  const kpiData = [
    {
      title: 'Total Vehicles',
      value: stats?.totalVehicles || mockStats.totalVehicles,
      change: { value: stats?.changes?.vehicles || mockStats.changes.vehicles, period: 'last month' },
      icon: <CarIcon />,
      color: 'primary' as const,
    },
    {
      title: 'Active Leads',
      value: stats?.activeLeads || mockStats.activeLeads,
      change: { value: stats?.changes?.leads || mockStats.changes.leads, period: 'last month' },
      icon: <PeopleIcon />,
      color: 'secondary' as const,
    },
    {
      title: 'Monthly Sales',
      value: stats?.monthlySales || mockStats.monthlySales,
      change: { value: stats?.changes?.sales || mockStats.changes.sales, period: 'last month' },
      icon: <TrendingUpIcon />,
      color: 'success' as const,
    },
    {
      title: 'Revenue',
      value: `$${((stats?.revenue || mockStats.revenue) / 1000).toFixed(0)}K`,
      change: { value: stats?.changes?.revenue || mockStats.changes.revenue, period: 'last month' },
      icon: <MoneyIcon />,
      color: 'warning' as const,
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your dealership today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <KPICard
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              icon={kpi.icon}
              color={kpi.color}
              loading={statsLoading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts and Activity */}
      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <SalesChart loading={statsLoading} />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <RecentActivity loading={statsLoading} />
        </Grid>
      </Grid>

      {/* Additional Analytics Row */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Performance Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Performance Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Conversion Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    12.4%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +2.1%
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Avg. Deal Size
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $25,000
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +$1,200
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Response Time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    2.3 hrs
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    +0.5 hrs
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.action.hover,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              >
                <Typography variant="subtitle2">Add New Vehicle</Typography>
                <Typography variant="body2" color="text.secondary">
                  Add a new vehicle to your inventory
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.action.hover,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              >
                <Typography variant="subtitle2">Create Lead</Typography>
                <Typography variant="body2" color="text.secondary">
                  Add a new customer lead
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.action.hover,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              >
                <Typography variant="subtitle2">View Reports</Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate sales and performance reports
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};