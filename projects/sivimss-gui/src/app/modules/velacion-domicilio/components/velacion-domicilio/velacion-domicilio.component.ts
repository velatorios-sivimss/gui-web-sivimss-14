import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { OverlayPanel } from "primeng/overlaypanel";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { LazyLoadEvent } from "primeng/api";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { BuscarFoliosOds, ControlMovimiento, ReporteTabla, VelacionDomicilioInterface } from "../../models/velacion-domicilio.interface";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { RegistrarEntradaEquipoComponent } from "../registrar-entrada-equipo/registrar-entrada-equipo.component";
import { ActivatedRoute, Router } from "@angular/router";
import { mapearArregloTipoDropdown, validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import { VelacionDomicilioService } from '../../services/velacion-domicilio.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from "moment/moment";
import { mensajes } from '../../../reservar-salas/constants/mensajes';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';

@Component({
  selector: 'app-velacion-domicilio',
  templateUrl: './velacion-domicilio.component.html',
  styleUrls: ['./velacion-domicilio.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class VelacionDomicilioComponent implements OnInit {
  readonly POSICION_NIVELES: number = 0;
  readonly POSICION_DELEGACIONES: number = 1;
  readonly POSICION_ODS_GENERADAS = 2;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroForm!: FormGroup;
  vale: VelacionDomicilioInterface[] = [];
  valeSeleccionado: VelacionDomicilioInterface = {}
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  registrarEntradaEquipoRef!: DynamicDialogRef;
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  foliosGenerados: TipoDropdown[] = [];
  fechaActual: Date = new Date();
  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;
  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private velacionDomicilioService: VelacionDomicilioService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
    this.cargarCatalogos();
    this.paginar();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    // const velatorios = respuesta[this.POSICION_VELATORIOS].datos;
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    // this.catalogoVelatorios = mapearArregloTipoDropdown(velatorios, "desc", "id");
    const ods = respuesta[this.POSICION_ODS_GENERADAS]?.datos;
    this.foliosGenerados = mapearArregloTipoDropdown(ods, "folioOds", "idOds");
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  async inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: new FormControl({ value: +this.rolLocalStorage.idOficina || null, disabled: +this.rolLocalStorage.idOficina >= 1 }, []),
      delegacion: new FormControl({ value: +this.rolLocalStorage.idDelegacion || null, disabled: +this.rolLocalStorage.idOficina >= 2 }, [Validators.required]),
      velatorio: new FormControl({ value: +this.rolLocalStorage.idVelatorio || null, disabled: +this.rolLocalStorage.idOficina === 3 }, [Validators.required]),
      folioODS: new FormControl({ value: null, disabled: false }, []),
      fechaInicio: new FormControl({ value: null, disabled: false }, []),
      fechaFinal: new FormControl({ value: null, disabled: false }, []),
    });
    await this.obtenerVelatorios();
  }

  paginar(event?: LazyLoadEvent): void {
    if (this.filtroForm.valid) {
      if (event && event.first !== undefined && event.rows !== undefined) {
        this.numPaginaActual = Math.floor(event.first / event.rows);
      } else {
        this.numPaginaActual = 0;
      }
      this.velacionDomicilioService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina).subscribe(
        (respuesta) => {
          this.vale = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        },
        (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == error?.error?.mensaje;
          })
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error Desconocido");
        }
      );
    }
  }

  abrirDetalleValeSalida(vale: VelacionDomicilioInterface): void {
    this.router.navigate([`reservar-capilla/velacion-en-domicilio/ver-detalle/${vale.idValeSalida}`]);
  }

  abrirModalRegistroEntradaEquipo(): void {
    this.registrarEntradaEquipoRef = this.dialogService.open(RegistrarEntradaEquipoComponent, {
      header: 'Registro de entrada de equipo de velación',
      width: '920px',
      data: { valeSeleccionado: this.valeSeleccionado },
    });

    this.registrarEntradaEquipoRef.onClose.subscribe(() => {
      this.paginar();
    })
  }

  abrirPanel(event: MouseEvent, vale: VelacionDomicilioInterface): void {
    this.valeSeleccionado = vale;
    this.overlayPanel.toggle(event);
  }

  eliminarVale(): void {
    if (this.valeSeleccionado.idValeSalida) {
      this.velacionDomicilioService.eliminarVale(this.valeSeleccionado.idValeSalida).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe(
        (respuesta: HttpRespuesta<any>) => {
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == respuesta.mensaje;
          })
          // this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
          this.alertaService.mostrar(TipoAlerta.Exito, 'Se ha eliminado correctamente');
          this.paginar();
        },
        (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == error?.error?.mensaje;
          })
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error Desconocido");
        }
      );
    }
  }

  descargarControlMovimiento(): void {
    if (this.valeSeleccionado.idValeSalida) {
      this.loaderService.activar();
      this.descargaArchivosService.descargarArchivo(
        this.velacionDomicilioService.descargarValeSalida(this.controlMovimiento())
      ).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe(
        (respuesta) => {
          console.log(respuesta);
        },
        (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == error?.error?.mensaje;
          })
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error Desconocido");
        },
      )
    }
  }

  controlMovimiento(): ControlMovimiento {
    return {
      idValeSalida: this.valeSeleccionado.idValeSalida || null,
      ruta: "reportes/generales/ReporteValeSalida.jrxml",
      tipoReporte: "pdf"
    }
  }

  descargarRegistrosTabla(tipoReporte: string): void {
    this.loaderService.activar();
    this.descargaArchivosService.descargarArchivo(
      this.velacionDomicilioService.descargarRegistrosTabla(this.reporteTabla(tipoReporte))
    ).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta);
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error Desconocido");
      },
    )
  }

  reporteTabla(tipoReporte: string): ReporteTabla {
    // const nombreVelatorio: string =
    //   this.catalogoVelatorios.filter((item: TipoDropdown) => item.value === this.f.velatorio.value)[0]?.label;
    return {
      idValeSalida: null,
      folioOds: this.f.folioODS.value,
      fechaInicio: this.f.fechaInicio.value,
      fechaFinal: this.f.fechaFinal.value,
      ruta: "reportes/generales/ReporteTablaValeSalida.jrxml",
      tipoReporte,
    }
  }

  buscar(): void {
    if(this.f.fechaInicio.value > this.f.fechaFinal.value) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }
    const temp = {
      delegacion: this.f.delegacion.value,
      velatorio: this.f.velatorio.value,
      folioODS: this.f.folioODS.value,
      fechaInicio: this.f.fechaInicio.value ? moment(this.f.fechaInicio.value).format('YYYY-MM-DD') : null,
      fechaFinal: this.f.fechaFinal.value ? moment(this.f.fechaFinal.value).format('YYYY-MM-DD') : null,
    };
    if (!validarAlMenosUnCampoConValor(temp)) {
      this.filtroForm.markAllAsTouched();
      const mensaje = this.alertas.filter((msj: any) => {
        return msj.idMensaje == 22;
      })
      this.alertaService.mostrar(TipoAlerta.Precaucion, mensaje[0].desMensaje);
    } else {
      this.numPaginaActual = 0;
      this.buscarPorFiltros();
    }
  }

  buscarPorFiltros(): void {
    if (this.filtroForm.valid) {
      this.velacionDomicilioService.buscarPorFiltros(
        this.obtenerObjetoParaFiltrado(),
        this.numPaginaActual,
        this.cantElementosPorPagina
      ).subscribe(
        (respuesta) => {
          if (!respuesta.datos && respuesta.error) {
            this.alertaService.mostrar(TipoAlerta.Precaucion, respuesta.mensaje);
          } else {
            if (respuesta!.datos?.content.length === 0) {
              this.vale = [];
              this.totalElementos = 0;
              const mensaje = this.alertas.filter((msj: any) => {
                return msj.idMensaje == 45;
              })
              this.alertaService.mostrar(TipoAlerta.Precaucion, mensaje[0].desMensaje);
            } else {
              this.vale = respuesta!.datos.content;
              this.totalElementos = respuesta!.datos.totalElements;
            }
          }
        },
        (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == error?.error?.mensaje;
          })
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error Desconocido");
        }
      );
    } else {
      this.filtroForm.markAllAsTouched();
    }
  }

  obtenerObjetoParaFiltrado(): object {
    return {
      idNivel: +this.f.nivel.value || null,
      idDelegacion: +this.f.delegacion.value || null,
      idVelatorio: +this.f.velatorio.value || null,
      folioOds: this.f.folioODS.value?.label,
      fechaInicio: this.f.fechaInicio.value ? moment(this.f.fechaInicio.value).format('YYYY-MM-DD') : null,
      fechaFinal: this.f.fechaFinal.value ? moment(this.f.fechaFinal.value).format('YYYY-MM-DD') : null,
    }
  }

  limpiar(): void {
    this.alertaService.limpiar();
    this.filtroForm.reset();
    this.f.nivel.setValue(+this.rolLocalStorage.idOficina || null);

    if (+this.rolLocalStorage.idOficina >= 2) {
      this.f.delegacion.setValue(+this.rolLocalStorage.idDelegacion || null);
    }

    if (+this.rolLocalStorage.idOficina === 3) {
      this.f.velatorio.setValue(+this.rolLocalStorage.idVelatorio || null);
    }

    this.obtenerFoliosGenerados();
    this.paginar();
  }

  regresar() {
    this.router.navigate(['/']).then((e)=>{}).catch((e)=>{});
  }

  validarCampoOds() {
    if (!this.f.folioODS.value) {
      this.filtroForm.get('delegacion')?.setValidators(Validators.required);
      this.filtroForm.get('velatorio')?.setValidators(Validators.required);
    } else {
      this.filtroForm.get('delegacion')?.clearValidators();
      this.filtroForm.get('velatorio')?.clearValidators();
    }
    this.filtroForm.get('delegacion')?.updateValueAndValidity();
    this.filtroForm.get('velatorio')?.updateValueAndValidity();
  }

  async obtenerVelatorios() {
    this.foliosGenerados = [];
    this.velacionDomicilioService.obtenerVelatoriosPorDelegacion(this.f.delegacion.value).subscribe(
      (respuesta) => {
        this.catalogoVelatorios = respuesta.datos ? mapearArregloTipoDropdown(respuesta.datos, "desc", "id") : [];
        this.obtenerFoliosGenerados();
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error Desconocido");
      }
    );
  }

  obtenerFoliosGenerados() {
    let buscarFoliosOds: BuscarFoliosOds = {
      idDelegacion: this.f.delegacion.value,
      idVelatorio: this.f.velatorio.value,
    }
    this.velacionDomicilioService.obtenerOds(buscarFoliosOds).subscribe(
      (respuesta) => {
        let filtrado: TipoDropdown[] = [];
        if (respuesta!.datos.length > 0) {
          respuesta!.datos.forEach((e: any) => {
            filtrado.push({
              label: e.folioOds,
              value: e.idOds,
            });
          });
          this.foliosGenerados = filtrado;
        } else {
          this.foliosGenerados = [];
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  get f() {
    return this.filtroForm.controls;
  }
}
