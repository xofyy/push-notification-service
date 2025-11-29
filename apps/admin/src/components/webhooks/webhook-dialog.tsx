"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect } from "react"
import { Webhook } from "@/types"

const events = [
    { id: "notification.sent", label: "Notification Sent" },
    { id: "notification.delivered", label: "Notification Delivered" },
    { id: "notification.failed", label: "Notification Failed" },
    { id: "notification.clicked", label: "Notification Clicked" },
] as const

const formSchema = z.object({
    url: z.string().url("Please enter a valid URL"),
    events: z.array(z.string()).refine((value) => value.length > 0, {
        message: "You have to select at least one event.",
    }),
})

interface WebhookDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    initialData?: Webhook | null
    mode: "create" | "edit"
}

export function WebhookDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
}: WebhookDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            url: "",
            events: [],
        },
    })

    useEffect(() => {
        if (initialData && mode === "edit") {
            form.reset({
                url: initialData.url,
                events: initialData.events,
            })
        } else {
            form.reset({
                url: "",
                events: [],
            })
        }
    }, [initialData, mode, form])

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add Webhook" : "Edit Webhook"}</DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Add a new webhook to receive real-time events."
                            : "Update existing webhook details."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Webhook URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://api.example.com/webhooks" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The URL where we will send POST requests.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="events"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Events</FormLabel>
                                        <FormDescription>
                                            Select the events you want to subscribe to.
                                        </FormDescription>
                                    </div>
                                    {events.map((item) => (
                                        <FormField
                                            key={item.id}
                                            control={form.control}
                                            name="events"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={item.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== item.id
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {item.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">
                                {mode === "create" ? "Add Webhook" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
