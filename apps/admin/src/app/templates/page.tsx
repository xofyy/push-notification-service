"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { templatesApi } from "@/lib/api/client"
import { useCurrentProject } from "@/hooks/use-current-project"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TemplateDialog } from "@/components/templates/template-dialog"
import { Template } from "@/types"
import { toast } from "sonner"

export default function TemplatesPage() {
    const { data: project } = useCurrentProject()
    const queryClient = useQueryClient()
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")

    const { data: templates, isLoading } = useQuery({
        queryKey: ["templates", project?._id],
        queryFn: async () => {
            if (!project?._id) return []
            const response = await templatesApi.templatesFindAll(
                project._id,
                undefined, // status
                undefined, // language
                undefined, // limit
                undefined // offset
            )
            // Unwrap response
            const data = response.data
            const items = (data as any).data || data
            return Array.isArray(items) ? (items as Template[]) : ([items] as Template[])
        },
        enabled: !!project?._id,
    })

    const createMutation = useMutation({
        mutationFn: async (values: any) => {
            if (!project?._id) throw new Error("No project selected")
            await templatesApi.templatesCreate(project._id, values)
        },
        onSuccess: () => {
            toast.success("Template created successfully")
            queryClient.invalidateQueries({ queryKey: ["templates"] })
            setIsDialogOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create template")
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (values: any) => {
            if (!project?._id || !selectedTemplate?._id) throw new Error("No project or template selected")
            await templatesApi.templatesUpdate(project._id, selectedTemplate._id, values)
        },
        onSuccess: () => {
            toast.success("Template updated successfully")
            queryClient.invalidateQueries({ queryKey: ["templates"] })
            setIsDialogOpen(false)
            setSelectedTemplate(null)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update template")
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (templateId: string) => {
            if (!project?._id) throw new Error("No project selected")
            await templatesApi.templatesRemove(project._id, templateId)
        },
        onSuccess: () => {
            toast.success("Template deleted successfully")
            queryClient.invalidateQueries({ queryKey: ["templates"] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete template")
        },
    })

    const handleCreate = () => {
        setSelectedTemplate(null)
        setDialogMode("create")
        setIsDialogOpen(true)
    }

    const handleEdit = (template: Template) => {
        setSelectedTemplate(template)
        setDialogMode("edit")
        setIsDialogOpen(true)
    }

    const handleDelete = (template: Template) => {
        if (confirm("Are you sure you want to delete this template?")) {
            deleteMutation.mutate(template._id)
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
    })

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Templates</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                </Button>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={templates || []}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            )}

            <TemplateDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleSubmit}
                initialData={selectedTemplate}
                mode={dialogMode}
            />
        </div>
    )
}
