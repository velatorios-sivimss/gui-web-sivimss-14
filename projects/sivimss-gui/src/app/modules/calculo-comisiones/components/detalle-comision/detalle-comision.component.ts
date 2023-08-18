import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { DetalleODS, DetallePromotor, DetalleConvenioPF, DetalleComisiones,FiltroComisiones } from '../../models/detalle-comision.interface';
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { ActivatedRoute } from '@angular/router';
import {CalculoComisionesService} from '../../services/calculo-comisiones.service';
import { finalize } from 'rxjs';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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

  @Input() detalleForm: DetallePromotor | undefined;

  registrarEntradaEquipoRef!: DynamicDialogRef;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  detallePromotor!: DetallePromotor;
  detalleODS!: DetalleODS[];
  detalleConveniosPF!: DetalleConvenioPF[];
  listaComisiones!: DetalleComisiones[];
  formComisiones!: FormGroup;
  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  registrarCalcularComisionRef!: DynamicDialogRef
  totalODS: number = 0;
  totalConveniosPF: number = 0;
  minDate!: Date;
  maxDate!: Date;

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
      this.detallePromotor = respuesta[this.POSICION_DETALLE_COMISION]?.datos[this.POSICION_DETALLE_COMISION];
      this.detalleODS = respuesta[this.POSICION_DETALLE_ODS]?.datos;
      this.detalleConveniosPF = respuesta[this.POSICION_DETALLE_CONVENIOS_PF]?.datos;
      this.minDate = new Date();
      this.maxDate = new Date();
      this.importeTotalODS();
      this.importeTotalConveniosPf();
    } else {
      window.scrollTo(0, 0);
      console.log(this.detalleForm);

      this.detallePromotor = this.detalleForm;
    }
    this.inicializarFiltroForm();
  }

  importeTotalODS(): void {
    this.totalODS = this.detalleODS.reduce((
      acc,
      obj,
    ) => acc +  (obj.importeODS!) ,
    0);
  }


  importeTotalConveniosPf(): void {
    this.totalConveniosPF = this.detalleConveniosPF.reduce((
      acc,
      obj,
    ) => acc +  (obj.importeCPF!) ,
    0);
  }

  inicializarFiltroForm(): void {
    this.formComisiones = this.formBuilder.group({
      anio: [{value: null, disabled: false}, [Validators.required]],
      mes: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  obtenerDetalleComision() {
    if (this.detallePromotor.idPromotor) {
      const filtros: FiltroComisiones = this.filtrosCalculoComision();
      this.calculoComisionesService.obtenerDetalleComisiones(filtros).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            this.listaComisiones = respuesta.datos;
          //  this.abrirModarCalcularComision();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
    }
  }

  filtrosCalculoComision(): FiltroComisiones {
    const anio = this.formComisiones.get('anio')?.value !== null ? moment(this.formComisiones.get('anio')?.value).format('YYYY') : null;
    const mes = this.formComisiones.get('mes')?.value !== null ? moment(this.formComisiones.get('mes')?.value).format('MM') : null;
    return {
      idPromotor: this.detallePromotor.idPromotor,
      mesCalculo: mes,
      anioCalculo: anio
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

  guardarPDF(): void {
  }

  guardarExcel(): void {
  }

  buscar(): void {
  }
}