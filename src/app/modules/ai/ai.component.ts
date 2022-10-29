import { Component } from '@angular/core';

@Component({
  selector: 'app-ai',
  templateUrl: './ai.component.html',
  styleUrls: ['./ai.component.scss']
})
export class AIComponent {
  articles = [
    {
      title: "Podcast Title",
      image: "https://picsum.photos/1000/1000",
      date: "Mon, May 25th 2020",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, fugiat asperiores inventore beatae accusamus odit minima enim, commodi quia, doloribus eius! Ducimus nemo accusantium maiores velit corrupti tempora reiciendis molestiae repellat vero.Eveniet ipsam adipisci illo iusto quibusdam, sunt neque nulla unde ipsum dolores nobis enim quidem excepturi, illum quos!",
      category: "Podcast",
      duration: "55 mins.",
      button: "Play Episode",
    },
    {
      title: "Podcast Title",
      image: "https://picsum.photos/1000/1000",
      date: "Mon, May 25th 2020",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, fugiat asperiores inventore beatae accusamus odit minima enim, commodi quia, doloribus eius! Ducimus nemo accusantium maiores velit corrupti tempora reiciendis molestiae repellat vero.Eveniet ipsam adipisci illo iusto quibusdam, sunt neque nulla unde ipsum dolores nobis enim quidem excepturi, illum quos!",
      category: "Podcast",
      duration: "55 mins.",
      button: "Play Episode",
    },
    {
      title: "Podcast Title",
      image: "https://picsum.photos/1000/1000",
      date: "Mon, May 25th 2020",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, fugiat asperiores inventore beatae accusamus odit minima enim, commodi quia, doloribus eius! Ducimus nemo accusantium maiores velit corrupti tempora reiciendis molestiae repellat vero.Eveniet ipsam adipisci illo iusto quibusdam, sunt neque nulla unde ipsum dolores nobis enim quidem excepturi, illum quos!",
      category: "Podcast",
      duration: "55 mins.",
      button: "Play Episode",
    },
  ];
}
