import { Module, OnModuleInit, RequestMethod, MiddlewareConsumer } from '@nestjs/common';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormconfig, tooljetDbOrmconfig } from '../ormconfig';
import { getEnvVars } from '../scripts/database-config-utils';

import { SeedsModule } from './modules/seeds/seeds.module';
import { SeedsService } from '@services/seeds.service';

import { LoggerModule } from 'nestjs-pino';
import { SentryModule } from './modules/observability/sentry/sentry.module';
import * as Sentry from '@sentry/node';
import { WinstonModule } from 'nest-winston';
import * as path from 'path';

import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CaslModule } from './modules/casl/casl.module';
import { EmailService } from '@services/email.service';
import { MetaModule } from './modules/meta/meta.module';
import { AppController } from './controllers/app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FilesModule } from './modules/files/files.module';
import { AppConfigModule } from './modules/app_config/app_config.module';
import { AppsModule } from './modules/apps/apps.module';
import { FoldersModule } from './modules/folders/folders.module';
import { OrgEnvironmentVariablesModule } from './modules/org_environment_variables/org_environment_variables.module';
import { FolderAppsModule } from './modules/folder_apps/folder_apps.module';
import { DataQueriesModule } from './modules/data_queries/data_queries.module';
import { DataSourcesModule } from './modules/data_sources/data_sources.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CommentModule } from './modules/comments/comment.module';
import { CommentUsersModule } from './modules/comment_users/comment_users.module';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { LibraryAppModule } from './modules/library_app/library_app.module';
import { ThreadModule } from './modules/thread/thread.module';
import { EventsModule } from './events/events.module';
import { GroupPermissionsModule } from './modules/group_permissions/group_permissions.module';
import { AuditLogsModule } from './modules/audit_logs/audit_logs.module';
import { InstanceSettingsModule } from './modules/instance_settings/instance_settings.module';
import { WhiteLabellingModule } from './modules/white-labelling/white-labelling.module';
import { TooljetDbModule } from './modules/tooljet_db/tooljet_db.module';
import { PluginsModule } from './modules/plugins/plugins.module';
import { CopilotModule } from './modules/copilot/copilot.module';
import { AppEnvironmentsModule } from './modules/app_environments/app_environments.module';
import { OrganizationConstantModule } from './modules/organization_constants/organization_constants.module';
import { RequestContextModule } from './modules/request_context/request-context.module';
import { WorkerModule } from './modules/worker.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LicenseModule } from './modules/license/license.module';
import { CustomStylesModule } from './modules/custom_styles/custom_styles.module';
import { AppGitModule } from './modules/app_git/app_git.module';
import { ImportExportResourcesModule } from './modules/import_export_resources/import_export_resources.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { logfileTransportConfig, logFormat } from './helpers/logger.helper';
import { InstanceLoginConfigsModule } from './modules/instance_login_configs/instance_login_configs.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

const port = +process.env.SMTP_PORT || 587;
const transport =
  process.env.NODE_ENV === 'development'
    ? {
        host: 'localhost',
        ignoreTLS: true,
        secure: false,
      }
    : {
        host: process.env.SMTP_DOMAIN,
        port: port,
        secure: port == 465,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      };

const imports = [
  EventEmitterModule.forRoot({
    wildcard: false,
    newListener: false,
    removeListener: false,
    maxListeners: 5,
    verboseMemoryLeak: true,
    ignoreErrors: false,
  }),
  ScheduleModule.forRoot(),
  BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    },
  }),
  WinstonModule.forRootAsync({
    useFactory: () => ({
      format: logFormat,
      transports: process.env.LOG_FILE_PATH ? [logfileTransportConfig(process.env.LOG_FILE_PATH, process.pid)] : [],
      exitOnError: false,
    }),
    inject: [],
  }),
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [`../.env.${process.env.NODE_ENV}`, '../.env'],
    load: [() => getEnvVars()],
  }),
  LoggerModule.forRoot({
    pinoHttp: {
      level: (() => {
        const logLevel = {
          production: 'info',
          development: 'debug',
          test: 'error',
        };
        return logLevel[process.env.NODE_ENV] || 'info';
      })(),
      autoLogging: {
        ignorePaths: ['/api/health'],
      },
      prettyPrint:
        process.env.NODE_ENV !== 'production'
          ? {
              colorize: true,
              levelFirst: true,
              translateTime: 'UTC:mm/dd/yyyy, h:MM:ss TT Z',
            }
          : false,
      redact: ['req.headers.authorization'],
    },
  }),
  MailerModule.forRoot({
    transport: transport,
    preview: process.env.NODE_ENV === 'development',
    template: {
      dir: join(__dirname, 'mails'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: false,
      },
    },
    options: {
      partials: {
        dir: path.join(__dirname, 'mails/base/partials'),
        options: {
          strict: false,
        },
      },
    },
  }),
  TypeOrmModule.forRoot(ormconfig),
  RequestContextModule,
  AppConfigModule,
  SeedsModule,
  AuthModule,
  UsersModule,
  LicenseModule,
  AppsModule,
  FoldersModule,
  OrgEnvironmentVariablesModule,
  FolderAppsModule,
  DataQueriesModule,
  DataSourcesModule,
  OrganizationsModule,
  CaslModule,
  MetaModule,
  LibraryAppModule,
  GroupPermissionsModule,
  AuditLogsModule,
  FilesModule,
  PluginsModule,
  EventsModule,
  AppEnvironmentsModule,
  InstanceSettingsModule,
  InstanceLoginConfigsModule,
  WhiteLabellingModule,
  LicenseModule,
  ImportExportResourcesModule,
  CopilotModule,
  CustomStylesModule,
  WorkerModule,
  AppGitModule,
  OrganizationConstantModule,
];

if (process.env.SERVE_CLIENT !== 'false' && process.env.NODE_ENV === 'production') {
  imports.unshift(
    ServeStaticModule.forRoot({
      // Have to remove trailing slash of SUB_PATH.
      serveRoot: process.env.SUB_PATH === undefined ? '' : process.env.SUB_PATH.replace(/\/$/, ''),
      rootPath: join(__dirname, '../../../', 'frontend/build'),
    })
  );
}

if (process.env.APM_VENDOR == 'sentry') {
  imports.unshift(
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: 1.0,
      debug: !!process.env.SENTRY_DEBUG,
    })
  );
}

if (process.env.COMMENT_FEATURE_ENABLE !== 'false') {
  imports.unshift(CommentModule, ThreadModule, CommentUsersModule);
}

if (process.env.ENABLE_TOOLJET_DB === 'true') {
  imports.unshift(TooljetDbModule);
  imports.unshift(TypeOrmModule.forRoot(tooljetDbOrmconfig));
}

if (process.env.DISABLE_WEBHOOKS !== 'true') {
  imports.unshift(WebhooksModule);
}

@Module({
  imports,
  controllers: [AppController],
  providers: [EmailService, SeedsService],
})
export class AppModule implements OnModuleInit {
  constructor(private connection: Connection) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(Sentry.Handlers.requestHandler()).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }

  onModuleInit(): void {
    console.log(`Version: ${globalThis.TOOLJET_VERSION}`);
    console.log(`Initializing server modules 📡 `);
  }
}
