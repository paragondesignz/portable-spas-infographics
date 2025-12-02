import { NextRequest, NextResponse } from 'next/server';
import { listInfographics, deleteInfographic } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const infographics = await listInfographics();
    return NextResponse.json({ success: true, infographics });
  } catch (error) {
    console.error('List infographics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list infographics',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await deleteInfographic(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete infographic error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete infographic',
      },
      { status: 500 }
    );
  }
}
