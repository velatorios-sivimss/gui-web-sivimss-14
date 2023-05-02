import {Component, OnInit} from '@angular/core';
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {Observable} from "rxjs";
import {ElementoBreadcrumb} from "../../models/elemento-breadcrumb.interface";

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  elementosBreadcrumb$: Observable<ElementoBreadcrumb[]> | null = null;


  constructor(private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit(): void {
    this.elementosBreadcrumb$ = this.breadcrumbService.obtenerObservable();
  }

}
