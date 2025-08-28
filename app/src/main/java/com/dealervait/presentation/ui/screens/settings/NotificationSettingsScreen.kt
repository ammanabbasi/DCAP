// File: presentation/ui/screens/settings/NotificationSettingsScreen.kt
// Purpose: Detailed notification preferences screen
// Dependencies: Compose, Material 3, notification channels

package com.dealervait.presentation.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.dealervait.presentation.ui.theme.DealerVaitTheme

/**
 * Notification settings screen with granular control
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationSettingsScreen(
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Notification preferences state - in real implementation from ViewModel/DataStore
    var masterNotificationsEnabled by remember { mutableStateOf(true) }
    var newLeadsEnabled by remember { mutableStateOf(true) }
    var messagesEnabled by remember { mutableStateOf(true) }
    var vehicleUpdatesEnabled by remember { mutableStateOf(true) }
    var documentsEnabled by remember { mutableStateOf(false) }
    var systemAlertsEnabled by remember { mutableStateOf(true) }
    var remindersEnabled by remember { mutableStateOf(true) }

    // Sound and vibration preferences
    var soundEnabled by remember { mutableStateOf(true) }
    var vibrationEnabled by remember { mutableStateOf(true) }
    var ledEnabled by remember { mutableStateOf(false) }

    // Email preferences
    var emailNotificationsEnabled by remember { mutableStateOf(true) }
    var dailySummaryEnabled by remember { mutableStateOf(false) }
    var weeklyReportEnabled by remember { mutableStateOf(true) }

    // Quiet hours
    var quietHoursEnabled by remember { mutableStateOf(false) }
    var quietStartTime by remember { mutableStateOf("22:00") }
    var quietEndTime by remember { mutableStateOf("07:00") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notification Settings") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(vertical = 8.dp)
        ) {
            // Master toggle
            item {
                NotificationSection(title = "Notifications") {
                    NotificationToggleItem(
                        icon = Icons.Default.Notifications,
                        title = "Enable Notifications",
                        subtitle = "Turn on/off all notifications",
                        checked = masterNotificationsEnabled,
                        onCheckedChange = { masterNotificationsEnabled = it },
                        prominent = true
                    )
                }
            }

            // Individual notification types
            if (masterNotificationsEnabled) {
                item {
                    NotificationSection(title = "Notification Types") {
                        NotificationToggleItem(
                            icon = Icons.Default.PersonAdd,
                            title = "New Leads",
                            subtitle = "When new customer leads are received",
                            checked = newLeadsEnabled,
                            onCheckedChange = { newLeadsEnabled = it }
                        )

                        NotificationToggleItem(
                            icon = Icons.Default.Message,
                            title = "Messages",
                            subtitle = "Team messages and conversations",
                            checked = messagesEnabled,
                            onCheckedChange = { messagesEnabled = it }
                        )

                        NotificationToggleItem(
                            icon = Icons.Default.CarRental,
                            title = "Vehicle Updates",
                            subtitle = "Vehicle sales and price changes",
                            checked = vehicleUpdatesEnabled,
                            onCheckedChange = { vehicleUpdatesEnabled = it }
                        )

                        NotificationToggleItem(
                            icon = Icons.Default.Description,
                            title = "Documents",
                            subtitle = "Document uploads and sharing",
                            checked = documentsEnabled,
                            onCheckedChange = { documentsEnabled = it }
                        )

                        NotificationToggleItem(
                            icon = Icons.Default.Alarm,
                            title = "Reminders",
                            subtitle = "Appointments and follow-ups",
                            checked = remindersEnabled,
                            onCheckedChange = { remindersEnabled = it }
                        )

                        NotificationToggleItem(
                            icon = Icons.Default.Warning,
                            title = "System Alerts",
                            subtitle = "Important system notifications",
                            checked = systemAlertsEnabled,
                            onCheckedChange = { systemAlertsEnabled = it }
                        )
                    }
                }

                // Sound and vibration
                item {
                    NotificationSection(title = "Sound & Vibration") {
                        NotificationToggleItem(
                            icon = Icons.Default.VolumeUp,
                            title = "Sound",
                            subtitle = "Play notification sounds",
                            checked = soundEnabled,
                            onCheckedChange = { soundEnabled = it }
                        )

                        NotificationToggleItem(
                            icon = Icons.Default.Vibration,
                            title = "Vibration",
                            subtitle = "Vibrate for notifications",
                            checked = vibrationEnabled,
                            onCheckedChange = { vibrationEnabled = it }
                        )

                        NotificationToggleItem(
                            icon = Icons.Default.Light,
                            title = "LED Light",
                            subtitle = "Flash LED for notifications",
                            checked = ledEnabled,
                            onCheckedChange = { ledEnabled = it }
                        )
                    }
                }

                // Quiet hours
                item {
                    NotificationSection(title = "Quiet Hours") {
                        NotificationToggleItem(
                            icon = Icons.Default.DoNotDisturb,
                            title = "Enable Quiet Hours",
                            subtitle = "Silence notifications during specific times",
                            checked = quietHoursEnabled,
                            onCheckedChange = { quietHoursEnabled = it }
                        )

                        if (quietHoursEnabled) {
                            QuietHoursSettings(
                                startTime = quietStartTime,
                                endTime = quietEndTime,
                                onStartTimeChange = { quietStartTime = it },
                                onEndTimeChange = { quietEndTime = it }
                            )
                        }
                    }
                }
            }

            // Email notifications
            item {
                NotificationSection(title = "Email Notifications") {
                    NotificationToggleItem(
                        icon = Icons.Default.Email,
                        title = "Email Notifications",
                        subtitle = "Receive notifications via email",
                        checked = emailNotificationsEnabled,
                        onCheckedChange = { emailNotificationsEnabled = it }
                    )

                    if (emailNotificationsEnabled) {
                        NotificationToggleItem(
                            icon = Icons.Default.Today,
                            title = "Daily Summary",
                            subtitle = "Daily activity summary email",
                            checked = dailySummaryEnabled,
                            onCheckedChange = { dailySummaryEnabled = it }
                        )

                        NotificationToggleItem(
                            icon = Icons.Default.DateRange,
                            title = "Weekly Report",
                            subtitle = "Weekly performance report email",
                            checked = weeklyReportEnabled,
                            onCheckedChange = { weeklyReportEnabled = it }
                        )
                    }
                }
            }

            // Advanced settings
            item {
                NotificationSection(title = "Advanced") {
                    NotificationItem(
                        icon = Icons.Default.Apps,
                        title = "System Settings",
                        subtitle = "Open system notification settings",
                        onClick = { /* Open system settings */ }
                    )

                    NotificationItem(
                        icon = Icons.Default.History,
                        title = "Notification History",
                        subtitle = "View recent notifications",
                        onClick = { /* Open notification history */ }
                    )

                    NotificationItem(
                        icon = Icons.Default.TestTube,
                        title = "Test Notification",
                        subtitle = "Send a test notification",
                        onClick = { /* Send test notification */ }
                    )
                }
            }

            // Add some bottom spacing
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

/**
 * Notification section with title and content
 */
@Composable
private fun NotificationSection(
    title: String,
    content: @Composable () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            content()
        }
    }
}

/**
 * Notification item with toggle
 */
@Composable
private fun NotificationToggleItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    prominent: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(24.dp),
            tint = if (prominent && checked) 
                MaterialTheme.colorScheme.primary 
            else 
                MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.width(16.dp))

        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = if (prominent) 
                    MaterialTheme.typography.titleMedium 
                else 
                    MaterialTheme.typography.bodyLarge,
                fontWeight = if (prominent) FontWeight.Bold else FontWeight.Normal
            )

            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

/**
 * Clickable notification item
 */
@Composable
private fun NotificationItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.width(16.dp))

        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge
            )

            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            modifier = Modifier.size(20.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

/**
 * Quiet hours time selection
 */
@Composable
private fun QuietHoursSettings(
    startTime: String,
    endTime: String,
    onStartTimeChange: (String) -> Unit,
    onEndTimeChange: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "From",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                OutlinedButton(
                    onClick = { /* Show time picker for start time */ },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(startTime)
                }
            }

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "To",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                OutlinedButton(
                    onClick = { /* Show time picker for end time */ },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(endTime)
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Notifications will be silenced from $startTime to $endTime",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun NotificationSettingsScreenPreview() {
    DealerVaitTheme {
        NotificationSettingsScreen(
            onNavigateBack = {}
        )
    }
}
