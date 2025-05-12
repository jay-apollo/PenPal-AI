import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RecipientForm } from "./recipient-form";
import { MoreHorizontal, Edit, Trash, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Recipient } from "@shared/schema";

interface RecipientTableProps {
  recipients: Recipient[];
  onEdit: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function RecipientTable({ recipients, onEdit, onDelete }: RecipientTableProps) {
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Toggle selection of a single recipient
  const toggleRecipient = (id: number) => {
    setSelectedRecipients(prevSelected => 
      prevSelected.includes(id)
        ? prevSelected.filter(recId => recId !== id)
        : [...prevSelected, id]
    );
  };

  // Toggle selection of all recipients
  const toggleAllRecipients = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.id));
    }
  };

  // Handle edit button click
  const handleEditClick = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setIsEditDialogOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (data: any) => {
    if (editingRecipient) {
      await onEdit(editingRecipient.id, data);
      setIsEditDialogOpen(false);
      setEditingRecipient(null);
    }
  };

  // Handle delete button click
  const handleDeleteClick = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this recipient?")) {
      await onDelete(id);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={recipients.length > 0 && selectedRecipients.length === recipients.length}
                  onCheckedChange={toggleAllRecipients}
                  aria-label="Select all recipients"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedRecipients.includes(recipient.id)}
                    onCheckedChange={() => toggleRecipient(recipient.id)}
                    aria-label={`Select ${recipient.firstName} ${recipient.lastName}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{recipient.firstName} {recipient.lastName}</div>
                  <div className="text-sm text-muted-foreground md:hidden">{recipient.company}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{recipient.company || "—"}</TableCell>
                <TableCell className="hidden md:table-cell">{recipient.email || "—"}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {recipient.addressLine1 ? (
                    <div className="text-sm">
                      <div>{recipient.addressLine1}</div>
                      {recipient.addressLine2 && <div>{recipient.addressLine2}</div>}
                      <div>
                        {recipient.city && `${recipient.city}, `}
                        {recipient.state} {recipient.postalCode}
                      </div>
                      <div>{recipient.country}</div>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(recipient)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(recipient.id)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Test Letter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Recipient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipient</DialogTitle>
          </DialogHeader>
          {editingRecipient && (
            <RecipientForm
              recipient={editingRecipient}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}