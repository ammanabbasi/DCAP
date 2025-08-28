// File: presentation/ui/activities/MainActivity.kt
// Purpose: Single activity with navigation setup and authentication flow
// Dependencies: Navigation, Compose, Hilt, Edge-to-edge

package com.dealervait.presentation.ui.activities

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.dealervait.presentation.navigation.DealerVaitNavigation
import com.dealervait.presentation.ui.theme.DealerVaitTheme
import com.dealervait.presentation.viewmodels.AuthViewModel
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

/**
 * Main activity for the application
 * Uses single activity architecture with Jetpack Compose navigation
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // Install splash screen before calling super.onCreate()
        val splashScreen = installSplashScreen()
        
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge display
        enableEdgeToEdge()
        
        Timber.d("MainActivity created")
        
        setContent {
            val authViewModel: AuthViewModel = hiltViewModel()
            val isAuthenticated by authViewModel.isAuthenticated.collectAsStateWithLifecycle()
            val currentUser by authViewModel.currentUser.collectAsStateWithLifecycle()
            
            // Keep splash screen until authentication status is determined
            var isReady by remember { mutableStateOf(false) }
            
            LaunchedEffect(isAuthenticated) {
                // Small delay to ensure smooth transition
                kotlinx.coroutines.delay(500)
                isReady = true
            }
            
            splashScreen.setKeepOnScreenCondition { !isReady }
            
            DealerVaitTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    if (isReady) {
                        DealerVaitNavigation(
                            isAuthenticated = isAuthenticated,
                            currentUser = currentUser
                        )
                    }
                }
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        Timber.d("MainActivity resumed")
    }
    
    override fun onPause() {
        super.onPause()
        Timber.d("MainActivity paused")
    }
}
