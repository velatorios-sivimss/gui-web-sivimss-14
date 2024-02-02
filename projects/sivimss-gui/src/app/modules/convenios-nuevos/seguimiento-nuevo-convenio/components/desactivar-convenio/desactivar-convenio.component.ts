import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {Documentos} from '../../models/documentos.interface';
import {SeguimientoNuevoConvenio} from '../../models/seguimiento-nuevo-convenio.interface';
import {ConvenioPersona} from "../../models/ConvenioPersona.interface";
import {PreRegistroPA} from "../../models/preRegistroPA.interface";
import {ConvenioEmpresa} from "../../models/convenioEmpresa.interface";
import {BeneficiarioResponse} from "../../models/beneficiarioResponse.interface";
import {Location} from "@angular/common";

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
  beneficiarios: BeneficiarioResponse[] = [];
  solicitantes: any[] = [];
  beneficiario1!: BeneficiarioResponse;
  beneficiario2!: BeneficiarioResponse;
  sustituto!: BeneficiarioResponse;
  convenioPersona!: ConvenioPersona;
  convenioEmpresa!: ConvenioEmpresa;
  titularPA!: PreRegistroPA;
  tipoConvenio: string = '';
  promotor: boolean = false;
  mismoSustituto: boolean = false;
  activo: boolean = false;
  folioConvenio: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {
    this.tipoConvenio = activatedRoute.snapshot.params.tipoConvenio ?? '';
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    if (!respuesta[this.POSICION_CONVENIO].datos) this.errorCargarRegistro();
    if (this.tipoConvenio === '3') {
      this.convenioPersona = respuesta[this.POSICION_CONVENIO].datos.detalleConvenioPFModel;
      this.folioConvenio = this.convenioPersona.folioConvenio;
    }
    if (this.tipoConvenio === '2') {
      this.convenioEmpresa = respuesta[this.POSICION_CONVENIO].datos.empresa;
      this.folioConvenio = this.convenioEmpresa.folioConvenio;
    }
    if (this.tipoConvenio === '1') {
      this.titularPA = respuesta[this.POSICION_CONVENIO].datos.preRegistro;
      this.folioConvenio = this.titularPA.folioConvenio;
      this.mismoSustituto = !respuesta[this.POSICION_CONVENIO].datos.sustituto;
      this.obtenerSustitutoDesdeTitular();
      this.activo = this.titularPA.activo === 1;
      this.beneficiarios = respuesta[this.POSICION_CONVENIO].datos.beneficiarios.filter((beneficiario: any) => beneficiario !== null);
      this.promotor = this.titularPA.gestionPromotor;
      this.obtenerBeneficiarios();
    }
  }

  errorCargarRegistro(): void {
    this.alertaService.mostrar(TipoAlerta.Error, 'El registro no pudo ser cargado, Intenta nuevamente mas tarde.');
    this.location.back();
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

  obtenerSustitutoDesdeTitular(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"][this.POSICION_CONVENIO].datos
    this.sustituto = !this.mismoSustituto ? respuesta.sustituto : this.titularPA as unknown as BeneficiarioResponse;
  }

  aceptar() {
    //agregar Mensaje

  }

}
