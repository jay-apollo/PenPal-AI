import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Info } from "lucide-react";
import { Template } from "@shared/schema";

// Schema for template form validation
const templateFormSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  // mergeFields will be handled separately in the component state
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  template?: Template;
  onChange?: (template: any) => void;
  onSubmit?: (data: any) => Promise<void>;
}

export function TemplateForm({ template, onChange, onSubmit }: TemplateFormProps) {
  const [mergeFields, setMergeFields] = useState<string[]>(template?.mergeFields || []);
  const [newMergeField, setNewMergeField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form with default values
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || "",
      content: template?.content || "",
    },
  });

  // Update parent component when form values change
  useEffect(() => {
    if (onChange) {
      const currentValues = form.getValues();
      onChange({
        ...currentValues,
        mergeFields,
      });
    }
  }, [form.watch(), mergeFields, onChange]);

  // Add a new merge field
  const handleAddMergeField = () => {
    if (!newMergeField.trim()) return;
    
    // Check if field already exists
    if (mergeFields.includes(newMergeField.trim())) {
      return;
    }
    
    setMergeFields([...mergeFields, newMergeField.trim()]);
    setNewMergeField("");
  };

  // Remove a merge field
  const handleRemoveMergeField = (field: string) => {
    setMergeFields(mergeFields.filter(f => f !== field));
  };

  // Insert a merge field at cursor position in the textarea
  const handleInsertMergeField = (field: string) => {
    const contentField = form.getValues("content");
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    
    if (!textarea) return;
    
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    const newContent = 
      contentField.substring(0, startPos) + 
      `{{${field}}}` + 
      contentField.substring(endPos);
    
    form.setValue("content", newContent, { shouldDirty: true });
    
    // Set focus back to textarea with cursor after the inserted field
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + field.length + 4; // +4 for the {{ and }}
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle form submission
  const handleFormSubmit = async (values: TemplateFormValues) => {
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          ...values,
          mergeFields,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={onSubmit ? form.handleSubmit(handleFormSubmit) : undefined} 
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Follow-up Letter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <label className="text-sm font-medium block mb-2">
            Merge Fields
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {mergeFields.map((field) => (
              <Badge key={field} variant="outline" className="py-1 px-2">
                {field}
                <button
                  type="button"
                  className="ml-1 text-neutral-400 hover:text-red-500"
                  onClick={() => handleRemoveMergeField(field)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {mergeFields.length === 0 && (
              <span className="text-sm text-neutral-500">
                No merge fields added yet
              </span>
            )}
          </div>

          <div className="flex gap-2 mb-1">
            <Input
              placeholder="Add merge field (e.g., firstName, company)"
              value={newMergeField}
              onChange={(e) => setNewMergeField(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMergeField();
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddMergeField}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-neutral-500 mb-4">
            These fields will be replaced with recipient data in your letters
          </p>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Letter Content</FormLabel>
              {mergeFields.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {mergeFields.map((field) => (
                    <Button
                      key={field}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInsertMergeField(field)}
                      className="text-xs"
                    >
                      {`{{${field}}}`}
                    </Button>
                  ))}
                </div>
              )}
              <FormControl>
                <Textarea
                  id="content"
                  placeholder="Write your letter content here..."
                  className="min-h-[300px] font-mono"
                  {...field}
                />
              </FormControl>
              <div className="flex items-start mt-2">
                <Info className="h-4 w-4 text-neutral-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-neutral-500">
                  Use merge fields like {`{{firstName}}`} to personalize your letter for each recipient. 
                  These will be replaced with their actual data when the letter is generated.
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {onSubmit && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner size="sm" className="mr-2" />}
              {template ? "Update Template" : "Create Template"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}