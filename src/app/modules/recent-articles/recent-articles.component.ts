import { Component } from '@angular/core';

@Component({
  selector: 'app-recent-articles',
  templateUrl: './recent-articles.component.html',
  styleUrls: ['./recent-articles.component.scss'],
})
export class RecentArticlesComponent {
  articles = [
    {
      id: 0,
      title: 'Podcast Title',
      image: 'https://picsum.photos/1000/1000',
      date: 'Mon, May 25th 2020',
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, fugiat asperiores inventore beatae accusamus odit minima enim, commodi quia, doloribus eius! Ducimus nemo accusantium maiores velit corrupti tempora reiciendis molestiae repellat vero.Eveniet ipsam adipisci illo iusto quibusdam, sunt neque nulla unde ipsum dolores nobis enim quidem excepturi, illum quos!',
      category: 'Podcast',
      duration: '55 mins.',
      button: 'Play Episode',
    },
    {
      id: 1,
      title: 'Podcast Title',
      image: 'https://picsum.photos/1000/1000',
      date: 'Mon, May 25th 2020',
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, fugiat asperiores inventore beatae accusamus odit minima enim, commodi quia, doloribus eius! Ducimus nemo accusantium maiores velit corrupti tempora reiciendis molestiae repellat vero.Eveniet ipsam adipisci illo iusto quibusdam, sunt neque nulla unde ipsum dolores nobis enim quidem excepturi, illum quos!',
      category: 'Podcast',
      duration: '55 mins.',
      button: 'Play Episode',
    },
    {
      id: 2,
      title: 'Podcast Title',
      image: 'https://picsum.photos/1000/1000',
      date: 'Mon, May 25th 2020',
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, fugiat asperiores inventore beatae accusamus odit minima enim, commodi quia, doloribus eius! Ducimus nemo accusantium maiores velit corrupti tempora reiciendis molestiae repellat vero.Eveniet ipsam adipisci illo iusto quibusdam, sunt neque nulla unde ipsum dolores nobis enim quidem excepturi, illum quos!',
      category: 'Podcast',
      duration: '55 mins.',
      button: 'Play Episode',
    },
  ];

  trackById(index: number, item: Item): number {
    return item.id;
  }
}
interface Item {
  id: number;
  title: string;
  image: string;
  date: string;
  text: string;
  category: string;
  duration: string;
  button: string;
}
