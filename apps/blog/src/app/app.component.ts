import { Component } from '@angular/core';
import { FooterComponent } from '@blog/shared/ui';
import { NavbarComponent } from '@blog/shell/layout';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
})
export class AppComponent {}
