import {Component, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
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

interface BeneficiarioResponse {
  curp: string,
  rfc: string,
  matricula: string,
  nss: string,
  nombre: string,
  primerApellido: string,
  segundoApellido: string,
  idSexo: string,
  fecNacimiento: string,
  idPais: string,
  lugarNac: string,
  telFijo: string,
  telCelular: string,
  correo: string,
  calle: string,
  numExt: string,
  numInt: string,
  cp: string,
  colonia: string,
  municipio: string,
  idEstado: string,
  estado: string
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

  readonly POSICION_CONVENIO: number = 0;
  readonly POSICION_BENEFICIARIO: number = 1;

  overlayPanelPersona!: OverlayPanel;
  convenios: SeguimientoNuevoConvenio[] = [];
  convenioSeleccionado: SeguimientoNuevoConvenio = {};
  documentos: Documentos[] = [];
  documentoSeleccionado: Documentos = {};
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  infoPersona: boolean = false;
  beneficiarios: BeneficiarioResponse[] = [];
  convenioPersona!: ConvenioPersona;
  tipoConvenio: string = 'PF Persona';

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
    this.convenioPersona = respuesta[this.POSICION_CONVENIO].datos;
  }

  regresar() {
    this.router.navigate(['seguimiento-nuevo-convenio'], {relativeTo: this.activatedRoute});
  }

  aceptar() {
    //agregar Mensaje

  }

}
