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

interface BeneficiarioResponse {
  idBeneficiario: number,
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

interface ConvenioEmpresa {
  nombre: string,
  razonSocial: string,
  rfc: string,
  pais: string,
  idPais: number,
  cp: string,
  colonia: string,
  estado: string,
  municipio: string,
  calle: string,
  numInterior: string,
  numExterior: string
  telefono: string,
  correo: string,
  idConvenio: number,
  idEmpresa: number,
  idPromotor: number,
  folioConvenio: string
}

interface PreRegistroPA {
  "idPersona": number,
  "idContratante": number,
  "idDomicilio": number,
  "folioConvenio": string,
  "curp": string,
  "rfc": string,
  "matricula": string,
  "nss": string,
  "nombre": string,
  "primerApellido": string,
  "segundoApellido": string,
  "idSexo": number,
  "fecNacimiento": string,
  "pais": string,
  "idPais": number,
  "lugarNac": string,
  "idLugarNac": number,
  "telCelular": string,
  "telFijo": string,
  "correo": string,
  "calle": string,
  "numExt": string,
  "numInt": string,
  "cp": string,
  "colonia": string,
  "municipio": string,
  "estado": string,
  "idPaquete": number,
  "numPagos": string,
  "nomPaquete": string,
  "titularSust": string,
  "idTitularSust": number,
  "beneficiario1": number,
  "beneficiario2": number,
  "gestionPromotor": boolean
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
  beneficiario1!: BeneficiarioResponse;
  beneficiario2!: BeneficiarioResponse;
  convenioPersona!: ConvenioPersona;
  convenioEmpresa!: ConvenioEmpresa;
  titularPA!: PreRegistroPA;
  tipoConvenio: string = '';
  promotor: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.tipoConvenio = activatedRoute.snapshot.params.tipoConvenio ?? '';
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"]
    if (this.tipoConvenio === '3') {
      this.convenioPersona = respuesta[this.POSICION_CONVENIO].datos;
    }
    if (this.tipoConvenio === '2') {
      this.convenioEmpresa = respuesta[this.POSICION_CONVENIO].datos.empresa;
    }
    this.titularPA = respuesta[this.POSICION_CONVENIO].datos.preRegistro;
    this.beneficiarios = respuesta[this.POSICION_CONVENIO].datos.beneficiarios.filter((beneficiario: any) => beneficiario !== null);
    this.promotor = this.titularPA.gestionPromotor;
    this.obtenerBeneficiarios()
  }

  regresar() {
    this.router.navigate(['seguimiento-nuevo-convenio'], {relativeTo: this.activatedRoute});
  }

  obtenerBeneficiarios(): void {
    const idBeneficiario1: number = this.titularPA.beneficiario1;
    const idBeneficiario2: number = this.titularPA.beneficiario2;
    if (idBeneficiario1 !== 0) {
      this.beneficiario1 = this.beneficiarios.find(beneficiario => beneficiario.idBeneficiario === idBeneficiario1)!;
    }
    if (idBeneficiario2 !== 0) {
      this.beneficiario2 = this.beneficiarios.find(beneficiario => beneficiario.idBeneficiario === idBeneficiario2)!;
    }
  }

  aceptar() {
    //agregar Mensaje

  }

}
