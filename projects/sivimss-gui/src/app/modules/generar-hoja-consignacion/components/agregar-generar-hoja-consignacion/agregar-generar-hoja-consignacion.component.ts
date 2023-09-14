import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { BuscarCatalogo, GenerarHojaConsignacion, GenerarHojaConsignacionBusqueda } from '../../models/generar-hoja-consignacion.interface';
import { UsuarioService } from '../../../usuarios/services/usuario.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import * as moment from 'moment';
import { GenerarHojaConsignacionService } from '../../services/generar-hoja-consignacion.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  selector: 'app-agregar-generar-hoja-consignacion',
  templateUrl: './agregar-generar-hoja-consignacion.component.html',
  styleUrls: ['./agregar-generar-hoja-consignacion.component.scss'],
  providers: [DialogService, DynamicDialogRef]
})
export class AgregarGenerarHojaConsignacionComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_CATALOGO_VELATORIO: number = 2;
  readonly POSICION_CATALOGOS_ENTIDADES: number = 3;

  public numPaginaActual: number = 0;
  public cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  public totalElementos: number = 0;
  public catalogoVelatorios: TipoDropdown[] = [];
  public catalogoPromotores: TipoDropdown[] = [];
  public mensajeModal: string = "";
  public realizoBusqueda: boolean = false;
  public clonedProducts: { [s: string]: GenerarHojaConsignacionBusqueda } = {};
  public actividades: GenerarHojaConsignacionBusqueda[] = [];

  public entidadFederativa: TipoDropdown[] = [];
  public tipoArticulos: any[] = [];
  public tituloEliminar: string = '';
  public intentoPorGuardar: boolean = false;
  public agregarGenerarHojaConsignacionForm!: FormGroup;
  public mostrarModalPromotorDuplicado: boolean = false;
  public fechaActual: Date = new Date();
  public agregandoRegistro: boolean = false;
  public mode: 'detail' | 'update' | 'create' = 'create';

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private url: LocationStrategy,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private generarHojaConsignacionService: GenerarHojaConsignacionService,
  ) {
  }

  ngOnInit(): void {
    if (this.url.path().includes('modificar')) {
      this.mode = 'detail';
    } else if (this.url.path().includes('detalle')) {
      this.mode = 'update';
    }
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);
    this.inicializarAgregarActividadesForm();
    this.cargarCatalogo();
  }

  inicializarAgregarActividadesForm() {
    this.agregarGenerarHojaConsignacionForm = this.formBuilder.group({
      folio: new FormControl({ value: null, disabled: true }, []),
      velatorio: new FormControl({ value: null, disabled: this.mode !== 'create' }, [Validators.required]),
      fechaInicio: new FormControl({ value: null, disabled: this.mode !== 'create' }, [Validators.required]),
      fechaFinal: new FormControl({ value: null, disabled: this.mode !== 'create' }, [Validators.required]),
    });
  }

  cargarCatalogo(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_VELATORIO].datos, "velatorio", "idVelatorio");
    this.entidadFederativa = respuesta[this.POSICION_CATALOGOS_ENTIDADES];
  }

  agregarRegistro() {
    if (!this.agregandoRegistro) {
      this.actividades.unshift({
        idHojaConsignacion: null,
        fecHojaConsignacion: null,
      });

      this.agregandoRegistro = true;

      setTimeout(() => {
        let elements = document.getElementById('null');
        elements?.click();
      }, 100);
    }
  }

  paginar(event?: LazyLoadEvent): void {
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
    // this.buscarPorFiltros(false);
  }

  cerrarDialogo() {
    this.ref.close();
  }

  consultarPromotores() {
    let obj: BuscarCatalogo = {
      idCatalogo: 1,
      idVelatorio: this.apf.velatorio.value,
    }
    this.generarHojaConsignacionService.obtenerCatalogos(obj).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catalogoPromotores = respuesta.datos;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  obtenerActividades() {
    // this.loaderService.activar();
    // this.generarHojaConsignacionService.obtenerActividades(this.apf.folio.value, this.numPaginaActual, this.cantElementosPorPagina).pipe(
    //   finalize(() => {
    //     this.loaderService.desactivar()
    //   })
    // ).subscribe({
    //   next: (respuesta: HttpRespuesta<any>) => {
    //     this.actividades = respuesta.datos;
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     console.error(error);
    //   }
    // });
  }

  obtenerDatosFormato() {
    // this.loaderService.activar();
    // this.generarHojaConsignacionService.obtenerDetalleFormato(this.apf.folio.value).pipe(
    //   finalize(() => {
    //     this.loaderService.desactivar()
    //   })
    // ).subscribe({
    //   next: (respuesta: HttpRespuesta<any>) => {
    //     this.agregarGenerarHojaConsignacionForm.patchValue({
    //       folio: respuesta.datos.folio,
    //       velatorio: respuesta.datos.velatorio,
    //       fechaInicio: respuesta.datos.fechaInicio,
    //       fechaFinal: respuesta.datos.fechaFinal,
    //     })
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     console.error(error);
    //   }
    // });
  }

  agregarActividad(actividad: GenerarHojaConsignacionBusqueda) {
    // this.loaderService.activar();
    // this.generarHojaConsignacionService.agregarActividad(this.datosGuardar(actividad)).pipe(
    //   finalize(() => {
    //     this.loaderService.desactivar()
    //   })
    // ).subscribe({
    //   next: (respuesta: HttpRespuesta<any>) => {
    //     if (respuesta.codigo === 200 && !respuesta.error) {
    //       this.obtenerActividades();
    //     }
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     console.error(error);
    //   }
    // });
  }

  eliminarActividad(idActividad: number | null | undefined) {
    // if (idActividad) {
    //   this.loaderService.activar();
    //   this.generarHojaConsignacionService.eliminarActividad(idActividad).pipe(
    //     finalize(() => {
    //       this.loaderService.desactivar()
    //     })
    //   ).subscribe({
    //     next: (respuesta: HttpRespuesta<any>) => {
    //       console.log(respuesta);
    //     },
    //     error: (error: HttpErrorResponse) => {
    //       console.error(error);
    //     }
    //   });
    // }
  }

  datosGuardar(actividad: GenerarHojaConsignacionBusqueda): GenerarHojaConsignacion {
    return {
      idFormatoRegistro: this.apf.folio.value,
      idVelatorio: this.apf.velatorio.value,
      fecInicio: this.apf.fechaInicio.value,
      fecFin: this.apf.fechaFinal.value,
    }
  }

  onRowEditInit(actividad: GenerarHojaConsignacionBusqueda) {
    if (!this.agregandoRegistro) {
      this.clonedProducts['nuevo'] = { ...actividad };
    }
  }

  onRowEditSave(actividad: GenerarHojaConsignacionBusqueda) {
    this.agregarActividad(actividad);
  }

  onRowDelete(actividad: GenerarHojaConsignacionBusqueda) {
    // if (!this.agregandoRegistro) {
    //   let index = this.actividades.findIndex((item: GenerarHojaConsignacionBusqueda) => item.idActividad === actividad.idActividad);
    //   if (index !== -1) {
    //     this.eliminarActividad(this.actividades[index].idActividad);
    //     this.actividades.splice(index, 1);
    //   }
    // }
  }

  onRowEditCancel(actividad: GenerarHojaConsignacionBusqueda, index: number) {
    // if (!actividad.idActividad) {
    //   this.actividades.shift();
    //   this.agregandoRegistro = false;
    // }
    // this.products[index] = this.clonedProducts[product.id as string];
    // delete this.clonedProducts[product.id as string];
  }

  get apf() {
    return this.agregarGenerarHojaConsignacionForm.controls;
  }
}
