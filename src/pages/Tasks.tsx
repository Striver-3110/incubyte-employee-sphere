import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";

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

const Tasks = () => {
  const { todos, loading, error } = useTask();
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [filters, setFilters] = useState({
    status: "Open",
    referenceType: "all",
    dateSort: "desc",
    search: ""
  });

  useEffect(() => {
    let filtered = [...todos];

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(todo => todo.status === filters.status);
    }

    // Apply reference type filter
    if (filters.referenceType !== "all") {
      filtered = filtered.filter(todo => todo.reference_type === filters.referenceType);
    }

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(todo => 
        todo.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        todo.reference_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply date sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return filters.dateSort === "desc" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    setFilteredTodos(filtered);
  }, [todos, filters]);

  const handleRowClick = (todo: TodoItem) => {
    if (todo.custom_doctype_actions && todo.custom_doctype_actions.length > 0) {
      const action = todo.custom_doctype_actions[0];
      if (action.action === "redirect" && action.url) {
        console.log(`Redirecting to: ${action.url}`);
        window.open(action.url, '_blank');
      }
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getUniqueReferenceTypes = () => {
    const types = new Set(todos.map(todo => todo.reference_type));
    return Array.from(types);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-500">Error loading tasks: {error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          My Tasks ({filteredTodos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Reference Type</label>
            <Select value={filters.referenceType} onValueChange={(value) => setFilters(prev => ({ ...prev, referenceType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getUniqueReferenceTypes().map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date Sort</label>
            <Select value={filters.dateSort} onValueChange={(value) => setFilters(prev => ({ ...prev, dateSort: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Filters */}
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setFilters({ status: "Open", referenceType: "all", dateSort: "desc", search: "" })}
          >
            Reset Filters
          </Button>
        </div>

        {/* Tasks Table */}
        <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700 py-4">Reference Type</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Description</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Due Date</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTodos.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    No tasks found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredTodos.map((todo) => (
                  <TableRow 
                    key={todo.name} 
                    onClick={() => handleRowClick(todo)} 
                    className={`cursor-pointer transition-colors duration-200 ${
                      todo.status === "Open" 
                        ? "hover:bg-green-50 border-l-4 border-l-green-500" 
                        : "hover:bg-gray-50 border-l-4 border-l-gray-400"
                    }`}
                  >
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${
                          todo.status === "Open" 
                            ? "border-blue-200 bg-blue-50 text-blue-700" 
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {todo.reference_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs py-4">
                      <span title={todo.description}>
                        {truncateText(todo.description)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm py-4">
                      {new Date(todo.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        variant={todo.status === "Open" ? "default" : "secondary"} 
                        className={`${
                          todo.status === "Open" 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-medium" 
                            : "bg-gray-100 text-gray-700 border-gray-200 font-medium"
                        }`}
                      >
                        {todo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      {todo.custom_doctype_actions && todo.custom_doctype_actions.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline" 
                          className={`${
                            todo.status === "Open" 
                              ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300" 
                              : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                          onClick={e => {
                            e.stopPropagation();
                            handleRowClick(todo);
                          }}
                        >
                          {todo.custom_doctype_actions[0].label}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Tasks;
