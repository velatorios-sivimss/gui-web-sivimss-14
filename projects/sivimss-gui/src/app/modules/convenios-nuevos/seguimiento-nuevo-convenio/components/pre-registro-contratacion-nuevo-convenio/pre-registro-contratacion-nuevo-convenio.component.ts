import { SeguimientoNuevoConvenio } from './../../models/seguimiento-nuevo-convenio.interface';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { LazyLoadEvent } from 'primeng/api';
import { Documentos } from '../../models/documentos.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pre-registro-contratacion-nuevo-convenio',
  templateUrl: './pre-registro-contratacion-nuevo-convenio.component.html',
  styleUrls: ['./pre-registro-contratacion-nuevo-convenio.component.scss'],
  providers: [DialogService]
})
export class PreRegistroContratacionNuevoConvenioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;
  overlayPanelPersona!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  infoPersona: boolean = false;


  documentos:Documentos[] = [];
  documentoSeleccionado:Documentos = {};

  preRegistroSiguiente: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }


  ngOnInit(): void {
  }

  abrir(event:MouseEvent){
    this.infoPersona = true;
    this.overlayPanel.toggle(event);
  }

  // ,articuloSeleccionado:SeguimientoNuevoConvenio
  abrirPanel(event:MouseEvent):void{
    console.log('se habre el panel');

    // this.infoPersona = false;
    // this.documentoSeleccionado = articuloSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalAgregarServicio(): void {
    // this.creacionRef = this.dialogService.open(AgregarArticulosComponent,{
    //   header:"Agregar artículo",
    //   width:"920px"
    // });
    // this.creacionRef.onClose.subscribe((estatus:boolean) => {
    //   if(estatus){
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo agregado correctamente');
    //   }
    // })
  }

  paginar(event: LazyLoadEvent): void{
    console.log(event);
    setTimeout(() =>{
      this.documentos = [
        {
          id:1,
          nombre:"Marta",
          apellidoMaterno:"eugenia",
          ApellidoPaterno:"eugenia",
          nombreDocumento:"Carta poder",
          numeroDocumento:23,
          tipoDocumento:"ningunDocumento",
          linkDocumento:"LinkDocumento",
        },
        {
          id:2,
          nombre:"Marta",
          apellidoMaterno:"eugenia",
          ApellidoPaterno:"eugenia",
          nombreDocumento:"Carta poder",
          numeroDocumento:23,
          tipoDocumento:"ningunDocumento",
          linkDocumento:"LinkDocumento",
        },
        {
          id:3,
          nombre:"Marta",
          apellidoMaterno:"eugenia",
          ApellidoPaterno:"eugenia",
          nombreDocumento:"Carta poder",
          numeroDocumento:23,
          tipoDocumento:"ningunDocumento",
          linkDocumento:"LinkDocumento",
        }
      ];
      this.totalElementos = this.documentos.length;
    },0)
  }

  abrirModificarDocumento(){

  }

  regresar(){
    this.router.navigate(['seguimiento-nuevo-convenio'], { relativeTo: this.activatedRoute });
  }
  aceptar(){
    //agregar Mensaje
    this.preRegistroSiguiente = true;
  }
  cancelar(){
    //agregar Mensaje
    this.preRegistroSiguiente = false;
  }



}
