// This file contains examples of how to use the API hooks
// It's not meant to be imported or used directly

import { useQuery, createQueryFn } from './useQuery';
import { useMutation, createMutationFn } from './useMutation';
import { useInfiniteQuery, createInfiniteQueryFn } from './useInfiniteQuery';

// Example API service
interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

// Mock API service
const todoService = {
  // Get todos
  getTodos: async (): Promise<TodoItem[]> => {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');
    return response.json();
  },
  
  // Get a single todo by ID
  getTodo: async (id: number): Promise<TodoItem> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
    return response.json();
  },
  
  // Create a new todo
  createTodo: async (data: Omit<TodoItem, 'id'>): Promise<TodoItem> => {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    return response.json();
  },
  
  // Update a todo
  updateTodo: async (id: number, data: Partial<TodoItem>): Promise<TodoItem> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    return response.json();
  },
  
  // Get paginated todos
  getPaginatedTodos: async (page: number | string): Promise<TodoItem[]> => {
    const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos?_page=${pageNumber}&_limit=10`);
    return response.json();
  },
};

/**
 * Example 1: Basic useQuery hook usage
 */
function ExampleUseQuery() {
  // Fetch all todos
  const {
    data: todos,
    isLoading,
    error,
    refetch,
  } = useQuery<TodoItem[], Error>(
    'todos', // Query key
    todoService.getTodos, // Query function
    {
      staleTime: 60000, // 1 minute
      onSuccess: (data) => {
        console.log('Todos fetched successfully:', data);
      },
      onError: (error) => {
        console.error('Error fetching todos:', error);
      },
    }
  );
  
  // Fetch a specific todo
  const todoId = 1;
  const {
    data: todo,
    isLoading: isLoadingTodo,
  } = useQuery<TodoItem, Error>(
    ['todo', todoId.toString()], // Array query key
    () => todoService.getTodo(todoId), // Query function with parameters
    {
      enabled: todoId > 0, // Only fetch if todoId is valid
    }
  );
  
  // Using the createQueryFn utility
  const getTodoQuery = createQueryFn(todoService.getTodo, todoId);
  const { data: todoAlt } = useQuery<TodoItem, Error>(
    ['todo', todoId.toString()],
    getTodoQuery
  );
  
  return {
    todos,
    todo,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Example 2: Basic useMutation hook usage
 */
function ExampleUseMutation() {
  // Create a new todo
  const [createTodo, { isLoading: isCreating, error: createError }] = useMutation<
    TodoItem, // Return type
    Omit<TodoItem, 'id'>, // Input variables type
    Error // Error type
  >(
    todoService.createTodo,
    {
      onSuccess: (data) => {
        console.log('Todo created successfully:', data);
        // You might want to invalidate the todos query cache here
      },
      onError: (error) => {
        console.error('Error creating todo:', error);
      },
    }
  );
  
  // Update a todo
  const [updateTodo, { isLoading: isUpdating, error: updateError }] = useMutation<
    TodoItem,
    { id: number; data: Partial<TodoItem> },
    Error
  >(
    ({ id, data }) => todoService.updateTodo(id, data),
    {
      onSuccess: (data) => {
        console.log('Todo updated successfully:', data);
      },
    }
  );
  
  // Using the createMutationFn utility
  const updateTodoMutation = createMutationFn(
    (data: Partial<TodoItem>, id: number) => todoService.updateTodo(id, data),
    1 // todoId
  );
  
  const [updateTodoAlt] = useMutation<TodoItem, Partial<TodoItem>, Error>(
    updateTodoMutation
  );
  
  // Example usage
  const handleCreateTodo = async () => {
    try {
      const newTodo = await createTodo({ title: 'New Todo', completed: false });
      console.log('New todo:', newTodo);
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };
  
  const handleUpdateTodo = async () => {
    try {
      const updatedTodo = await updateTodo({ 
        id: 1, 
        data: { completed: true } 
      });
      console.log('Updated todo:', updatedTodo);
      
      // Alternative using the utility
      const updatedTodoAlt = await updateTodoAlt({ completed: true });
      console.log('Updated todo (alt):', updatedTodoAlt);
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };
  
  return {
    createTodo,
    updateTodo,
    isCreating,
    isUpdating,
    createError,
    updateError,
    handleCreateTodo,
    handleUpdateTodo,
  };
}

/**
 * Example 3: Basic useInfiniteQuery hook usage
 */
function ExampleUseInfiniteQuery() {
  const {
    data: todoPages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<TodoItem[], Error>(
    'paginatedTodos',
    ({ pageParam }) => todoService.getPaginatedTodos(pageParam as number),
    {
      getNextPageParam: (lastPage, allPages) => {
        // If the last page has fewer items than the page size, there are no more pages
        return lastPage.length < 10 ? null : allPages.length + 1;
      },
      initialPageParam: 1,
    }
  );
  
  // Using the createInfiniteQueryFn utility
  const getPaginatedTodosQuery = createInfiniteQueryFn(todoService.getPaginatedTodos);
  
  const { data: todoPagesAlt } = useInfiniteQuery<TodoItem[], Error>(
    'paginatedTodosAlt',
    getPaginatedTodosQuery,
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length < 10 ? null : allPages.length + 1;
      },
      initialPageParam: 1,
    }
  );
  
  // Example usage
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
  // Flatten all pages into a single array
  const allTodos = todoPages.flat();
  
  return {
    todoPages,
    allTodos,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleLoadMore,
  };
}

// Export to prevent TypeScript errors, though this file is just for examples
export const examples = {
  ExampleUseQuery,
  ExampleUseMutation,
  ExampleUseInfiniteQuery,
}; 