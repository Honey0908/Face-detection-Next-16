import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  listUsers,
  type UsersSortField,
  type UsersSortOrder,
} from '@/lib/db/user';
import { requireAdminApiAccess } from '@/lib/auth/admin';

const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 50;
const LIMIT_MAX = 100;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGE_DEFAULT),
  limit: z.coerce.number().int().min(1).max(LIMIT_MAX).default(LIMIT_DEFAULT),
  sort: z.string().optional().default('name'),
  department: z.string().trim().optional(),
});

function parseSort(sort: string): {
  field: UsersSortField;
  order: UsersSortOrder;
} {
  const isDesc = sort.startsWith('-');
  const rawField = (isDesc ? sort.slice(1) : sort) as UsersSortField;

  if (!['name', 'department', 'createdAt'].includes(rawField)) {
    throw new Error('Invalid sort field. Allowed: name, department, createdAt');
  }

  return {
    field: rawField,
    order: isDesc ? 'desc' : 'asc',
  };
}

export async function GET(request: NextRequest) {
  const authError = requireAdminApiAccess(request);
  if (authError) {
    return authError;
  }

  try {
    const url = new URL(request.url);
    const rawQuery = {
      page: url.searchParams.get('page') ?? PAGE_DEFAULT,
      limit: url.searchParams.get('limit') ?? LIMIT_DEFAULT,
      sort: url.searchParams.get('sort') ?? 'name',
      department: url.searchParams.get('department') ?? undefined,
    };

    const validated = querySchema.parse(rawQuery);
    const { field, order } = parseSort(validated.sort);

    const result = await listUsers({
      page: validated.page,
      limit: validated.limit,
      sort: field,
      order,
      department: validated.department,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          users: result.users,
          pagination: {
            totalCount: result.totalCount,
            page: result.page,
            pageSize: result.pageSize,
            totalPages: result.totalPages,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message.startsWith('Invalid sort field')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.message,
        },
        { status: 400 },
      );
    }

    console.error('Users API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to load users',
      },
      { status: 500 },
    );
  }
}
