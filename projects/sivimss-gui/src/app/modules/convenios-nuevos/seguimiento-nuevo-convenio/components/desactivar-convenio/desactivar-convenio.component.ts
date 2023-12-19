import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {DialogService} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {Documentos} from '../../models/documentos.interface';
import {SeguimientoNuevoConvenio} from '../../models/seguimiento-nuevo-convenio.interface';
import {ConvenioPersona} from "../../models/ConvenioPersona.interface";

export enum TipoAlerta {
  Exito = 'success',
  Info = 'info',
  Precaucion = 'warning',
  Error = 'error'
}

@Component({
  selector: 'app-desactivar-convenio',
  templateUrl: './desactivar-convenio.component.html',
  styleUrls: ['./desactivar-convenio.component.scss'],
  providers: [DialogService],
})
export class DesactivarConvenioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;
  overlayPanelPersona!: OverlayPanel;
  convenios: SeguimientoNuevoConvenio[] = [];
  convenioSeleccionado: SeguimientoNuevoConvenio = {};
  documentos: Documentos[] = [];
  documentoSeleccionado: Documentos = {};
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  infoPersona: boolean = false;

  convenioPersona!: ConvenioPersona

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.convenioPersona = this.activatedRoute.snapshot.data["respuesta"].datos[0];
    console.log(this.convenioPersona)
  }

  paginar(event: LazyLoadEvent): void {

    setTimeout(() => {
      this.documentos = [
        {
          id: 1,
          nombre: "Marta",
          apellidoMaterno: "eugenia",
          ApellidoPaterno: "eugenia",
          nombreDocumento: "Carta poder",
          numeroDocumento: 23,
          tipoDocumento: "ningunDocumento",
          linkDocumento: "LinkDocumento",
        },
        {
          id: 2,
          nombre: "Marta",
          apellidoMaterno: "eugenia",
          ApellidoPaterno: "eugenia",
          nombreDocumento: "Carta poder",
          numeroDocumento: 23,
          tipoDocumento: "ningunDocumento",
          linkDocumento: "LinkDocumento",
        },
        {
          id: 3,
          nombre: "Marta",
          apellidoMaterno: "eugenia",
          ApellidoPaterno: "eugenia",
          nombreDocumento: "Carta poder",
          numeroDocumento: 23,
          tipoDocumento: "ningunDocumento",
          linkDocumento: "LinkDocumento",
        }
      ];
      this.totalElementos = this.documentos.length;
    }, 0)
  }

  regresar() {
    this.router.navigate(['seguimiento-nuevo-convenio'], {relativeTo: this.activatedRoute});
  }

  aceptar() {
    //agregar Mensaje
    this.abrirModalModificarServicio();
  }

  abrirModalModificarServicio(): void {
    // this.creacionRef = this.dialogService.open(ModificarArticulosComponent, {
    //   header:"Modificar servicio",
    //   width:"920px",
    // })

    // this.creacionRef.onClose.subscribe((estatus:boolean) => {
    //   if(estatus){
    this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio modificado correctamente');
    // this.ref.close();
    //   }
    // })
  }

}
