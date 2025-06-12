
import { useTeamEmployees } from "@/api/employeeService";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeamMembersModal = ({ isOpen, onClose }: TeamMembersModalProps) => {
  const { employees, loading } = useTeamEmployees();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[500px] overflow-y-auto" showOverlay={false}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Team Members</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading team members...</p>
          </div>
        ) : employees.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((teamMember, index) => (
                  <TableRow key={teamMember.name}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{teamMember.employee_name}</TableCell>
                    <TableCell>{teamMember.designation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No team members found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeamMembersModal;
