"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { webhooksApi } from "@/lib/api/client"
import { useCurrentProject } from "@/hooks/use-current-project"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { WebhookDialog } from "@/components/webhooks/webhook-dialog"
import { Webhook } from "@/types"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function WebhooksPage() {
    const { data: project } = useCurrentProject()
    const queryClient = useQueryClient()
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedWebhook, setSelectedWebhook] = useState<{ webhook: Webhook; index: number } | null>(null)
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")

    const { data: webhooks, isLoading } = useQuery({
        queryKey: ["webhooks", project?._id],
        queryFn: async () => {
            if (!project?._id) return []
            const response = await webhooksApi.webhooksList(project._id)
            // Unwrap response
            const data = response.data
            const items = (data as any).data || data
            return Array.isArray(items) ? (items as Webhook[]) : ([items] as Webhook[])
        },
        enabled: !!project?._id,
    })

    const createMutation = useMutation({
        mutationFn: async (values: any) => {
            if (!project?._id) throw new Error("No project selected")
            await webhooksApi.webhooksAdd(project._id, values)
        },
        onSuccess: () => {
            toast.success("Webhook added successfully")
            queryClient.invalidateQueries({ queryKey: ["webhooks"] })
            setIsDialogOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to add webhook")
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (values: any) => {
            if (!project?._id || selectedWebhook === null) throw new Error("No project or webhook selected")
            await webhooksApi.webhooksUpdate(project._id, selectedWebhook.index.toString(), values)
        },
        onSuccess: () => {
            toast.success("Webhook updated successfully")
            queryClient.invalidateQueries({ queryKey: ["webhooks"] })
            setIsDialogOpen(false)
            setSelectedWebhook(null)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update webhook")
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (index: number) => {
            if (!project?._id) throw new Error("No project selected")
            await webhooksApi.webhooksRemove(project._id, index.toString())
        },
        onSuccess: () => {
            toast.success("Webhook deleted successfully")
            queryClient.invalidateQueries({ queryKey: ["webhooks"] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete webhook")
        },
    })

    const rotateSecretMutation = useMutation({
        mutationFn: async () => {
            if (!project?._id) throw new Error("No project selected")
            await webhooksApi.webhooksRotateSecret(project._id)
        },
        onSuccess: () => {
            toast.success("Webhook secret rotated successfully")
            queryClient.invalidateQueries({ queryKey: ["webhooks"] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to rotate webhook secret")
        },
    })

    const handleCreate = () => {
        setSelectedWebhook(null)
        setDialogMode("create")
        setIsDialogOpen(true)
    }

    const handleEdit = (webhook: Webhook, index: number) => {
        setSelectedWebhook({ webhook, index })
        setDialogMode("edit")
        setIsDialogOpen(true)
    }

    const handleDelete = (webhook: Webhook, index: number) => {
        if (confirm("Are you sure you want to delete this webhook?")) {
            deleteMutation.mutate(index)
        }
    }

    const handleRotateSecret = () => {
        if (confirm("Are you sure you want to rotate the webhook signing secret? This will invalidate the old secret.")) {
            rotateSecretMutation.mutate()
        }
    }

    const handleSubmit = (values: any) => {
        if (dialogMode === "create") {
            createMutation.mutate(values)
        } else {
            updateMutation.mutate(values)
        }
    }

    const columns = getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onRotateSecret: handleRotateSecret,
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Webhooks</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Webhook
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Signing Secret</CardTitle>
                    <CardDescription>
                        This secret is used to sign webhook events so you can verify they came from us.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                        {webhooks && webhooks.length > 0 ? webhooks[0].secret : "No webhooks configured"}
                    </code>
                    <Button variant="outline" size="sm" onClick={handleRotateSecret} disabled={!webhooks || webhooks.length === 0}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Rotate Secret
                    </Button>
                </CardContent>
            </Card>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={webhooks || []}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            )}

            <WebhookDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleSubmit}
                initialData={selectedWebhook?.webhook}
                mode={dialogMode}
            />
        </div>
    )
}
