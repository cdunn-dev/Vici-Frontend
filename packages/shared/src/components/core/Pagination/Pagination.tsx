import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  style?: any;
  testID?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  style,
  testID = 'pagination',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    },
    pageButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
    },
    pageButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    pageButtonDisabled: {
      opacity: 0.5,
    },
    pageText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    pageTextActive: {
      color: theme.colors.background,
    },
    ellipsis: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ellipsisText: {
      color: theme.colors.text,
      fontSize: 14,
    },
  });

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1 && showFirstLast) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages && showFirstLast) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageButton = (page: number | string) => {
    if (page === '...') {
      return (
        <View key={`ellipsis-${page}`} style={styles.ellipsis}>
          <Text style={styles.ellipsisText}>...</Text>
        </View>
      );
    }

    const pageNumber = page as number;
    const isActive = pageNumber === currentPage;
    const isDisabled = pageNumber < 1 || pageNumber > totalPages;

    return (
      <TouchableOpacity
        key={`page-${page}`}
        style={[
          styles.pageButton,
          isActive && styles.pageButtonActive,
          isDisabled && styles.pageButtonDisabled,
        ]}
        onPress={() => handlePageChange(pageNumber)}
        disabled={isDisabled || isActive}
        testID={`${testID}-page-${page}`}
      >
        <Text style={[styles.pageText, isActive && styles.pageTextActive]}>
          {page}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      {getPageNumbers().map(renderPageButton)}
    </View>
  );
}; 