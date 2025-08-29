import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  View,
  Image,
  ImageStyle,
  ViewStyle,
  ActivityIndicator,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import { styled } from './style';
import { performanceProfiler } from '../../Utils/performanceProfiler';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center' | 'repeat';
  quality?: 'low' | 'medium' | 'high';
  lazy?: boolean;
  cache?: boolean;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  webpSupport?: boolean;
  progressive?: boolean;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  source,
  style,
  containerStyle,
  placeholder,
  fallback,
  resizeMode = 'cover',
  quality = 'high',
  lazy = false,
  cache = true,
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  testID,
  accessible = true,
  accessibilityLabel,
  webpSupport = true,
  progressive = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);

  // Screen dimensions for responsive sizing
  const screenDimensions = useMemo(() => Dimensions.get('window'), []);

  // Optimize image URL with quality and format parameters
  const optimizedSource = useMemo(() => {
    if (typeof source === 'number') {
      return source; // Local image
    }

    let uri = source.uri;

    // Add quality parameters if URL supports it
    if (uri.includes('cloudinary.com') || uri.includes('imgix.net')) {
      const separator = uri.includes('?') ? '&' : '?';
      const qualityParam = quality === 'low' ? '30' : quality === 'medium' ? '60' : '80';
      
      // Add quality parameter
      uri += `${separator}q_${qualityParam}`;
      
      // Add WebP format if supported
      if (webpSupport && Platform.OS === 'android') {
        uri += `&f_webp`;
      }

      // Add auto-optimization
      uri += `&f_auto&dpr_auto`;

      // Responsive sizing based on container dimensions
      if (style && typeof style === 'object') {
        const width = style.width as number;
        const height = style.height as number;
        
        if (width && height) {
          uri += `&w_${Math.round(width)}&h_${Math.round(height)}`;
        } else if (width) {
          uri += `&w_${Math.round(width)}`;
        } else if (height) {
          uri += `&h_${Math.round(height)}`;
        }
      }

      // Progressive loading
      if (progressive) {
        uri += `&fl_progressive`;
      }
    }

    return { uri };
  }, [source, quality, webpSupport, style, progressive]);

  // Handle load start
  const handleLoadStart = useCallback(() => {
    const startTime = Date.now();
    setLoadStartTime(startTime);
    setIsLoading(true);
    setHasError(false);
    
    performanceProfiler.markPerformance(`image-load-start-${startTime}`);
    onLoadStart?.();
  }, [onLoadStart]);

  // Handle successful load
  const handleLoad = useCallback((event: any) => {
    const loadTime = Date.now() - loadStartTime;
    
    setIsLoading(false);
    setHasError(false);

    // Get image dimensions
    if (event.nativeEvent) {
      const { width, height } = event.nativeEvent.source;
      setDimensions({ width, height });
    }

    // Track performance
    performanceProfiler.markPerformance(`image-load-end-${loadStartTime}`);
    performanceProfiler.measurePerformance(
      `image-load-${loadStartTime}`,
      `image-load-start-${loadStartTime}`,
      `image-load-end-${loadStartTime}`
    );

    // Alert if image load is slow (>1 second)
    if (loadTime > 1000) {
      performanceProfiler.reportPerformanceIssue?.('slow_image_load', {
        loadTime,
        source: typeof source === 'object' ? source.uri : 'local',
        timestamp: Date.now(),
      });
    }

    onLoad?.();
  }, [loadStartTime, source, onLoad]);

  // Handle load error
  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    
    performanceProfiler.markPerformance(`image-error-${loadStartTime}`);
    onError?.(error);
  }, [loadStartTime, onError]);

  // Handle load end
  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  // Calculate responsive dimensions
  const responsiveStyle = useMemo(() => {
    if (!dimensions || !style) return style;

    const containerWidth = (style as any)?.width;
    const containerHeight = (style as any)?.height;

    // If both dimensions are specified, use as-is
    if (containerWidth && containerHeight) {
      return style;
    }

    // Calculate aspect ratio
    const aspectRatio = dimensions.width / dimensions.height;

    // Auto-adjust dimensions while maintaining aspect ratio
    if (containerWidth && !containerHeight) {
      return {
        ...style,
        height: containerWidth / aspectRatio,
      };
    }

    if (containerHeight && !containerWidth) {
      return {
        ...style,
        width: containerHeight * aspectRatio,
      };
    }

    return style;
  }, [dimensions, style]);

  // Render loading placeholder
  const renderPlaceholder = () => {
    if (placeholder) return placeholder;
    
    return (
      <View style={styled.placeholder}>
        <ActivityIndicator size="small" color="#999" />
        <Text style={styled.placeholderText}>Loading...</Text>
      </View>
    );
  };

  // Render error fallback
  const renderFallback = () => {
    if (fallback) return fallback;
    
    return (
      <View style={styled.fallback}>
        <Text style={styled.fallbackText}>Failed to load image</Text>
      </View>
    );
  };

  if (hasError) {
    return (
      <View style={[styled.container, containerStyle]} testID={`${testID}-error`}>
        {renderFallback()}
      </View>
    );
  }

  return (
    <View style={[styled.container, containerStyle]} testID={testID}>
      {isLoading && renderPlaceholder()}
      
      <Image
        source={optimizedSource}
        style={[styled.image, responsiveStyle, isLoading && styled.hiddenImage]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        testID={`${testID}-image`}
        // Performance optimizations
        defaultSource={require('../../Assets/Images/placeholder.jpg')}
        loadingIndicatorSource={require('../../Assets/Images/placeholder.jpg')}
        fadeDuration={300}
        // Cache optimization
        {...(cache && Platform.OS === 'ios' && {
          cache: 'force-cache' as any,
        })}
      />
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;