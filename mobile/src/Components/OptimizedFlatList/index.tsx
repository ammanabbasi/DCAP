import React, { memo, useMemo, useCallback, useRef, useState } from 'react';
import {
  FlatList,
  FlatListProps,
  ViewToken,
  ListRenderItem,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  Dimensions,
} from 'react-native';
import { FlashList, ListRenderItem as FlashListRenderItem } from '@shopify/flash-list';
import { styled } from './style';
import { usePerformanceMonitor } from '../../Utils/performanceProfiler';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T> | FlashListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  // Performance optimization props
  useFlashList?: boolean;
  estimatedItemSize?: number;
  getItemType?: (item: T, index: number) => string | number;
  // Virtual scrolling props
  windowSize?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  initialNumToRender?: number;
  removeClippedSubviews?: boolean;
  // Loading states
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  emptyMessage?: string;
  // Performance monitoring
  enablePerformanceMonitoring?: boolean;
  itemHeightCache?: Map<string, number>;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

function OptimizedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.8,
  refreshing = false,
  onRefresh,
  useFlashList = true,
  estimatedItemSize = 60,
  getItemType,
  windowSize = 10,
  maxToRenderPerBatch = 10,
  updateCellsBatchingPeriod = 100,
  initialNumToRender = 10,
  removeClippedSubviews = true,
  loading = false,
  loadingMore = false,
  error = null,
  emptyMessage = 'No items to display',
  enablePerformanceMonitoring = true,
  itemHeightCache = new Map(),
  ...props
}: OptimizedFlatListProps<T>) {
  const listRef = useRef<FlatList<T> | FlashList<T>>(null);
  const [viewableItems, setViewableItems] = useState<Set<string>>(new Set());
  
  // Performance monitoring
  usePerformanceMonitor('OptimizedFlatList');

  // Memoized keyExtractor
  const memoizedKeyExtractor = useCallback((item: T, index: number) => {
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    
    // Fallback key extraction
    if (item && typeof item === 'object') {
      const obj = item as any;
      return obj.id?.toString() || obj.key?.toString() || index.toString();
    }
    
    return index.toString();
  }, [keyExtractor]);

  // Optimized render item with performance monitoring
  const memoizedRenderItem: ListRenderItem<T> = useCallback(({ item, index }) => {
    const key = memoizedKeyExtractor(item, index);
    
    // Track render performance for visible items
    if (enablePerformanceMonitoring) {
      const renderStart = Date.now();
      
      const result = renderItem({ item, index });
      
      const renderTime = Date.now() - renderStart;
      if (renderTime > 16.67) { // 60fps threshold
        console.warn(`Slow list item render: Index ${index} took ${renderTime}ms`);
      }
      
      return result;
    }
    
    return renderItem({ item, index });
  }, [renderItem, memoizedKeyExtractor, enablePerformanceMonitoring]);

  // Viewability configuration for better performance
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
    waitForInteraction: true,
  }), []);

  // Handle viewable items changed
  const onViewableItemsChanged = useCallback(({ viewableItems: viewable }: { viewableItems: ViewToken[] }) => {
    const newViewableSet = new Set(viewable.map(token => 
      memoizedKeyExtractor(token.item, token.index || 0)
    ));
    setViewableItems(newViewableSet);
  }, [memoizedKeyExtractor]);

  // Optimized end reached handler with debouncing
  const handleEndReached = useCallback(() => {
    if (loadingMore || !onEndReached) return;
    
    // Debounce end reached calls
    setTimeout(() => {
      onEndReached();
    }, 100);
  }, [onEndReached, loadingMore]);

  // Get item layout for better scrolling performance
  const getItemLayout = useCallback((data: any, index: number) => {
    const key = memoizedKeyExtractor(data?.[index], index);
    const cachedHeight = itemHeightCache.get(key);
    
    if (cachedHeight) {
      return {
        length: cachedHeight,
        offset: cachedHeight * index,
        index,
      };
    }
    
    // Use estimated size if no cache
    return {
      length: estimatedItemSize,
      offset: estimatedItemSize * index,
      index,
    };
  }, [memoizedKeyExtractor, itemHeightCache, estimatedItemSize]);

  // Refresh control
  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;
    
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['#007AFF']} // Android
        tintColor="#007AFF" // iOS
        progressViewOffset={0}
        progressBackgroundColor="#f8f9fa"
      />
    );
  }, [onRefresh, refreshing]);

  // Loading footer component
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styled.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styled.footerText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  // Empty list component
  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styled.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styled.emptyText}>Loading...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styled.emptyContainer}>
          <Text style={styled.errorText}>{error}</Text>
        </View>
      );
    }
    
    return (
      <View style={styled.emptyContainer}>
        <Text style={styled.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }, [loading, error, emptyMessage]);

  // Separator component
  const renderSeparator = useCallback(() => (
    <View style={styled.separator} />
  ), []);

  // FlashList optimized props
  const flashListProps = useMemo(() => ({
    estimatedItemSize,
    getItemType,
    overrideItemLayout: (layout: any, item: T, index: number) => {
      // Cache item height for better performance
      const key = memoizedKeyExtractor(item, index);
      itemHeightCache.set(key, layout.size);
      return layout;
    },
  }), [estimatedItemSize, getItemType, memoizedKeyExtractor, itemHeightCache]);

  // Common props for both FlatList and FlashList
  const commonProps = {
    ref: listRef,
    data,
    renderItem: memoizedRenderItem,
    keyExtractor: memoizedKeyExtractor,
    onEndReached: handleEndReached,
    onEndReachedThreshold,
    refreshControl,
    ListFooterComponent: renderFooter,
    ListEmptyComponent: renderEmpty,
    ItemSeparatorComponent: renderSeparator,
    onViewableItemsChanged,
    viewabilityConfig,
    // Performance optimizations
    windowSize,
    maxToRenderPerBatch,
    updateCellsBatchingPeriod,
    initialNumToRender,
    removeClippedSubviews,
    // Scroll optimizations
    scrollEventThrottle: 16, // 60fps
    maintainVisibleContentPosition: {
      minIndexForVisible: 0,
      autoscrollToTopThreshold: 100,
    },
    // Memory optimizations
    legacyImplementation: false,
    disableVirtualization: false,
    ...props,
  };

  // Render FlashList (preferred for performance)
  if (useFlashList && data.length > 50) {
    return (
      <FlashList
        {...commonProps}
        {...flashListProps}
        contentContainerStyle={[styled.container, props.contentContainerStyle]}
      />
    );
  }

  // Fallback to regular FlatList
  return (
    <FlatList
      {...commonProps}
      getItemLayout={data.length > 100 ? getItemLayout : undefined}
      contentContainerStyle={[styled.container, props.contentContainerStyle]}
    />
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(OptimizedFlatList) as typeof OptimizedFlatList;