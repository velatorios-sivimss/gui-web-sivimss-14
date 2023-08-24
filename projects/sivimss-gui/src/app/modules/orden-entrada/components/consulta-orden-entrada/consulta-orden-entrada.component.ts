import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import * as moment from "moment/moment";

import {LazyLoadEvent} from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";

import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OrdenEntradaService} from "../../services/orden-entrada.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {PaginadoConsultaOrdenEntrada} from "../../models/paginado-consulta-orden-entrada.interface";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {DialogService} from "primeng/dynamicdialog";
import {ActivatedRoute, Router} from "@angular/router";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {CatalogoFolioODE} from "../../models/catalogos.interface";

@Component({
  selector: 'app-consulta-orden-entrada',
  templateUrl: './consulta-orden-entrada.component.html',
  styleUrls: ['./consulta-orden-entrada.component.scss']
})
export class ConsultaOrdenEntradaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_DELEGACIONES: number = 0;
  readonly POSICION_NIVELES: number = 1;
  readonly POSICION_CONTRATOS: number = 2

  formulario!: FormGroup;

  folioCatalogosODE!:CatalogoFolioODE[];
  catalogoFolios!: TipoDropdown[];

  ordenesEntrada: PaginadoConsultaOrdenEntrada[] = [
    {
      idOde:1,
      folioOde: "DOC-000001",
      contrato: "Anual proveedores de mantenimiento",
      proveedor: "Logística sanitaria del norte S.A. de C.V.",
      folioProveedor: "DOC-000001",
      categoria: "categoría",
      modelo: "madera",
      velatorio: "DOCTORES",
      costo: 15000,
      precio: 15000,
      numeroArticulos: 10,
      fechaOde: "12/08/2021",
      estatus: 1
    },
    {
      idOde:2,
      folioOde: "DOC-000002",
      contrato: "Anual proveedores de mantenimiento",
      proveedor: "Logística sanitaria del norte S.A. de C.V.",
      folioProveedor: "DOC-000002",
      categoria: "categoría",
      modelo: "madera",
      velatorio: "DOCTORES",
      costo: 15000,
      precio: 15000,
      numeroArticulos: 10,
      fechaOde: "12/08/2021",
      estatus: 2
    },
    {
      idOde:3,
      folioOde: "DOC-000003",
      contrato: "Anual proveedores de mantenimiento",
      proveedor: "Logística sanitaria del norte S.A. de C.V.",
      folioProveedor: "DOC-000003",
      categoria: "categoría",
      modelo: "madera",
      velatorio: "DOCTORES",
      costo: 15000,
      precio: 15000,
      numeroArticulos: 10,
      fechaOde: "12/08/2021",
      estatus: 3
    }
  ];
  ordenEntradaSeleccionada!: PaginadoConsultaOrdenEntrada;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  fechaActual = new Date();
  fechaRango = moment().subtract(10, 'years').toDate();
  mostrarModalFechaMayor: boolean = false;

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA
  totalElementos: number = 0

  constructor(
    private alertaService: AlertaService,
    private readonly dialogService: DialogService,
    private formBuilder: FormBuilder,
    public ordenEntradaService: OrdenEntradaService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.inicializarCatalogos();
  }

  inicializarFormulario(): void {

    this.formulario= this.formBuilder.group({
             nivel: [{value:null, disabled: false}],
        delegacion: [{value:null, disabled: false}],
         velatorio: [{value:null, disabled: false}],
      ordenEntrada: [{value:null, disabled: false}],
         proveedor: [{value:null, disabled: false}],
      fechaInicial: [{value:null, disabled: false}, [Validators.required]],
        fechaFinal: [{value:null, disabled: false}, [Validators.required]]
    });
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    this.folioCatalogosODE = respuesta[this.POSICION_CONTRATOS].datos
    // POSICION_CONTRATOS
  }

  filtrarOrdenes(): void {
    let query = this.obtenerFolioContratos()
    let filtered: TipoDropdown[] = [];

    if(query?.length < 3)return;
    for (let i = 0; i < (this.folioCatalogosODE as CatalogoFolioODE[]).length; i++) {
      let folio = (this.folioCatalogosODE as any[])[i];
      if (folio.NUM_CONTRATO.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push({
          label: folio.NUM_CONTRATO,
          value: folio.ID_CONTRATO
        })
      }
    }
    this.catalogoFolios = filtered;

  }

  obtenerFolioContratos(): string {
    let query = this.f.ordenEntrada?.value || '';
    if (typeof this.f.ordenEntrada?.value === 'object') {
      query = this.f.ordenEntrada?.value?.label;
    }
    return query?.toLowerCase();
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1))
    }
  }

  abrirPanel(event: MouseEvent, orden: PaginadoConsultaOrdenEntrada): void{
    this.ordenEntradaSeleccionada = orden;
    this.overlayPanel.toggle(event);
  }

  consultarVelatorios(): void {

      this.loaderService.activar();
    this.ordenEntradaService.obtenerCatalogoVelatoriosPorDelegacion(this.f.delegacion.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos,"nomVelatorio","idVelatorio");
      },
      error:(error:HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error,
          this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  validarFechaFinal(): void {
    if (!this.f.fechaInicial?.value || !this.f.fechaFinal?.value) {
      return
    }
    if (this.f.fechaInicial.value > this.f.fechaFinal.value) {
      this.mostrarModalFechaMayor = true;
    }
  }

  consultarProveedores(): void {
    this.loaderService.activar();
    this.ordenEntradaService.consultarPromotores(this.f.ordenEntrada.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    })
  }

  abrirModalCancelarODE(): void {

  }

  abrirModalCerrarODE(): void {

  }

  abrirModalGenerarODE(): void {
    this.router.navigate(["./orden-entrada/generar-ode"])
    // const ref = this.dialogService.open(GenerarOdeComponent, {
    //   header: 'Orden de entrada',
    //   style: { maxWidth: '876px', width: '100%' },
    //   data:{}
    // })
  }

  get f() {
    return this.formulario.controls;
  }

}
