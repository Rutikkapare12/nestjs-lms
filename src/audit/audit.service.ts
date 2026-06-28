import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schema/audit.schma';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('AuditService');

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLog>,
  ) {}

  async log(data: Partial<AuditLog>) {
    try {
      const auditLog = await this.auditModel.create(data);
      this.logger.log(
        `Audit: ${(data as any).action} - Entity: ${(data as any).entityType}`,
      );
      return auditLog;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
      throw error;
    }
  }

  async getAuditLogs(
    filters?: Partial<AuditLog>,
    limit: number = 100,
    skip: number = 0,
  ) {
    return await this.auditModel
      .find(filters || {})
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAuditLogsByEntity(entityType: string, entityId: string) {
    return await this.auditModel
      .find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAuditLogsByUser(
    userId: string,
    limit: number = 50,
    skip: number = 0,
  ) {
    return await this.auditModel
      .find({ userId })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();
  }

  async countLogs(filters?: Partial<AuditLog>): Promise<number> {
    return await this.auditModel.countDocuments(filters || {});
  }
}
