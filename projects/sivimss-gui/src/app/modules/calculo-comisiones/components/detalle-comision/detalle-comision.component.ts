import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { DatosFolioODS, DetalleComisionInterface } from '../../models/detalle-comision.interface';
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { ActivatedRoute } from '@angular/router';
import {CalculoComisionesService} from '../../services/calculo-comisiones.service';
import { finalize } from 'rxjs';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { CATALOGOS_DUMMIES } from '../../../articulos/constants/dummies';

@Component({
  selector: 'app-detalle-comision',
  templateUrl: './detalle-comision.component.html',
  styleUrls: ['./detalle-comision.component.scss'],
  providers: [DialogService]
})
export class DetalleComisionComponent implements OnInit {
  readonly POSICION_DETALLE_VALE_SALIDA = 0;

  @Input() detalleForm: DatosFolioODS | undefined;

  registrarEntradaEquipoRef!: DynamicDialogRef;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  detalleComision: DatosFolioODS = {
    articulos: []
  };
  formComisiones!: FormGroup;
  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private calculoComisionesService: CalculoComisionesService,
    private readonly loaderService: LoaderService,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    if (!this.detalleForm) {
      const respuesta = this.route.snapshot.data["respuesta"];
      this.detalleComision = respuesta[this.POSICION_DETALLE_VALE_SALIDA]?.datos;
    } else {
      window.scrollTo(0, 0);
      console.log(this.detalleForm);

      this.detalleComision = this.detalleForm;
    }
    this.inicializarFiltroForm();
    this.obtenerDetalleComision();
  }

  obtenerDetalleComision() {
    if (this.detalleComision.idValeSalida) {
      this.calculoComisionesService.obtenerDetalleComision(this.detalleComision.idValeSalida).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            this.detalleComision = respuesta.datos;
            console.log(respuesta.datos);

          }
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
    }
  }

  inicializarFiltroForm(): void {
    this.formComisiones = this.formBuilder.group({
      anio: [{value: null, disabled: false}],
      mes: [{value: null, disabled: false}],
    });
  }

  registrarSalida() {

  }

  cancelar() {

  }

  buscar(): void {
  }
}