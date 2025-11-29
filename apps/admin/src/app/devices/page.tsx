"use client"

import { useQuery } from "@tanstack/react-query"
import { devicesApi } from "@/lib/api/client"
import { useCurrentProject } from "@/hooks/use-current-project"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useState } from "react"

export default function DevicesPage() {
    const { data: project } = useCurrentProject()
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const { data: devicesData, isLoading } = useQuery({
        queryKey: ["devices", project?._id],
        queryFn: async () => {
            if (!project?._id) return []
            const response = await devicesApi.devicesFindAll(
                project._id,
                undefined as any, // platform
                undefined as any, // userId
                undefined as any, // tags
                undefined as any, // topics
                undefined as any, // isActive
                '' // API Key injected by proxy
            )
            return response.data
        },
        enabled: !!project?._id,
    })

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Devices</h1>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={devicesData || []}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            )}
        </div>
    )
}
