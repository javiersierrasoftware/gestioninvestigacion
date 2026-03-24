import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { ConvocatoriasModule } from './convocatorias/convocatorias.module';
import { ProjectsModule } from './projects/projects.module';
import { ProductionsModule } from './productions/productions.module';
import { AuthModule } from './auth/auth.module';
import { RubricsModule } from './rubrics/rubrics.module';
import { ProductsModule } from './products/products.module';
import { CiarpModule } from './ciarp/ciarp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    UsersModule,
    GroupsModule,
    ConvocatoriasModule,
    ProjectsModule,
    ProductionsModule,
    AuthModule,
    RubricsModule,
    ProductsModule,
    CiarpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
