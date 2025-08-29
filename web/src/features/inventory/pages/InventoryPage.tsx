import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useGetVehiclesQuery, useDeleteVehicleMutation } from '@/store/api/baseApi';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  status: 'available' | 'sold' | 'pending';
  images: string[];
  vin: string;
  createdAt: string;
}

export const InventoryPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // API hooks
  const { data: vehicles = [], isLoading, error } = useGetVehiclesQuery({ search });
  const [deleteVehicle] = useDeleteVehicleMutation();

  // Mock data for demonstration
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      price: 25000,
      mileage: 15000,
      status: 'available',
      images: ['https://via.placeholder.com/300x200'],
      vin: '1HGCM82633A123456',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      price: 28000,
      mileage: 22000,
      status: 'pending',
      images: ['https://via.placeholder.com/300x200'],
      vin: '4T1BF1FK2DU123456',
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      make: 'Ford',
      model: 'F-150',
      year: 2023,
      price: 45000,
      mileage: 8000,
      status: 'available',
      images: ['https://via.placeholder.com/300x200'],
      vin: '1FTPW14V8TK123456',
      createdAt: '2024-01-08',
    },
  ];

  const displayVehicles = vehicles.length > 0 ? vehicles : mockVehicles;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, vehicle: Vehicle) => {
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedVehicle) {
      try {
        await deleteVehicle(selectedVehicle.id).unwrap();
        setDeleteDialogOpen(false);
        setSelectedVehicle(null);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'sold':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'vehicle',
      headerName: 'Vehicle',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {params.row.year} {params.row.make} {params.row.model}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            VIN: {params.row.vin}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          ${params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'mileage',
      headerName: 'Mileage',
      width: 120,
      renderCell: (params) => `${params.value.toLocaleString()} mi`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Added',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => {/* Handle view */}}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => {/* Handle edit */}}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setSelectedVehicle(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton width={200} height={40} />
          <Skeleton width={300} height={20} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton width="80%" />
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Inventory Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your vehicle inventory and track availability
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            sx={{ ml: 2 }}
          >
            Add Vehicle
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search vehicles..."
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
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
        </Box>
      </Box>

      {/* Content */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {displayVehicles.map((vehicle) => (
            <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.shadows[8],
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height={200}
                  image={vehicle.images[0] || 'https://via.placeholder.com/300x200'}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3" fontWeight={600}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Typography>
                    <Chip
                      label={vehicle.status}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                    ${vehicle.price.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {vehicle.mileage.toLocaleString()} miles • VIN: {vehicle.vin}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'between' }}>
                  <Button size="small" startIcon={<ViewIcon />}>
                    View Details
                  </Button>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, vehicle)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <DataGrid
            rows={displayVehicles}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.paper',
                borderBottom: `1px solid divider`,
              },
            }}
          />
        </Card>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon sx={{ mr: 2 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 2 }} />
          Edit Vehicle
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 2 }} />
          Delete Vehicle
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Vehicle</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this vehicle? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};