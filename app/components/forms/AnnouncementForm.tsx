"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { createAnnouncement, editAnnouncement } from "@/lib/actions"
import { toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { Card } from "@/components/ui/card";
import { z } from "zod"
import { Announcement } from '@/types/announcement';
import { useEffect } from "react"

const announcementSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    status: z.enum(['active', 'important',]).default('active'),
}).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
});
  
type AnnouncementFormValues = z.infer<typeof announcementSchema>
  
interface AnnouncementFormProps {
  initialData?: Announcement | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function AnnouncementForm({ initialData, onClose, onSuccess }: AnnouncementFormProps) {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      status: initialData?.status || "active",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        startDate: new Date(initialData.startDate),
        endDate: new Date(initialData.endDate),
        status: initialData.status,
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: AnnouncementFormValues) {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (value !== undefined) {
          formData.append(key, value);
        }
      });

      if (initialData?.id) {
        formData.append('id', initialData.id);
        const result = await editAnnouncement(initialData.id, formData);
        if (!result?.success) {
          throw new Error(result?.error || "Something went wrong");
        }
        toast.success("Announcement updated successfully");
      } else {
        const result = await createAnnouncement(formData);
        if (!result?.success) {
          throw new Error(result?.error || "Something went wrong");
        }
        toast.success("Announcement created successfully");
      }

      form.reset({
        title: "",
        content: "",
        startDate: undefined,
        endDate: undefined,
      });
      
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <Card className="w-full p-6 bg-white shadow-md rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Announcement title" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Announcement content"
                    className="min-h-[100px]"
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                        disabled={(date) =>
                          date < new Date()
                        }
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
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                        disabled={(date) =>
                          date < field.value || date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Announcement Priority</FormLabel>
                <FormControl>
                  <select 
                    {...field}
                    className="p-2 border rounded-md w-32"
                  >
                    <option value="active">Normal</option>
                    <option value="important">Important</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-mainColor-700 hover:bg-mainColor-500"
          >
            {initialData ? 'Update' : 'Create'} Announcement
          </Button>
        </form>
      </Form>
    </Card>
  );
}
