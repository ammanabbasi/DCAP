import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  TrendingFlat as TrendFlatIcon,
} from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
  loading = false,
}) => {
  const theme = useTheme();

  const getTrendIcon = (changeValue: number) => {
    if (changeValue > 0) return <TrendUpIcon fontSize="small" />;
    if (changeValue < 0) return <TrendDownIcon fontSize="small" />;
    return <TrendFlatIcon fontSize="small" />;
  };

  const getTrendColor = (changeValue: number) => {
    if (changeValue > 0) return theme.palette.success.main;
    if (changeValue < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={120} sx={{ ml: 1 }} />
          </Box>
          <Skeleton variant="text" width={80} height={40} />
          <Skeleton variant="text" width={100} height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: theme.palette[color].main + '20',
                color: theme.palette[color].main,
                mr: 2,
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {title}
          </Typography>
        </Box>

        {/* Value */}
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: theme.palette[color].main,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>

        {/* Change Indicator */}
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: getTrendColor(change.value),
              }}
            >
              {getTrendIcon(change.value)}
              <Typography
                variant="body2"
                sx={{ 
                  fontWeight: 600,
                  ml: 0.5,
                }}
              >
                {Math.abs(change.value)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              from {change.period}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};