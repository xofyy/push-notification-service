"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsApi } from "@/lib/api/client"
import { useCurrentProject } from "@/hooks/use-current-project"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Notification } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Ban, RefreshCw, Clock } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export function NotificationsHistory() {
    const { data: project } = useCurrentProject()
    const queryClient = useQueryClient()
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const { data: notifications, isLoading } = useQuery({
        queryKey: ["notifications", project?._id, pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            if (!project?._id) return []
            const response = await notificationsApi.notificationsList(
                '', // xAPIKey (handled by config/proxy)
                project._id,
                undefined,
                undefined,
                pagination.pageSize,
                pagination.pageIndex * pagination.pageSize,
                'createdAt',
                'desc'
            )
            const data = response.data
            const items = (data as any).data?.items || (data as any).items || []
            return items as Notification[]
        },
        enabled: !!project?._id,
    })

    const cancelMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!project?._id) throw new Error("No project selected")
            await notificationsApi.notificationsCancel('', project._id, id)
        },
        onSuccess: () => {
            toast.success("Notification canceled")
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to cancel notification")
        },
    })

    const columns: ColumnDef<Notification>[] = [
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue("type") as string
                return (
                    <div className="flex items-center gap-2">
                        {type === "SCHEDULED" && <Clock className="h-4 w-4 text-orange-500" />}
                        {type === "RECURRING" && <RefreshCw className="h-4 w-4 text-blue-500" />}
                        <span className="capitalize">{type.toLowerCase()}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={
                        status === "SENT" ? "default" :
                            status === "FAILED" ? "destructive" :
                                status === "PENDING" ? "outline" :
                                    "secondary"
                    }>
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "scheduledFor",
            header: "Scheduled For",
            cell: ({ row }) => {
                const date = row.getValue("scheduledFor") as string
                return date ? format(new Date(date), "PPp") : "-"
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => {
                const date = row.getValue("createdAt") as string
                return date ? format(new Date(date), "PPp") : "-"
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const notification = row.original
                const isCancellable = (notification.status === "PENDING" || notification.status === "SCHEDULED") &&
                    (notification.type === "SCHEDULED" || notification.type === "RECURRING")

                if (!isCancellable) return null

                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            if (confirm("Are you sure you want to cancel this notification?")) {
                                cancelMutation.mutate(notification._id)
                            }
                        }}
                    >
                        <Ban className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                )
            },
        },
    ]

    if (isLoading) return <div>Loading...</div>

    return (
        <DataTable
            columns={columns}
            data={notifications || []}
            pagination={pagination}
            onPaginationChange={setPagination}
        />
    )
}
