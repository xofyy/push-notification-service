'use client';

import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Project } from '@/types';

export function ProjectSwitcher() {
    const [selectedProject, setSelectedProject] = useState<string>('');

    const { data: projects, isLoading, error } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            try {
                // Pass empty string as dummy API key, handled by proxy
                const response = await projectsApi.projectsGetCurrent('');
                const data = response.data;
                // Handle wrapped response from TransformInterceptor
                const items = (data as any).data || data;
                return Array.isArray(items) ? (items as Project[]) : ([items] as Project[]);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
                throw error;
            }
        },
    });

    // Select first project by default when loaded
    useEffect(() => {
        if (projects && projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0]._id);
        }
    }, [projects, selectedProject]);

    if (error) {
        return <div className="text-red-500 text-sm">Error loading projects</div>;
    }

    return (
        <Select value={selectedProject} onValueChange={setSelectedProject} disabled={isLoading}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
                {projects?.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                        {project.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
