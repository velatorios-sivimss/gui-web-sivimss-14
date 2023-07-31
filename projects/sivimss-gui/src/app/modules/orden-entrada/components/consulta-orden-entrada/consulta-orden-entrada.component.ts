import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import * as moment from "moment/moment";

import {LazyLoadEvent} from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";

import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {OrdenEntradaService} from "../../services/orden-entrada.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {PaginadoConsultaOrdenEntrada} from "../../models/paginado-consulta-orden-entrada.interface";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {DialogService} from "primeng/dynamicdialog";
import {GenerarOdeComponent} from "../generar-ode/generar-ode.component";

@Component({
  selector: 'app-consulta-orden-entrada',
  templateUrl: './consulta-orden-entrada.component.html',
  styleUrls: ['./consulta-orden-entrada.component.scss']
})
export class ConsultaOrdenEntradaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  formulario!: FormGroup;

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
    public ordenEntradaService: OrdenEntradaService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
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

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1))
    }
  }

  abrirPanel(event: MouseEvent, orden: PaginadoConsultaOrdenEntrada): void{
    this.ordenEntradaSeleccionada = orden;
    this.overlayPanel.toggle(event);
  }

  validarFechaFinal(): void {
    if (!this.f.fechaInicial?.value || !this.f.fechaFinal?.value) {
      return
    }
    if (this.f.fechaInicial.value > this.f.fechaFinal.value) {
      this.mostrarModalFechaMayor = true;
    }
  }

  abrirModalCancelarODE(): void {

  }

  abrirModalCerrarODE(): void {

  }

  abrirModalGenerarODE(): void {
    const ref = this.dialogService.open(GenerarOdeComponent, {
      header: 'Orden de entrada',
      style: { maxWidth: '876px', width: '100%' },
      data:{}
    })
  }

  get f() {
    return this.formulario.controls;
  }

}
