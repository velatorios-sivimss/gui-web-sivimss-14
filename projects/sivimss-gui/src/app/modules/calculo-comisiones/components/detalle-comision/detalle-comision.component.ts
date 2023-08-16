import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { DetalleODS, DetalleComision, DetalleConvenioPF, DetalleComisiones,FiltroComisiones } from '../../models/detalle-comision.interface';
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
import { ModalComisionComponent } from '../modal-comision/modal-comision.component';  
import * as moment from "moment/moment";

@Component({
  selector: 'app-detalle-comision',
  templateUrl: './detalle-comision.component.html',
  styleUrls: ['./detalle-comision.component.scss'],
  providers: [DialogService]
})
export class DetalleComisionComponent implements OnInit {
  readonly POSICION_DETALLE_COMISION = 0;
  readonly POSICION_DETALLE_ODS = 1;
  readonly POSICION_DETALLE_CONVENIOS_PF = 2;
  readonly POSICION_DETALLE_COMISIONES = 3;

  @Input() detalleForm: DetalleComision | undefined;

  registrarEntradaEquipoRef!: DynamicDialogRef;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  detalleComision!: DetalleComision;
  detalleODS!: DetalleODS[];
  detalleConveniosPF!: DetalleConvenioPF[];
  listaComisiones!: DetalleComisiones[];
  formComisiones!: FormGroup;
  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  registrarCalcularComisionRef!: DynamicDialogRef

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
      this.detalleComision = respuesta[this.POSICION_DETALLE_COMISION]?.datos[this.POSICION_DETALLE_COMISION];
      this.detalleODS = respuesta[this.POSICION_DETALLE_ODS]?.datos;
      this.detalleConveniosPF = respuesta[this.POSICION_DETALLE_CONVENIOS_PF]?.datos;
    } else {
      window.scrollTo(0, 0);
      console.log(this.detalleForm);

      this.detalleComision = this.detalleForm;
    }
    this.inicializarFiltroForm();
  }

  inicializarFiltroForm(): void {
    this.formComisiones = this.formBuilder.group({
      anio: [{value: null, disabled: false}],
      mes: [{value: null, disabled: false}],
    });
  }

  obtenerDetalleComision() {
    if (this.detalleComision.idPromotor) {
      const filtros: FiltroComisiones = this.filtrosCalculoComision();
      this.calculoComisionesService.obtenerDetalleComision(this.detalleComision.idPromotor).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            this.listaComisiones = respuesta.datos;
            this.abrirModarCalcularComision();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
    }
  }

  filtrosCalculoComision(): FiltroComisiones {
    const anio = this.formComisiones.get('anio')?.value !== null ? moment(this.formComisiones.get('fechaInicial')?.value).format('DD/MM/YYYY') : null;
    const mes = this.formComisiones.get('mes')?.value !== null ? moment(this.formComisiones.get('fechaFinal')?.value).format('DD/MM/YYYY') : null;
    return {
      idPromotor: this.detalleComision.idPromotor,
      mesCalculo: moment().format('MM').toUpperCase(),
      anioCalculo: parseInt(moment().format('yyyy')),
    }
  }

  abrirModarCalcularComision(): void {
    this.registrarCalcularComisionRef = this.dialogService.open(
      ModalComisionComponent,
      {
        header: 'Comisiones',
        width: '880px',
      },
    )
  }

  registrarSalida() {

  }

  buscar(): void {
  }
}