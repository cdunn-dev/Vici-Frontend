import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pagination } from '../Pagination';

jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      background: '#FFFFFF',
      text: '#11182C',
    },
  }),
}));

describe('Pagination', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    expect(getByTestId('pagination')).toBeTruthy();
  });

  it('renders correct number of page buttons', () => {
    const { getByTestId } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    expect(getByTestId('pagination-page-1')).toBeTruthy();
    expect(getByTestId('pagination-page-2')).toBeTruthy();
    expect(getByTestId('pagination-page-3')).toBeTruthy();
    expect(getByTestId('pagination-page-4')).toBeTruthy();
    expect(getByTestId('pagination-page-5')).toBeTruthy();
  });

  it('handles page change events', () => {
    const onPageChange = jest.fn();
    const { getByTestId } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );
    fireEvent.press(getByTestId('pagination-page-2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables current page button', () => {
    const { getByTestId } = render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    const button = getByTestId('pagination-page-2');
    expect(button.props.disabled).toBe(true);
  });

  it('shows ellipsis for large page counts', () => {
    const { getByTestId } = render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={() => {}}
      />
    );
    expect(getByTestId('pagination-page-1')).toBeTruthy();
    expect(getByTestId('pagination-page-...')).toBeTruthy();
    expect(getByTestId('pagination-page-10')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        style={{ marginTop: 10 }}
      />
    );
    const container = getByTestId('pagination');
    expect(container.props.style.marginTop).toBe(10);
  });

  it('hides first and last buttons when showFirstLast is false', () => {
    const { queryByTestId } = render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={() => {}}
        showFirstLast={false}
      />
    );
    expect(queryByTestId('pagination-page-1')).toBeNull();
    expect(queryByTestId('pagination-page-10')).toBeNull();
  });

  it('limits visible pages based on maxVisiblePages prop', () => {
    const { queryByTestId } = render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={() => {}}
        maxVisiblePages={3}
      />
    );
    expect(queryByTestId('pagination-page-1')).toBeTruthy();
    expect(queryByTestId('pagination-page-2')).toBeTruthy();
    expect(queryByTestId('pagination-page-3')).toBeTruthy();
    expect(queryByTestId('pagination-page-4')).toBeNull();
  });
}); 