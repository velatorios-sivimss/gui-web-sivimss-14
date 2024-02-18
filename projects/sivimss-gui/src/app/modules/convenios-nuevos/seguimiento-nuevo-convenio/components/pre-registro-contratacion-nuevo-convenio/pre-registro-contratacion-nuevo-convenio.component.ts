import {Component} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DialogService} from 'primeng/dynamicdialog';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {DIEZ_ELEMENTOS_POR_PAGINA, PATRON_CORREO} from 'projects/sivimss-gui/src/app/utils/constantes';
import {ActivatedRoute, Router} from '@angular/router';
import {ConvenioPersona} from "../../models/ConvenioPersona.interface";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {diferenciaUTC, mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {ConvenioEmpresa} from "../../models/convenioEmpresa.interface";
import {BeneficiarioResponse} from "../../models/beneficiarioResponse.interface";
import {PreRegistroPA} from "../../models/preRegistroPA.interface";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {delay, finalize} from "rxjs/operators";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {
  SolicitudActualizarBeneficiario,
  SolicitudActualizarPersona,
  SolicitudActualizarSolicitante
} from "../../models/solicitudActualizarPersona.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";

@Component({
  selector: 'app-pre-registro-contratacion-nuevo-convenio',
  templateUrl: './pre-registro-contratacion-nuevo-convenio.component.html',
  styleUrls: ['./pre-registro-contratacion-nuevo-convenio.component.scss'],
  providers: [DialogService]
})
export class PreRegistroContratacionNuevoConvenioComponent {

  contratacionNuevoConvenioForm!: FormGroup;

  readonly POSICION_CONVENIO: number = 0;
  readonly POSICION_PAQUETES: number = 1;
  readonly POSICION_PROMOTORES: number = 2;
  readonly POSICION_BENEFICIARIO: number = 3;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  convenioPersona!: ConvenioPersona;
  convenioEmpresa!: ConvenioEmpresa;
  paquetes: TipoDropdown[] = [];
  promotores: TipoDropdown[] = [];

  solicitantes: PreRegistroPA[] = [];
  beneficiariosEmpresa: BeneficiarioResponse[] = [];

  preRegistroSiguiente: boolean = false;
  folio: string = '';
  nombresBeneficiario: string[] = [];
  nombresSolicitantes: string[] = [];
  tipoConvenio: string = '';
  idConvenio: string = '';
  beneficiariosPF: BeneficiarioResponse[] = [];
  beneficiariosPA: BeneficiarioResponse[] = [];
  beneficiario1!: BeneficiarioResponse;
  beneficiario2!: BeneficiarioResponse;
  sustituto!: BeneficiarioResponse;
  titularPA!: PreRegistroPA;
  mismoSustituto: boolean = false;
  promotor: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private cargadorService: LoaderService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seguimientoConvenioService: SeguimientoNuevoConvenioService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
    this.tipoConvenio = this.activatedRoute.snapshot.params.tipoConvenio ?? '';
    this.idConvenio = this.activatedRoute.snapshot.params.idConvenio ?? '';
    this.cargarCatalogos();
    this.inicializarTipoFormulario();
  }

  errorCargarRegistro(): void {
    this.alertaService.mostrar(TipoAlerta.Error, 'El registro no pudo ser cargado, Intenta nuevamente mas tarde.');
    this.regresar();
  }

  ngOnInit(): void {
  }

  cargarCatalogos(): void {
    const registro = this.activatedRoute.snapshot.data["respuesta"];
    const preRegistro = registro[this.POSICION_CONVENIO].datos;
    if (!preRegistro || (!preRegistro["detalleConvenioPFModel"] && this.tipoConvenio === '3') ||
      (!preRegistro.empresa && this.tipoConvenio === '2') ||
      (preRegistro.empresa?.idConvenio === 0 && this.tipoConvenio === '2') ||
      (this.tipoConvenio === '1' && !preRegistro["preRegistro"])) {
      this.errorCargarRegistro();
      return;
    }
    this.cargarCatalogosGenerales();
    if (this.tipoConvenio === '3') {
      this.convenioPersona = preRegistro["detalleConvenioPFModel"];
      this.folio = this.convenioPersona.folioConvenio;
      this.beneficiariosPF = preRegistro.beneficiarios;
    }
    if (this.tipoConvenio === '2') {
      const registroBeneficiarios = registro[this.POSICION_BENEFICIARIO].datos;
      this.convenioEmpresa = registro[this.POSICION_CONVENIO].datos.empresa;
      this.folio = this.convenioEmpresa.folioConvenio;
      this.solicitantes = preRegistro.solicitantes;
      this.beneficiariosEmpresa = registroBeneficiarios.beneficiarios;
    }
    if (this.tipoConvenio === '1') {
      this.titularPA = registro[this.POSICION_CONVENIO].datos.preRegistro;
      this.mismoSustituto = !registro[this.POSICION_CONVENIO].datos.sustituto;
      const promotores = registro[this.POSICION_PROMOTORES].datos;
      this.promotores = mapearArregloTipoDropdown(promotores, 'nombrePromotor', 'idPromotor');
      this.obtenerSustitutoDesdeTitular();
      this.beneficiariosPA = registro[this.POSICION_CONVENIO].datos.beneficiarios.filter((beneficiario: any) => beneficiario !== null);
      this.folio = this.titularPA.folioConvenio;
      this.promotor = this.titularPA.gestionPromotor;
      this.obtenerBeneficiarios()
    }
  }

  obtenerSustitutoDesdeTitular(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"][this.POSICION_CONVENIO].datos
    this.sustituto = !this.mismoSustituto ? respuesta.sustituto : this.titularPA as unknown as BeneficiarioResponse;
  }

  cargarCatalogosGenerales(): void {
    const POSICION_PAQUETES: number = 1;
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    const paquetes = respuesta[POSICION_PAQUETES].datos;
    this.paquetes = mapearArregloTipoDropdown(paquetes, 'nombrePaquete', 'idPaquete');
  }

  obtenerBeneficiarios(): void {
    const idBeneficiario1: number = this.titularPA.beneficiario1;
    const idBeneficiario2: number = this.titularPA.beneficiario2;
    if (idBeneficiario1 !== 0) {
      this.beneficiario1 = this.beneficiariosPA.find(beneficiario => beneficiario.idBeneficiario === idBeneficiario1)!;
    }
    if (idBeneficiario2 !== 0) {
      this.beneficiario2 = this.beneficiariosPA.find(beneficiario => beneficiario.idBeneficiario === idBeneficiario2)!;
    }
  }

  inicializarTipoFormulario(): void {
    if (!['1', '2', '3'].includes(this.tipoConvenio)) return;
    if (this.tipoConvenio === '3') {
      this.inicializarFormulario();
      return;
    }
    if (this.tipoConvenio === '2') {
      this.inicializarFormularioEmpresa();
      return;
    }
    this.inicializarFormularioPA();
  }

  inicializarFormulario(): void {
    const nacionalidad: number = this.convenioPersona?.idPais === 119 ? 1 : 2;
    this.contratacionNuevoConvenioForm = this.formBuilder.group({
      persona: this.formBuilder.group({
        matricula: [{value: this.convenioPersona?.matricula, disabled: false}],
        rfc: [{value: this.convenioPersona?.rfc, disabled: false}, [Validators.required]],
        curp: [{value: this.convenioPersona?.curp, disabled: false}, [Validators.required]],
        nombres: [{value: this.convenioPersona?.nombre, disabled: false}, [Validators.required]],
        primerApellido: [{value: this.convenioPersona?.primerApellido, disabled: false}, [Validators.required]],
        segundoApellido: [{value: this.convenioPersona?.segundoApellido, disabled: false}, [Validators.required]],
        calle: [{value: this.convenioPersona?.calle, disabled: false}, [Validators.required]],
        numeroExterior: [{value: this.convenioPersona?.numExt, disabled: false}, [Validators.required]],
        numeroInterior: [{value: this.convenioPersona?.numInt, disabled: false}],
        codigoPostal: [{value: this.convenioPersona?.cp, disabled: false}, [Validators.required]],
        colonia: [{value: this.convenioPersona?.colonia, disabled: false}, [Validators.required]],
        municipio: [{value: this.convenioPersona?.municipio, disabled: false}, [Validators.required]],
        estado: [{value: this.convenioPersona?.estado, disabled: false}, [Validators.required]],
        nacionalidad: [{value: nacionalidad, disabled: false}, [Validators.required]],
        paisNacimiento: [{value: this.convenioPersona?.idPais, disabled: false}, [Validators.required]],
        lugarNacimiento: [{value: this.convenioPersona?.idLugarNac, disabled: false}, [Validators.required]],
        correoElectronico: [{value: this.convenioPersona?.correo, disabled: false}, [Validators.required]],
        telefono: [{value: this.convenioPersona?.telCelular, disabled: false}, [Validators.required]],
        enfermedadPreExistente: [{value: +this.convenioPersona?.enfermedadPre, disabled: false}, [Validators.required]],
      }),
      tipoPaquete: [{value: this.convenioPersona?.idPaquete, disabled: false}, [Validators.required]],
      beneficiarios: this.formBuilder.array([])
    });
    if (!this.convenioPersona) {
      this.errorCargarRegistro();
      return;
    }
    this.cargarBeneficiarios();
  }

  inicializarFormularioEmpresa(): void {
    this.contratacionNuevoConvenioForm = this.formBuilder.group({
      empresa: this.formBuilder.group({
        nombre: [{value: this.convenioEmpresa.nombre, disabled: false}, [Validators.required]],
        razonSocial: [{value: this.convenioEmpresa.razonSocial, disabled: false}, [Validators.required]],
        rfc: [{value: this.convenioEmpresa.rfc, disabled: false}, [Validators.required]],
        pais: [{value: this.convenioEmpresa.idPais, disabled: false}, [Validators.required]],
        cp: [{value: this.convenioEmpresa.cp, disabled: false}, [Validators.required]],
        colonia: [{value: this.convenioEmpresa.colonia, disabled: false}, [Validators.required]],
        estado: [{value: this.convenioEmpresa.estado, disabled: false}, [Validators.required]],
        municipio: [{value: this.convenioEmpresa.municipio, disabled: false}, [Validators.required]],
        calle: [{value: this.convenioEmpresa.calle, disabled: false}, [Validators.required]],
        numeroExterior: [{value: this.convenioEmpresa.numExterior, disabled: false}, [Validators.required]],
        numeroInterior: [{value: this.convenioEmpresa.numInterior, disabled: false}, [Validators.required]],
        telefono: [{value: null, disabled: false}, [Validators.required]],
        correo: [{value: this.convenioEmpresa.correo, disabled: false},
          [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      }),
      solicitantes: this.formBuilder.array([])
    });
    this.cargarSolicitantes();
  }

  calcularFechaNacimiento(fecha: string): Date | null {
    if (!fecha) return null;
    return new Date(diferenciaUTC(this.titularPA.fecNacimiento));
  }

  inicializarFormularioPA(): void {
    const nacionalidad: number = this.titularPA.idPais === '119' ? 1 : 2;
    const nacionalidadSustituto: number = this.sustituto.idPais === '119' ? 1 : 2;
    const sexo: number = this.titularPA.otroSexo === '' ? this.titularPA.idSexo : 3;
    const sexoSustituto: number = this.sustituto.otroSexo === '' ? +this.sustituto.idSexo : 3;
    const fecNacimientoSust = this.calcularFechaNacimiento(this.sustituto?.fecNacimiento);
    this.contratacionNuevoConvenioForm = this.formBuilder.group({
      titular: this.formBuilder.group({
        curp: [{value: this.titularPA.curp, disabled: false}, [Validators.required]],
        rfc: [{value: this.titularPA.rfc, disabled: false}, [Validators.required]],
        matricula: [{value: this.titularPA.matricula, disabled: false}],
        nss: [{value: this.titularPA.nss, disabled: false}],
        nombre: [{value: this.titularPA.nombre, disabled: false}, [Validators.required]],
        primerApellido: [{value: this.titularPA.primerApellido, disabled: false}, [Validators.required]],
        segundoApellido: [{value: this.titularPA.segundoApellido, disabled: false}, [Validators.required]],
        sexo: [{value: sexo, disabled: false}, [Validators.required]],
        otroSexo: [{value: this.titularPA.otroSexo, disabled: false}],
        fechaNacimiento: [{value: this.calcularFechaNacimiento(this.titularPA.fecNacimiento), disabled: false},
          [Validators.required]],
        nacionalidad: [{value: nacionalidad, disabled: false}, [Validators.required]],
        paisNacimiento: [{value: +this.titularPA.idPais, disabled: false}],
        lugarNacimiento: [{value: +this.titularPA.idLugarNac, disabled: false}],
        telefonoCelular: [{value: this.titularPA.telCelular, disabled: false}, [Validators.required]],
        telefonoFijo: [{value: this.titularPA.telFijo, disabled: false}, [Validators.required]],
        correoElectronico: [{value: this.titularPA.correo, disabled: false},
          [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
        calle: [{value: this.titularPA.calle, disabled: false}, [Validators.required]],
        numeroExterior: [{value: this.titularPA.numExt, disabled: false}, [Validators.required]],
        numeroInterior: [{value: this.titularPA.numInt, disabled: false}],
        cp: [{value: this.titularPA.cp, disabled: false}, [Validators.required]],
        colonia: [{value: this.titularPA.colonia, disabled: false}, [Validators.required]],
        municipio: [{value: this.titularPA.municipio, disabled: false}, [Validators.required]],
        estado: [{value: this.titularPA.estado, disabled: false}, [Validators.required]],
        tipoPaquete: [{value: this.titularPA.idPaquete, disabled: false}, [Validators.required]],
        numeroPagos: [{value: this.titularPA.numPagos, disabled: false}, [Validators.required]],
      }),
      sustituto: this.formBuilder.group({
        curp: [{value: this.sustituto?.curp ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        rfc: [{value: this.sustituto?.rfc ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        matricula: [{value: this.sustituto?.matricula ?? null, disabled: this.mismoSustituto}],
        nss: [{value: this.sustituto?.nss ?? null, disabled: this.mismoSustituto}],
        nombre: [{value: this.sustituto?.nombre ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        primerApellido: [{value: this.sustituto?.primerApellido ?? null, disabled: this.mismoSustituto},
          [Validators.required]],
        segundoApellido: [{value: this.sustituto?.segundoApellido ?? null, disabled: this.mismoSustituto},
          [Validators.required]],
        sexo: [{value: sexoSustituto ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        otroSexo: [{value: this.sustituto.otroSexo, disabled: this.mismoSustituto}],
        fechaNacimiento: [{value: fecNacimientoSust, disabled: this.mismoSustituto},
          [Validators.required]],
        nacionalidad: [{value: nacionalidadSustituto, disabled: this.mismoSustituto}, [Validators.required]],
        paisNacimiento: [{value: +this.sustituto?.idPais ?? null, disabled: this.mismoSustituto},
          [Validators.required]],
        lugarNacimiento: [{value: +this.sustituto?.idLugarNac ?? null, disabled: this.mismoSustituto},
          [Validators.required]],
        telefono: [{value: this.sustituto?.telFijo ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        correoElectronico: [{value: this.sustituto?.correo ?? null, disabled: this.mismoSustituto},
          [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
        calle: [{value: this.sustituto?.calle ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        numeroExterior: [{value: this.sustituto?.numExt ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        numeroInterior: [{value: this.sustituto?.numInt ?? null, disabled: this.mismoSustituto}],
        cp: [{value: this.sustituto?.cp ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        colonia: [{value: this.sustituto?.colonia ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        municipio: [{value: this.sustituto?.municipio ?? null, disabled: this.mismoSustituto}, [Validators.required]],
        estado: [{value: this.sustituto?.estado ?? null, disabled: this.mismoSustituto}, [Validators.required]],
      }),
      beneficiario1: this.formBuilder.group({
        curp: [{value: this.beneficiario1?.curp ?? null, disabled: false}],
        rfc: [{value: this.beneficiario1?.rfc ?? null, disabled: false}],
        matricula: [{value: this.beneficiario1?.matricula ?? null, disabled: false}],
        nss: [{value: this.beneficiario1?.nss ?? null, disabled: false}],
        nombre: [{value: this.beneficiario1?.nombre ?? null, disabled: false}],
        primerApellido: [{value: this.beneficiario1?.primerApellido ?? null, disabled: false}],
        segundoApellido: [{value: this.beneficiario1?.segundoApellido ?? null, disabled: false}],
        sexo: [{value: +this.beneficiario1?.idSexo ?? null, disabled: false}],
        fechaNacimiento: [{value: this.calcularFechaNacimiento(this.beneficiario1?.fecNacimiento), disabled: false}],
        nacionalidad: [{value: null, disabled: false}],
        paisNacimiento: [{value: null, disabled: false}],
        lugarNacimiento: [{value: null, disabled: false}],
        telefono: [{value: this.beneficiario1?.telFijo ?? null, disabled: false}],
        correoElectronico: [{value: this.beneficiario1?.correo ?? null, disabled: false}],
        calle: [{value: this.beneficiario1?.calle ?? null, disabled: false}],
        numeroExterior: [{value: this.beneficiario1?.numExt ?? null, disabled: false}],
        numeroInterior: [{value: this.beneficiario1?.numInt ?? null, disabled: false}],
        cp: [{value: this.beneficiario1?.cp ?? null, disabled: false}],
        colonia: [{value: this.beneficiario1?.colonia ?? null, disabled: false}],
        municipio: [{value: this.beneficiario1?.municipio ?? null, disabled: false}],
        estado: [{value: this.beneficiario1?.estado ?? null, disabled: false}],
      }),
      beneficiario2: this.formBuilder.group({
        curp: [{value: this.beneficiario2?.curp ?? null, disabled: false}],
        rfc: [{value: this.beneficiario2?.rfc ?? null, disabled: false}],
        matricula: [{value: this.beneficiario2?.matricula ?? null, disabled: false}],
        nss: [{value: this.beneficiario2?.nss ?? null, disabled: false}],
        nombre: [{value: this.beneficiario2?.nombre ?? null, disabled: false}],
        primerApellido: [{value: this.beneficiario2?.primerApellido ?? null, disabled: false}],
        segundoApellido: [{value: this.beneficiario2?.segundoApellido ?? null, disabled: false}],
        sexo: [{value: +this.beneficiario2?.idSexo ?? null, disabled: false}],
        fechaNacimiento: [{value: this.calcularFechaNacimiento(this.beneficiario2?.fecNacimiento), disabled: false}],
        nacionalidad: [{value: null, disabled: false}],
        paisNacimiento: [{value: null, disabled: false}],
        lugarNacimiento: [{value: null, disabled: false}],
        telefono: [{value: null, disabled: false}],
        correoElectronico: [{value: this.beneficiario2?.correo ?? null, disabled: false}],
        calle: [{value: this.beneficiario2?.calle ?? null, disabled: false}],
        numeroExterior: [{value: this.beneficiario2?.numExt ?? null, disabled: false}],
        numeroInterior: [{value: this.beneficiario2?.numInt ?? null, disabled: false}],
        cp: [{value: this.beneficiario2?.cp ?? null, disabled: false}],
        colonia: [{value: this.beneficiario2?.colonia ?? null, disabled: false}],
        municipio: [{value: null, disabled: false}],
        estado: [{value: null, disabled: false}],
      }),
      idPromotor: [{value: this.titularPA.idPromotor, disabled: false}]
    });
  }

  cargarBeneficiarios(): void {
    for (let beneficiario of this.beneficiariosPF) {
      this.agregarBeneficiario(beneficiario)
    }
  }

  cargarSolicitantes(): void {
    for (let i = 0; i < this.solicitantes.length; i++) {
      this.solicitantes[i].beneficiarios = this.beneficiariosEmpresa.filter((b: any) => (b.idContratante === this.solicitantes[i].idContratante));
    }
    for (let solicitante of this.solicitantes) {
      this.agregarSolicitante(solicitante)
    }
  }

  agregarBeneficiario(beneficiario: BeneficiarioResponse): void {
    this.nombresBeneficiario.push(beneficiario.nombre);
    const beneficiarioForm: FormGroup = this.formBuilder.group({
      nombre: [{value: beneficiario.nombre, disabled: false}, [Validators.required]],
      curp: [{value: beneficiario.curp, disabled: false}, [Validators.required]],
      rfc: [{value: beneficiario.rfc, disabled: false}, [Validators.required]],
      correo: [{value: beneficiario.correo, disabled: false},
        [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      telefono: [{value: beneficiario.telefono, disabled: false}, [Validators.required]],
      edad: [{value: beneficiario.edad, disabled: false}, [Validators.required]],
      parentesco: [{value: beneficiario.idParentesco, disabled: false}, [Validators.required]],
      idBeneficiario: [{value: beneficiario.idBeneficiario, disabled: false}],
      idPersona: [{value: beneficiario.idPersona, disabled: false}],
    });
    if (this.beneficiarios) {
      this.beneficiarios.push(beneficiarioForm);
    }
  }

  agregarSolicitante(solicitante: PreRegistroPA): void {
    const nombre: string = `${solicitante.nombre} ${solicitante.primerApellido} ${solicitante.primerApellido}`
    this.nombresSolicitantes.push(nombre);
    const nacionalidad: number = +solicitante.idPais === 119 ? 1 : 2;
    const solicitanteForm: FormGroup = this.formBuilder.group({
      matricula: [{value: solicitante.matricula, disabled: false}],
      rfc: [{value: solicitante.rfc, disabled: false}, [Validators.required]],
      curp: [{value: solicitante.curp, disabled: false}, [Validators.required]],
      nombres: [{value: nombre, disabled: false}, [Validators.required]],
      primerApellido: [{value: solicitante.primerApellido, disabled: false}, [Validators.required]],
      segundoApellido: [{value: solicitante.segundoApellido, disabled: false}, [Validators.required]],
      calle: [{value: solicitante.calle, disabled: false}, [Validators.required]],
      numeroExterior: [{value: solicitante.numExterior, disabled: false}, [Validators.required]],
      numeroInterior: [{value: solicitante.numInterior, disabled: false}],
      codigoPostal: [{value: solicitante.cp, disabled: false}, [Validators.required]],
      colonia: [{value: solicitante.colonia, disabled: false}, [Validators.required]],
      municipio: [{value: solicitante.municipio, disabled: false}, [Validators.required]],
      estado: [{value: solicitante.estado, disabled: false}, [Validators.required]],
      nacionalidad: [{value: nacionalidad, disabled: false}, [Validators.required]],
      paisNacimiento: [{value: solicitante.idPais, disabled: false}, [Validators.required]],
      lugarNacimiento: [{value: solicitante.idLugarNac, disabled: false}, [Validators.required]],
      correoElectronico: [{
        value: solicitante.correo,
        disabled: false
      }, [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      telefono: [{value: solicitante.telefono, disabled: false}, [Validators.required]],
      tipoPaquete: [{value: solicitante.idPaquete, disabled: false}, [Validators.required]],
      beneficiarios: this.formBuilder.array([])
    });
    if (solicitante.beneficiarios) {
      for (let beneficiario of solicitante.beneficiarios) {
        const beneficiarioForm: FormGroup = this.formBuilder.group({
          nombre: [{value: beneficiario.nombre, disabled: false}, [Validators.required]],
          curp: [{value: beneficiario.curp, disabled: false}, [Validators.required]],
          rfc: [{value: beneficiario.rfc, disabled: false}, [Validators.required]],
          correo: [{
            value: beneficiario.correo,
            disabled: false
          }, [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
          telefono: [{value: beneficiario.telefono, disabled: false}, [Validators.required]],
          edad: [{value: beneficiario.edad, disabled: false}, [Validators.required]],
          parentesco: [{value: null, disabled: false}, [Validators.required]],
        });
        if (solicitanteForm.get('beneficiarios')) {
          (solicitanteForm.get('beneficiarios') as FormArray).push(beneficiarioForm);
        }
      }
    }
    if (this.solicitantesEmpresa) {
      this.solicitantesEmpresa.push(solicitanteForm);
    }
  }

  regresar(): void {
    void this.router.navigate(['../../../'], {relativeTo: this.activatedRoute});
  }

  aceptar(): void {
    if (+this.tipoConvenio === 3) {
      this.guardarContratacionPersona();
      return;
    }
    this.cargadorService.activar();
    delay(3000)
    this.cargadorService.desactivar();
    this.alertaService.mostrar(TipoAlerta.Error, 'Error al guardar la información. Intenta nuevamente.')
  }

  cancelar() {
    //agregar Mensaje
    this.preRegistroSiguiente = false;
  }

  modificarSustituto(): void {
    if (this.mismoSustituto) {
      this.asignarMismoTitular();
    } else {
      this.limpiarSustituto();
    }
  }

  limpiarSustituto(): void {
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('curp')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('curp')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('rfc')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('rfc')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('matricula')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('matricula')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nss')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nss')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nombre')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nombre')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('primerApellido')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('primerApellido')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('segundoApellido')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('segundoApellido')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('sexo')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('sexo')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('otroSexo')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('otroSexo')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('fechaNacimiento')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('fechaNacimiento')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nacionalidad')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nacionalidad')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('paisNacimiento')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('paisNacimiento')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('lugarNacimiento')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('lugarNacimiento')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('telefono')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('telefono')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('correoElectronico')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('correoElectronico')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('calle')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('calle')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('numeroExterior')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('numeroExterior')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('numeroInterior')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('numeroInterior')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('cp')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('cp')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('colonia')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('colonia')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('municipio')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('municipio')?.enable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('estado')?.setValue(null);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('estado')?.enable();
  }

  asignarMismoTitular(): void {
    const nacionalidad: number = this.titularPA.idPais === '119' ? 1 : 2;
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('curp')?.setValue(this.titularPA.curp);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('curp')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('rfc')?.setValue(this.titularPA.rfc);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('rfc')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('matricula')?.setValue(this.titularPA.matricula);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('matricula')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nss')?.setValue(this.titularPA.nss);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nss')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nombre')?.setValue(this.titularPA.nombre);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nombre')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('primerApellido')?.setValue(this.titularPA.primerApellido);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('primerApellido')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('segundoApellido')?.setValue(this.titularPA.segundoApellido);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('segundoApellido')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('sexo')?.setValue(this.titularPA.idSexo);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('sexo')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('otroSexo')?.setValue(this.titularPA.otroSexo);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('otroSexo')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('fechaNacimiento')?.setValue(this.calcularFechaNacimiento(this.titularPA.fecNacimiento));
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('fechaNacimiento')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nacionalidad')?.setValue(nacionalidad);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('nacionalidad')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('paisNacimiento')?.setValue(+this.titularPA.idPais);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('paisNacimiento')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('lugarNacimiento')?.setValue(+this.titularPA.idLugarNac);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('lugarNacimiento')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('telefono')?.setValue(this.titularPA.telFijo);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('telefono')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('correoElectronico')?.setValue(this.titularPA.correo);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('correoElectronico')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('calle')?.setValue(this.titularPA.calle);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('calle')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('numeroExterior')?.setValue(this.titularPA.numExt);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('numeroExterior')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('numeroInterior')?.setValue(this.titularPA.numInt);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('numeroInterior')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('cp')?.setValue(this.titularPA.cp);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('cp')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('colonia')?.setValue(this.titularPA.colonia);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('colonia')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('municipio')?.setValue(this.titularPA.municipio);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('municipio')?.disable();
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('estado')?.setValue(this.titularPA.estado);
    this.contratacionNuevoConvenioForm.controls["sustituto"].get('estado')?.disable();
  }

  get beneficiarios() {
    return this.contratacionNuevoConvenioForm?.controls["beneficiarios"] as FormArray;
  }

  get solicitantesEmpresa() {
    return this.contratacionNuevoConvenioForm?.controls["solicitantes"] as FormArray;
  }

  get convenioFormGroup() {
    return this.contratacionNuevoConvenioForm.controls
  }

  getFormBeneficiarios(form: any) {
    return form.get('beneficiarios') as FormArray;
  }

  guardarContratacionPersona(): void {
    const solicitud: SolicitudActualizarPersona = {
      convenio: this.obtenerDatosSolicitante(),
      beneficiarios: this.obtenerDatosBeneficiarios()
    }
    this.cargadorService.activar();
    this.seguimientoConvenioService.guardarConvenioPorPersona(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        console.log(respuesta);
        this.regresar();
        this.alertaService.mostrar(TipoAlerta.Exito, `Convenio ${this.folio} agregado correctamente.`);
      },
      error: (error: HttpErrorResponse) => this.manejarMensajeError(error)
    })
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error, 'Error al consultar la información');
  }

  obtenerDatosSolicitante(): SolicitudActualizarSolicitante {
    return {
      calle: this.contratacionNuevoConvenioForm.controls["persona"].get('calle')?.value,
      colonia: this.contratacionNuevoConvenioForm.controls["persona"].get('colonia')?.value,
      correo: this.contratacionNuevoConvenioForm.controls["persona"].get('correoElectronico')?.value,
      cp: this.contratacionNuevoConvenioForm.controls["persona"].get('codigoPostal')?.value,
      curp: this.contratacionNuevoConvenioForm.controls["persona"].get('curp')?.value,
      estado: this.contratacionNuevoConvenioForm.controls["persona"].get('estado')?.value,
      idContraPaqPF: this.convenioPersona.idContraPaqPF,
      idConvenioPF: +this.idConvenio,
      idDomicilio: this.convenioPersona.idDomicilio,
      idEstado: this.contratacionNuevoConvenioForm.controls["persona"].get('lugarNacimiento')?.value,
      idPais: this.contratacionNuevoConvenioForm.controls["persona"].get('paisNacimiento')?.value,
      idPaquete: this.contratacionNuevoConvenioForm.get('tipoPaquete')?.value,
      idPersona: this.convenioPersona.idPersona,
      indEnfermedad: false,
      municipio: this.contratacionNuevoConvenioForm.controls["persona"].get('municipio')?.value,
      nombre: this.contratacionNuevoConvenioForm.controls["persona"].get('nombres')?.value,
      numExt: this.contratacionNuevoConvenioForm.controls["persona"].get('numeroExterior')?.value,
      numInt: this.contratacionNuevoConvenioForm.controls["persona"].get('numeroInterior')?.value,
      otraEnfermedad: "",
      primerApe: this.contratacionNuevoConvenioForm.controls["persona"].get('primerApellido')?.value,
      rfc: this.contratacionNuevoConvenioForm.controls["persona"].get('rfc')?.value,
      segunApe: this.contratacionNuevoConvenioForm.controls["persona"].get('segundoApellido')?.value,
      telefono: this.contratacionNuevoConvenioForm.controls["persona"].get('telefono')?.value
    }
  }

  obtenerDatosBeneficiarios(): SolicitudActualizarBeneficiario[] {
    const beneficiarios: SolicitudActualizarBeneficiario[] = [];
    const form = this.contratacionNuevoConvenioForm.getRawValue();
    for (let beneficiario of form.beneficiarios) {
      beneficiarios.push({
        correo: beneficiario.correo,
        curp: beneficiario.curp,
        idBeneficiario: beneficiario.idBeneficiario,
        idParentesco: beneficiario.parentesco,
        idPersona: beneficiario.idPersona,
        nombre: beneficiario.nombre,
        rfc: beneficiario.rfc,
        telefono: beneficiario.telefono
      })
    }
    return beneficiarios;
  }

}
