"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCurrentProject } from "@/hooks/use-current-project"
import { notificationsApi } from "@/lib/api/client"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationsHistory } from "@/components/notifications/notifications-history"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    body: z.string().min(1, "Body is required"),
    imageUrl: z.string().url().optional().or(z.literal("")),
    actionUrl: z.string().url().optional().or(z.literal("")),
    type: z.enum(["instant", "scheduled", "recurring"]),
    scheduledFor: z.date().optional(),
    recurringPattern: z.string().optional(),
    targetType: z.enum(["deviceId", "topic", "tag"]),
    targetValue: z.string().min(1, "Target value is required"),
}).refine((data) => {
    if (data.targetType === "deviceId") {
        return /^[0-9a-fA-F]{24}$/.test(data.targetValue);
    }
    return true;
}, {
    message: "Device ID must be a 24-character hex string",
    path: ["targetValue"],
});

interface NotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
    actionUrl?: string;
    type?: 'instant' | 'scheduled' | 'recurring';
    scheduledFor?: string;
    recurring?: {
        pattern: string;
        timezone: string;
    };
    targetDevices?: string[];
    targetTopics?: string[];
    targetTags?: string[];
}

export default function NotificationsPage() {
    const { data: project } = useCurrentProject()
    const [activeTab, setActiveTab] = useState("send")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            body: "",
            imageUrl: "",
            actionUrl: "",
            type: "instant",
            targetType: "deviceId",
            targetValue: "",
        },
    })

    const type = form.watch("type")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!project?._id) return

        try {
            const payload: NotificationPayload = {
                title: values.title,
                body: values.body,
                type: values.type as any,
            }

            if (values.imageUrl) payload.imageUrl = values.imageUrl
            if (values.actionUrl) payload.actionUrl = values.actionUrl

            if (values.type === "scheduled" && values.scheduledFor) {
                payload.scheduledFor = values.scheduledFor.toISOString()
            }

            if (values.type === "recurring" && values.recurringPattern) {
                payload.recurring = {
                    pattern: values.recurringPattern,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }
            }

            if (values.targetType === "deviceId") {
                payload.targetDevices = [values.targetValue]
            } else if (values.targetType === "topic") {
                payload.targetTopics = [values.targetValue]
            } else if (values.targetType === "tag") {
                payload.targetTags = [values.targetValue]
            }

            // Using 'any' cast because the generated client might have strict type checks that we are dynamically building
            await notificationsApi.notificationsSend(
                '', // xAPIKey (handled by proxy)
                project._id,
                crypto.randomUUID(),
                payload as any
            )

            toast.success("Notification sent successfully")
            form.reset()
            // Switch to history tab to show the new notification
            setActiveTab("history")
        } catch (error: any) {
            console.error(error)
            const errorMessage = error.response?.data?.message || "Failed to send notification"
            toast.error(errorMessage)

            // If it's a validation error (400), we can also set form errors if we want, 
            // but the toast is usually sufficient for this case.
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Notifications</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="send">Send Notification</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="send">
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Notification Title" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="body"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Body</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Notification Body" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="imageUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Image URL (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="actionUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Action URL (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="instant">Instant</SelectItem>
                                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                                            <SelectItem value="recurring">Recurring</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {type === "scheduled" && (
                                            <FormField
                                                control={form.control}
                                                name="scheduledFor"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Schedule For</FormLabel>
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
                                                        <FormDescription>
                                                            The notification will be sent at this date (Time selection not yet implemented in UI, defaults to midnight UTC).
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {type === "recurring" && (
                                            <FormField
                                                control={form.control}
                                                name="recurringPattern"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Cron Pattern</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="0 9 * * MON-FRI" {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Standard cron expression (e.g., "0 9 * * MON-FRI" for 9 AM weekdays).
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="targetType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Target Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select target type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="deviceId">Device ID</SelectItem>
                                                                <SelectItem value="topic">Topic</SelectItem>
                                                                <SelectItem value="tag">Tag</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="targetValue"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Target Value</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Device ID (24 hex), topic, or tag" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full">Send Notification</Button>
                            </form>
                        </Form>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <NotificationsHistory />
                </TabsContent>
            </Tabs>
        </div>
    )
}
