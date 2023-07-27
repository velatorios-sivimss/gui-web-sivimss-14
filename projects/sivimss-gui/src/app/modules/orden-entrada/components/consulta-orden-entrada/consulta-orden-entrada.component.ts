import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import * as moment from "moment/moment";

import {LazyLoadEvent} from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";
import {DialogService} from "primeng/dynamicdialog";

import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {OrdenEntradaService} from "../../services/orden-entrada.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {Paginado} from "../../models/paginado.interface";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";

@Component({
  selector: 'app-consulta-orden-entrada',
  templateUrl: './consulta-orden-entrada.component.html',
  styleUrls: ['./consulta-orden-entrada.component.scss']
})
export class ConsultaOrdenEntradaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  formulario!: FormGroup;

  ordenesEntrada: Paginado[] = [];
  ordenEntradaSeleccionada!: Paginado;

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
        fechaFinal: [{value:null, disabled: false}, [Validators.required]],
    })
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1))
    }
  }

  abrirPanel(event: MouseEvent, orden: Paginado): void{
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

  get f() {
    return this.formulario.controls;
  }

}
