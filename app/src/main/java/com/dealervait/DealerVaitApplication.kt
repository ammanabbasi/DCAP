// File: DealerVaitApplication.kt
// Purpose: Main application class with Hilt setup and initialization
// Dependencies: Hilt, Timber

package com.dealervait

import android.app.Application
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

/**
 * Main application class for DealerVait
 * Initializes Hilt dependency injection and global configurations
 */
@HiltAndroidApp
class DealerVaitApplication : Application(), Configuration.Provider {

    override fun onCreate() {
        super.onCreate()
        
        // Initialize Timber logging
        initializeTimber()
        
        // Log application startup
        Timber.i("DealerVait Application started")
        
        // Initialize other components as needed
        // initializeOtherComponents()
    }

    /**
     * Initialize Timber logging based on build type
     */
    private fun initializeTimber() {
        if (BuildConfig.DEBUG) {
            // Debug builds - plant debug tree with detailed logging
            Timber.plant(Timber.DebugTree())
        } else {
            // Release builds - plant crash reporting tree
            Timber.plant(CrashReportingTree())
        }
    }

    /**
     * WorkManager configuration
     */
    override fun getWorkManagerConfiguration(): Configuration {
        return Configuration.Builder()
            .setMinimumLoggingLevel(
                if (BuildConfig.DEBUG) android.util.Log.DEBUG else android.util.Log.ERROR
            )
            .build()
    }

    /**
     * Custom Timber tree for release builds that logs to crash reporting service
     */
    private class CrashReportingTree : Timber.Tree() {
        override fun log(priority: Int, tag: String?, message: String, t: Throwable?) {
            if (priority == android.util.Log.VERBOSE || priority == android.util.Log.DEBUG) {
                return
            }

            // Log to crash reporting service (Firebase Crashlytics, etc.)
            // FakeCrashLibrary.log(priority, tag, message)
            
            if (t != null && priority == android.util.Log.ERROR) {
                // Report exception to crash reporting service
                // FakeCrashLibrary.logException(t)
            }
        }
    }
}
