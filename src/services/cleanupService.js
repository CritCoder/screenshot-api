import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import logger from '../middleware/logger.js';

const prisma = new PrismaClient();

class CleanupService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.maxFileAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    this.cleanupInterval = 60 * 60 * 1000; // Run every hour
    this.intervalId = null;
  }

  async start() {
    logger.info('Starting file cleanup service');
    
    // Run cleanup immediately
    await this.cleanup();
    
    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.cleanup().catch(error => {
        logger.error('Cleanup service error:', error);
      });
    }, this.cleanupInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('File cleanup service stopped');
    }
  }

  async cleanup() {
    try {
      const cutoffTime = new Date(Date.now() - this.maxFileAge);
      logger.info(`Running file cleanup for files older than ${cutoffTime.toISOString()}`);

      // Get old requests from database
      const oldRequests = await prisma.request.findMany({
        where: {
          createdAt: {
            lt: cutoffTime
          },
          filePath: {
            not: null
          }
        },
        select: {
          id: true,
          filePath: true
        }
      });

      let deletedFiles = 0;
      let errors = 0;

      for (const request of oldRequests) {
        try {
          // Convert relative path to absolute path
          const filename = path.basename(request.filePath);
          const absolutePath = path.join(this.uploadDir, filename);

          // Check if file exists and delete it
          try {
            await fs.access(absolutePath);
            await fs.unlink(absolutePath);
            deletedFiles++;
            logger.debug(`Deleted file: ${filename}`);
          } catch (fileError) {
            if (fileError.code !== 'ENOENT') {
              logger.warn(`Failed to delete file ${filename}:`, fileError.message);
              errors++;
            }
            // If file doesn't exist, that's fine - it may have been deleted already
          }

          // Update database record
          await prisma.request.update({
            where: { id: request.id },
            data: { filePath: null }
          });

        } catch (error) {
          logger.error(`Error processing request ${request.id}:`, error);
          errors++;
        }
      }

      // Also clean up orphaned files (files that exist but have no database record)
      await this.cleanupOrphanedFiles();

      logger.info(`Cleanup completed: ${deletedFiles} files deleted, ${errors} errors`);

    } catch (error) {
      logger.error('Cleanup service error:', error);
    }
  }

  async cleanupOrphanedFiles() {
    try {
      const files = await fs.readdir(this.uploadDir);
      const cutoffTime = new Date(Date.now() - this.maxFileAge);

      let orphanedFiles = 0;

      for (const filename of files) {
        if (filename.startsWith('.')) continue; // Skip hidden files

        const filePath = path.join(this.uploadDir, filename);
        
        try {
          const stats = await fs.stat(filePath);
          
          // Check if file is old
          if (stats.mtime < cutoffTime) {
            // Check if file has a corresponding database record
            const request = await prisma.request.findFirst({
              where: {
                filePath: `/uploads/${filename}`
              }
            });

            // If no database record found, delete the orphaned file
            if (!request) {
              await fs.unlink(filePath);
              orphanedFiles++;
              logger.debug(`Deleted orphaned file: ${filename}`);
            }
          }
        } catch (error) {
          logger.warn(`Error processing file ${filename}:`, error.message);
        }
      }

      if (orphanedFiles > 0) {
        logger.info(`Cleaned up ${orphanedFiles} orphaned files`);
      }

    } catch (error) {
      logger.error('Error cleaning up orphaned files:', error);
    }
  }

  async getStorageStats() {
    try {
      const files = await fs.readdir(this.uploadDir);
      let totalSize = 0;
      let fileCount = 0;

      for (const filename of files) {
        if (filename.startsWith('.')) continue;

        const filePath = path.join(this.uploadDir, filename);
        try {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          fileCount++;
        } catch (error) {
          // File might have been deleted between readdir and stat
        }
      }

      return {
        fileCount,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
      };

    } catch (error) {
      logger.error('Error getting storage stats:', error);
      return {
        fileCount: 0,
        totalSize: 0,
        totalSizeMB: '0.00'
      };
    }
  }
}

export default CleanupService;