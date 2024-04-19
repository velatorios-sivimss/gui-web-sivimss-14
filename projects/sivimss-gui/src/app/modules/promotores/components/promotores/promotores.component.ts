import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import {
  BuscarCatalogo,
  BuscarPromotores,
  CambiarEstatus,
  Promotor,
  PromotoresBusqueda
} from "../../models/promotores.interface";
import { LazyLoadEvent } from "primeng/api";
import { ActivatedRoute, Router } from '@angular/router';
import { AgregarPromotoresComponent } from '../agregar-promotores/agregar-promotores.component';
import { ModificarPromotoresComponent } from '../modificar-promotores/modificar-promotores.component';
import { PROMOTORES_BREADCRUMB } from '../../constants/breadcrumb';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PromotoresService } from '../../services/promotores.service';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from 'rxjs';
import {AutenticacionService} from "../../../../services/autenticacion.service";

interface HttpResponse {
  respuesta: string;
  promotor: Promotor;
}

@Component({
  selector: 'app-promotores',
  templateUrl: './promotores.component.html',
  styleUrls: ['./promotores.component.scss'],
  providers: [DialogService, AutenticacionService]
})
export class PromotoresComponent implements OnInit, OnDestroy {
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

  promotoresServicio: any[] = [
    {
      label: 'Promotor Uno',
      value: 0,
    },
    {
      label: 'Promotor Dos',
      value: 1,
    },
    {
      label: 'Promotor Tres',
      value: 2,
    }
  ];

  promotores: PromotoresBusqueda[] = [];
  promotorSeleccionado!: Promotor;
  detalleRef!: DynamicDialogRef;
  filtroForm!: FormGroup;
  promotoresFiltrados: TipoDropdown[] = [];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private promotoresService: PromotoresService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private authService: AutenticacionService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(PROMOTORES_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
    this.cargarVelatorios(true);
  }

  inicializarFiltroForm() {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: +usuario.idOficina, disabled: true }],
      delegacion: [{ value: +usuario.idDelegacion, disabled: +usuario.idOficina >= 2 }, []],
      velatorio: [{ value: +usuario.idVelatorio, disabled: +usuario.idOficina === 3 }, []],
      nombrePromotor: [{ value: null, disabled: false }],
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
    this.promotoresService.velatoriosPorDelegacion(idDelegacion).subscribe({
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
    this.promotoresService.buscarPorFiltros(this.datosPromotoresFiltros(esFiltro), this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            this.promotores = respuesta.datos.content;
            this.totalElementos = respuesta.datos.totalElements;
            this.realizoBusqueda = true;
          } else {
            this.promotores = [];
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  datosPromotoresFiltros(esFiltro: boolean): BuscarPromotores {
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
      nomPromotor,
    }
  }

  abrirModalAgregarPromotor(): void {
    this.detalleRef = this.dialogService.open(AgregarPromotoresComponent, {
      header: "Registro nuevo promotor",
      width: "920px"
    });

    this.detalleRef.onClose.subscribe(() => {
      this.paginar();
    });
  }

  abrirPanel(event: MouseEvent, promotorSeleccionado: Promotor): void {
    this.promotorSeleccionado = promotorSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalModificarPromotor() {
    this.detalleRef = this.dialogService.open(ModificarPromotoresComponent, {
      data: { promotor: this.promotorSeleccionado },
      header: "Modificar promotor",
      width: "920px"
    });

    this.detalleRef.onClose.subscribe(() => {
      this.paginar();
    });
  }

  agregarPromotor(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiar(): void {
    this.realizoBusqueda = false;
    this.filtroForm.reset();
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
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
    this.promotores = [];
    this.totalElementos = 0;
  }

  validarAlMenosUnCampoConValor(group: FormGroup) {
    if (!Object.values(group.value).find(value => value !== '' && value !== null)) {
      return false;
    }
    return true;
  }

  confirmarInhabilitar() {
    this.mostrarModalConfirmacion = true;
    this.mensajeModal = '¿Estás seguro de desactivar el registro seleccionado?';
  }

  inhabilitarPromotor() {
    this.loaderService.activar();
    this.promotoresService.cambiarEstatus(this.datosCambiarEstatus()).pipe(
      finalize(() => {
        this.mostrarModalConfirmacion = false;
        this.loaderService.desactivar();
      })
    ).subscribe({
      next: () => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Promotor inhabilitado correctamente');
        this.paginar();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  datosCambiarEstatus(): CambiarEstatus {
    return {
      idPromotor: this.promotorSeleccionado.idPromotor,
      estatus: 0,
    }
  }

  obtenerNombrePromotor(): string {
    let query = this.ff.nombrePromotor?.value || '';
    if (typeof this.ff.nombrePromotor?.value === 'object') {
      query = this.ff.nombrePromotor?.value?.label;
    }
    return query;
  }

  filtrarPromotores() {
    let nomPromotor = this.obtenerNombrePromotor();
    if (nomPromotor?.length >= 3) {
      const obj: BuscarCatalogo = {
        idDelegacion: this.ff.delegacion.getRawValue() === '' ? null : this.ff.delegacion.getRawValue(),
        idVelatorio: this.ff.velatorio.getRawValue() === '' ? null : this.ff.velatorio.getRawValue(),
        nomPromotor,
        catalogo: 1,
      }
      this.promotoresService.obtenerCatalogos(obj).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          let filtrado: TipoDropdown[] = [];
          if (respuesta.datos && respuesta.datos.length > 0) {
            respuesta.datos.forEach((e: any) => {
              filtrado.push({
                label: e.nomPromotor,
                value: e.idPromotor,
              });
            });
            this.promotoresFiltrados = filtrado;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  get ff() {
    return this.filtroForm.controls;
  }

  ngOnDestroy(): void {
    if (this.detalleRef) {
      this.detalleRef.destroy();
    }
  }

}
