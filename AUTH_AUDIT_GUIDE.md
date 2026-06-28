# Auth & Audit Modules - Production Guide

## Overview

This guide explains how to properly use the Auth and Audit modules in your NestJS LMS application following production-ready patterns.

## Auth Module

### Architecture

The Auth module is organized into:

- **Controllers**: Handle authentication endpoints (login, register)
- **Services**: Business logic for authentication
- **Guards**: Protect routes (AuthGuard, RolesGuard)
- **Decorators**: Custom decorators for metadata and user injection
- **Interfaces**: Type definitions for auth objects
- **Services**: JWT configuration management

### Key Features

#### 1. JWT Configuration (Production-Ready)

JWT is now configured via `ConfigService` for environment variables:

```typescript
// Environment variables (.env)
JWT_SECRET = your - secret - key - here;
JWT_EXPIRATION = 3600; // in seconds
```

The configuration is loaded from your `.env` file automatically.

#### 2. Using Auth Guards & Decorators

**Protecting Routes with Role-Based Access Control:**

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles, AuthGuard, RolesGuard } from 'src/auth';
import { Role } from 'src/modules/user/user.types';

@Controller('admin')
export class AdminController {
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('create-user')
  createUser() {
    // Only admins can access this
  }
}
```

#### 3. Injecting Current User

Use the `@CurrentUser()` decorator to get the authenticated user:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { IAuthUser } from 'src/auth/interfaces';

@Controller('courses')
export class CourseController {
  @Post()
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: IAuthUser,
  ) {
    console.log('Created by:', user.email);
    return this.courseService.create(createCourseDto, user);
  }
}
```

#### 4. Auth Interfaces

Type-safe auth objects:

```typescript
interface IAuthUser {
  sub: string; // User ID
  email: string; // User email
  role: 'admin' | 'student';
  iat?: number; // Issued at
  exp?: number; // Expiration
}
```

### Best Practices

1. **Never hardcode JWT secrets** - Always use `.env` files
2. **Use role-based guards** - Apply `@UseGuards(AuthGuard, RolesGuard)` to sensitive endpoints
3. **Type-safe user objects** - Use `@CurrentUser()` with `IAuthUser` type
4. **Short-lived tokens** - Set reasonable JWT expiration times
5. **Export from barrel file** - Import from `src/auth` index file

## Audit Module

### Architecture

The Audit module tracks all user actions in the system:

- **Service**: Logs and retrieves audit records
- **Schema**: MongoDB schema for audit logs
- **Enum**: Standardized audit actions
- **DTOs**: Validation for audit data
- **Middleware**: Captures request context (IP, User-Agent)

### Usage Examples

#### 1. Logging Actions

```typescript
import { Injectable } from '@nestjs/common';
import { AuditService, AuditAction } from 'src/audit';
import { IAuthUser } from 'src/auth/interfaces';

@Injectable()
export class CourseService {
  constructor(private auditService: AuditService) {}

  async createCourse(createCourseDto: CreateCourseDto, user: IAuthUser) {
    const course = await this.courseModel.create(createCourseDto);

    // Log the action
    await this.auditService.log({
      userId: user.sub,
      action: AuditAction.COURSE_CREATED,
      entityType: 'Course',
      entityId: course._id.toString(),
      data: createCourseDto,
      description: `Course "${course.name}" created by ${user.email}`,
      ipAddress: req['auditContext']?.ipAddress,
      userAgent: req['auditContext']?.userAgent,
    });

    return course;
  }
}
```

#### 2. Querying Audit Logs

```typescript
// Get logs for a specific user
const userLogs = await this.auditService.getAuditLogsByUser(userId);

// Get logs for a specific entity
const entityLogs = await this.auditService.getAuditLogsByEntity(
  'Course',
  courseId,
);

// Get all logs with filters
const logs = await this.auditService.getAuditLogs(
  { action: AuditAction.COURSE_CREATED },
  50, // limit
  0, // skip (for pagination)
);

// Count logs matching filters
const count = await this.auditService.countLogs({ userId });
```

#### 3. Audit Actions

Use predefined actions for consistency:

```typescript
export enum AuditAction {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',

  COURSE_CREATED = 'COURSE_CREATED',
  COURSE_UPDATED = 'COURSE_UPDATED',
  COURSE_DELETED = 'COURSE_DELETED',
  COURSE_VIEWED = 'COURSE_VIEWED',
}
```

### Audit Middleware

Automatically captures request context:

```typescript
// Automatically available in request
req['auditContext'] = {
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  method: string;
  path: string;
}
```

### Best Practices

1. **Log all critical actions** - Create, Update, Delete operations
2. **Use consistent action names** - Follow the AuditAction enum
3. **Include descriptive messages** - Help with future debugging
4. **Capture user context** - Always log who performed the action
5. **Add request context** - Include IP and User-Agent for security

## Module Exports

### Auth Module

```typescript
import {
  AuthService,
  AuthController,
  AuthGuard,
  RolesGuard,
  Roles,
  IAuthUser,
  IAuthResponse,
  CurrentUser,
} from 'src/auth';
```

### Audit Module

```typescript
import {
  AuditService,
  AuditAction,
  AuditLog,
  CreateAuditLogDto,
} from 'src/audit';
```

## Example: Complete Flow

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AuthGuard, RolesGuard, Roles, CurrentUser } from 'src/auth';
import { IAuthUser } from 'src/auth/interfaces';
import { AuditService, AuditAction } from 'src/audit';
import { Role } from 'src/modules/user/user.types';

@Controller('courses')
export class CourseController {
  constructor(
    private courseService: CourseService,
    private auditService: AuditService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: IAuthUser,
  ) {
    // Create course
    const course = await this.courseService.create(createCourseDto, user);

    // Log audit trail
    await this.auditService.log({
      userId: user.sub,
      action: AuditAction.COURSE_CREATED,
      entityType: 'Course',
      entityId: course._id.toString(),
      data: createCourseDto,
      description: `Admin ${user.email} created course: ${course.name}`,
    });

    return course;
  }
}
```

## Security Considerations

1. ✅ JWT secrets are environment-specific
2. ✅ Audit logs are immutable (MongoDB documents)
3. ✅ Role-based access control is enforced
4. ✅ Request context (IP/User-Agent) is captured
5. ✅ All sensitive operations are logged
6. ✅ Tokens have expiration times

## Troubleshooting

### JWT Token Errors

- Check `.env` file has `JWT_SECRET`
- Verify `JWT_EXPIRATION` is set
- Ensure token is passed in `Authorization: Bearer <token>` header

### Audit Logs Not Created

- Verify `AuditService` is injected
- Check user object is passed correctly
- Ensure MongoDB connection is working

### Role Guard Not Working

- Verify `@UseGuards(AuthGuard, RolesGuard)` order
- Apply `@Roles()` before guards
- Check user.role matches enum values
