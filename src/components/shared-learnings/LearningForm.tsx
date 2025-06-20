
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SharedLearning {
  name: string;
  employee?: string;
  employee_name?: string;
  event_type: string;
  event_date: string;
  event_description: string;
  event_link?: string;
}

interface SharedLearningFormData {
  event_type: string;
  custom_event_type?: string;
  event_date: Date;
  event_description: string;
  event_link?: string;
}

interface LearningFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SharedLearningFormData) => Promise<void>;
  editingLearning: SharedLearning | null;
  isSubmitting: boolean;
}

const eventTypes = [
  "Lightning Talk",
  "GenAI Hour", 
  "Webinar",
  "Workshop",
  "Conference",
  "Tech Talk",
  "Knowledge Sharing Session",
  "Other"
];

const LearningForm = ({ isOpen, onClose, onSubmit, editingLearning, isSubmitting }: LearningFormProps) => {
  const [showCustomEventType, setShowCustomEventType] = useState(false);
  const form = useForm<SharedLearningFormData>();
  const watchEventType = form.watch("event_type");

  useEffect(() => {
    if (watchEventType === "Other") {
      setShowCustomEventType(true);
    } else {
      setShowCustomEventType(false);
      form.setValue("custom_event_type", "");
    }
  }, [watchEventType, form]);

  useEffect(() => {
    if (isOpen && editingLearning) {
      const isCustomType = !eventTypes.includes(editingLearning.event_type) || editingLearning.event_type === "Other";
      
      form.reset({
        event_type: isCustomType ? "Other" : editingLearning.event_type,
        custom_event_type: isCustomType ? editingLearning.event_type : "",
        event_date: new Date(editingLearning.event_date),
        event_description: editingLearning.event_description,
        event_link: editingLearning.event_link || "",
      });
    } else if (isOpen && !editingLearning) {
      form.reset({
        event_type: "",
        custom_event_type: "",
        event_date: new Date(),
        event_description: "",
        event_link: "",
      });
      setShowCustomEventType(false);
    }
  }, [isOpen, editingLearning, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" showOverlay={false}>
        <DialogHeader>
          <DialogTitle>
            {editingLearning ? "Edit Shared Learning" : "Add Shared Learning"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="event_type"
              rules={{ required: "Event type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showCustomEventType && (
              <FormField
                control={form.control}
                name="custom_event_type"
                rules={{ required: showCustomEventType ? "Custom event type is required" : false }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Event Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter custom event type..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="event_date"
              rules={{ required: "Event date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_description"
              rules={{ required: "Event description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what was shared..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingLearning ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingLearning ? "Update" : "Add"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LearningForm;
