import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { Articulo, ConfirmacionServicio } from '../../models/articulos.interface';
import { ArticulosService } from '../../services/articulos.service';

@Component({
  selector: 'app-modificar-articulos',
  templateUrl: './modificar-articulos.component.html',
  styleUrls: ['./modificar-articulos.component.scss']
})
export class ModificarArticulosComponent implements OnInit {
  readonly POSICION_CATALOGO_CATEGORIAS: number = 0;
  readonly POSICION_CATALOGO_TIPOS_ARTICULOS: number = 1;
  readonly POSICION_CATALOGO_TIPOS_MATERIALES: number = 2;
  readonly POSICION_CATALOGO_TAMANIOS: number = 3;
  readonly POSICION_CATALOGO_CLASIFICACION_PRODUCTOS: number = 4;
  readonly POSICION_CATALOGO_PARTIDAS_PRESUPUESTALES: number = 5;
  readonly POSICION_CATALOGO_CUENTAS_CONTABLES: number = 6;
  readonly POSICION_CATALOGO_CLAVES_SAT: number = 7;
  readonly ID_ARTICULO_COMPLEMENTARIO: number = 2;

  modificarArticuloForm!: FormGroup;
  articulos: Articulo = {};
  ventanaConfirmacion: boolean = false;
  articuloSeleccionado!: Articulo;
  catalogoCategorias: TipoDropdown[] = [];
  catalogoTiposArticulos: TipoDropdown[] = [];
  catalogoTiposMateriales: TipoDropdown[] = [];
  catalogoTamanios: TipoDropdown[] = [];
  catalogoClasificacionProductos: TipoDropdown[] = [];
  catalogoPartidasPresupuestales: TipoDropdown[] = [];
  catalogoCuentasContables: TipoDropdown[] = [];
  catalogoClavesSat: TipoDropdown[] = [];
  estatus: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private articulosService: ArticulosService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
    if (this.config?.data) {
      this.articuloSeleccionado = this.config.data.articulo;
    }

    let respuesta = this.route.snapshot.data['respuesta'];
    this.catalogoCategorias = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_CATEGORIAS]?.datos, 'desCategoriaArticulo', 'idCategoriaArticulo');
    this.catalogoTiposArticulos = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_TIPOS_ARTICULOS]?.datos, 'desTipoArticulo', 'idTipoArticulo');
    this.catalogoTiposMateriales = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_TIPOS_MATERIALES]?.datos, 'desTipoMaterial', 'idTipoMaterial');
    this.catalogoTamanios = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_TAMANIOS]?.datos, 'desTamanio', 'idTamanio');
    this.catalogoClasificacionProductos = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_CLASIFICACION_PRODUCTOS]?.datos, 'desClasificacionProducto', 'idClasificacionProducto');
    this.catalogoPartidasPresupuestales = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_PARTIDAS_PRESUPUESTALES]?.datos, 'desPartPresupuestal', 'idPartidaPresupuestal');
    this.catalogoCuentasContables = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_CUENTAS_CONTABLES]?.datos, 'numCuentaContable', 'idCuentaContable');
    this.catalogoClavesSat = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_CLAVES_SAT]?.datos, 'desClaveSAT', 'claveSAT');
    this.estatus = true;
    this.inicializarModificarArticuloForm();
  }

  inicializarModificarArticuloForm(): void {
    this.modificarArticuloForm = this.formBuilder.group({
      id: [{ value: this.articuloSeleccionado.idArticulo, disabled: true }],
      categoria: [{ value: this.articuloSeleccionado.idCategoriaArticulo, disabled: false }, [Validators.required]],
      tipoArticulo: [{ value: this.articuloSeleccionado.idTipoArticulo, disabled: false }, []],
      tipoMaterial: [{ value: this.articuloSeleccionado.idTipoMaterial, disabled: false }, [Validators.required]],
      tamanio: [{ value: this.articuloSeleccionado.idTamanio, disabled: false }, [Validators.required]],
      clasificacionProducto: [{ value: this.articuloSeleccionado.idClasificacionProducto, disabled: false }, [Validators.required]],
      modeloArticulo: [{ value: this.articuloSeleccionado.modeloArticulo, disabled: false }, [Validators.maxLength(70), Validators.required]],
      descripcionProducto: [{ value: this.articuloSeleccionado.desArticulo, disabled: true }, [Validators.maxLength(70), Validators.required]],
      largo: [{ value: this.articuloSeleccionado.largo, disabled: false }, [Validators.maxLength(3)]],
      ancho: [{ value: this.articuloSeleccionado.ancho, disabled: false }, [Validators.maxLength(3)]],
      alto: [{ value: this.articuloSeleccionado.alto, disabled: false }, [Validators.maxLength(3)]],
      estatus: [{ value: this.articuloSeleccionado.estatus, disabled: true }],
      cuentaContable: [{ value: this.articuloSeleccionado.idCuentaPartPresupuestal, disabled: this.articuloSeleccionado.idTipoArticulo !== this.ID_ARTICULO_COMPLEMENTARIO }, []],
      partidaPresupuestal: [{ value: this.articuloSeleccionado.idPartPresupuestal, disabled: this.articuloSeleccionado.idTipoArticulo !== this.ID_ARTICULO_COMPLEMENTARIO }, []],
      productoServicios: [{ value: this.articuloSeleccionado.idProductosServicios, disabled: false }, []],
    });
    this.handleChangeTipoArticulo();
  }

  confirmarModificarArticulo(): void {
    this.modificarArticuloForm.markAllAsTouched();
    if (this.modificarArticuloForm.valid) {
      this.articuloSeleccionado = this.obtenerArticuloParaDetalle();
      this.ventanaConfirmacion = true;
    }
  }

  obtenerArticuloParaDetalle(): Articulo {
    return {
      idCategoriaArticulo: this.fma.categoria.value,
      categoriaArticulo: this.catalogoCategorias.find((e: TipoDropdown) => e.value === this.fma.categoria.value)?.label,
      idTipoArticulo: this.fma.tipoArticulo.value,
      tipoArticulo: this.catalogoTiposArticulos.find((e: TipoDropdown) => e.value === this.fma.tipoArticulo.value)?.label || '',
      idTipoMaterial: this.fma.tipoMaterial.value,
      tipoMaterial: this.catalogoTiposMateriales.find((e: TipoDropdown) => e.value === this.fma.tipoMaterial.value)?.label,
      idTamanio: this.fma.tamanio.value,
      tamanio: this.catalogoTamanios.find((e: TipoDropdown) => e.value === this.fma.tamanio.value)?.label,
      idClasificacionProducto: this.fma.clasificacionProducto.value,
      clasificacionProducto: this.catalogoClasificacionProductos.find((e: TipoDropdown) => e.value === this.fma.clasificacionProducto.value)?.label,
      modeloArticulo: this.fma.modeloArticulo.value,
      desArticulo: this.fma.descripcionProducto.value,
      largo: this.fma.largo.value,
      ancho: this.fma.ancho.value,
      alto: this.fma.alto.value,
      estatus: true,
      idPartPresupuestal: this.fma.partidaPresupuestal.value,
      partPresupuestal: this.catalogoPartidasPresupuestales.find((e: TipoDropdown) => e.value === this.fma.partidaPresupuestal.value)?.label || '',
      idCuentaPartPresupuestal: this.fma.cuentaContable.value,
      numCuentaPartPresupuestal: this.catalogoCuentasContables.find((e: TipoDropdown) => e.value === this.fma.cuentaContable.value)?.label || '',
      idProductosServicios: this.fma.productoServicios.value,
      productoServicios: this.catalogoClavesSat.find((e: TipoDropdown) => e.value === this.fma.productoServicios.value)?.label || '',
    }
  }

  cerrar(event?: ConfirmacionServicio): void {
    if (event && event.origen == "modificar") {
      this.ventanaConfirmacion = false;
      this.modificarArticulo();
      return;
    }

    if (event && event.origen == "regresar") {
      this.ventanaConfirmacion = false;
      return;
    }

    if (event && event.origen == "cancelar") {
      this.ventanaConfirmacion = false;
      return;
    }

    this.ref.close(false);
  }

  modificarArticulo() {
    this.articulosService.actualizar(this.obtenerArticuloModificar()).subscribe(
      (respuesta) => {
        if (respuesta) {
          this.ref.close(true);
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.error?.mensaje);
      }
    );
  }

  obtenerArticuloModificar() {
    return {
      idArticulo: this.fma.id.value,
      idCategoria: this.fma.categoria.value,
      idTipoArticulo: this.fma.tipoArticulo.value  || null,
      idTipoMaterial: this.fma.tipoMaterial.value,
      idTamanio: this.fma.tamanio.value,
      idClasificacionProducto: this.fma.clasificacionProducto.value,
      modeloArticulo: this.fma.modeloArticulo.value,
      descripcionArticulo: this.fma.descripcionProducto.value,
      medidas: {
        largo: this.fma.largo.value || null,
        ancho: this.fma.ancho.value || null,
        alto: this.fma.alto.value  || null,
      },
      idPartidaPresupuestal: this.fma.partidaPresupuestal.value || null,
      idCuentaContable: this.fma.cuentaContable.value || null,
      idClaveSAT: this.fma.productoServicios.value || null,
    }
  }

  handleChangeTipoArticulo() {
    if (this.fma.tipoArticulo.value === this.ID_ARTICULO_COMPLEMENTARIO) {
      this.fma.cuentaContable.enable();
      this.fma.cuentaContable.setValidators(Validators.required);
      this.fma.cuentaContable.updateValueAndValidity();
      this.fma.partidaPresupuestal.enable();
      this.fma.partidaPresupuestal.setValidators(Validators.required);
      this.fma.partidaPresupuestal.updateValueAndValidity();
      this.modificarArticuloForm.markAllAsTouched();
    } else {
      this.fma.cuentaContable.reset();
      this.fma.cuentaContable.patchValue(null);
      this.fma.cuentaContable.clearValidators();
      this.fma.cuentaContable.updateValueAndValidity();
      this.fma.cuentaContable.disable();
      this.fma.partidaPresupuestal.reset();
      this.fma.partidaPresupuestal.patchValue(null);
      this.fma.partidaPresupuestal.clearValidators();
      this.fma.partidaPresupuestal.updateValueAndValidity();
      this.fma.partidaPresupuestal.disable();
    }
  }

  get fma() {
    return this.modificarArticuloForm.controls;
  }

}
