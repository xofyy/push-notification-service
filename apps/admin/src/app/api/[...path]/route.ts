import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY?.trim();
const ADMIN_SECRET = process.env.ADMIN_SECRET?.trim();

async function handleRequest(request: NextRequest, params: { path: string[] }) {
    const path = params.path.join('/');
    // The path already includes 'v1' from the generated API client
    const url = `${API_URL}/api/${path}${request.nextUrl.search}`;

    try {
        const headers = new Headers(request.headers);

        // Inject Admin Secret or API Key
        if (ADMIN_SECRET) {
            headers.set('X-Admin-Secret', ADMIN_SECRET);
        } else if (API_KEY) {
            headers.set('X-API-Key', API_KEY);
        } else {
            console.error('[Proxy] Neither ADMIN_SECRET nor API_KEY is defined in server environment variables');
            return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
        }

        // Remove host header to avoid conflicts
        headers.delete('host');

        const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob();

        const response = await fetch(url, {
            method: request.method,
            headers,
            body,
            cache: 'no-store',
        });

        console.log(`[Proxy] Backend response status: ${response.status}`);

        // Handle 204 No Content specifically
        if (response.status === 204) {
            return new NextResponse(null, {
                status: 204,
                statusText: 'No Content',
                headers: response.headers,
            });
        }

        const data = await response.blob();

        return new NextResponse(data, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (error) {
        console.error('[Proxy] Error:', error);
        return NextResponse.json({ error: 'Proxy Error' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return handleRequest(request, { path });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return handleRequest(request, { path });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return handleRequest(request, { path });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return handleRequest(request, { path });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return handleRequest(request, { path });
}
