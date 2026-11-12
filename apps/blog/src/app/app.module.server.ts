import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { provideBlogServer } from './blog.server.providers';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent],
  providers: provideBlogServer(),
})
export class AppServerModule {}
