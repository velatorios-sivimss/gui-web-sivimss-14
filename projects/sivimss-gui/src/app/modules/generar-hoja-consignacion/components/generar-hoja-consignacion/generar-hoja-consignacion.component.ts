import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { BuscarGenerarHojaConsignacion, GenerarHojaConsignacion, GenerarHojaConsignacionBusqueda } from "../../models/generar-hoja-consignacion.interface";
import { LazyLoadEvent } from "primeng/api";
import { ActivatedRoute, Router } from '@angular/router';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { GenerarHojaConsignacionService } from '../../services/generar-hoja-consignacion.service';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { finalize } from 'rxjs';
import { AgregarGenerarHojaConsignacionComponent } from '../agregar-generar-hoja-consignacion/agregar-generar-hoja-consignacion.component';

interface HttpResponse {
  respuesta: string;
  promotor: GenerarHojaConsignacion;
}
@Component({
  selector: 'app-generar-hoja-consignacion',
  templateUrl: './generar-hoja-consignacion.component.html',
  styleUrls: ['./generar-hoja-consignacion.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class GenerarHojaConsignacionComponent implements OnInit {
  readonly POSICION_CATALOGOS_NIVELES: number = 0;
  readonly POSICION_CATALOGOS_DELEGACIONES: number = 1;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  public numPaginaActual: number = 0;
  public cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  public totalElementos: number = 0;
  public catalogoNiveles: TipoDropdown[] = [];
  public catalogoDelegaciones: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];
  public catalogoPlacas: TipoDropdown[] = [];
  public mostrarModalConfirmacion: boolean = false;
  public realizoBusqueda: boolean = false;
  public mensajeArchivoConfirmacion: string = "";

  public hojasConsignacion: GenerarHojaConsignacionBusqueda[] = [
    {
      idHojaConsignacion: 1,
      fecHojaConsignacion: '14/09/2023',
      folioHojaConsignacion: '14/09/2023',
    }
  ];
  public actividadSeleccionada!: GenerarHojaConsignacionBusqueda;
  public detalleRef!: DynamicDialogRef;
  public filtroForm!: FormGroup;
  public promotoresFiltrados: TipoDropdown[] = [];
  public fechaActual: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private generarHojaConsignacionService: GenerarHojaConsignacionService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
    this.cargarVelatorios(true);
  }

  inicializarFiltroForm() {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: +usuario?.idOficina, disabled: true }],
      delegacion: [{ value: +usuario?.idDelegacion, disabled: +usuario?.idOficina >= 2 }, []],
      velatorio: [{ value: +usuario?.idVelatorio, disabled: +usuario?.idOficina === 3 }, []],
      nombrePromotor: [{ value: null, disabled: false }],
      folio: new FormControl({ value: null, disabled: false }, []),
      fecInicio: new FormControl({ value: null, disabled: false }, []),
      fecFin: new FormControl({ value: null, disabled: false }, []),
    });
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGOS_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGOS_DELEGACIONES];
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.filtroForm.get('velatorio')?.patchValue("");
    }
    const idDelegacion = this.filtroForm.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.generarHojaConsignacionService.velatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  buscar(): void {
    if (this.ff.fecInicio.value > this.ff.fecFin.value && this.ff.fecFin.value) {
      const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(20);
      this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
      return;
    }
    this.numPaginaActual = 0;
    this.buscarPorFiltros();
  }

  paginar(event?: LazyLoadEvent): void {
    if (this.filtroForm.valid) {
      if (event?.first !== undefined && event.rows !== undefined) {
        this.numPaginaActual = Math.floor(event.first / event.rows);
      } else {
        this.numPaginaActual = 0;
      }
      this.buscarPorFiltros();
    }
  }

  paginarPorFiltros(): void {
    this.numPaginaActual = 0;
    this.buscarPorFiltros();
  }

  buscarPorFiltros(): void {
    this.loaderService.activar();
    this.generarHojaConsignacionService.buscarPorFiltros(this.datosPromotoresFiltros(), this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            this.hojasConsignacion = respuesta.datos;
            this.totalElementos = respuesta.datos.totalElements;
            this.realizoBusqueda = true;
          } else {
            this.hojasConsignacion = [];
          }

          this.hojasConsignacion = [
            {
              idHojaConsignacion: 1,
              fecHojaConsignacion: '14/09/2023',
              folioHojaConsignacion: '14/09/2023',
            }
          ]
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  datosPromotoresFiltros(): BuscarGenerarHojaConsignacion {
    return {
      idDelegacion: this.ff.delegacion.getRawValue() === '' ? null : this.ff.delegacion.getRawValue(),
      idVelatorio: this.ff.velatorio.getRawValue() === '' ? null : this.ff.velatorio.getRawValue(),
      folio: this.ff.folio.getRawValue() === '' ? null : this.ff.folio.getRawValue(),
      fecInicio: this.ff.fecInicio.getRawValue() === '' ? null : this.ff.fecInicio.getRawValue(),
      fecFin: this.ff.fecFin.getRawValue() === '' ? null : this.ff.fecFin.getRawValue(),
    }
  }

  agregarFormatoActividades(): void {
    void this.router.navigate([`agregar-actividades`], { relativeTo: this.activatedRoute });
  }

  modificarFormatoActividades(actividadSeleccionada: GenerarHojaConsignacionBusqueda): void {
    void this.router.navigate([`modificar-actividades/${actividadSeleccionada.idHojaConsignacion}`], { relativeTo: this.activatedRoute });
  }

  detalleFormatoActividades(actividadSeleccionada: GenerarHojaConsignacionBusqueda): void {
    void this.router.navigate([`detalle-de-actividades/${actividadSeleccionada.idHojaConsignacion}`], { relativeTo: this.activatedRoute });
  }

  abrirPanel(event: MouseEvent, actividadSeleccionada: GenerarHojaConsignacionBusqueda): void {
    this.actividadSeleccionada = actividadSeleccionada;
    this.overlayPanel.toggle(event);
  }

  abrirModalCargarFactura(): void {
    this.detalleRef = this.dialogService.open(AgregarGenerarHojaConsignacionComponent, {
      header: "Factura proveedor",
      width: "920px",
      data: { actividad: this.actividadSeleccionada },
    });

    // this.detalleRef.onClose.subscribe((respuesta: ConfirmarContratante) => {
    //   if (respuesta?.estatus) {
    //     this.paginar();
    //   }
    // });
  }

  agregarPromotor(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiar(): void {
    this.realizoBusqueda = false;
    this.filtroForm.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm.get('nivel')?.patchValue(+usuario?.idOficina);

    if (+usuario?.idOficina >= 2) {
      this.filtroForm.get('delegacion')?.patchValue(+usuario?.idDelegacion);
    }

    if (+usuario?.idOficina === 3) {
      this.filtroForm.get('velatorio')?.patchValue(+usuario?.idVelatorio);
    } else {
      this.catalogoVelatorios = [];
    }
    this.cargarVelatorios(true);
    this.hojasConsignacion = [];
    this.totalElementos = 0;
  }

  validarAlMenosUnCampoConValor(group: FormGroup) {
    if (!Object.values(group.value).find(value => value !== '' && value !== null)) {
      return false;
    }
    return true;
  }

  generarReporteTabla(tipoReporte: string): void {
    if (this.filtroForm.invalid) return;
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);
    this.descargaArchivosService.descargarArchivo(this.generarHojaConsignacionService.generarReporteConsulta(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: () => {
        this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
        this.mostrarModalConfirmacion = true;
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }

  filtrosArchivos(tipoReporte: string) {
    return {
      idDelegacion: this.ff.delegacion.value ? +this.ff.delegacion.value : null,
      idVelatorio: this.ff.velatorio.value ? +this.ff.velatorio.value : null,
      folio: this.ff.folio.value ? +this.ff.folio.value : null,
      fecInicio: this.ff.fecInicio.value ? +this.ff.fecInicio.value : null,
      fecFin: this.ff.fecFin.value ? +this.ff.fecFin.value : null,
      tipoReporte,
    }
  }

  get ff() {
    return this.filtroForm.controls;
  }

}
