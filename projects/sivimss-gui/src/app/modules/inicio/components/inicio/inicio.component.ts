import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  anuncio: {image: string }[] = [];

  ngOnInit(): void {
    this.anuncio = [
      {image: "slide1.jpg"},
      {image: "slide2.jpg"}
    ];
  }


}
