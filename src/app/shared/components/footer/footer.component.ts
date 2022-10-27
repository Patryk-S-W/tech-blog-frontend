import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  icons = [
    { icon: 'fa-linkedin-in', link: 'https://www.linkedin.com/in/patryksadowski/' },
    { icon: 'fa-github', link: 'https://github.com/Patryk-S-W' }
  ];

}
