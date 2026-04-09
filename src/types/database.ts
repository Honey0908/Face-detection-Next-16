/**
 * Database Type Exports
 *
 * Central location for all database-related types.
 * Re-exports Prisma types for easier imports throughout the application.
 */

import { User, LunchRecord, Prisma } from '@prisma/client';

// Model types
export type { User, LunchRecord };

// Prisma namespace for utility types
export { Prisma };

// Utility types for database operations
export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserWhereInput = Prisma.UserWhereInput;
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;

export type LunchRecordCreateInput = Prisma.LunchRecordCreateInput;
export type LunchRecordWhereInput = Prisma.LunchRecordWhereInput;
export type LunchRecordWhereUniqueInput = Prisma.LunchRecordWhereUniqueInput;

// Include types for relations
export type UserWithLunchRecords = Prisma.UserGetPayload<{
  include: { lunchRecords: true };
}>;

export type LunchRecordWithUser = Prisma.LunchRecordGetPayload<{
  include: { user: true };
}>;

export interface UserListItem {
  id: string;
  employeeId: string;
  name: string;
  department: string | null;
  email: string | null;
  createdAt: Date;
}

export interface UserListPagination {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserListApiResponse {
  success: true;
  data: {
    users: UserListItem[];
    pagination: UserListPagination;
  };
}
