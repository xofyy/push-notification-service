"use client"

import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/lib/api/client"
import { useCurrentProject } from "@/hooks/use-current-project"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Bell, Zap } from "lucide-react"
import { DashboardStats } from "@/types"

export default function DashboardPage() {
  const { data: project } = useCurrentProject()

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["analytics", project?._id],
    queryFn: async () => {
      if (!project?._id) throw new Error("No project selected");
      // Use proxy, no API key needed
      const response = await analyticsApi.analyticsGetRealTimeData(project._id);
      return response.data as unknown as DashboardStats
    },
    enabled: !!project?._id,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error loading dashboard stats</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeDevices || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.notificationsSent || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deliveryRate || "0%"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.errors || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
