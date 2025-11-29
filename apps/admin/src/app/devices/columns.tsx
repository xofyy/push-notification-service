"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export interface Device {
    _id: string;
    token: string;
    platform: string;
    userId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastSeen?: string;
    tags?: string[];
    properties?: Record<string, any>;
}

export const columns: ColumnDef<Device>[] = [
    {
        accessorKey: "token",
        header: "Token",
        cell: ({ row }) => {
            const token = row.getValue("token") as string
            return <div className="max-w-[200px] truncate" title={token}>{token}</div>
        },
    },
    {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ row }) => (
            <Badge variant="outline">{row.getValue("platform")}</Badge>
        ),
    },
    {
        accessorKey: "userId",
        header: "User ID",
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive")
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(date);
        },
    },
]
