import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {Documentos} from '../../models/documentos.interface';
import {SeguimientoNuevoConvenio} from '../../models/seguimiento-nuevo-convenio.interface';
import {ConvenioPersona} from "../../models/ConvenioPersona.interface";
import {PreRegistroPA} from "../../models/preRegistroPA.interface";
import {ConvenioEmpresa} from "../../models/convenioEmpresa.interface";
import {BeneficiarioResponse} from "../../models/beneficiarioResponse.interface";
import {Location} from "@angular/common";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";

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
  idConvenio!: number;

  constructor(
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
  ) {
    this.tipoConvenio = activatedRoute.snapshot.params.tipoConvenio ?? '';
    this.idConvenio = activatedRoute.snapshot.params.idConvenio ?? 0;
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    const preRegistro = respuesta[this.POSICION_CONVENIO].datos;
    if (!preRegistro) this.errorCargarRegistro();
    if (this.tipoConvenio === '3') {
      this.convenioPersona = preRegistro.detalleConvenioPFModel;
      this.folioConvenio = this.convenioPersona.folioConvenio;
    }
    if (this.tipoConvenio === '2') {
      this.convenioEmpresa = preRegistro.empresa;
      this.folioConvenio = this.convenioEmpresa.folioConvenio;
    }
    if (this.tipoConvenio === '1') {
      this.titularPA = preRegistro.preRegistro;
      this.folioConvenio = this.titularPA.folioConvenio;
      this.mismoSustituto = !preRegistro.sustituto;
      this.obtenerSustitutoDesdeTitular();
      this.activo = this.titularPA.activo === 1;
      this.beneficiarios = preRegistro.beneficiarios.filter((beneficiario: any) => beneficiario !== null);
      this.promotor = this.titularPA.gestionPromotor;
      this.obtenerBeneficiarios();
    }
  }

  errorCargarRegistro(): void {
    this.alertaService.mostrar(TipoAlerta.Error, 'El registro no pudo ser cargado, Intenta nuevamente mas tarde.');
    this.location.back();
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

  aceptar(): void {
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.cambiarEstatusConvenio(this.idConvenio, +this.tipoConvenio).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: () => this.manejarRespuestaExitosa(),
      error: (error: HttpErrorResponse) => this.manejarMensajeError(error)
    });
  }

  private manejarRespuestaExitosa(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, `Convenio ${this.folioConvenio} ${this.activo ? 'Desactivado' : 'Activado'}
    satisfactoriamente`);
    void this.router.navigate(['./../../../'], {relativeTo: this.activatedRoute});
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar.');
  }

}
