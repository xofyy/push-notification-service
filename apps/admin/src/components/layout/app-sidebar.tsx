'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Home, LayoutDashboard, Bell, Activity, FileText, Webhook } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProjectSwitcher } from './project-switcher';

const items = [
    {
        title: 'Dashboard',
        url: '/',
        icon: Home,
    },
    {
        title: 'Projects',
        url: '/projects',
        icon: LayoutDashboard,
    },
    {
        title: 'Devices',
        url: '/devices',
        icon: Activity,
    },
    {
        title: 'Templates',
        url: '/templates',
        icon: FileText,
    },
    {
        title: 'Webhooks',
        url: '/webhooks',
        icon: Webhook,
    },
    {
        title: 'Notifications',
        url: '/notifications',
        icon: Bell,
    },

];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Bell className="h-4 w-4" />
                    </div>
                    <div className="font-semibold">Push Service</div>
                </div>
                <div className="px-4 pb-2">
                    <ProjectSwitcher />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
