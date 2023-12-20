import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DialogService} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {LazyLoadEvent} from 'primeng/api';
import {Documentos} from '../../models/documentos.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {ConvenioPersona} from "../../models/ConvenioPersona.interface";

@Component({
  selector: 'app-pre-registro-contratacion-nuevo-convenio',
  templateUrl: './pre-registro-contratacion-nuevo-convenio.component.html',
  styleUrls: ['./pre-registro-contratacion-nuevo-convenio.component.scss'],
  providers: [DialogService]
})
export class PreRegistroContratacionNuevoConvenioComponent {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;
  overlayPanelPersona!: OverlayPanel;

  readonly POSICION_CONVENIO: number = 0;
  readonly POSICION_BENEFICIARIO: number = 1;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  infoPersona: boolean = false;

  beneficiarios: any[] = [];
  convenioPersona!: ConvenioPersona;

  documentos: Documentos[] = [];
  documentoSeleccionado: Documentos = {};

  preRegistroSiguiente: boolean = false;
  folio: string = '';

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
    const respuesta = this.activatedRoute.snapshot.data["respuesta"]
    this.convenioPersona = respuesta[this.POSICION_CONVENIO].datos[0];
    this.folio = this.convenioPersona.folioConvenio.toString();
    this.beneficiarios = respuesta[this.POSICION_BENEFICIARIO].datos;
  }

  abrir(event: MouseEvent) {
    this.infoPersona = true;
    this.overlayPanel.toggle(event);
  }

  // ,articuloSeleccionado:SeguimientoNuevoConvenio
  contratacionNuevoConvenioForm!: FormGroup;

  abrirPanel(event: MouseEvent): void {
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

  paginar(event: LazyLoadEvent): void {
    console.log(event);
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

  abrirModificarDocumento() {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  regresar() {
    void this.router.navigate(['seguimiento-nuevo-convenio'], {relativeTo: this.activatedRoute});
  }

  aceptar() {
    //agregar Mensaje
    this.preRegistroSiguiente = true;
  }

  cancelar() {
    //agregar Mensaje
    this.preRegistroSiguiente = false;
  }


}
