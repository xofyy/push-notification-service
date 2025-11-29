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
import { useCurrentProject } from "@/hooks/use-current-project"
import { projectsApi } from "@/lib/api/client"
import { toast } from "sonner"
import { useEffect } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Trash2, RefreshCw } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
})

export default function ProjectsPage() {
    const { data: project, refetch } = useCurrentProject()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    })

    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name,
                description: project.description || "",
            })
        }
    }, [project, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!project?._id) return

        try {
            await projectsApi.projectsUpdate(
                '',
                project._id,
                {
                    name: values.name,
                    description: values.description,
                }
            )

            toast.success("Project updated successfully")
            refetch()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update project")
        }
    }

    async function onRegenerateKey() {
        if (!project?._id) return
        try {
            await projectsApi.projectsRotateApiKey('', project._id)
            toast.success("API Key regenerated successfully")
            refetch()
        } catch (error) {
            console.error(error)
            toast.error("Failed to regenerate API key")
        }
    }

    async function onDeleteProject() {
        if (!project?._id) return
        try {
            await projectsApi.projectsRemove('', project._id)
            toast.success("Project deleted successfully")
            // Force reload to clear state and redirect
            window.location.href = "/"
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete project")
        }
    }

    if (!project) return <div>Loading...</div>

    return (
        <div className="p-6 max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-6">Project Settings</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My App" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Project description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Save Changes</Button>
                    </form>
                </Form>
            </div>

            <Separator />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </h2>

                <div className="border border-destructive/50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Regenerate API Key</h3>
                            <p className="text-sm text-muted-foreground">
                                This will invalidate the current API key immediately.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Regenerate Key
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <p>
                                                This action cannot be undone. Any applications using the current API key will stop working until updated with the new key.
                                            </p>
                                            <div className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 p-3 rounded-md text-sm border border-yellow-500/20">
                                                <strong>Warning:</strong> If this project is used by this Admin Panel, regenerating the key will disconnect the panel. You will need to manually update the <code>API_KEY</code> in <code>.env.local</code> and restart the application.
                                            </div>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onRegenerateKey}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-destructive">Delete Project</h3>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete this project and all its data.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Project
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the project
                                        <span className="font-bold"> {project.name} </span>
                                        and remove all associated data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete Project
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </div>
    )
}
