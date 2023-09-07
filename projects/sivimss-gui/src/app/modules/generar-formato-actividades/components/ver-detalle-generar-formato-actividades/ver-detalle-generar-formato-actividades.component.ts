import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { GenerarFormatoActividades, GenerarFormatoActividadesBusqueda } from '../../models/generar-formato-actividades.interface';
import { UsuarioService } from '../../../usuarios/services/usuario.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import * as moment from 'moment';
import { GenerarFormatoActividadesService } from '../../services/generar-formato-actividades.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  selector: 'app-ver-detalle-generar-formato-actividades',
  templateUrl: './ver-detalle-generar-formato-actividades.component.html',
  styleUrls: ['./ver-detalle-generar-formato-actividades.component.scss']
})
export class VerDetalleGenerarFormatoActividadesComponent implements OnInit {
  readonly POSICION_CATALOGO_VELATORIO: number = 2;
  readonly POSICION_CATALOGOS_ENTIDADES: number = 3;

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
  public clonedProducts: { [s: string]: GenerarFormatoActividadesBusqueda } = {};
  public actividades: GenerarFormatoActividadesBusqueda[] = [
    {
      fecha: 'q',
      horarioInicial: 'q',
      horarioFinal: 'q',
      personalVelatorio: 'q',
      puesto: 'q',
      numPlaticas: 'q',
      unidadImss: 'q',
      empresa: 'q',
      actividadRealizada: 'q',
    }
  ];

  public entidadFederativa: TipoDropdown[] = [];
  public tipoArticulos: any[] = [];
  public tituloEliminar: string = '';
  public intentoPorGuardar: boolean = false;
  public agregarGenerarFormatoActividadesForm!: FormGroup;
  public mostrarModalPromotorDuplicado: boolean = false;
  public fechaActual: Date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private generarFormatoActividadesService: GenerarFormatoActividadesService,
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);
    this.inicializarAgregarActividadesForm();
    this.cargarCatalogo();
  }

  inicializarAgregarActividadesForm() {
    this.agregarGenerarFormatoActividadesForm = this.formBuilder.group({
      folio: new FormControl({ value: null, disabled: true }, []),
      velatorio: new FormControl({ value: null, disabled: true }, []),
      fechaInicio: new FormControl({ value: null, disabled: false }, [Validators.required]),
      fechaFinal: new FormControl({ value: null, disabled: false }, [Validators.required]),
    });
  }

  cargarCatalogo(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_VELATORIO].datos, "velatorio", "idVelatorio");
    this.entidadFederativa = respuesta[this.POSICION_CATALOGOS_ENTIDADES];
  }

  agregarRegistro() {

  }

  paginar(event?: LazyLoadEvent): void {
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
    // this.buscarPorFiltros(false);
  }

  cerrarDialogo() {
    this.ref.close();
  }

  confirmarGuardar() {
    this.agregarGenerarFormatoActividadesForm.markAllAsTouched();
    if (this.agregarGenerarFormatoActividadesForm.invalid) return;
    this.mostrarModalConfirmacion = true;
    this.mensajeModal = `¿Estás seguro de agregar este nuevo registro? Promotor`;
  }

  guardarPromotor() {
    this.loaderService.activar();
    this.generarFormatoActividadesService.guardar(this.datosGuardar()).pipe(
      finalize(() => {
        this.mostrarModalConfirmacion = false;
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200 && !respuesta.error) {
          this.alertaService.mostrar(TipoAlerta.Exito, `Agregado correctamente. Promotor`);
          this.ref.close({ estatus: true });
        } else {
          this.mensajeModal = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje);
          this.mostrarModalPromotorDuplicado = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  datosGuardar() {
    return {
      curp: this.apf.curp.value,
      nomPromotor: this.apf.nombre.value,
      aPaterno: this.apf.primerApellido.value,
      aMaterno: this.apf.segundoApellido.value,
      fecNac: moment(this.apf.fechaNacimiento.value).format('DD/MM/YYYY'),
      idLugarNac: this.apf.entidadFederativa.value,
      correo: this.apf.correo.value,
      numEmpleado: this.apf.numEmpleado.value,
      puesto: this.apf.puesto.value,
      categoria: this.apf.categoria.value,
      fecIngreso: moment(this.apf.fechaIngreso.value).format('DD/MM/YYYY'),
      sueldoBase: +this.apf.sueldoBase.value,
      idVelatorio: this.apf.velatorio.value,
    }
  }

  onRowEditInit(generarFormatoActividadesBusqueda: GenerarFormatoActividadesBusqueda) {
    this.clonedProducts[0] = { ...generarFormatoActividadesBusqueda };
  }

  onRowEditSave(generarFormatoActividades: GenerarFormatoActividades) {
    // if (product.price > 0) {
    //   delete this.clonedProducts[product.id as string];
    //   this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product is updated' });
    // } else {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Price' });
    // }
  }

  onRowEditCancel(generarFormatoActividades: GenerarFormatoActividades, index: number) {
    // this.products[index] = this.clonedProducts[product.id as string];
    // delete this.clonedProducts[product.id as string];
  }

  get apf() {
    return this.agregarGenerarFormatoActividadesForm.controls;
  }
}
