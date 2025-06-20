
import React from "react";
import { format } from "date-fns";
import { Edit, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SharedLearning {
  name: string;
  employee?: string;
  employee_name?: string;
  event_type: string;
  event_date: string;
  event_description: string;
  event_link?: string;
}

interface LearningsTableProps {
  learnings: SharedLearning[];
  currentEmployee?: string;
  onView: (learning: SharedLearning) => void;
  onEdit: (learning: SharedLearning) => void;
  onDelete: (name: string) => void;
  isLoading: boolean;
}

const LearningsTable = ({ 
  learnings, 
  currentEmployee, 
  onView, 
  onEdit, 
  onDelete, 
  isLoading 
}: LearningsTableProps) => {
  const canEditDelete = (learning: SharedLearning) => {
    return currentEmployee === learning.employee;
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Event Type</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Employee</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {learnings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No shared learnings found
              </TableCell>
            </TableRow>
          ) : (
            learnings.map((learning) => (
              <TableRow key={learning.name} className="hover:bg-gray-50">
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {learning.event_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {format(new Date(learning.event_date), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-sm font-medium text-blue-600">
                  {learning.employee_name || learning.employee}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(learning)}
                      className="h-8 w-8 p-0"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEditDelete(learning) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(learning)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(learning.name)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LearningsTable;
