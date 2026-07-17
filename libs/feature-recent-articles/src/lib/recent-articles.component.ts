import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BlogStore } from '@tech-blog/data-access-blog';

@Component({
  selector: 'app-recent-articles',
  templateUrl: './recent-articles.component.html',
  styleUrls: ['./recent-articles.component.scss'],
  imports: [DatePipe],
})
export class RecentArticlesComponent {
  readonly store = inject(BlogStore);
}
