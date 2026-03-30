/**
 * Face Matching Utilities (Server-Side)
 *
 * Compares face descriptors using Euclidean distance.
 * Includes threshold-based matching and confidence level calculation.
 */

// Matching constants
const DESCRIPTOR_LENGTH = 128;
const DEFAULT_THRESHOLD = 0.6;

// Confidence level thresholds
const HIGH_CONFIDENCE_THRESHOLD = 0.3;
const MEDIUM_CONFIDENCE_THRESHOLD = 0.5;
const LOW_CONFIDENCE_THRESHOLD = 0.6;

// Confidence level enum
export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  NO_MATCH = 'no_match',
}

// Match result interface
export interface MatchResult {
  matched: boolean;
  userId?: string;
  distance?: number;
  confidence?: ConfidenceLevel;
  error?: string;
}

// User descriptor interface
export interface UserDescriptor {
  userId: string;
  descriptor: number[] | Float32Array;
  name?: string;
  [key: string]: any;
}

// In-memory descriptor cache
let descriptorCache: UserDescriptor[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate Euclidean distance between two descriptors
 *
 * @param descriptor1 - First face descriptor
 * @param descriptor2 - Second face descriptor
 * @returns Euclidean distance (lower = more similar)
 */
export function euclideanDistance(
  descriptor1: number[] | Float32Array,
  descriptor2: number[] | Float32Array,
): number {
  if (
    descriptor1.length !== DESCRIPTOR_LENGTH ||
    descriptor2.length !== DESCRIPTOR_LENGTH
  ) {
    throw new Error(
      `Invalid descriptor length. Expected ${DESCRIPTOR_LENGTH}.`,
    );
  }

  let sumSquares = 0;
  for (let i = 0; i < DESCRIPTOR_LENGTH; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sumSquares += diff * diff;
  }

  return Math.sqrt(sumSquares);
}

/**
 * Validate descriptor before matching
 *
 * @param descriptor - Descriptor to validate
 * @returns True if valid
 */
export function validateDescriptorForMatching(
  descriptor: number[] | Float32Array,
): boolean {
  // Check length
  if (descriptor.length !== DESCRIPTOR_LENGTH) {
    return false;
  }

  // Check for finite values
  for (let i = 0; i < descriptor.length; i++) {
    if (!isFinite(descriptor[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate confidence level from distance
 *
 * @param distance - Euclidean distance
 * @returns Confidence level
 */
export function getConfidenceLevel(distance: number): ConfidenceLevel {
  if (distance < HIGH_CONFIDENCE_THRESHOLD) {
    return ConfidenceLevel.HIGH;
  } else if (distance < MEDIUM_CONFIDENCE_THRESHOLD) {
    return ConfidenceLevel.MEDIUM;
  } else if (distance < LOW_CONFIDENCE_THRESHOLD) {
    return ConfidenceLevel.LOW;
  } else {
    return ConfidenceLevel.NO_MATCH;
  }
}

/**
 * Find best matching user from registered users
 *
 * Compares input descriptor against all registered users and
 * returns the closest match if within threshold.
 *
 * @param inputDescriptor - Face descriptor to match
 * @param registeredUsers - Array of registered user descriptors
 * @param threshold - Maximum distance for match (default from env or 0.6)
 * @returns Match result with user ID and confidence
 */
export function findBestMatch(
  inputDescriptor: number[] | Float32Array,
  registeredUsers: UserDescriptor[],
  threshold?: number,
): MatchResult {
  // Validate input descriptor
  if (!validateDescriptorForMatching(inputDescriptor)) {
    return {
      matched: false,
      error: 'Invalid input descriptor',
    };
  }

  // Get threshold from parameter or environment or default
  const matchThreshold =
    threshold ??
    (process.env.FACE_MATCH_THRESHOLD
      ? parseFloat(process.env.FACE_MATCH_THRESHOLD)
      : DEFAULT_THRESHOLD);

  // Handle empty user list
  if (registeredUsers.length === 0) {
    return {
      matched: false,
      error: 'No registered users to match against',
    };
  }

  // Convert input to Float32Array once for efficiency
  const inputFloat32 =
    inputDescriptor instanceof Float32Array
      ? inputDescriptor
      : new Float32Array(inputDescriptor);

  // Find closest match
  let bestMatch: MatchResult = {
    matched: false,
  };
  let minDistance = Infinity;

  for (const user of registeredUsers) {
    // Validate user descriptor
    if (!validateDescriptorForMatching(user.descriptor)) {
      console.warn(`Skipping user ${user.userId} - invalid descriptor`);
      continue;
    }

    try {
      // Calculate distance
      const distance = euclideanDistance(inputFloat32, user.descriptor);

      // Early exit if perfect match (distance = 0)
      if (distance === 0) {
        return {
          matched: true,
          userId: user.userId,
          distance: 0,
          confidence: ConfidenceLevel.HIGH,
        };
      }

      // Update best match if closer
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = {
          matched: distance <= matchThreshold,
          userId: user.userId,
          distance: distance,
          confidence: getConfidenceLevel(distance),
        };

        // Early exit if very strong match (no need to check remaining users)
        if (distance < matchThreshold * 0.5) {
          return bestMatch;
        }
      }
    } catch (error) {
      console.error(`Error matching user ${user.userId}:`, error);
      continue;
    }
  }

  // Check if we found a match within threshold
  if (!bestMatch.matched) {
    return {
      matched: false,
      error:
        minDistance !== Infinity
          ? `No match found within threshold. Closest distance: ${minDistance.toFixed(3)}`
          : 'No valid matches found',
    };
  }

  return bestMatch;
}

/**
 * Set descriptor cache
 *
 * @param descriptors - Array of user descriptors to cache
 */
export function setCachedDescriptors(descriptors: UserDescriptor[]): void {
  descriptorCache = descriptors;
  cacheTimestamp = Date.now();
}

/**
 * Get cached descriptors if not expired
 *
 * @returns Cached descriptors or null if expired/empty
 */
export function getCachedDescriptors(): UserDescriptor[] | null {
  if (!descriptorCache) {
    return null;
  }

  // Check if cache is expired
  const age = Date.now() - cacheTimestamp;
  if (age > CACHE_TTL) {
    descriptorCache = null;
    return null;
  }

  return descriptorCache;
}

/**
 * Invalidate descriptor cache
 *
 * Call when new users are registered or descriptors are updated.
 */
export function invalidateDescriptorCache(): void {
  descriptorCache = null;
  cacheTimestamp = 0;
}

/**
 * Warmup descriptor cache on server startup
 *
 * Loads all user descriptors into memory for faster matching.
 * Should be called once during server initialization.
 *
 * @returns Number of descriptors loaded
 */
export async function warmupDescriptorCache(): Promise<number> {
  try {
    // Import getAllUsers dynamically to avoid circular deps
    const { getAllUsers } = await import('@/lib/db/user');

    const users = await getAllUsers();

    const userDescriptors: UserDescriptor[] = users.map((user) => ({
      userId: user.id,
      descriptor: user.faceDescriptor,
      name: user.name,
      employeeId: user.employeeId,
    }));

    setCachedDescriptors(userDescriptors);

    console.log(
      `✓ Descriptor cache warmed up with ${userDescriptors.length} users`,
    );
    return userDescriptors.length;
  } catch (error) {
    console.error('Failed to warmup descriptor cache:', error);
    return 0;
  }
}

/**
 * Batch compare descriptor against multiple users (optimized)
 *
 * Alternative to findBestMatch that uses cached descriptors for better performance.
 *
 * @param inputDescriptor - Face descriptor to match
 * @param threshold - Maximum distance for match
 * @returns Match result with user ID and confidence
 */
export async function batchCompare(
  inputDescriptor: number[] | Float32Array,
  threshold?: number,
): Promise<MatchResult> {
  // Check cache first
  let users = getCachedDescriptors();

  // If no cache, this function expects cache to be set externally
  if (!users) {
    return {
      matched: false,
      error:
        'Descriptor cache not initialized. Call setCachedDescriptors first.',
    };
  }

  // Use findBestMatch with cached users
  return findBestMatch(inputDescriptor, users, threshold);
}
