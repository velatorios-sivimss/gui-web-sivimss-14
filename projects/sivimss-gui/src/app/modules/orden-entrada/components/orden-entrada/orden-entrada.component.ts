import {Component, OnInit} from '@angular/core';
import {MENU_ORDEN_ENTRADA} from "../../constants/tab-orden-entrada";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {ORDEN_ENTRADA_BREADCRUMB} from "../../constants/breadcrumb";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-orden-entrada',
  templateUrl: './orden-entrada.component.html',
  styleUrls: ['./orden-entrada.component.scss'],
  providers: [CookieService]
})
export class OrdenEntradaComponent implements OnInit {

  menu: string[] = MENU_ORDEN_ENTRADA;
  index: number = 0;

  constructor(private breadcrumbService: BreadcrumbService,
              private cookieService: CookieService,) {
  }

  ngOnInit(): void {
    this.index = +JSON.parse(localStorage.getItem('indexOrdenEntrada') as string);
    this.cookieService.delete("indexOrdenEntrada")
    this.actualizarBreadCrumb();
  }

  actualizarBreadCrumb(): void {
    this.breadcrumbService.actualizar(ORDEN_ENTRADA_BREADCRUMB);
  }

}
