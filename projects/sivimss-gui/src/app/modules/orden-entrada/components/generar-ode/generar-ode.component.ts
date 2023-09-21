import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OrdenEntradaService } from "../../services/orden-entrada.service";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from "rxjs/operators";
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-generar-ode',
  templateUrl: './generar-ode.component.html',
  styleUrls: ['./generar-ode.component.scss'],
  providers: [DatePipe]
})
export class GenerarOdeComponent implements OnInit {

  formulario!: FormGroup;
  mostrarModalAgregarODE: boolean = false;

  categorias: TipoDropdown[] = [];
  contratos: TipoDropdown[] = [];
  modelos: TipoDropdown[] = [];
  estatus: TipoDropdown[] = [{ value: 1, label: 'Activa' }];

  idContratoSeleccionado: number = 0;
  idCategoriaSeleccionada: number = 0;
  idModeloSeleccionado: number = 0;
  descripcionModeloSeleccionado: string = "";
  maxNumeroArticulos: number = 0;
  bloquearCampoArticulos: boolean = false;

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private readonly loaderService: LoaderService,
    private datePipe: DatePipe,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    public ordenEntradaService: OrdenEntradaService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.obtenerCatalogos();
  }

  inicializarFormulario(): void {
    this.formulario = this.formBuilder.group({
      idOde: [{ value: null, disabled: true }],
      folioOde: [{ value: null, disabled: true }],
      contrato: [{ value: null, disabled: false }, [Validators.required]],
      proveedor: [{ value: null, disabled: true }],
      folioProveedor: [{ value: null, disabled: true }],
      categoria: [{ value: null, disabled: true }, [Validators.required]],
      modelo: [{ value: null, disabled: true }],
      velatorio: [{ value: null, disabled: true }],
      costo: [{ value: null, disabled: true }],
      precio: [{ value: null, disabled: true }],
      numeroArticulos: [{ value: null, disabled: true }, [Validators.required, Validators.max(this.maxNumeroArticulos)]],
      fecha: [{ value: this.datePipe.transform(new Date(), 'dd/MM/YYYY'), disabled: true }],
      estatus: [{ value: 1, disabled: true }],
    });
  }

  obtenerCatalogos(): void {
    this.loaderService.activar();
    this.ordenEntradaService.consultarContrato().pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.contratos = mapearArregloTipoDropdown(respuesta.datos, "NUM_CONTRATO", "ID_CONTRATO");
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  onContratoChange(event: any) {
    const idContratoSeleccionado = event.value;
    this.idContratoSeleccionado = idContratoSeleccionado;
    console.log('Id contrato seleccionado:', idContratoSeleccionado);
    this.loaderService.activar();
    this.ordenEntradaService.consultarContratoProveedor(idContratoSeleccionado).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200) {
          this.formulario.get("proveedor")?.setValue(respuesta.datos[0].NOM_PROVEEDOR);
          this.formulario.get("velatorio")?.setValue(respuesta.datos[0].DES_VELATORIO);
          this.formulario.get("folioProveedor")?.setValue(respuesta.datos[0].FOLIO_PROVEEDOR);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
    this.ordenEntradaService.consultarContratoCategoria(idContratoSeleccionado).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.formulario.get('categoria')?.enable();
        this.categorias = mapearArregloTipoDropdown(respuesta.datos, "DES_CATEGORIA_ARTICULO", "ID_CATEGORIA_ARTICULO");
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  onCategoriaChange(event: any) {
    const idCategoriaSeleccionada = event.value;
    this.idCategoriaSeleccionada = idCategoriaSeleccionada;
    console.log('Id categoria seleccionada: ', idCategoriaSeleccionada);
    this.loaderService.activar();
    this.ordenEntradaService.consultarContratoModelo(this.idContratoSeleccionado, idCategoriaSeleccionada).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.formulario.get('modelo')?.enable();
        this.modelos = mapearArregloTipoDropdown(respuesta.datos, "DES_MODELO_ARTICULO", "ID_ARTICULO");
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  onModeloChange(event: any) {
    this.bloquearCampoArticulos = false;
    const idModeloSeleccionado = event.value;
    this.idModeloSeleccionado = idModeloSeleccionado;
    this.descripcionModeloSeleccionado = event.originalEvent.currentTarget.ariaLabel
    console.log('Id modelo seleccionado: ', idModeloSeleccionado);
    this.loaderService.activar();
    this.ordenEntradaService.consultarContratoCosto(this.idContratoSeleccionado, this.idCategoriaSeleccionada, idModeloSeleccionado).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200) {
          this.formulario.get("costo")?.setValue(respuesta.datos[0].MON_COSTO_UNITARIO);
          this.formulario.get("precio")?.setValue(respuesta.datos[0].MON_PRECIO);
          this.maxNumeroArticulos = respuesta.datos[0].NUM_CANTIDAD_DISPONIBLE;
          if (this.maxNumeroArticulos <= 0) {
            this.formulario.get("numeroArticulos")?.setValue(0);
            this.bloquearCampoArticulos = true;
          } else {
            this.formulario.get('numeroArticulos')?.enable();
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  generarODE(): void {
    const ordenEntrada = this.mapearOrdenEntrada();
    this.ordenEntradaService.guardarOrdenEntrada(ordenEntrada).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200) {
          this.alertaService.mostrar(TipoAlerta.Exito, "Orden de entrada agregada correctamente");
          void this.router.navigate(["../"], {relativeTo: this.activatedRoute});
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  mapearOrdenEntrada(): any {
    return {
      idContrato: this.idContratoSeleccionado,
      idArticulo: this.idModeloSeleccionado,
      numArticulo: this.formulario.get("numeroArticulos")?.value ? this.formulario.get("numeroArticulos")?.value : 0,
      folioProveedor: this.formulario.get("folioProveedor")?.value,
      desModeloArticulo: this.descripcionModeloSeleccionado,
      fecIngreso: this.datePipe.transform(new Date(), 'YYYY-MM-dd')
    }
  }

  get f() {
    return this.formulario.controls;
  }

}
