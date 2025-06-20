
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LearningsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedEventType: string;
  setSelectedEventType: (type: string) => void;
  selectedEmployee: string;
  setSelectedEmployee: (employee: string) => void;
  showMyLearningsOnly: boolean;
  setShowMyLearningsOnly: (show: boolean) => void;
  uniqueEventTypes: string[];
  uniqueEmployees: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultsCount: number;
  totalCount: number;
  isDisabled?: boolean;
}

const LearningsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedEventType,
  setSelectedEventType,
  selectedEmployee,
  setSelectedEmployee,
  showMyLearningsOnly,
  setShowMyLearningsOnly,
  uniqueEventTypes,
  uniqueEmployees,
  onClearFilters,
  hasActiveFilters,
  resultsCount,
  totalCount,
  isDisabled = false,
}: LearningsFiltersProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search learnings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={isDisabled}
          />
        </div>

        {/* Event Type Filter */}
        <Select value={selectedEventType} onValueChange={setSelectedEventType} disabled={isDisabled}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Event Types</SelectItem>
            {uniqueEventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Employee Filter */}
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={isDisabled}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {uniqueEmployees.map((emp) => (
              <SelectItem key={emp} value={emp}>
                {emp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showMyLearningsOnly}
              onChange={(e) => setShowMyLearningsOnly(e.target.checked)}
              className="rounded"
              disabled={isDisabled}
            />
            My learnings only
          </label>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="self-start sm:self-auto"
            disabled={isDisabled}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="text-sm text-gray-600">
          Showing {resultsCount} of {totalCount} learnings
        </div>
      )}
    </div>
  );
};

export default LearningsFilters;
