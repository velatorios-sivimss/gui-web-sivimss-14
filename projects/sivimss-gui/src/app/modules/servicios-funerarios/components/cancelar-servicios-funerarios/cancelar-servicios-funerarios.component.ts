import { Component, OnInit } from '@angular/core';
import { SERVICIO_BREADCRUMB_CANCELAR, SERVICIO_BREADCRUMB_CLEAR } from "../../constants/breadcrumb";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-cancelar-servicios-funerarios',
  templateUrl: './cancelar-servicios-funerarios.component.html',
  styleUrls: ['./cancelar-servicios-funerarios.component.scss']
})
export class CancelarServiciosFunerariosComponent implements OnInit {

  idPlanSfpa!: number;
  numConvenio?: string;
  dirVelatorio?: string;
  fecha?: string;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.idPlanSfpa = Number(this.route.snapshot.queryParams.idPlanSfpa);
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CANCELAR);
  }

  aceptar(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Plan SFPA cancelardo correctamente');
    this.router.navigate(["servicios-funerarios"]);
  }

  cancelar(): void {
    this.router.navigate(["servicios-funerarios"]);
  }

}
