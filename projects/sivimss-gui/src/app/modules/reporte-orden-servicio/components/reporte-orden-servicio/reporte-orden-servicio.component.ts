import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DialogService} from "primeng/dynamicdialog";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import * as moment from "moment";

@Component({
  selector: 'app-reporte-orden-servicio',
  templateUrl: './reporte-orden-servicio.component.html',
  styleUrls: ['./reporte-orden-servicio.component.scss']
})
export class ReporteOrdenServicioComponent implements OnInit {

  filtroForm!: FormGroup;

  niveles!: TipoDropdown[];
  delegaciones: TipoDropdown[] = [];
  velatorios: TipoDropdown[] = [];
  tipoODS: TipoDropdown[] = [
    {value: 1, label: 'servicio normal'},
    {value: 2, label: 'siniestros de previsión funeraria'},
    {value: 3, label: 'ambos'}
  ];

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public  dialogService: DialogService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  fechaActual = new Date();
  mostrarModalFechaMayor: boolean = false;
  fechaRango = moment().subtract(10, 'years').toDate();

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value:null,disabled:false},[Validators.required]],
      delegacion: [{value:null,disabled:false},[Validators.required]],
      velatorio: [{value:null,disabled:false},[Validators.required]],
      idTipoODS: [{value:null,disabled:false}],
      idEstatusODS: [{value:null,disabled:false}, [Validators.required]],
      fechaIni: [{value:null,disabled:false}],
      fechaFin: [{value:null,disabled:false}],

      preorden: [{value:null,disabled:false}],
      generada: [{value:null,disabled:false}],
      cancelada: [{value:null,disabled:false}],
      pagada: [{value:null,disabled:false}],
      enTransito: [{value:null,disabled:false}],
      concluida: [{value:null,disabled:false}],
      todos: [{value:null,disabled:false}],
    })
  }

  validarFechaFinal(): void {
    if (!this.ff.fechaIni?.value || !this.ff.fechaFin?.value) {
      return
    }
    if (this.ff.fechaIni.value > this.ff.fechaFin.value) {
      this.mostrarModalFechaMayor = true;
    }
  }

  cambiarDelegacion(): void {

  }

  estatusODS(estatusODS?: number):void {

  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
  }

  get ff(){
    return this.filtroForm.controls;
  }

}
