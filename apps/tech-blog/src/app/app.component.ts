import { Component } from '@angular/core';
import { FooterComponent, NavbarComponent } from '@tech-blog/shared-ui';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
})
export class AppComponent {}
