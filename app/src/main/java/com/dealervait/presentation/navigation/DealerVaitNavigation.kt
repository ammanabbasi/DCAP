// File: presentation/navigation/DealerVaitNavigation.kt
// Purpose: Main navigation component with authentication flow and bottom navigation
// Dependencies: Navigation Compose, Material 3, Authentication

package com.dealervait.presentation.navigation

import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.navigation.*
import androidx.navigation.compose.*
import com.dealervait.R
import com.dealervait.domain.model.User
import com.dealervait.presentation.ui.screens.auth.LoginScreen
import com.dealervait.presentation.ui.screens.dashboard.DashboardScreen
import com.dealervait.presentation.ui.screens.inventory.VehicleListScreen
import com.dealervait.presentation.ui.screens.inventory.AddEditVehicleScreen
import com.dealervait.presentation.ui.screens.crm.LeadListScreen
import com.dealervait.presentation.ui.screens.crm.AddEditLeadScreen
import com.dealervait.presentation.ui.screens.messaging.ConversationListScreen
import com.dealervait.presentation.ui.screens.messaging.ChatScreen
import com.dealervait.presentation.ui.screens.messaging.NewChatScreen

/**
 * Main navigation component for the entire app
 * Handles authentication flow and main app navigation
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DealerVaitNavigation(
    isAuthenticated: Boolean,
    currentUser: User?,
    modifier: Modifier = Modifier
) {
    val navController = rememberNavController()
    
    // Navigation based on authentication status
    LaunchedEffect(isAuthenticated) {
        if (isAuthenticated) {
            navController.navigate(NavRoute.Dashboard.route) {
                popUpTo(NavRoute.Login.route) { inclusive = true }
            }
        } else {
            navController.navigate(NavRoute.Login.route) {
                popUpTo(navController.graph.startDestinationId) { inclusive = true }
            }
        }
    }

    if (isAuthenticated && currentUser != null) {
        // Main app with bottom navigation
        MainAppNavigation(
            navController = navController,
            currentUser = currentUser,
            modifier = modifier
        )
    } else {
        // Authentication flow
        AuthNavigation(
            navController = navController,
            modifier = modifier
        )
    }
}

/**
 * Main app navigation with bottom navigation bar
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainAppNavigation(
    navController: NavHostController,
    currentUser: User,
    modifier: Modifier = Modifier
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    // Determine if bottom bar should be visible
    val showBottomBar = remember(currentDestination?.route) {
        when (currentDestination?.route) {
            NavRoute.Dashboard.route,
            NavRoute.VehicleList.route,
            NavRoute.LeadList.route,
            NavRoute.ConversationList.route,
            NavRoute.Profile.route -> true
            else -> false
        }
    }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                DealerVaitBottomBar(
                    navController = navController,
                    currentDestination = currentDestination
                )
            }
        },
        modifier = modifier
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = NavRoute.Dashboard.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            enterTransition = {
                slideInHorizontally(initialOffsetX = { it }) + fadeIn()
            },
            exitTransition = {
                slideOutHorizontally(targetOffsetX = { -it }) + fadeOut()
            },
            popEnterTransition = {
                slideInHorizontally(initialOffsetX = { -it }) + fadeIn()
            },
            popExitTransition = {
                slideOutHorizontally(targetOffsetX = { it }) + fadeOut()
            }
        ) {
            // Dashboard
            composable(NavRoute.Dashboard.route) {
                DashboardScreen(
                    onNavigateToVehicles = {
                        navController.navigate(NavRoute.VehicleList.route)
                    },
                    onNavigateToLeads = {
                        navController.navigate(NavRoute.LeadList.route)
                    }
                )
            }

            // Vehicle Management
            composable(NavRoute.VehicleList.route) {
                VehicleListScreen(
                    onNavigateToAddVehicle = {
                        navController.navigate(NavRoute.AddVehicle.route)
                    },
                    onNavigateToVehicleDetail = { vehicleId ->
                        navController.navigate(NavRoute.EditVehicle.createRoute(vehicleId))
                    },
                    onNavigateBack = {
                        navController.navigateUp()
                    }
                )
            }

            composable(NavRoute.AddVehicle.route) {
                AddEditVehicleScreen(
                    vehicleId = null,
                    onNavigateBack = {
                        navController.navigateUp()
                    },
                    onVehicleSaved = {
                        navController.navigateUp()
                    }
                )
            }

            composable(
                route = NavRoute.EditVehicle.route,
                arguments = listOf(
                    navArgument("vehicleId") { type = NavType.IntType }
                )
            ) { backStackEntry ->
                val vehicleId = backStackEntry.arguments?.getInt("vehicleId") ?: 0
                AddEditVehicleScreen(
                    vehicleId = vehicleId,
                    onNavigateBack = {
                        navController.navigateUp()
                    },
                    onVehicleSaved = {
                        navController.navigateUp()
                    }
                )
            }

            // CRM Management
            composable(NavRoute.LeadList.route) {
                LeadListScreen(
                    onNavigateToAddLead = {
                        navController.navigate(NavRoute.AddLead.route)
                    },
                    onNavigateToLeadDetail = { leadId ->
                        navController.navigate(NavRoute.EditLead.createRoute(leadId))
                    },
                    onNavigateBack = {
                        navController.navigateUp()
                    }
                )
            }

            composable(NavRoute.AddLead.route) {
                AddEditLeadScreen(
                    leadId = null,
                    onNavigateBack = {
                        navController.navigateUp()
                    },
                    onLeadSaved = {
                        navController.navigateUp()
                    }
                )
            }

            composable(
                route = NavRoute.EditLead.route,
                arguments = listOf(
                    navArgument("leadId") { type = NavType.IntType }
                )
            ) { backStackEntry ->
                val leadId = backStackEntry.arguments?.getInt("leadId") ?: 0
                AddEditLeadScreen(
                    leadId = leadId,
                    onNavigateBack = {
                        navController.navigateUp()
                    },
                    onLeadSaved = {
                        navController.navigateUp()
                    }
                )
            }

            // Messaging
            composable(NavRoute.ConversationList.route) {
                ConversationListScreen(
                    onNavigateToChat = { conversationId ->
                        navController.navigate(NavRoute.Chat.createRoute(conversationId))
                    },
                    onNavigateToNewChat = {
                        navController.navigate(NavRoute.NewChat.route)
                    }
                )
            }

            composable(
                route = NavRoute.Chat.route,
                arguments = listOf(
                    navArgument("conversationId") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val conversationId = backStackEntry.arguments?.getString("conversationId") ?: ""
                ChatScreen(
                    conversationId = conversationId,
                    onNavigateBack = {
                        navController.navigateUp()
                    }
                )
            }

            composable(NavRoute.NewChat.route) {
                NewChatScreen(
                    onNavigateBack = {
                        navController.navigateUp()
                    },
                    onNavigateToChat = { conversationId ->
                        navController.navigate(NavRoute.Chat.createRoute(conversationId)) {
                            popUpTo(NavRoute.ConversationList.route)
                        }
                    }
                )
            }

            // Profile/Settings (placeholder)
            composable(NavRoute.Profile.route) {
                ProfileScreen(
                    currentUser = currentUser,
                    onNavigateBack = {
                        navController.navigateUp()
                    }
                )
            }
        }
    }
}

/**
 * Authentication navigation flow
 */
@Composable
private fun AuthNavigation(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = NavRoute.Login.route,
        modifier = modifier
    ) {
        composable(NavRoute.Login.route) {
            LoginScreen(
                onNavigateToDashboard = {
                    navController.navigate(NavRoute.Dashboard.route) {
                        popUpTo(NavRoute.Login.route) { inclusive = true }
                    }
                },
                onNavigateToForgotPassword = {
                    navController.navigate(NavRoute.ForgotPassword.route)
                },
                onNavigateToSignUp = {
                    navController.navigate(NavRoute.SignUp.route)
                }
            )
        }

        composable(NavRoute.ForgotPassword.route) {
            ForgotPasswordScreen(
                onNavigateBack = {
                    navController.navigateUp()
                }
            )
        }

        composable(NavRoute.SignUp.route) {
            SignUpScreen(
                onNavigateBack = {
                    navController.navigateUp()
                },
                onNavigateToLogin = {
                    navController.navigate(NavRoute.Login.route) {
                        popUpTo(NavRoute.SignUp.route) { inclusive = true }
                    }
                }
            )
        }
    }
}

/**
 * Bottom navigation bar
 */
@Composable
private fun DealerVaitBottomBar(
    navController: NavController,
    currentDestination: NavDestination?
) {
    NavigationBar {
        bottomNavItems.forEach { item ->
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label
                    )
                },
                label = { Text(item.label) },
                selected = currentDestination?.route == item.route,
                onClick = {
                    navController.navigate(item.route) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    }
}

/**
 * Bottom navigation items
 */
private val bottomNavItems = listOf(
    BottomNavItem(
        route = NavRoute.Dashboard.route,
        icon = Icons.Default.Dashboard,
        label = "Dashboard"
    ),
    BottomNavItem(
        route = NavRoute.VehicleList.route,
        icon = Icons.Default.DirectionsCar,
        label = "Vehicles"
    ),
    BottomNavItem(
        route = NavRoute.LeadList.route,
        icon = Icons.Default.People,
        label = "CRM"
    ),
    BottomNavItem(
        route = NavRoute.ConversationList.route,
        icon = Icons.Default.Chat,
        label = "Messages"
    ),
    BottomNavItem(
        route = NavRoute.Profile.route,
        icon = Icons.Default.Person,
        label = "Profile"
    )
)

/**
 * Data class for bottom navigation items
 */
private data class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String
)

/**
 * Navigation routes
 */
sealed class NavRoute(val route: String) {
    // Authentication
    object Login : NavRoute("login")
    object SignUp : NavRoute("sign_up")
    object ForgotPassword : NavRoute("forgot_password")

    // Main App
    object Dashboard : NavRoute("dashboard")
    
    // Vehicle Management
    object VehicleList : NavRoute("vehicles")
    object AddVehicle : NavRoute("add_vehicle")
    object EditVehicle : NavRoute("edit_vehicle/{vehicleId}") {
        fun createRoute(vehicleId: Int) = "edit_vehicle/$vehicleId"
    }

    // CRM
    object LeadList : NavRoute("leads")
    object AddLead : NavRoute("add_lead")
    object EditLead : NavRoute("edit_lead/{leadId}") {
        fun createRoute(leadId: Int) = "edit_lead/$leadId"
    }

    // Messaging
    object ConversationList : NavRoute("conversations")
    object Chat : NavRoute("chat/{conversationId}") {
        fun createRoute(conversationId: String) = "chat/$conversationId"
    }
    object NewChat : NavRoute("new_chat")

    // Profile
    object Profile : NavRoute("profile")
}

/**
 * Placeholder screens for unimplemented features
 */
@Composable
private fun ForgotPasswordScreen(onNavigateBack: () -> Unit) {
    // Placeholder implementation
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("Forgot Password Screen")
        Button(onClick = onNavigateBack) {
            Text("Back")
        }
    }
}

@Composable
private fun SignUpScreen(
    onNavigateBack: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    // Placeholder implementation
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("Sign Up Screen")
        Button(onClick = onNavigateBack) {
            Text("Back")
        }
        Button(onClick = onNavigateToLogin) {
            Text("Go to Login")
        }
    }
}

@Composable
private fun ProfileScreen(
    currentUser: User,
    onNavigateBack: () -> Unit
) {
    // Placeholder implementation
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("Profile Screen")
        Text("User: ${currentUser.displayName}")
        Button(onClick = onNavigateBack) {
            Text("Back")
        }
    }
}
