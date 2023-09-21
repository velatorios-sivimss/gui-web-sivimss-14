import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { BuscarCatalogo, CatalogoPromotores, GenerarFormatoActividades, GenerarFormatoActividadesBusqueda } from '../../models/generar-formato-actividades.interface';
import { UsuarioService } from '../../../usuarios/services/usuario.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { finalize, of } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import * as moment from 'moment';
import { GenerarFormatoActividadesService } from '../../services/generar-formato-actividades.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { PrevisualizacionArchivoComponent } from '../previsualizacion-archivo/previsualizacion-archivo.component';

@Component({
  selector: 'app-agregar-generar-formato-actividades',
  templateUrl: './agregar-generar-formato-actividades.component.html',
  styleUrls: ['./agregar-generar-formato-actividades.component.scss'],
  providers: [DialogService, DynamicDialogRef, DescargaArchivosService, ConfirmationService]
})
export class AgregarGenerarFormatoActividadesComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_CATALOGO_VELATORIO: number = 2;
  readonly POSICION_CATALOGOS_ENTIDADES: number = 3;

  public idFormatoRegistro: number = 0;
  public numPaginaActual: number = 0;
  public cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  public totalElementos: number = 0;
  public catalogoVelatorios: TipoDropdown[] = [];
  public catalogoPromotores: TipoDropdown[] = [];
  public catalogoPromotoresOriginal: CatalogoPromotores[] = [];
  public mensajeModal: string = "";
  public realizoBusqueda: boolean = false;
  public clonedProducts: { [s: string]: GenerarFormatoActividadesBusqueda } = {};
  public actividades: GenerarFormatoActividadesBusqueda[] = [];

  public entidadFederativa: TipoDropdown[] = [];
  public tipoArticulos: any[] = [];
  public tituloEliminar: string = '';
  public intentoPorGuardar: boolean = false;
  public agregarGenerarFormatoActividadesForm!: FormGroup;
  public agregarActividadForm!: FormGroup;
  public mostrarModal: boolean = false;
  public fechaActual: Date = new Date();
  public agregandoRegistro: boolean = false;
  public descVelatorio: string = '';
  public numActividades: number | null = null;
  public idFormato: number | null = null;
  public mensajeArchivoConfirmacion: string | undefined;
  public mode: 'detail' | 'update' | 'create' = 'create';

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private url: LocationStrategy,
    public ref: DynamicDialogRef,
    private router: Router,
    private usuarioService: UsuarioService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private generarFormatoActividadesService: GenerarFormatoActividadesService,
    private descargaArchivosService: DescargaArchivosService,
    private confirmationService: ConfirmationService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.idFormatoRegistro = +params['id'];
    });
    if (this.url.path().includes('detalle')) {
      this.mode = 'detail';
    } else if (this.url.path().includes('modificar')) {
      this.mode = 'update';
    }
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);
    this.inicializarAgregarActividadesForm();
    this.cargarCatalogo();
    if (this.idFormatoRegistro) {
      this.obtenerDatosFormato();
      this.obtenerActividades();
    } else {
      this.apf.velatorio.setValidators(Validators.required);
      this.apf.velatorio.updateValueAndValidity();
      this.apf.fechaInicio.setValidators(Validators.required);
      this.apf.fechaInicio.updateValueAndValidity();
      this.apf.fechaFinal.setValidators(Validators.required);
      this.apf.fechaFinal.updateValueAndValidity();
    }
  }

  inicializarAgregarActividadesForm() {
    this.agregarGenerarFormatoActividadesForm = this.formBuilder.group({
      folio: new FormControl({ value: null, disabled: true }, []),
      velatorio: new FormControl({ value: null, disabled: this.mode !== 'create' }, []),
      descVelatorio: new FormControl({ value: null, disabled: this.mode !== 'create' }, []),
      fechaInicio: new FormControl({ value: null, disabled: this.mode !== 'create' }, []),
      fechaFinal: new FormControl({ value: null, disabled: this.mode !== 'create' }, []),
    });

    this.agregarActividadForm = this.formBuilder.group({
      fecActividad: new FormControl({ value: null, disabled: false }, []),
      hrInicio: new FormControl({ value: null, disabled: false }, []),
      hrFin: new FormControl({ value: null, disabled: false }, []),
      idPromotor: new FormControl({ value: null, disabled: false }, []),
      numPlaticas: new FormControl({ value: null, disabled: false }, []),
      unidadImss: new FormControl({ value: null, disabled: false }, []),
      empresa: new FormControl({ value: null, disabled: false }, []),
      actividadRealizada: new FormControl({ value: null, disabled: false }, []),
      observaciones: new FormControl({ value: null, disabled: false }, []),
      evidencia: new FormControl({ value: null, disabled: false }, []),
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
        idFormatoRegistro: null,
        idActividad: null,
        fecActividad: null,
        hrInicio: null,
        hrFin: null,
        idPromotor: null,
        puesto: null,
        numPlaticas: null,
        unidad: null,
        empresa: null,
        actividadRealizada: null,
        observaciones: null,
        evidencia: null,
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
  }

  cerrarDialogo() {
    this.ref.close();
  }

  consultarPromotores() {
    let obj: BuscarCatalogo = {
      idCatalogo: 1,
      idVelatorio: this.apf.velatorio.value,
    }
    this.generarFormatoActividadesService.obtenerCatalogos(obj).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catalogoPromotoresOriginal = respuesta.datos;
        this.catalogoPromotores = mapearArregloTipoDropdown(respuesta.datos, "nomPromotor", "idPromotor");
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  buscarPuesto(actividad: GenerarFormatoActividadesBusqueda) {
    let index = this.catalogoPromotoresOriginal.findIndex((item: CatalogoPromotores) => item.idPromotor === actividad.idPromotor);
    if (index > -1) {
      actividad.puesto = this.catalogoPromotoresOriginal[index].puesto;
    }
  }

  obtenerActividades() {
    this.loaderService.activar();
    this.actividades = [];
    this.generarFormatoActividadesService.obtenerActividades(this.idFormatoRegistro, this.numPaginaActual, this.cantElementosPorPagina).pipe(
      finalize(() => {
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos && respuesta.datos?.content) {
          respuesta.datos.content?.forEach((element: GenerarFormatoActividadesBusqueda) => {
            element.hrInicio = moment(element.hrInicio, 'HH:mm:ss').format('HH:mm');
            element.hrFin = moment(element.hrFin, 'HH:mm:ss').format('HH:mm');
          });
          this.actividades = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  obtenerDatosFormato() {
    this.loaderService.activar();
    this.numActividades = 0;
    this.generarFormatoActividadesService.obtenerDetalleFormato(this.idFormatoRegistro).pipe(
      finalize(() => {
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos && respuesta.datos?.length > 0) {
          this.agregarGenerarFormatoActividadesForm.patchValue({
            folio: respuesta.datos[0].folio,
            descVelatorio: respuesta.datos[0].Velatorio,
            velatorio: +respuesta.datos[0].Velatorio.split('')[0],
            fechaInicio: moment(respuesta.datos[0].fecInicio).format('DD/MM/YYYY'),
            fechaFinal: moment(respuesta.datos[0].fecFin).format('DD/MM/YYYY'),
          });
          this.idFormato = respuesta.datos[0].idFormato;
          this.numActividades = respuesta.datos[0].numActividades;
          this.consultarPromotores();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  agregarActividad(actividad: GenerarFormatoActividadesBusqueda) {
    this.loaderService.activar();
    this.generarFormatoActividadesService.agregarActividad(this.datosGuardar(actividad)).pipe(
      finalize(() => {
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200 && !respuesta.error) {
          if (!this.apf.folio.value) {
            void this.router.navigate([`/generar-formato-de-actividades/modificar-actividades/${respuesta.datos}`], { relativeTo: this.activatedRoute });
          } else {
            setTimeout(() => {
              let elements = document.getElementById(`cancel-${actividad.idActividad}`);
              elements?.click();
              this.obtenerActividades();
              this.obtenerDatosFormato();
              this.agregandoRegistro = false;
            }, 100);
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  eliminarActividad(idActividad: number | null | undefined) {
    if (idActividad) {
      this.loaderService.activar();
      this.generarFormatoActividadesService.eliminarActividad(idActividad).pipe(
        finalize(() => {
          this.loaderService.desactivar()
        })
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);
          this.obtenerActividades();
          this.obtenerDatosFormato();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  datosGuardar(actividad: GenerarFormatoActividadesBusqueda): GenerarFormatoActividades {
    return {
      idFormato: this.idFormato,
      idFormatoRegistro: this.apf.folio.value,
      idVelatorio: this.apf.velatorio.value,
      fecInicio:
        typeof this.apf.fechaInicio.value === 'object' ?
          moment(this.apf.fechaInicio.value).format('DD/MM/YYYY') : this.apf.fechaInicio.value,
      fecFin:
        typeof this.apf.fechaFinal.value === 'object' ?
          moment(this.apf.fechaFinal.value).format('DD/MM/YYYY') : this.apf.fechaFinal.value,
      actividades: {
        idActividad: actividad.idActividad,
        fecActividad:
          typeof actividad.fecActividad === 'object' ?
            moment(actividad.fecActividad).format('DD/MM/YYYY') : actividad.fecActividad,
        hrInicio:
          typeof actividad.hrInicio === 'object' ?
            moment(actividad.hrInicio).format('HH:mm:ss') : actividad.hrInicio,
        hrFin:
          typeof actividad.hrFin === 'object' ?
            moment(actividad.hrFin).format('HH:mm:ss') : actividad.hrFin,
        idPromotor: actividad.idPromotor,
        numPlaticas: +(actividad.numPlaticas ?? 0),
        unidad: actividad.unidad,
        empresa: actividad.empresa,
        actividadRealizada: actividad.actividadRealizada,
        observaciones: actividad.observaciones,
        evidencia: actividad.evidencia ? 1 : 0,
      }
    }
  }

  onRowEditInit(actividad: GenerarFormatoActividadesBusqueda) {
    if (!this.agregandoRegistro) {
      this.clonedProducts['nuevo'] = { ...actividad };
    }
  }

  onRowEditSave(actividad: GenerarFormatoActividadesBusqueda) {
    if (this.mode !== 'create') {
      if (this.validarActidadForm(actividad)) {
        this.agregarActividad(actividad);
      }
    } else {
      this.agregarGenerarFormatoActividadesForm.markAllAsTouched();
      if (this.validarActidadForm(actividad) && this.agregarGenerarFormatoActividadesForm.valid) {
        this.agregarActividad(actividad);
      }
      // else {
      //   setTimeout(() => {
      //     let elements = document.getElementById('actividad-numPlaticas');
      //     elements?.click();
      //   }, 100);
      // }
    }
  }

  onRowDelete(actividad: GenerarFormatoActividadesBusqueda) {
    if (!this.agregandoRegistro) {
      let index = this.actividades.findIndex((item: GenerarFormatoActividadesBusqueda) => item.idActividad === actividad.idActividad);
      if (index !== -1) {
        this.eliminarActividad(this.actividades[index].idActividad);
        this.actividades.splice(index, 1);
      }
    }
  }

  onRowEditCancel(actividad: GenerarFormatoActividadesBusqueda, index: number) {
    if (!actividad.idActividad) {
      this.actividades.shift();
      this.agregandoRegistro = false;
    }
  }

  validarFechas() {
    if (this.apf.fechaInicio.value > this.apf.fechaFinal.value && this.apf.fechaFinal.value) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
      this.apf.fechaInicio.setErrors({ 'incorrect': true });
    } else {
      this.apf.fechaInicio.setErrors(null);
    }
  }

  validarActidadForm(actividad: GenerarFormatoActividadesBusqueda): boolean {
    if (actividad.hrInicio &&
      actividad.hrFin &&
      actividad.numPlaticas &&
      actividad.unidad &&
      actividad.empresa &&
      actividad.idPromotor && typeof actividad.idPromotor === 'number' &&
      actividad.actividadRealizada) {
      return true;
    }
    return false;
  }

  generarReporteTabla(): void {
    this.loaderService.activar();
    this.descargaArchivosService.descargarArchivo(this.generarFormatoActividadesService.generarReporteActividades({ idFormato: this.idFormato })).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (res: boolean) => {
        if (res) {
          this.mensajeModal = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
          this.mostrarModal = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }

  modalConfirmacion() {
    this.confirmationService.confirm({
      message: this.mensajeArchivoConfirmacion,
      accept: () => { },
    });
  }

  previsualizarReporte(): void {
    const configuracionArchivo: OpcionesArchivos = { nombreArchivo: 'Formato de actividades' };
    this.loaderService.activar();
    this.generarFormatoActividadesService.previsualizarReporte({ idFormato: this.idFormato }).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        const file = new Blob([respuesta], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(file);
        let archivoRef: DynamicDialogRef = this.dialogService.open(PrevisualizacionArchivoComponent, {
          data: url,
          header: "",
          width: "1000px",
        });
        archivoRef.onClose.subscribe((response: any) => {
          if (response) {
            this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
              finalize(() => this.loaderService.desactivar())
            ).subscribe({
              next: (respuesta: any) => {
                if (respuesta) {
                  this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
                  this.modalConfirmacion();
                }
              },
              error: (error: HttpErrorResponse) => {
                this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
              }
            });
          }
        })
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  get apf() {
    return this.agregarGenerarFormatoActividadesForm.controls;
  }
}
