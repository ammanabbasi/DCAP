// File: presentation/ui/screens/settings/SettingsScreen.kt
// Purpose: Comprehensive settings screen with user preferences and configuration
// Dependencies: Compose, Material 3, DataStore preferences

package com.dealervait.presentation.ui.screens.settings

import androidx.biometric.BiometricManager
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.dealervait.BuildConfig
import com.dealervait.presentation.ui.theme.DealerVaitTheme

/**
 * Comprehensive settings screen with all user preferences
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToNotificationSettings: () -> Unit = {},
    onNavigateToSecuritySettings: () -> Unit = {},
    onNavigateToAbout: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var showLogoutDialog by remember { mutableStateOf(false) }
    var showClearCacheDialog by remember { mutableStateOf(false) }
    var showDeleteAccountDialog by remember { mutableStateOf(false) }

    // Settings state - in real implementation these would come from DataStore/ViewModel
    var isDarkMode by remember { mutableStateOf(false) }
    var isAutoSync by remember { mutableStateOf(true) }
    var isWifiOnlySync by remember { mutableStateOf(false) }
    var isAnalyticsEnabled by remember { mutableStateOf(true) }
    var isBiometricEnabled by remember { mutableStateOf(false) }

    // Check biometric availability
    val biometricManager = BiometricManager.from(context)
    val biometricSupported = biometricManager.canAuthenticate(
        BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.BIOMETRIC_WEAK
    ) == BiometricManager.BIOMETRIC_SUCCESS

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
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
            // Account section
            item {
                SettingsSection(title = "Account") {
                    SettingsItem(
                        icon = Icons.Default.Person,
                        title = "Profile",
                        subtitle = "Manage your profile information",
                        onClick = { /* Navigate to profile */ }
                    )

                    SettingsItem(
                        icon = Icons.Default.Business,
                        title = "Dealership",
                        subtitle = "Switch between dealerships",
                        onClick = { /* Navigate to dealership selection */ }
                    )

                    SettingsItem(
                        icon = Icons.Default.Key,
                        title = "Change Password",
                        subtitle = "Update your account password",
                        onClick = { /* Navigate to change password */ }
                    )
                }
            }

            // Security section
            item {
                SettingsSection(title = "Security") {
                    if (biometricSupported) {
                        SettingsToggleItem(
                            icon = Icons.Default.Fingerprint,
                            title = "Biometric Authentication",
                            subtitle = "Use fingerprint or face unlock",
                            checked = isBiometricEnabled,
                            onCheckedChange = { isBiometricEnabled = it }
                        )
                    }

                    SettingsItem(
                        icon = Icons.Default.Security,
                        title = "Security Settings",
                        subtitle = "Advanced security options",
                        onClick = onNavigateToSecuritySettings
                    )

                    SettingsItem(
                        icon = Icons.Default.History,
                        title = "Session Management",
                        subtitle = "Manage active sessions",
                        onClick = { /* Navigate to session management */ }
                    )
                }
            }

            // Appearance section
            item {
                SettingsSection(title = "Appearance") {
                    SettingsToggleItem(
                        icon = Icons.Default.DarkMode,
                        title = "Dark Mode",
                        subtitle = "Use dark theme",
                        checked = isDarkMode,
                        onCheckedChange = { isDarkMode = it }
                    )

                    SettingsItem(
                        icon = Icons.Default.Language,
                        title = "Language",
                        subtitle = "English (US)",
                        onClick = { /* Navigate to language selection */ }
                    )

                    SettingsItem(
                        icon = Icons.Default.Palette,
                        title = "Theme",
                        subtitle = "Customize app appearance",
                        onClick = { /* Navigate to theme selection */ }
                    )
                }
            }

            // Notifications section
            item {
                SettingsSection(title = "Notifications") {
                    SettingsItem(
                        icon = Icons.Default.Notifications,
                        title = "Notification Settings",
                        subtitle = "Manage notification preferences",
                        onClick = onNavigateToNotificationSettings
                    )

                    SettingsItem(
                        icon = Icons.Default.Schedule,
                        title = "Quiet Hours",
                        subtitle = "Set do not disturb schedule",
                        onClick = { /* Navigate to quiet hours */ }
                    )
                }
            }

            // Sync & Data section
            item {
                SettingsSection(title = "Sync & Data") {
                    SettingsToggleItem(
                        icon = Icons.Default.Sync,
                        title = "Auto Sync",
                        subtitle = "Automatically sync data",
                        checked = isAutoSync,
                        onCheckedChange = { isAutoSync = it }
                    )

                    SettingsToggleItem(
                        icon = Icons.Default.Wifi,
                        title = "WiFi Only Sync",
                        subtitle = "Only sync when connected to WiFi",
                        checked = isWifiOnlySync,
                        onCheckedChange = { isWifiOnlySync = it },
                        enabled = isAutoSync
                    )

                    SettingsItem(
                        icon = Icons.Default.Storage,
                        title = "Storage Usage",
                        subtitle = "View app storage usage",
                        onClick = { /* Navigate to storage usage */ }
                    )

                    SettingsItem(
                        icon = Icons.Default.CloudDownload,
                        title = "Backup & Restore",
                        subtitle = "Manage data backups",
                        onClick = { /* Navigate to backup settings */ }
                    )
                }
            }

            // Privacy section
            item {
                SettingsSection(title = "Privacy") {
                    SettingsToggleItem(
                        icon = Icons.Default.Analytics,
                        title = "Usage Analytics",
                        subtitle = "Help improve the app",
                        checked = isAnalyticsEnabled,
                        onCheckedChange = { isAnalyticsEnabled = it }
                    )

                    SettingsItem(
                        icon = Icons.Default.PrivacyTip,
                        title = "Privacy Policy",
                        subtitle = "View our privacy policy",
                        onClick = { /* Open privacy policy */ }
                    )

                    SettingsItem(
                        icon = Icons.Default.Article,
                        title = "Terms of Service",
                        subtitle = "View terms and conditions",
                        onClick = { /* Open terms of service */ }
                    )
                }
            }

            // Advanced section
            item {
                SettingsSection(title = "Advanced") {
                    SettingsItem(
                        icon = Icons.Default.DeveloperMode,
                        title = "Developer Options",
                        subtitle = "Advanced debugging options",
                        onClick = { /* Navigate to developer options */ },
                        enabled = BuildConfig.DEBUG
                    )

                    SettingsItem(
                        icon = Icons.Default.BugReport,
                        title = "Report Issue",
                        subtitle = "Send feedback or report bugs",
                        onClick = { /* Navigate to bug report */ }
                    )

                    SettingsItem(
                        icon = Icons.Default.DeleteSweep,
                        title = "Clear Cache",
                        subtitle = "Free up storage space",
                        onClick = { showClearCacheDialog = true }
                    )
                }
            }

            // Support section
            item {
                SettingsSection(title = "Support") {
                    SettingsItem(
                        icon = Icons.Default.Help,
                        title = "Help & FAQ",
                        subtitle = "Get help and answers",
                        onClick = { /* Navigate to help */ }
                    )

                    SettingsItem(
                        icon = Icons.Default.ContactSupport,
                        title = "Contact Support",
                        subtitle = "Get in touch with our team",
                        onClick = { /* Navigate to contact support */ }
                    )

                    SettingsItem(
                        icon = Icons.Default.Info,
                        title = "About",
                        subtitle = "App version and information",
                        onClick = onNavigateToAbout
                    )
                }
            }

            // Danger zone section
            item {
                SettingsSection(
                    title = "Danger Zone",
                    titleColor = MaterialTheme.colorScheme.error
                ) {
                    SettingsItem(
                        icon = Icons.Default.Logout,
                        title = "Sign Out",
                        subtitle = "Sign out of your account",
                        onClick = { showLogoutDialog = true },
                        titleColor = MaterialTheme.colorScheme.error
                    )

                    SettingsItem(
                        icon = Icons.Default.DeleteForever,
                        title = "Delete Account",
                        subtitle = "Permanently delete your account",
                        onClick = { showDeleteAccountDialog = true },
                        titleColor = MaterialTheme.colorScheme.error
                    )
                }
            }

            // Add some bottom spacing
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        // Dialogs
        if (showLogoutDialog) {
            ConfirmationDialog(
                title = "Sign Out",
                message = "Are you sure you want to sign out?",
                confirmText = "Sign Out",
                onConfirm = {
                    showLogoutDialog = false
                    // Handle logout
                },
                onDismiss = { showLogoutDialog = false }
            )
        }

        if (showClearCacheDialog) {
            ConfirmationDialog(
                title = "Clear Cache",
                message = "This will free up storage space but may slow down the app temporarily.",
                confirmText = "Clear",
                onConfirm = {
                    showClearCacheDialog = false
                    // Handle clear cache
                },
                onDismiss = { showClearCacheDialog = false }
            )
        }

        if (showDeleteAccountDialog) {
            ConfirmationDialog(
                title = "Delete Account",
                message = "This action cannot be undone. All your data will be permanently deleted.",
                confirmText = "Delete Account",
                confirmColor = MaterialTheme.colorScheme.error,
                onConfirm = {
                    showDeleteAccountDialog = false
                    // Handle account deletion
                },
                onDismiss = { showDeleteAccountDialog = false }
            )
        }
    }
}

/**
 * Settings section with title and content
 */
@Composable
private fun SettingsSection(
    title: String,
    titleColor: Color = MaterialTheme.colorScheme.primary,
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
            color = titleColor,
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
 * Individual settings item
 */
@Composable
private fun SettingsItem(
    icon: ImageVector,
    title: String,
    subtitle: String? = null,
    titleColor: Color = MaterialTheme.colorScheme.onSurface,
    onClick: () -> Unit,
    enabled: Boolean = true,
    trailingContent: @Composable (() -> Unit)? = null
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = enabled, onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(24.dp),
            tint = if (enabled) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
        )

        Spacer(modifier = Modifier.width(16.dp))

        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = if (enabled) titleColor else titleColor.copy(alpha = 0.38f)
            )

            subtitle?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (enabled) 
                        MaterialTheme.colorScheme.onSurfaceVariant 
                    else 
                        MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.38f)
                )
            }
        }

        trailingContent?.invoke() ?: run {
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                modifier = Modifier.size(20.dp),
                tint = if (enabled) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.38f)
            )
        }
    }
}

/**
 * Settings item with toggle switch
 */
@Composable
private fun SettingsToggleItem(
    icon: ImageVector,
    title: String,
    subtitle: String? = null,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    enabled: Boolean = true
) {
    SettingsItem(
        icon = icon,
        title = title,
        subtitle = subtitle,
        onClick = { onCheckedChange(!checked) },
        enabled = enabled,
        trailingContent = {
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                enabled = enabled
            )
        }
    )
}

/**
 * Confirmation dialog for destructive actions
 */
@Composable
private fun ConfirmationDialog(
    title: String,
    message: String,
    confirmText: String,
    confirmColor: Color = MaterialTheme.colorScheme.primary,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error
            )
        },
        title = { Text(title) },
        text = { Text(message) },
        confirmButton = {
            TextButton(
                onClick = onConfirm,
                colors = ButtonDefaults.textButtonColors(contentColor = confirmColor)
            ) {
                Text(confirmText)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Preview(showBackground = true)
@Composable
private fun SettingsScreenPreview() {
    DealerVaitTheme {
        SettingsScreen(
            onNavigateBack = {}
        )
    }
}
