/**
 * User Database Operations
 *
 * CRUD operations for User model.
 * Includes face matching queries for lunch scan feature.
 */

import prisma from '../prisma';
import { User, Prisma } from '@prisma/client';
import { createUserSchema } from '../validation/schemas';
import { z } from 'zod';

/**
 * Get user by employee ID
 *
 * @param employeeId - Unique employee identifier
 * @returns User or null if not found
 */
export async function getUserByEmployeeId(
  employeeId: string,
): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { employeeId },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by employeeId:', error);
    throw new Error('Failed to fetch user');
  }
}

/**
 * Get all users with face descriptors
 *
 * Used for face matching during lunch scan.
 * Loads all users into memory for Euclidean distance comparison.
 *
 * @returns Array of all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        name: true,
        faceDescriptor: true,
        email: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users for face matching');
  }
}

/**
 * Get user by ID
 *
 * @param id - User's unique ID
 * @returns User or null if not found
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Failed to fetch user');
  }
}

/**
 * Create a new user
 *
 * Validates input data before insertion.
 * Ensures face descriptor is 128 floats and employeeId is unique.
 *
 * @param data - User creation data
 * @returns Created user
 * @throws Error if validation fails or employeeId already exists
 */
export async function createUser(
  data: z.infer<typeof createUserSchema>,
): Promise<User> {
  // Validate input data
  const validated = createUserSchema.parse(data);

  try {
    const user = await prisma.user.create({
      data: {
        employeeId: validated.employeeId,
        name: validated.name,
        faceDescriptor: validated.faceDescriptor,
        email: validated.email ?? null,
        department: validated.department ?? null,
      },
    });

    return user;
  } catch (error) {
    // Handle unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error(`Employee ID '${validated.employeeId}' already exists`);
      }
    }

    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Update user information
 *
 * @param id - User's unique ID
 * @param data - Fields to update
 * @returns Updated user
 */
export async function updateUser(
  id: string,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

/**
 * Delete user
 *
 * Note: Cascade delete will remove all associated lunch records.
 *
 * @param id - User's unique ID
 * @returns Deleted user
 */
export async function deleteUser(id: string): Promise<User> {
  try {
    const user = await prisma.user.delete({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * Get total user count
 *
 * @returns Total number of registered employees
 */
export async function getUserCount(): Promise<number> {
  try {
    const count = await prisma.user.count();
    return count;
  } catch (error) {
    console.error('Error counting users:', error);
    throw new Error('Failed to count users');
  }
}
