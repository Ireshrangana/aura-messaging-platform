import { appConfig } from "./config/app.config";
import { socketEvents } from "./common/events";
import { commonGuards } from "./common/guards";
import { commonMiddleware } from "./common/middleware";
import { adminAuthModule } from "./modules/admin-auth/module";
import { adminModule } from "./modules/admin/module";
import { aiModule } from "./modules/ai/module";
import { analyticsModule } from "./modules/analytics/module";
import { authModule } from "./modules/auth/module";
import { chatsModule } from "./modules/chats/module";
import { devicesModule } from "./modules/devices/module";
import { groupsModule } from "./modules/groups/module";
import { mediaModule } from "./modules/media/module";
import { messagesModule } from "./modules/messages/module";
import { moderationModule } from "./modules/moderation/module";
import { notificationsModule } from "./modules/notifications/module";
import { profilesModule } from "./modules/profiles/module";
import { reportsModule } from "./modules/reports/module";
import { securityModule } from "./modules/security/module";
import { settingsModule } from "./modules/settings/module";
import { usersModule } from "./modules/users/module";

const modules = [
  authModule,
  usersModule,
  profilesModule,
  chatsModule,
  groupsModule,
  messagesModule,
  mediaModule,
  notificationsModule,
  aiModule,
  reportsModule,
  moderationModule,
  settingsModule,
  devicesModule,
  securityModule,
  adminAuthModule,
  adminModule,
  analyticsModule
];

console.log(
  JSON.stringify(
    {
      service: "aura-api",
      description: "Production-oriented messenger backend blueprint",
      config: appConfig,
      middleware: commonMiddleware,
      guards: commonGuards,
      socketEvents,
      modules
    },
    null,
    2
  )
);
