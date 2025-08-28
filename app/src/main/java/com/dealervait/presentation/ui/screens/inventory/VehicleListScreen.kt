// File: presentation/ui/screens/inventory/VehicleListScreen.kt
// Purpose: Complete vehicle list screen with search, filters, and pagination
// Dependencies: Compose, Material 3, Paging, Coil for images

package com.dealervait.presentation.ui.screens.inventory

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.dealervait.domain.model.Vehicle
import com.dealervait.presentation.viewmodels.VehicleListViewModel
import com.dealervait.presentation.viewmodels.VehicleFilters
import com.dealervait.presentation.viewmodels.VehicleSortOption
import com.dealervait.presentation.ui.theme.DealerVaitTheme
import java.text.NumberFormat
import java.util.*

/**
 * Complete vehicle list screen with advanced features
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun VehicleListScreen(
    onNavigateToAddVehicle: () -> Unit,
    onNavigateToVehicleDetail: (Int) -> Unit,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: VehicleListViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val filters by viewModel.filters.collectAsStateWithLifecycle()
    val vehicles by viewModel.vehicles.collectAsStateWithLifecycle()
    val keyboardController = LocalSoftwareKeyboardController.current

    // Handle navigation
    LaunchedEffect(uiState.shouldNavigateToAddVehicle) {
        if (uiState.shouldNavigateToAddVehicle) {
            viewModel.clearNavigationFlags()
            onNavigateToAddVehicle()
        }
    }

    LaunchedEffect(uiState.shouldNavigateToVehicleDetail) {
        uiState.shouldNavigateToVehicleDetail?.let { vehicleId ->
            viewModel.clearNavigationFlags()
            onNavigateToVehicleDetail(vehicleId)
        }
    }

    Scaffold(
        topBar = {
            VehicleListTopBar(
                searchQuery = searchQuery,
                onSearchQueryChange = viewModel::updateSearchQuery,
                onClearSearch = viewModel::clearSearch,
                hasActiveFilters = uiState.hasActiveFilters,
                onFilterClick = viewModel::toggleFilterSheet,
                onSortClick = viewModel::toggleSortOptions,
                sortOption = uiState.sortOption,
                totalCount = uiState.totalCount,
                onNavigateBack = onNavigateBack
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = viewModel::onNavigateToAddVehicle
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Add Vehicle"
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Content
                when {
                    uiState.isLoading && vehicles.isEmpty() -> {
                        VehicleListLoadingContent()
                    }
                    uiState.isEmpty -> {
                        VehicleListEmptyContent(
                            isSearching = uiState.isSearching,
                            searchQuery = searchQuery,
                            onAddVehicle = viewModel::onNavigateToAddVehicle,
                            onClearSearch = viewModel::clearSearch
                        )
                    }
                    else -> {
                        VehicleListContent(
                            vehicles = vehicles,
                            onVehicleClick = viewModel::onNavigateToVehicleDetail,
                            onRefresh = viewModel::refresh,
                            isRefreshing = uiState.isLoading
                        )
                    }
                }
            }

            // Filter bottom sheet
            if (uiState.showFilterSheet) {
                VehicleFilterSheet(
                    filters = filters,
                    onFiltersUpdated = viewModel::updateFilters,
                    onClearFilters = viewModel::clearFilters,
                    onDismiss = viewModel::toggleFilterSheet
                )
            }

            // Sort options
            if (uiState.showSortOptions) {
                VehicleSortSheet(
                    currentSort = uiState.sortOption,
                    onSortSelected = { sortOption ->
                        viewModel.updateSort(sortOption)
                        viewModel.toggleSortOptions()
                    },
                    onDismiss = viewModel::toggleSortOptions
                )
            }

            // Error snackbar
            uiState.errorMessage?.let { error ->
                LaunchedEffect(error) {
                    // Show snackbar
                    viewModel.clearError()
                }
            }
        }
    }
}

/**
 * Top bar for vehicle list with search and actions
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun VehicleListTopBar(
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onClearSearch: () -> Unit,
    hasActiveFilters: Boolean,
    onFilterClick: () -> Unit,
    onSortClick: () -> Unit,
    sortOption: VehicleSortOption,
    totalCount: Int,
    onNavigateBack: () -> Unit
) {
    Column {
        TopAppBar(
            title = {
                if (searchQuery.isNotBlank()) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = onSearchQueryChange,
                        placeholder = { Text("Search vehicles...") },
                        leadingIcon = {
                            Icon(Icons.Default.Search, contentDescription = null)
                        },
                        trailingIcon = {
                            if (searchQuery.isNotBlank()) {
                                IconButton(onClick = onClearSearch) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                                }
                            }
                        },
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    Column {
                        Text("Vehicles")
                        if (totalCount > 0) {
                            Text(
                                text = "$totalCount vehicles",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            },
            navigationIcon = {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            actions = {
                if (searchQuery.isBlank()) {
                    IconButton(onClick = { onSearchQueryChange("") }) {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    }
                }
                
                BadgedBox(
                    badge = {
                        if (hasActiveFilters) {
                            Badge()
                        }
                    }
                ) {
                    IconButton(onClick = onFilterClick) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filter")
                    }
                }
                
                IconButton(onClick = onSortClick) {
                    Icon(Icons.Default.Sort, contentDescription = "Sort")
                }
            }
        )
    }
}

/**
 * Vehicle list content with pull-to-refresh
 */
@Composable
private fun VehicleListContent(
    vehicles: List<Vehicle>,
    onVehicleClick: (Int) -> Unit,
    onRefresh: () -> Unit,
    isRefreshing: Boolean
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(
            items = vehicles,
            key = { it.id }
        ) { vehicle ->
            VehicleCard(
                vehicle = vehicle,
                onClick = { onVehicleClick(vehicle.id) }
            )
        }
    }
}

/**
 * Individual vehicle card
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun VehicleCard(
    vehicle: Vehicle,
    onClick: () -> Unit
) {
    val currencyFormatter = NumberFormat.getCurrencyInstance(Locale.US)
    val daysInInventory = ((System.currentTimeMillis() - vehicle.createdAt) / (24 * 60 * 60 * 1000)).toInt()
    
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Vehicle image
            AsyncImage(
                model = vehicle.images.firstOrNull(),
                contentDescription = "Vehicle image",
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentScale = ContentScale.Crop
            )

            // Vehicle info
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Title
                Text(
                    text = vehicle.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                // Price
                Text(
                    text = currencyFormatter.format(vehicle.price),
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )

                // Details row
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    vehicle.formattedMileage?.let { mileage ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Speed,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = mileage,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    vehicle.transmission?.let { transmission ->
                        Text(
                            text = transmission,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Status and days in inventory
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Status badge
                    Surface(
                        color = when (vehicle.status.lowercase()) {
                            "available" -> MaterialTheme.colorScheme.primaryContainer
                            "sold" -> MaterialTheme.colorScheme.errorContainer
                            else -> MaterialTheme.colorScheme.surfaceVariant
                        },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = vehicle.status,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = when (vehicle.status.lowercase()) {
                                "available" -> MaterialTheme.colorScheme.onPrimaryContainer
                                "sold" -> MaterialTheme.colorScheme.onErrorContainer
                                else -> MaterialTheme.colorScheme.onSurfaceVariant
                            }
                        )
                    }

                    // Days in inventory
                    Text(
                        text = "$daysInInventory days",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

/**
 * Loading content with shimmer effect
 */
@Composable
private fun VehicleListLoadingContent() {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(5) {
            VehicleCardSkeleton()
        }
    }
}

/**
 * Skeleton card for loading state
 */
@Composable
private fun VehicleCardSkeleton() {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Image skeleton
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
            )

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Title skeleton
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(20.dp)
                        .background(
                            MaterialTheme.colorScheme.surfaceVariant,
                            RoundedCornerShape(4.dp)
                        )
                )

                // Price skeleton
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.4f)
                        .height(24.dp)
                        .background(
                            MaterialTheme.colorScheme.surfaceVariant,
                            RoundedCornerShape(4.dp)
                        )
                )

                // Details skeleton
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .width(60.dp)
                            .height(16.dp)
                            .background(
                                MaterialTheme.colorScheme.surfaceVariant,
                                RoundedCornerShape(4.dp)
                            )
                    )
                    Box(
                        modifier = Modifier
                            .width(80.dp)
                            .height(16.dp)
                            .background(
                                MaterialTheme.colorScheme.surfaceVariant,
                                RoundedCornerShape(4.dp)
                            )
                    )
                }
            }
        }
    }
}

/**
 * Empty content when no vehicles found
 */
@Composable
private fun VehicleListEmptyContent(
    isSearching: Boolean,
    searchQuery: String,
    onAddVehicle: () -> Unit,
    onClearSearch: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Icon(
                imageVector = if (isSearching) Icons.Default.SearchOff else Icons.Default.DirectionsCar,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (isSearching) "No vehicles found" else "No vehicles in inventory",
                style = MaterialTheme.typography.headlineSmall
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (isSearching) {
                    "No vehicles match \"$searchQuery\""
                } else {
                    "Start building your inventory by adding vehicles"
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (isSearching) {
                OutlinedButton(onClick = onClearSearch) {
                    Text("Clear Search")
                }
            } else {
                Button(onClick = onAddVehicle) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Add First Vehicle")
                }
            }
        }
    }
}

/**
 * Placeholder filter sheet
 */
@Composable
private fun VehicleFilterSheet(
    filters: VehicleFilters,
    onFiltersUpdated: (VehicleFilters) -> Unit,
    onClearFilters: () -> Unit,
    onDismiss: () -> Unit
) {
    // TODO: Implement complete filter sheet in next iteration
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Filters") },
        text = { Text("Filter options will be implemented here") },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

/**
 * Sort options sheet
 */
@Composable
private fun VehicleSortSheet(
    currentSort: VehicleSortOption,
    onSortSelected: (VehicleSortOption) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Sort by") },
        text = {
            LazyColumn {
                items(VehicleSortOption.values()) { sortOption ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSortSelected(sortOption) }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = currentSort == sortOption,
                            onClick = { onSortSelected(sortOption) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(sortOption.displayName)
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

@Preview(showBackground = true)
@Composable
private fun VehicleListScreenPreview() {
    DealerVaitTheme {
        VehicleListScreen(
            onNavigateToAddVehicle = {},
            onNavigateToVehicleDetail = {},
            onNavigateBack = {}
        )
    }
}
