# File: app/proguard-rules.pro
# Purpose: ProGuard rules for production builds with obfuscation
# Dependencies: All third-party libraries

# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep line numbers for debugging crashes in production
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep all annotations
-keepattributes *Annotation*

# ================================
# ANDROID CORE RULES
# ================================

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable classes
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ================================
# RETROFIT & NETWORKING
# ================================

# Retrofit does reflection on generic parameters
-keepattributes Signature
-keepattributes Exceptions
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.* <methods>;
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# ================================
# MOSHI JSON PARSING
# ================================

# Keep Moshi generated adapters
-keep class **JsonAdapter {
    <init>(...);
    <fields>;
}
-keep @com.squareup.moshi.JsonQualifier interface *
-keepclassmembers class * {
    @com.squareup.moshi.Json <fields>;
}

# Keep data classes used for JSON parsing
-keep class com.dealervait.data.models.** { *; }

# Keep classes with @JsonClass annotation
-keep @com.squareup.moshi.JsonClass class * { *; }

# ================================
# HILT DEPENDENCY INJECTION
# ================================

# Keep Hilt generated classes
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keep class * extends dagger.hilt.android.internal.modules.ApplicationContextModule
-keep class **_HiltModules
-keep class **_HiltModules$*

# Keep classes with Hilt annotations
-keep @dagger.hilt.* class * { *; }
-keep @javax.inject.* class * { *; }

# ================================
# ROOM DATABASE
# ================================

# Keep Room generated classes
-keep class androidx.room.** { *; }
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.* class * { *; }
-keepclassmembers class * extends androidx.room.RoomDatabase {
    public abstract *;
}

# Keep DAO classes and methods
-keep class com.dealervait.data.local.dao.** { *; }
-keep class com.dealervait.data.local.entities.** { *; }

# ================================
# JETPACK COMPOSE
# ================================

# Keep Compose runtime
-keep class androidx.compose.** { *; }
-keepclassmembers class androidx.compose.** { *; }

# Keep Compose generated classes
-keep class **.*ComposableSingletons* { *; }

# ================================
# KOTLIN COROUTINES
# ================================

# Keep ServiceLoader support
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Most of volatile fields are updated with AFU and should not be mangled
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}

# Keep continuation classes
-keep class kotlinx.coroutines.** { *; }

# ================================
# APPLICATION SPECIFIC
# ================================

# Keep ViewModels
-keep class com.dealervait.presentation.viewmodels.** { *; }

# Keep repository implementations  
-keep class com.dealervait.data.repository.** { *; }

# Keep use case classes
-keep class com.dealervait.domain.usecases.** { *; }

# Keep error handling classes
-keep class com.dealervait.core.error.** { *; }

# Keep base classes
-keep class com.dealervait.core.base.** { *; }

# ================================
# TIMBER LOGGING
# ================================

# Remove logging in release builds
-assumenosideeffects class timber.log.Timber* {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# ================================
# SOCKET.IO
# ================================

# Keep Socket.IO classes
-keep class io.socket.** { *; }
-keep class org.json.** { *; }

# ================================
# SECURITY & CRYPTO
# ================================

# Keep security related classes
-keep class androidx.security.crypto.** { *; }

# ================================
# REMOVE UNUSED CODE
# ================================

# Remove Log calls
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# Remove System.out.println calls
-assumenosideeffects class java.lang.System {
    public static void out.println(...);
    public static void err.println(...);
}

# ================================
# OPTIMIZATION SETTINGS
# ================================

# Enable aggressive optimization
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# ================================
# WARNINGS TO IGNORE
# ================================

# Ignore warnings about missing classes (common in Android builds)
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn java.lang.invoke.**
