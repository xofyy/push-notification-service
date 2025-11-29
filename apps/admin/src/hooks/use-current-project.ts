import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/client';
import { Project } from '@/types';

export function useCurrentProject() {
    return useQuery<Project | null>({
        queryKey: ['current-project'],
        queryFn: async () => {
            // No API Key needed here, handled by proxy, but TS requires an argument
            const response = await projectsApi.projectsGetCurrent('');
            const data = response.data;
            // Handle wrapped response from TransformInterceptor
            const items = (data as any).data || data;

            if (Array.isArray(items)) {
                return items.length > 0 ? (items[0] as Project) : null;
            }
            return items ? (items as Project) : null;
        },
    });
}
