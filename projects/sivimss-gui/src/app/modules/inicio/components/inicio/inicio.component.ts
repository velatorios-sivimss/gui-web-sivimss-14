import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  @ViewChild('breadcrumb')
  private Breadcrumb!: ElementRef;

  anuncio: { image: string }[] = [];

  constructor(private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit(): void {
    this.breadcrumbService.limpiar();
    this.anuncio = [
      {image: "slide1.jpg"},
      {image: "slide2.jpg"}
    ];
  }


}
