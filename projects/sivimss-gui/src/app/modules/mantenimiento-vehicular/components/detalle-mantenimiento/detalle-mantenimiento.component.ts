import {Component, OnInit, ViewChild} from '@angular/core';
import {tablaRin} from "../../constants/tabla-rines";
import {OverlayPanel} from "primeng/overlaypanel";
import {VehiculoMantenimiento} from "../../models/vehiculoMantenimiento.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {MantenimientoVehicularService} from "../../services/mantenimiento-vehicular.service";

@Component({
  selector: 'app-detalle-mantenimiento',
  templateUrl: './detalle-mantenimiento.component.html',
  styleUrls: ['./detalle-mantenimiento.component.scss']
})
export class DetalleMantenimientoComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  data = tablaRin;
  vehiculo!: VehiculoMantenimiento;

  constructor(private route: ActivatedRoute,
              private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  ngOnInit(): void {
    this.vehiculo = this.route.snapshot.data["respuesta"];
  }

  abrirPanel(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayPanel.toggle(event);
  }
}
