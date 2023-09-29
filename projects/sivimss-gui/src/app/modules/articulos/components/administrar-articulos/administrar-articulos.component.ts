import { DetalleArticulosComponent } from './../detalle-articulos/detalle-articulos.component';
import { ModificarArticulosComponent } from './../modificar-articulos/modificar-articulos.component';
import { AgregarArticulosComponent } from './../agregar-articulos/agregar-articulos.component';
import { Articulo } from './../../models/articulos.interface';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { CATALOGOS_DUMMIES, CATALOGO_NIVEL } from '../../constants/dummies';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LazyLoadEvent } from 'primeng/api';
import { SERVICIO_BREADCRUMB } from '../../constants/breadcrumb';
import { validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import { ArticulosService } from '../../services/articulos.service';
import { HttpErrorResponse } from '@angular/common/http';
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Component({
  selector: 'app-administrar-articulos',
  templateUrl: './administrar-articulos.component.html',
  styleUrls: ['./administrar-articulos.component.scss'],
  providers: [DialogService]
})
export class AdministrarArticulosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;


  articulos: Articulo[] = [];
  articuloSeleccionado: Articulo = {};

  filtroForm!: FormGroup;

  modificarArticuloForm!: FormGroup;

  mostrarModalModificarArticulo: boolean = false;
  mostrarModalDetalleArticulo: boolean = false;
  mostrarModalEstatusArticulo: boolean = false;

  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  catNiveles: TipoDropdown[] = CATALOGO_NIVEL;
  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  articulosServicio: TipoDropdown[] = [
    {
      value: 0,
      label: 'Artículo Uno',
    },
    {
      value: 1,
      label: 'Artículo Dos',
    },
    {
      value: 2,
      label: 'Artículo Tres',
    }
  ];

  articuloServicioFiltrados: TipoDropdown[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private articulosService: ArticulosService,
  ) { }


  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: 1, disabled: true }],
      delegacion: [{ value: null, disabled: false }],
      velatorio: [{ value: null, disabled: false }],
      nombreArticulo: [{ value: null, disabled: false }],
    });
  }

  abrirModalAgregarServicio(): void {
    this.creacionRef = this.dialogService.open(AgregarArticulosComponent, {
      header: "Registro de artículo nuevo",
      width: "920px"
    });

    this.creacionRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo agregado correctamente');
        this.paginar();
      }
    })
  }

  abrirModalModificarServicio(): void {
    this.creacionRef = this.dialogService.open(ModificarArticulosComponent, {
      header: "Modificar artículo",
      width: "920px",
      data: { articulo: this.articuloSeleccionado, origen: "modificar" },
    });

    this.creacionRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo modificado correctamente');
        this.paginar();
      }
    })
  }

  abrirModalDetalleArticulo(articulo: Articulo) {
    this.creacionRef = this.dialogService.open(DetalleArticulosComponent, {
      header: "Detalle de artículo",
      width: "920px",
      data: { articulo, origen: "detalle" },
    });
  }

  abrirModalCambioEstatus(articulo: Articulo) {
    const header: string = articulo.estatus ? "Desactivar artículo" : "Activar artículo";
    this.creacionRef = this.dialogService.open(DetalleArticulosComponent, {
      header: header,
      width: "920px",
      data: { articulo, origen: "estatus" },
    });

    this.creacionRef.onClose.subscribe((articulo: Articulo) => {
      this.paginar();
    });
  }

  abrirPanel(event: MouseEvent, articuloSeleccionado: Articulo): void {
    this.articuloSeleccionado = articuloSeleccionado;
    this.overlayPanel.toggle(event);
  }

  paginar(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    } else {
      this.numPaginaActual = 0;
    }
    this.buscarPorFiltros();
  }

  buscarPorFiltros(): void {
    this.articulosService.buscarPorFiltros(this.obtenerObjetoParaFiltrado(), this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.articulos = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  buscarArticulo() {
    this.clearValidatorsFiltroForm();
    if (validarAlMenosUnCampoConValor(this.filtroForm.value)) {
      this.paginar();
    } else {
      this.f.delegacion.setValidators(Validators.required);
      this.f.delegacion.updateValueAndValidity();
      this.f.velatorio.setValidators(Validators.required);
      this.f.velatorio.updateValueAndValidity();
      this.f.nombreArticulo.setValidators(Validators.required);
      this.f.nombreArticulo.updateValueAndValidity();
      this.filtroForm.markAllAsTouched();
    }
  }

  obtenerObjetoParaFiltrado(): object {
    return {
      nivel: null,
      nombreArticulo: this.obtenerNombreArticuloDescripcion() || null,
    }
  }

  obtenerNombreArticuloDescripcion(): string {
    let query = this.f.nombreArticulo?.value || '';
    if (typeof this.f.nombreArticulo?.value === 'object') {
      query = this.f.nombreArticulo?.value?.label;
    }
    return query?.toLowerCase();
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.clearValidatorsFiltroForm();
    this.paginar();
  }

  clearValidatorsFiltroForm() {
    this.f.delegacion.clearValidators();
    this.f.delegacion.updateValueAndValidity();
    this.f.velatorio.clearValidators();
    this.f.velatorio.updateValueAndValidity();
    this.f.nombreArticulo.clearValidators();
    this.f.nombreArticulo.updateValueAndValidity();
  }

  filtrarArticulos() {
    let query = this.obtenerNombreArticuloDescripcion();
    if (query?.length >= 3) {
      this.articulosService.buscarTodosPorFiltros(this.obtenerObjetoParaFiltrado()).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          let filtrado: TipoDropdown[] = [];
          if (respuesta.datos.length > 0) {
            respuesta.datos.forEach((e: any) => {
              filtrado.push({
                label: e.desArticulo,
                value: e.idArticulo,
              });
            });
            this.articuloServicioFiltrados = filtrado;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  get f() {
    return this.filtroForm?.controls;
  }

}
