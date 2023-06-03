import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { DatosFolioODS, VelacionDomicilioInterface } from "../../models/velacion-domicilio.interface";
import { RegistrarEntradaEquipoComponent } from "../registrar-entrada-equipo/registrar-entrada-equipo.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { ActivatedRoute } from '@angular/router';
import { VelacionDomicilioService } from '../../services/velacion-domicilio.service';
import { finalize } from 'rxjs';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';

@Component({
  selector: 'app-detalle-velacion-domicilio',
  templateUrl: './detalle-velacion-domicilio.component.html',
  styleUrls: ['./detalle-velacion-domicilio.component.scss'],
  providers: [DialogService]
})
export class DetalleVelacionDomicilioComponent implements OnInit {
  readonly POSICION_DETALLE_VALE_SALIDA = 0;

  @Input() detalleForm: DatosFolioODS | undefined;
  @Output() confirmacionAceptar = new EventEmitter<boolean>();
  @Output() confirmacionRegresar = new EventEmitter<boolean>();

  registrarEntradaEquipoRef!: DynamicDialogRef;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  detalleValeSalida: DatosFolioODS = {
    articulos: []
  };

  constructor(
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private velacionDomicilioService: VelacionDomicilioService,
    private readonly loaderService: LoaderService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
    if (!this.detalleForm) {
      const respuesta = this.route.snapshot.data["respuesta"];
      this.detalleValeSalida = respuesta[this.POSICION_DETALLE_VALE_SALIDA]?.datos;
      this.actualizarBreadcrumb();
    } else {
      window.scrollTo(0, 0);
      console.log(this.detalleForm);

      this.detalleValeSalida = this.detalleForm;
    }
  }

  registrarEquipoEntrada(): void {
    let valeSeleccionado: VelacionDomicilioInterface = {
      idValeSalida: this.detalleValeSalida.idVelatorio
    }
    this.registrarEntradaEquipoRef = this.dialogService.open(RegistrarEntradaEquipoComponent, {
      header: 'Registro de entrada de equipo de velación',
      width: '920px',
      data: { valeSeleccionado },
    });

    this.registrarEntradaEquipoRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.obtenerDetalleValeSalida();
      }
    })
  }

  obtenerDetalleValeSalida() {
    if (this.detalleValeSalida.idValeSalida) {
      this.velacionDomicilioService.obtenerDetalleValeSalida(this.detalleValeSalida.idValeSalida).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            this.detalleValeSalida = respuesta.datos;
            console.log(respuesta.datos);

          }
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
    }
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

  registrarSalida() {
    this.confirmacionAceptar.emit(true);
  }

  cancelar() {
    this.confirmacionRegresar.emit(true);
  }

}
