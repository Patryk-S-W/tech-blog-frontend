import {
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
})
export class NavbarComponent implements OnInit {

  links = [
    { title: 'Home', fragment: 'home' },
    { title: 'Articles', fragment: 'articles' }
  ];

  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void { }

}
