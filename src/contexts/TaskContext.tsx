
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TodoItem {
  name: string;
  date: string;
  status: "Open" | "Closed";
  allocated_to: string | null;
  description: string;
  reference_type: string;
  reference_name: string;
  role: string | null;
  custom_doctype_actions: {
    label: string;
    action: string;
    url: string;
  }[];
}

interface TodoResponse {
  message: {
    success: boolean;
    data: TodoItem[];
    message: string;
  };
}

interface TaskContextType {
  todos: TodoItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}todo.todo.get_my_todos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data: TodoResponse = await response.json();
      console.log("task data are:",data)

      if (!data.message || !data.message.data) {
        throw new Error('Invalid task data received');
      }

      setTodos(data.message.data);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to fetch tasks');
      // Fallback to empty array for development
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <TaskContext.Provider value={{ todos, loading, error, refetch: fetchTodos }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
