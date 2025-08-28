// File: presentation/ui/theme/Theme.kt
// Purpose: Material 3 theme configuration for DealerVait app
// Dependencies: Material 3, Dynamic theming

package com.dealervait.presentation.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

/**
 * Light color scheme for DealerVait theme
 */
private val LightColorScheme = lightColorScheme(
    primary = androidx.compose.ui.graphics.Color(0xFF1976D2),
    onPrimary = androidx.compose.ui.graphics.Color(0xFFFFFFFF),
    primaryContainer = androidx.compose.ui.graphics.Color(0xFFE3F2FD),
    onPrimaryContainer = androidx.compose.ui.graphics.Color(0xFF0D47A1),
    
    secondary = androidx.compose.ui.graphics.Color(0xFF43A047),
    onSecondary = androidx.compose.ui.graphics.Color(0xFFFFFFFF),
    secondaryContainer = androidx.compose.ui.graphics.Color(0xFFE8F5E8),
    onSecondaryContainer = androidx.compose.ui.graphics.Color(0xFF1B5E20),
    
    tertiary = androidx.compose.ui.graphics.Color(0xFFFF9800),
    onTertiary = androidx.compose.ui.graphics.Color(0xFFFFFFFF),
    tertiaryContainer = androidx.compose.ui.graphics.Color(0xFFFFF3E0),
    onTertiaryContainer = androidx.compose.ui.graphics.Color(0xFFE65100),
    
    error = androidx.compose.ui.graphics.Color(0xFFD32F2F),
    onError = androidx.compose.ui.graphics.Color(0xFFFFFFFF),
    errorContainer = androidx.compose.ui.graphics.Color(0xFFFFEBEE),
    onErrorContainer = androidx.compose.ui.graphics.Color(0xFFB71C1C),
    
    background = androidx.compose.ui.graphics.Color(0xFFFAFAFA),
    onBackground = androidx.compose.ui.graphics.Color(0xFF1C1C1C),
    surface = androidx.compose.ui.graphics.Color(0xFFFFFFFF),
    onSurface = androidx.compose.ui.graphics.Color(0xFF1C1C1C),
    surfaceVariant = androidx.compose.ui.graphics.Color(0xFFF5F5F5),
    onSurfaceVariant = androidx.compose.ui.graphics.Color(0xFF424242),
    
    outline = androidx.compose.ui.graphics.Color(0xFF757575),
    outlineVariant = androidx.compose.ui.graphics.Color(0xFFBDBDBD)
)

/**
 * Dark color scheme for DealerVait theme
 */
private val DarkColorScheme = darkColorScheme(
    primary = androidx.compose.ui.graphics.Color(0xFF64B5F6),
    onPrimary = androidx.compose.ui.graphics.Color(0xFF0D47A1),
    primaryContainer = androidx.compose.ui.graphics.Color(0xFF1565C0),
    onPrimaryContainer = androidx.compose.ui.graphics.Color(0xFFE3F2FD),
    
    secondary = androidx.compose.ui.graphics.Color(0xFF81C784),
    onSecondary = androidx.compose.ui.graphics.Color(0xFF1B5E20),
    secondaryContainer = androidx.compose.ui.graphics.Color(0xFF2E7D32),
    onSecondaryContainer = androidx.compose.ui.graphics.Color(0xFFE8F5E8),
    
    tertiary = androidx.compose.ui.graphics.Color(0xFFFFB74D),
    onTertiary = androidx.compose.ui.graphics.Color(0xFFE65100),
    tertiaryContainer = androidx.compose.ui.graphics.Color(0xFFF57C00),
    onTertiaryContainer = androidx.compose.ui.graphics.Color(0xFFFFF3E0),
    
    error = androidx.compose.ui.graphics.Color(0xFFEF5350),
    onError = androidx.compose.ui.graphics.Color(0xFFB71C1C),
    errorContainer = androidx.compose.ui.graphics.Color(0xFFD32F2F),
    onErrorContainer = androidx.compose.ui.graphics.Color(0xFFFFEBEE),
    
    background = androidx.compose.ui.graphics.Color(0xFF121212),
    onBackground = androidx.compose.ui.graphics.Color(0xFFE0E0E0),
    surface = androidx.compose.ui.graphics.Color(0xFF1E1E1E),
    onSurface = androidx.compose.ui.graphics.Color(0xFFE0E0E0),
    surfaceVariant = androidx.compose.ui.graphics.Color(0xFF2C2C2C),
    onSurfaceVariant = androidx.compose.ui.graphics.Color(0xFFBDBDBD),
    
    outline = androidx.compose.ui.graphics.Color(0xFF757575),
    outlineVariant = androidx.compose.ui.graphics.Color(0xFF424242)
)

/**
 * Main theme composable for DealerVait app
 */
@Composable
fun DealerVaitTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
