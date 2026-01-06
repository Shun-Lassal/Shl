/**
 * Base Repository class for standardized data access patterns
 */

import { PrismaClient } from '@prisma/client';
import { prisma } from '../prisma.js';

export abstract class BaseRepository {
  protected db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  /**
   * Create a new record
   */
  abstract create(data: any): Promise<any>;

  /**
   * Find record by ID
   */
  abstract findById(id: string | number): Promise<any>;

  /**
   * Find all records
   */
  abstract findAll(options?: { skip?: number; take?: number }): Promise<any[]>;

  /**
   * Update a record
   */
  abstract update(id: string | number, data: any): Promise<any>;

  /**
   * Delete a record
   */
  abstract delete(id: string | number): Promise<any>;

  /**
   * Check if record exists
   */
  abstract exists(id: string | number): Promise<boolean>;
}
