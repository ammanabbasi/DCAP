import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useGetLeadsQuery } from '@/store/api/baseApi';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  source: string;
  interestedVehicle?: string;
  budget?: number;
  notes: string;
  createdAt: string;
  lastContact?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const CRMPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [tabValue, setTabValue] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);

  // API hooks
  const { data: leads = [], isLoading, error } = useGetLeadsQuery({ search });

  // Mock data for demonstration
  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      status: 'new',
      source: 'Website',
      interestedVehicle: '2023 Honda Civic',
      budget: 25000,
      notes: 'Interested in financing options',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 234-5678',
      status: 'contacted',
      source: 'Referral',
      interestedVehicle: '2024 Toyota Camry',
      budget: 30000,
      notes: 'Looking for family sedan',
      createdAt: '2024-01-14',
      lastContact: '2024-01-16',
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      phone: '(555) 345-6789',
      status: 'qualified',
      source: 'Facebook Ad',
      interestedVehicle: '2023 Ford F-150',
      budget: 45000,
      notes: 'Pre-approved for financing',
      createdAt: '2024-01-13',
      lastContact: '2024-01-15',
    },
    {
      id: '4',
      name: 'Lisa Brown',
      email: 'lisa.brown@email.com',
      phone: '(555) 456-7890',
      status: 'proposal',
      source: 'Walk-in',
      interestedVehicle: '2022 BMW X5',
      budget: 55000,
      notes: 'Considering trade-in',
      createdAt: '2024-01-12',
      lastContact: '2024-01-14',
    },
  ];

  const displayLeads = leads.length > 0 ? leads : mockLeads;

  const getStatusColor = (status: string) => {
    const statusColors = {
      new: 'info',
      contacted: 'warning',
      qualified: 'primary',
      proposal: 'secondary',
      negotiation: 'warning',
      closed: 'success',
      lost: 'error',
    };
    return statusColors[status as keyof typeof statusColors] || 'default';
  };

  const getLeadsByStatus = (status?: string) => {
    if (!status) return displayLeads;
    return displayLeads.filter(lead => lead.status === status);
  };

  const leadStatuses = [
    { label: 'All Leads', count: displayLeads.length },
    { label: 'New', count: getLeadsByStatus('new').length },
    { label: 'Contacted', count: getLeadsByStatus('contacted').length },
    { label: 'Qualified', count: getLeadsByStatus('qualified').length },
    { label: 'Proposal', count: getLeadsByStatus('proposal').length },
    { label: 'Closed', count: getLeadsByStatus('closed').length },
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              CRM & Lead Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track leads, manage customer relationships, and monitor sales pipeline
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
          >
            Add Lead
          </Button>
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {/* Pipeline Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {leadStatuses.map((status, index) => (
          <Grid item xs={12} sm={6} md={2} key={index}>
            <Card
              sx={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => setTabValue(index)}
            >
              <CardContent>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {status.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {status.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Lead Pipeline */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {leadStatuses.map((status, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {status.label}
                  <Chip size="small" label={status.count} />
                </Box>
              }
            />
          ))}
        </Tabs>

        {leadStatuses.map((status, index) => (
          <TabPanel value={tabValue} index={index} key={index}>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {(index === 0 ? displayLeads : getLeadsByStatus(status.label.toLowerCase())).map((lead) => (
                  <Grid item xs={12} md={6} lg={4} key={lead.id}>
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: (theme) => theme.shadows[8],
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {lead.name}
                              </Typography>
                              <Chip
                                label={lead.status}
                                color={getStatusColor(lead.status) as any}
                                size="small"
                              />
                            </Box>
                          </Box>
                          <IconButton
                            onClick={(e) => handleMenuClick(e, lead)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{lead.email}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{lead.phone}</Typography>
                          </Box>
                        </Box>

                        {lead.interestedVehicle && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Interest:</strong> {lead.interestedVehicle}
                          </Typography>
                        )}

                        {lead.budget && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Budget:</strong> ${lead.budget.toLocaleString()}
                          </Typography>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          <strong>Source:</strong> {lead.source}
                        </Typography>

                        {lead.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            "{lead.notes}"
                          </Typography>
                        )}

                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(lead.createdAt).toLocaleDateString()}
                          </Typography>
                          {lead.lastContact && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Last Contact: {new Date(lead.lastContact).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
        ))}
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <PersonIcon sx={{ mr: 2 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EmailIcon sx={{ mr: 2 }} />
          Send Email
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PhoneIcon sx={{ mr: 2 }} />
          Call Lead
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ScheduleIcon sx={{ mr: 2 }} />
          Schedule Follow-up
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <TrendingUpIcon sx={{ mr: 2 }} />
          Change Status
        </MenuItem>
      </Menu>
    </Box>
  );
};