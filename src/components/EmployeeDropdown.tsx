
import React, { useState, useRef, useEffect } from 'react';
import { Check, Search } from 'lucide-react';

interface Employee {
  name: string;
  employee_name: string;
}

interface EmployeeDropdownProps {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
  placeholder?: string;
}

export const EmployeeDropdown: React.FC<EmployeeDropdownProps> = ({
  employees,
  onSelect,
  placeholder = "Search employees..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredEmployees = employees.filter(employee =>
    employee && employee.name && (
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employee_name && employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSelect = (employee: Employee) => {
    onSelect(employee);
    setSearchTerm('');
  };

  return (
    <div className="w-full">
      <div className="flex items-center border-b px-3 pb-2">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={inputRef}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="max-h-64 overflow-y-auto p-1">
        {filteredEmployees.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {searchTerm ? "No employee found." : "No employees available"}
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div
              key={employee.name}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={() => handleSelect(employee)}
            >
              <Check className="mr-2 h-4 w-4 opacity-0" />
              {employee.employee_name || employee.name} ({employee.name})
            </div>
          ))
        )}
      </div>
    </div>
  );
};
