import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA, Accion } from "../../../../utils/constantes";
import { BuscarPromotores, Promotor, PromotoresBusqueda } from "../../models/promotores.interface";
import { LazyLoadEvent } from "primeng/api";
import { ActivatedRoute, Router } from '@angular/router';
import { VerDetallePromotoresComponent } from '../ver-detalle-promotores/ver-detalle-promotores.component';
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

interface HttpResponse {
  respuesta: string;
  promotor: Promotor;
}
@Component({
  selector: 'app-promotores',
  templateUrl: './promotores.component.html',
  styleUrls: ['./promotores.component.scss'],
  providers: [DialogService]
})
export class PromotoresComponent implements OnInit {
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
  promotoresServicioFiltrados: any[] = [];

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
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(PROMOTORES_BREADCRUMB);
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
    this.promotoresService.obtenerVelatorios(idDelegacion).subscribe({
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
    this.promotoresService.buscarPorFiltros(this.datosPromotoresFiltros(esFiltro), this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos) {
          this.promotores = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
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
      header: "Agregar promotor",
      width: "920px"
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
  }

  agregarPromotor(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiarFormBusqueda() {
    this.filtroForm.reset();
  }

  buscarPromotor() {
    // De acuerdo a CU al menos un campo con información a buscar
    if (this.validarAlMenosUnCampoConValor(this.filtroForm)) {
      // TO DO llamada a servicio para realizar búsqueda
    }
  }

  validarAlMenosUnCampoConValor(group: FormGroup) {
    if (!Object.values(group.value).find(value => value !== '' && value !== null)) {
      return false;
    }
    return true;
  }

  cambiarEstatus(promotor: Promotor) {
    const modo = promotor.estatus ? Accion.Desactivar : Accion.Activar;
    this.detalleRef = this.dialogService.open(VerDetallePromotoresComponent, {
      data: { promotor, modo },
      header: "Ver detalle",
      width: "920px"
    });
    // this.detalleRef.onClose.subscribe((res: HttpResponse) => {
    //   if (res && res.respuesta === 'Ok' && res.promotor) {
    //     const foundIndex = this.promotores.findIndex((item: Promotor) => item.id === promotor.id);
    //     this.promotores[foundIndex] = res.promotor;
    //   }
    // });
  }

  get ff() {
    return this.filtroForm.controls;
  }

}
