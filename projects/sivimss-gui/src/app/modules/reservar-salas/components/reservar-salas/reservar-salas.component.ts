import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { RESERVAR_SALAS_BREADCRUMB } from '../../constants/breadcrumb';
import { OpcionesReservarSalas, SelectButtonOptions } from '../../constants/opciones-reservar-salas';
import { Router, ActivatedRoute } from '@angular/router';
import {mensajes} from '../../constants/mensajes'

@Component({
  selector: 'app-reservar-salas',
  templateUrl: './reservar-salas.component.html',
  styleUrls: ['./reservar-salas.component.scss']
})
export class ReservarSalasComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  OpcionesReservarSalas = OpcionesReservarSalas;
  opcionSala: any = OpcionesReservarSalas[0];

  constructor(private breadcrumbService: BreadcrumbService,
    private router: Router) {
  }

  ngOnInit(): void {
    localStorage.setItem("mensajes", JSON.stringify(mensajes));
    const alertas = JSON.parse(localStorage.getItem('mensajes') as string);
    this.router.navigate(["/reservar-salas", { outlets: { salas: [this.opcionSala.route] } }]);
    this.actualizarBreadcrumb();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(RESERVAR_SALAS_BREADCRUMB);
  }

  redirigirOpcionSala(opcion: { value: SelectButtonOptions }): void {
    this.router.navigate(["/reservar-salas", { outlets: { salas: [this.opcionSala.route] } }]);
  }

}
