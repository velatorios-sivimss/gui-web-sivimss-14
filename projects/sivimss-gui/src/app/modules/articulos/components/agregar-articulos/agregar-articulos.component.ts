import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { Articulo, ConfirmacionServicio } from '../../models/articulos.interface';
import { ArticulosService } from '../../services/articulos.service';

@Component({
  selector: 'app-agregar-articulos',
  templateUrl: './agregar-articulos.component.html',
  styleUrls: ['./agregar-articulos.component.scss'],
  providers: [DialogService]
})
export class AgregarArticulosComponent implements OnInit {
  readonly POSICION_CATALOGO_CATEGORIAS: number = 0;
  readonly POSICION_CATALOGO_TIPOS_ARTICULOS: number = 1;
  readonly POSICION_CATALOGO_TIPOS_MATERIALES: number = 2;
  readonly POSICION_CATALOGO_TAMANIOS: number = 3;
  readonly POSICION_CATALOGO_CLASIFICACION_PRODUCTOS: number = 4;
  readonly POSICION_CATALOGO_PARTIDAS_PRESUPUESTALES: number = 5;
  readonly POSICION_CATALOGO_CUENTAS_CONTABLES: number = 6;
  readonly POSICION_CATALOGO_CLAVES_SAT: number = 7;
  readonly ID_ARTICULO_COMPLEMENTARIO: number = 2;
  readonly MSG017: string = 'El tipo de artículo que deseas ingresar ya se encuentra registrado en el sistema.';

  agregarArticuloForm!: FormGroup;
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
    public ref: DynamicDialogRef,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private articulosService: ArticulosService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
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
    this.inicializarAgregarArticuloForm();
  }

  inicializarAgregarArticuloForm(): void {
    this.agregarArticuloForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      categoria: [{ value: null, disabled: false }, [Validators.required]],
      tipoArticulo: [{ value: null, disabled: false }, []],
      tipoMaterial: [{ value: null, disabled: false }, [Validators.required]],
      tamanio: [{ value: null, disabled: false }, [Validators.required]],
      clasificacionProducto: [{ value: null, disabled: false }, [Validators.required]],
      modeloArticulo: [{ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]],
      descripcionProducto: [{ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]],
      largo: [{ value: null, disabled: false }, [Validators.maxLength(3)]],
      ancho: [{ value: null, disabled: false }, [Validators.maxLength(3)]],
      alto: [{ value: null, disabled: false }, [Validators.maxLength(3)]],
      estatus: [{ value: true, disabled: false }],
      cuentaContable: [{ value: null, disabled: true }, []],
      partidaPresupuestal: [{ value: null, disabled: true }, []],
      productoServicios: [{ value: null, disabled: false }, []],
    });
  }

  confirmarAgregarArticulo(): void {
    this.agregarArticuloForm.markAllAsTouched();
    if (this.agregarArticuloForm.valid) {
      this.articuloSeleccionado = this.obtenerArticuloParaDetalle();
      this.ventanaConfirmacion = true;
    }
  }

  obtenerArticuloParaDetalle(): Articulo {
    return {
      idCategoriaArticulo: this.faa.categoria.value,
      categoriaArticulo: this.catalogoCategorias.find((e: TipoDropdown) => e.value === this.faa.categoria.value)?.label,
      idTipoArticulo: this.faa.tipoArticulo.value,
      tipoArticulo: this.catalogoTiposArticulos.find((e: TipoDropdown) => e.value === this.faa.tipoArticulo.value)?.label || '',
      idTipoMaterial: this.faa.tipoMaterial.value,
      tipoMaterial: this.catalogoTiposMateriales.find((e: TipoDropdown) => e.value === this.faa.tipoMaterial.value)?.label,
      idTamanio: this.faa.tamanio.value,
      tamanio: this.catalogoTamanios.find((e: TipoDropdown) => e.value === this.faa.tamanio.value)?.label,
      idClasificacionProducto: this.faa.clasificacionProducto.value,
      clasificacionProducto: this.catalogoClasificacionProductos.find((e: TipoDropdown) => e.value === this.faa.clasificacionProducto.value)?.label,
      modeloArticulo: this.faa.modeloArticulo.value,
      desArticulo: this.faa.descripcionProducto.value,
      largo: this.faa.largo.value,
      ancho: this.faa.ancho.value,
      alto: this.faa.alto.value,
      estatus: true,
      idPartPresupuestal: this.faa.partidaPresupuestal.value,
      partPresupuestal: this.catalogoPartidasPresupuestales.find((e: TipoDropdown) => e.value === this.faa.partidaPresupuestal.value)?.label || '',
      idCuentaPartPresupuestal: this.faa.cuentaContable.value,
      numCuentaPartPresupuestal: this.catalogoCuentasContables.find((e: TipoDropdown) => e.value === this.faa.cuentaContable.value)?.label || '',
      idProductosServicios: this.faa.productoServicios.value,
      productoServicios: this.catalogoClavesSat.find((e: TipoDropdown) => e.value === this.faa.productoServicios.value)?.label || '',
    }
  }

  cerrar(event?: ConfirmacionServicio): void {
    if (event && event.origen == "agregar") {
      this.ventanaConfirmacion = false;
      this.agregarArticulo();
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

  agregarArticulo() {
    this.articulosService.guardar(this.obtenerArticuloAgregar()).subscribe(
      (respuesta) => {
        if (respuesta) {
          this.ref.close(true);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error.mensaje === "Registro repetido") {
          this.alertaService.mostrar(TipoAlerta.Error, this.MSG017);
        } else {
          this.alertaService.mostrar(TipoAlerta.Error, err.error.mensaje);
        }
      }
    );
  }

  obtenerArticuloAgregar() {
    return {
      idCategoria: this.faa.categoria.value,
      idTipoArticulo: this.faa.tipoArticulo.value,
      idTipoMaterial: this.faa.tipoMaterial.value,
      idTamanio: this.faa.tamanio.value,
      idClasificacionProducto: this.faa.clasificacionProducto.value,
      modeloArticulo: this.faa.modeloArticulo.value,
      descripcionArticulo: this.faa.descripcionProducto.value,
      medidas: {
        largo: this.faa.largo.value,
        ancho: this.faa.ancho.value,
        alto: this.faa.alto.value,
      },
      idPartidaPresupuestal: this.faa.partidaPresupuestal.value,
      idCuentaContable: this.faa.cuentaContable.value,
      idClaveSAT: this.faa.productoServicios.value,
    }
  }

  handleChangeTipoArticulo() {
    if (this.faa.tipoArticulo.value === this.ID_ARTICULO_COMPLEMENTARIO) {
      this.faa.cuentaContable.enable();
      this.faa.cuentaContable.setValidators(Validators.required);
      this.faa.cuentaContable.updateValueAndValidity();
      this.faa.partidaPresupuestal.enable();
      this.faa.partidaPresupuestal.setValidators(Validators.required);
      this.faa.partidaPresupuestal.updateValueAndValidity();
      this.agregarArticuloForm.markAllAsTouched();
    } else {
      this.faa.cuentaContable.reset();
      this.faa.cuentaContable.clearValidators();
      this.faa.cuentaContable.updateValueAndValidity();
      this.faa.cuentaContable.disable();
      this.faa.partidaPresupuestal.reset();
      this.faa.partidaPresupuestal.clearValidators();
      this.faa.partidaPresupuestal.updateValueAndValidity();
      this.faa.partidaPresupuestal.disable();
    }
  }

  get faa() {
    return this.agregarArticuloForm.controls;
  }

}
