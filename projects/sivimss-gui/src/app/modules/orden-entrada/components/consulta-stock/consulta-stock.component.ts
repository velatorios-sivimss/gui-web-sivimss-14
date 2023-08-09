import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PaginadoConsultaStock} from "../../models/paginado-consulta-stock.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {OrdenEntradaService} from "../../services/orden-entrada.service";
import {LazyLoadEvent} from "primeng/api";
import {PaginadoConsultaOrdenEntrada} from "../../models/paginado-consulta-orden-entrada.interface";
import {OverlayPanel} from "primeng/overlaypanel";

@Component({
  selector: 'app-consulta-stock',
  templateUrl: './consulta-stock.component.html',
  styleUrls: ['./consulta-stock.component.scss']
})
export class ConsultaStockComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  formulario!: FormGroup;

  stock: PaginadoConsultaStock[] = [
    {
      fechaOde: "12/08/2021",
      folioOde: "DOC-000001",
      folioArticulo: "DOC-000001",
      articulo: "urna",
      estatus: true
    },
    {
      fechaOde: "12/08/2021",
      folioOde: "DOC-000002",
      folioArticulo: "DOC-000002",
      articulo: "urna",
      estatus: false
    }
  ];
  stockSeleccionado!: PaginadoConsultaStock;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  asignacion: TipoDropdown[] = [
    {
      value: 1,
      label: "consignado"
    },
    {
      value: 2,
      label: "donado"
    },
    {
      value: 3,
      label: "ambos"
    },
  ];

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
         categoria: [{value:null, disabled: false}],
        asignacion: [{value:null, disabled: false}]
    });
  }

  abrirPanel(event: MouseEvent, stock: PaginadoConsultaStock): void{
    this.stockSeleccionado = stock;
    this.overlayPanel.toggle(event);
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1))
    }
  }

  abrirModalDevolver(): void {

  }

  get f() {
    return this.formulario.controls;
  }

}
