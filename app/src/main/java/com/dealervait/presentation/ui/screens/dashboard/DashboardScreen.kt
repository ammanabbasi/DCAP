// File: presentation/ui/screens/dashboard/DashboardScreen.kt
// Purpose: Material 3 dashboard screen with real-time metrics and navigation
// Dependencies: Compose, Material 3, ViewModel, Charts

package com.dealervait.presentation.ui.screens.dashboard

import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.dealervait.R
import com.dealervait.domain.model.DashboardMetrics
import com.dealervait.domain.model.InventoryAgeMetric
import com.dealervait.domain.model.LeadsStatusMetric
import com.dealervait.presentation.viewmodels.DashboardViewModel
import com.dealervait.presentation.ui.theme.DealerVaitTheme
import java.text.SimpleDateFormat
import java.util.*

/**
 * Dashboard screen showing key business metrics and navigation
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToVehicles: () -> Unit,
    onNavigateToLeads: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val dashboardMetrics by viewModel.dashboardMetrics.collectAsStateWithLifecycle()

    // Handle navigation
    LaunchedEffect(uiState.shouldNavigateToVehicles) {
        if (uiState.shouldNavigateToVehicles) {
            viewModel.clearNavigationFlags()
            onNavigateToVehicles()
        }
    }

    LaunchedEffect(uiState.shouldNavigateToLeads) {
        if (uiState.shouldNavigateToLeads) {
            viewModel.clearNavigationFlags()
            onNavigateToLeads()
        }
    }

    // Main content
    Box(modifier = modifier.fillMaxSize()) {
        Column {
            // App bar
            DashboardTopBar(
                isRefreshing = uiState.isRefreshing,
                lastRefreshTime = viewModel.getLastRefreshTimeFormatted(),
                onRefresh = viewModel::refreshDashboard
            )

            // Content
            if (uiState.isLoading && dashboardMetrics == null) {
                // Initial loading state
                DashboardLoadingContent()
            } else if (dashboardMetrics != null) {
                // Dashboard content with data
                DashboardContent(
                    metrics = dashboardMetrics,
                    isRefreshing = uiState.isRefreshing,
                    onNavigateToVehicles = viewModel::onNavigateToVehicles,
                    onNavigateToLeads = viewModel::onNavigateToLeads,
                    onRefresh = viewModel::refreshDashboard,
                    modifier = Modifier.weight(1f)
                )
            } else {
                // Error state
                DashboardErrorContent(
                    error = uiState.error ?: "No data available",
                    onRetry = viewModel::refreshDashboard,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Error snackbar
        if (uiState.error != null && dashboardMetrics != null) {
            LaunchedEffect(uiState.error) {
                // Show snackbar for errors when we have cached data
            }
        }
    }
}

/**
 * Dashboard top app bar
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DashboardTopBar(
    isRefreshing: Boolean,
    lastRefreshTime: String,
    onRefresh: () -> Unit
) {
    TopAppBar(
        title = {
            Column {
                Text(
                    text = "Dashboard",
                    style = MaterialTheme.typography.headlineSmall
                )
                Text(
                    text = "Last updated: $lastRefreshTime",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        actions = {
            IconButton(
                onClick = onRefresh,
                enabled = !isRefreshing
            ) {
                if (isRefreshing) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Refresh"
                    )
                }
            }
        }
    )
}

/**
 * Main dashboard content with metrics
 */
@Composable
private fun DashboardContent(
    metrics: DashboardMetrics,
    isRefreshing: Boolean,
    onNavigateToVehicles: () -> Unit,
    onNavigateToLeads: () -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Key metrics cards
        item {
            KeyMetricsSection(
                inventoryCount = metrics.inventoryCount,
                crmCount = metrics.crmCount,
                onNavigateToVehicles = onNavigateToVehicles,
                onNavigateToLeads = onNavigateToLeads
            )
        }

        // Inventory age breakdown
        item {
            InventoryAgeSection(
                inventoryAge = metrics.inventoryAge
            )
        }

        // Leads status breakdown
        item {
            LeadsStatusSection(
                leadsStatus = metrics.leadsStatus
            )
        }

        // Quick actions
        item {
            QuickActionsSection(
                onNavigateToVehicles = onNavigateToVehicles,
                onNavigateToLeads = onNavigateToLeads
            )
        }
    }
}

/**
 * Key metrics overview cards
 */
@Composable
private fun KeyMetricsSection(
    inventoryCount: Int,
    crmCount: Int,
    onNavigateToVehicles: () -> Unit,
    onNavigateToLeads: () -> Unit
) {
    Text(
        text = "Overview",
        style = MaterialTheme.typography.headlineSmall,
        fontWeight = FontWeight.Bold
    )

    Spacer(modifier = Modifier.height(8.dp))

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Inventory card
        MetricCard(
            title = "Vehicles",
            value = inventoryCount.toString(),
            icon = Icons.Default.DirectionsCar,
            color = MaterialTheme.colorScheme.primary,
            onClick = onNavigateToVehicles,
            modifier = Modifier.weight(1f)
        )

        // CRM card
        MetricCard(
            title = "Leads",
            value = crmCount.toString(),
            icon = Icons.Default.People,
            color = MaterialTheme.colorScheme.secondary,
            onClick = onNavigateToLeads,
            modifier = Modifier.weight(1f)
        )
    }
}

/**
 * Inventory age breakdown section
 */
@Composable
private fun InventoryAgeSection(
    inventoryAge: List<InventoryAgeMetric>
) {
    if (inventoryAge.isEmpty()) return

    Text(
        text = "Inventory Age",
        style = MaterialTheme.typography.headlineSmall,
        fontWeight = FontWeight.Bold
    )

    Spacer(modifier = Modifier.height(8.dp))

    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(inventoryAge) { ageMetric ->
            InventoryAgeCard(ageMetric = ageMetric)
        }
    }
}

/**
 * Leads status breakdown section
 */
@Composable
private fun LeadsStatusSection(
    leadsStatus: LeadsStatusMetric
) {
    Text(
        text = "Leads Status",
        style = MaterialTheme.typography.headlineSmall,
        fontWeight = FontWeight.Bold
    )

    Spacer(modifier = Modifier.height(8.dp))

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        LeadsStatusCard(
            title = "Awaiting Response",
            count = leadsStatus.awaitingResponse,
            total = leadsStatus.total,
            color = MaterialTheme.colorScheme.error,
            modifier = Modifier.weight(1f)
        )
        
        LeadsStatusCard(
            title = "Responded",
            count = leadsStatus.responded,
            total = leadsStatus.total,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.weight(1f)
        )
        
        LeadsStatusCard(
            title = "Not Responded",
            count = leadsStatus.notResponded,
            total = leadsStatus.total,
            color = MaterialTheme.colorScheme.outline,
            modifier = Modifier.weight(1f)
        )
    }
}

/**
 * Quick actions section
 */
@Composable
private fun QuickActionsSection(
    onNavigateToVehicles: () -> Unit,
    onNavigateToLeads: () -> Unit
) {
    Text(
        text = "Quick Actions",
        style = MaterialTheme.typography.headlineSmall,
        fontWeight = FontWeight.Bold
    )

    Spacer(modifier = Modifier.height(8.dp))

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        ActionButton(
            text = "Add Vehicle",
            icon = Icons.Default.Add,
            onClick = onNavigateToVehicles,
            modifier = Modifier.weight(1f)
        )

        ActionButton(
            text = "Add Lead",
            icon = Icons.Default.PersonAdd,
            onClick = onNavigateToLeads,
            modifier = Modifier.weight(1f)
        )
    }
}

/**
 * Reusable metric card component
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: androidx.compose.ui.graphics.Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier.height(120.dp),
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(32.dp)
            )

            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = color
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

/**
 * Inventory age card
 */
@Composable
private fun InventoryAgeCard(
    ageMetric: InventoryAgeMetric,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.width(160.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = ageMetric.ageBucket,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Total: ${ageMetric.total}",
                style = MaterialTheme.typography.bodyLarge
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "Cash: ${ageMetric.cash}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "Floor Plan: ${ageMetric.floorPlan}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "Consignment: ${ageMetric.consignment}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

/**
 * Leads status card
 */
@Composable
private fun LeadsStatusCard(
    title: String,
    count: Int,
    total: Int,
    color: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = count.toString(),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = color
            )
            
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                maxLines = 2
            )
            
            if (total > 0) {
                Text(
                    text = "${(count * 100 / total)}%",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

/**
 * Action button component
 */
@Composable
private fun ActionButton(
    text: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    FilledTonalButton(
        onClick = onClick,
        modifier = modifier.height(56.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = text)
    }
}

/**
 * Loading state for dashboard
 */
@Composable
private fun DashboardLoadingContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CircularProgressIndicator()
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Loading dashboard...",
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

/**
 * Error state for dashboard
 */
@Composable
private fun DashboardErrorContent(
    error: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Error,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = MaterialTheme.colorScheme.error
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Dashboard Error",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = error,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(onClick = onRetry) {
                Text("Try Again")
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun DashboardScreenPreview() {
    DealerVaitTheme {
        DashboardScreen(
            onNavigateToVehicles = {},
            onNavigateToLeads = {}
        )
    }
}
