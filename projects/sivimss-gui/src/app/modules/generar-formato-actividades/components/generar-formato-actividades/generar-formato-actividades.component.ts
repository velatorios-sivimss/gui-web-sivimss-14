import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { BuscarGenerarFormatoActividades, GenerarFormatoActividades, GenerarFormatoActividadesBusqueda } from "../../models/generar-formato-actividades.interface";
import { LazyLoadEvent } from "primeng/api";
import { ActivatedRoute, Router } from '@angular/router';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { GenerarFormatoActividadesService } from '../../services/generar-formato-actividades.service';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from 'rxjs';

interface HttpResponse {
  respuesta: string;
  promotor: GenerarFormatoActividades;
}
@Component({
  selector: 'app-generar-formato-actividades',
  templateUrl: './generar-formato-actividades.component.html',
  styleUrls: ['./generar-formato-actividades.component.scss'],
  providers: [DialogService]
})
export class GenerarFormatoActividadesComponent implements OnInit {
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
  public mensajeModal: string = "";
  public realizoBusqueda: boolean = false;

  public actividades: GenerarFormatoActividadesBusqueda[] = [];
  public actividadSeleccionada!: GenerarFormatoActividades;
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
    private generarFormatoActividadesService: GenerarFormatoActividadesService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
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
      nivel: [{ value: +usuario.idOficina, disabled: true }],
      delegacion: [{ value: +usuario.idDelegacion, disabled: +usuario.idOficina >= 2 }, []],
      velatorio: [{ value: +usuario.idVelatorio, disabled: +usuario.idOficina === 3 }, []],
      nombrePromotor: [{ value: null, disabled: false }],
      folio: new FormControl({ value: null, disabled: false }, []),
      fechaInicio: new FormControl({ value: null, disabled: false }, []),
      fechaFinal: new FormControl({ value: null, disabled: false }, []),
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
    this.generarFormatoActividadesService.velatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  paginar(event?: LazyLoadEvent): void {
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
    this.buscarPorFiltros(false);
  }

  paginarPorFiltros(): void {
    this.numPaginaActual = 0;
    this.buscarPorFiltros(true);
  }

  buscarPorFiltros(esFiltro: boolean): void {
    this.loaderService.activar();
    this.generarFormatoActividadesService.buscarPorFiltros(this.datosPromotoresFiltros(esFiltro), this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            this.actividades = respuesta.datos.content;
            this.totalElementos = respuesta.datos.totalElements;
            this.realizoBusqueda = true;
          } else {
            this.actividades = [];
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  datosPromotoresFiltros(esFiltro: boolean): BuscarGenerarFormatoActividades {
    let nomPromotor: string | null = null;
    if (esFiltro) {
      if (typeof this.ff.nombrePromotor?.value === 'object') {
        nomPromotor = this.ff.nombrePromotor?.value?.label;
      } else {
        nomPromotor = this.ff.nombrePromotor.getRawValue() === '' ? null : this.ff.nombrePromotor.getRawValue();
      }
    }
    return {
      idDelegacion: this.ff.delegacion.getRawValue() === '' ? null : this.ff.delegacion.getRawValue(),
      idVelatorio: this.ff.velatorio.getRawValue() === '' ? null : this.ff.velatorio.getRawValue(),
    }
  }

  agregarFormatoActividades(): void {
    void this.router.navigate([`agregar-actividades`], { relativeTo: this.activatedRoute });
  }

  modificarFormatoActividades(): void {
    void this.router.navigate([`modificar-actividades`], { relativeTo: this.activatedRoute });
  }

  detalleFormatoActividades(): void {
    void this.router.navigate([`detalle-de-actividades/${this.actividadSeleccionada.idFormato}`], { relativeTo: this.activatedRoute });
  }

  abrirPanel(event: MouseEvent, actividadSeleccionada: GenerarFormatoActividades): void {
    this.actividadSeleccionada = actividadSeleccionada;
    this.overlayPanel.toggle(event);
  }

  agregarPromotor(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiar(): void {
    this.realizoBusqueda = false;
    this.filtroForm.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm.get('nivel')?.patchValue(+usuario.idOficina);

    if (+usuario.idOficina >= 2) {
      this.filtroForm.get('delegacion')?.patchValue(+usuario.idDelegacion);
    }

    if (+usuario.idOficina === 3) {
      this.filtroForm.get('velatorio')?.patchValue(+usuario.idVelatorio);
    } else {
      this.catalogoVelatorios = [];
    }
    this.cargarVelatorios(true);
    this.actividades = [];
    this.totalElementos = 0;
  }

  validarAlMenosUnCampoConValor(group: FormGroup) {
    if (!Object.values(group.value).find(value => value !== '' && value !== null)) {
      return false;
    }
    return true;
  }

  onRowEditInit(generarFormatoActividadesBusqueda: GenerarFormatoActividadesBusqueda) {
  }

  onRowEditSave(generarFormatoActividades: GenerarFormatoActividades) {
  }

  onRowEditCancel(generarFormatoActividades: GenerarFormatoActividades, index: number) {
  }

  get ff() {
    return this.filtroForm.controls;
  }

}
