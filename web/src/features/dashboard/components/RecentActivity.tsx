import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

interface ActivityItem {
  id: string;
  type: 'sale' | 'lead' | 'message' | 'vehicle';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'info';
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  loading?: boolean;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'sale',
    title: 'Vehicle Sold',
    description: '2023 Honda Civic sold to John Smith',
    timestamp: '2 hours ago',
    status: 'success',
  },
  {
    id: '2',
    type: 'lead',
    title: 'New Lead',
    description: 'Sarah Johnson interested in 2024 Toyota Camry',
    timestamp: '4 hours ago',
    status: 'info',
  },
  {
    id: '3',
    type: 'message',
    title: 'Customer Message',
    description: 'Mike Davis asked about financing options',
    timestamp: '6 hours ago',
    status: 'pending',
  },
  {
    id: '4',
    type: 'vehicle',
    title: 'Vehicle Added',
    description: '2023 Ford F-150 added to inventory',
    timestamp: '8 hours ago',
    status: 'info',
  },
  {
    id: '5',
    type: 'sale',
    title: 'Payment Received',
    description: '$25,000 payment from Lisa Brown',
    timestamp: '1 day ago',
    status: 'success',
  },
];

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = mockActivities,
  loading = false,
}) => {
  const theme = useTheme();

  const getActivityIcon = (type: string) => {
    const iconProps = { fontSize: 'small' as const };
    switch (type) {
      case 'sale':
        return <MoneyIcon {...iconProps} />;
      case 'lead':
        return <PersonIcon {...iconProps} />;
      case 'message':
        return <MessageIcon {...iconProps} />;
      case 'vehicle':
        return <CarIcon {...iconProps} />;
      default:
        return <PersonIcon {...iconProps} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale':
        return theme.palette.success.main;
      case 'lead':
        return theme.palette.info.main;
      case 'message':
        return theme.palette.warning.main;
      case 'vehicle':
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title={<Skeleton width={150} />} />
        <CardContent>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton width="60%" />
                <Skeleton width="80%" />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Recent Activity"
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
      />
      <CardContent sx={{ py: 0 }}>
        <List>
          {activities.map((activity, index) => (
            <ListItem
              key={activity.id}
              sx={{
                px: 0,
                borderBottom: index < activities.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 1,
                },
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: getActivityColor(activity.type) + '20',
                    color: getActivityColor(activity.type),
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {activity.title}
                    </Typography>
                    {activity.status && (
                      <Chip
                        label={activity.status}
                        size="small"
                        color={getStatusColor(activity.status) as any}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.timestamp}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};