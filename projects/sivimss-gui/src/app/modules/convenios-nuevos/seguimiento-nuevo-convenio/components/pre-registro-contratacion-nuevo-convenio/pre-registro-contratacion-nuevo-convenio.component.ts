import {Component, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DialogService} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {Documentos} from '../../models/documentos.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {ConvenioPersona} from "../../models/ConvenioPersona.interface";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {diferenciaUTC, mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {ConvenioEmpresa} from "../../models/convenioEmpresa.interface";
import {BeneficiarioResponse} from "../../models/beneficiarioResponse.interface";
import {PreRegistroPA} from "../../models/preRegistroPA.interface";

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
  readonly POSICION_PAQUETES: number = 2;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  infoPersona: boolean = false;

  convenioPersona!: ConvenioPersona;
  convenioEmpresa!: ConvenioEmpresa;
  paquetes: TipoDropdown[] = [];

  documentos: Documentos[] = [];
  documentoSeleccionado: Documentos = {};

  preRegistroSiguiente: boolean = false;
  folio: string = '';
  nombresBeneficiario: string[] = [];
  tipoConvenio: string = '';
  beneficiariosPA: BeneficiarioResponse[] = [];
  beneficiario1!: BeneficiarioResponse;
  beneficiario2!: BeneficiarioResponse;
  titularPA!: PreRegistroPA;


  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,

  ) {
    this.tipoConvenio = this.activatedRoute.snapshot.params.tipoConvenio ?? '';
    this.cargarCatalogos();
    this.inicializarTipoFormulario();
  }

  ngOnInit(): void {
    this.cargarBeneficiarios();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"]
    if (this.tipoConvenio === '3') {
      this.convenioPersona = respuesta[this.POSICION_CONVENIO].datos;
      this.folio = this.convenioPersona.folioConvenio
    }
    if (this.tipoConvenio === '2') {
      this.convenioEmpresa = respuesta[this.POSICION_CONVENIO].datos.empresa;
    }
    if (this.tipoConvenio === '1') {
      this.titularPA = respuesta[this.POSICION_CONVENIO].datos.preRegistro;
      this.beneficiariosPA = respuesta[this.POSICION_CONVENIO].datos.beneficiarios.filter((beneficiario: any) => beneficiario !== null);
      this.folio = this.titularPA.folioConvenio;
      this.obtenerBeneficiarios()
    }
    const paquetes = respuesta[this.POSICION_PAQUETES].datos;
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
    this.contratacionNuevoConvenioForm = this.formBuilder.group({
      persona: this.formBuilder.group({
        matricula: [{value: this.convenioPersona.matricula, disabled: false}],
        rfc: [{value: this.convenioPersona.rfc, disabled: false}],
        curp: [{value: this.convenioPersona.curp, disabled: false}],
        nombres: [{value: this.convenioPersona.nombre, disabled: false}],
        primerApellido: [{value: this.convenioPersona.primerApellido, disabled: false}],
        segundoApellido: [{value: this.convenioPersona.segundoApellido, disabled: false}],
        calle: [{value: this.convenioPersona.calle, disabled: false}],
        numeroExterior: [{value: this.convenioPersona.numExt, disabled: false}],
        numeroInterior: [{value: this.convenioPersona.numInt, disabled: false}],
        codigoPostal: [{value: this.convenioPersona.cp, disabled: false}],
        colonia: [{value: this.convenioPersona.colonia, disabled: false}],
        municipio: [{value: this.convenioPersona.municipio, disabled: false}],
        estado: [{value: this.convenioPersona.estado, disabled: false}],
        nacionalidad: [{value: null, disabled: false}],
        paisNacimiento: [{value: parseInt(this.convenioPersona.pais), disabled: false}],
        lugarNacimiento: [{value: this.convenioPersona.lugarNac, disabled: false}],
        correoElectronico: [{value: this.convenioPersona.correo, disabled: false}],
        telefono: [{value: this.convenioPersona.telFijo, disabled: false}],
        enfermedadPreExistente: [{value: null, disabled: false}],
      }),
      tipoPaquete: [{value: this.convenioPersona.idPaquete, disabled: false}],
      beneficiarios: this.formBuilder.array([])
    });
  }

  inicializarFormularioEmpresa(): void {
    this.contratacionNuevoConvenioForm = this.formBuilder.group({
      empresa: this.formBuilder.group({
        nombre: [{value: this.convenioEmpresa.nombre, disabled: false}],
        razonSocial: [{value: this.convenioEmpresa.razonSocial, disabled: false}],
        rfc: [{value: this.convenioEmpresa.rfc, disabled: false}],
        pais: [{value: this.convenioEmpresa.idPais, disabled: false}],
        cp: [{value: this.convenioEmpresa.cp, disabled: false}],
        colonia: [{value: this.convenioEmpresa.colonia, disabled: false}],
        estado: [{value: this.convenioEmpresa.estado, disabled: false}],
        municipio: [{value: this.convenioEmpresa.municipio, disabled: false}],
        calle: [{value: this.convenioEmpresa.calle, disabled: false}],
        numeroExterior: [{value: this.convenioEmpresa.numExterior, disabled: false}],
        numeroInterior: [{value: this.convenioEmpresa.numInterior, disabled: false}],
        correo: [{value: this.convenioEmpresa.correo, disabled: false}],
      })
    });
  }

  inicializarFormularioPA(): void {
    const fecNacimiento = new Date(diferenciaUTC(this.titularPA.fecNacimiento));
    this.contratacionNuevoConvenioForm = this.formBuilder.group({
      titular: this.formBuilder.group({
        curp: [{value: this.titularPA.curp, disabled: false}, [Validators.required]],
        rfc: [{value: this.titularPA.rfc, disabled: false}, [Validators.required]],
        matricula: [{value: this.titularPA.matricula, disabled: false}, [Validators.required]],
        nss: [{value: this.titularPA.nss, disabled: false}, [Validators.required]],
        nombre: [{value: this.titularPA.nombre, disabled: false}, [Validators.required]],
        primerApellido: [{value: this.titularPA.primerApellido, disabled: false}, [Validators.required]],
        segundoApellido: [{value: this.titularPA.segundoApellido, disabled: false}, [Validators.required]],
        sexo: [{value: this.titularPA.idSexo, disabled: false}, [Validators.required]],
        fechaNacimiento: [{value: fecNacimiento, disabled: false}, [Validators.required]],
        nacionalidad: [{value: null, disabled: false}, [Validators.required]],
        paisNacimiento: [{value: +this.titularPA.idPais, disabled: false}],
        lugarNacimiento: [{value: null, disabled: false}],
        telefonoCelular: [{value: this.titularPA.telCelular, disabled: false}, [Validators.required]],
        telefonoFijo: [{value: this.titularPA.telFijo, disabled: false}, [Validators.required]],
        correoElectronico: [{value: this.titularPA.correo, disabled: false}, [Validators.required]],
        calle: [{value: this.titularPA.calle, disabled: false}, [Validators.required]],
        numeroExterior: [{value: this.titularPA.numExt, disabled: false}, [Validators.required]],
        numeroInterior: [{value: this.titularPA.numInt, disabled: false}, [Validators.required]],
        cp: [{value: this.titularPA.cp, disabled: false}, [Validators.required]],
        colonia: [{value: this.titularPA.colonia, disabled: false}, [Validators.required]],
        municipio: [{value: this.titularPA.municipio, disabled: false}, [Validators.required]],
        estado: [{value: this.titularPA.estado, disabled: false}, [Validators.required]],
        tipoPaquete: [{value: null, disabled: false}, [Validators.required]],
        numeroPagos: [{value: this.titularPA.numPagos, disabled: false}, [Validators.required]],
      }),
      sustituto: this.formBuilder.group({
        curp: [{value: null, disabled: false}],
        rfc: [{value: null, disabled: false}],
        matricula: [{value: null, disabled: false}],
        nss: [{value: null, disabled: false}],
        nombre: [{value: null, disabled: false}],
        primerApellido: [{value: null, disabled: false}],
        segundoApellido: [{value: null, disabled: false}],
        sexo: [{value: null, disabled: false}],
        fechaNacimiento: [{value: null, disabled: false}],
        nacionalidad: [{value: null, disabled: false}],
        paisNacimiento: [{value: null, disabled: false}],
        lugarNacimiento: [{value: null, disabled: false}],
        telefono: [{value: null, disabled: false}],
        correoElectronico: [{value: null, disabled: false}],
        calle: [{value: null, disabled: false}],
        numeroExterior: [{value: null, disabled: false}],
        numeroInterior: [{value: null, disabled: false}],
        cp: [{value: null, disabled: false}],
        colonia: [{value: null, disabled: false}],
        municipio: [{value: null, disabled: false}],
        estado: [{value: null, disabled: false}],
      }),
      beneficiario1: this.formBuilder.group({
        curp: [{value: this.beneficiario1?.curp ?? null, disabled: false}],
        rfc: [{value: this.beneficiario1?.rfc ?? null, disabled: false}],
        matricula: [{value: this.beneficiario1?.matricula ?? null, disabled: false}],
        nss: [{value: this.beneficiario1?.nss ?? null, disabled: false}],
        nombre: [{value: this.beneficiario1?.nombre ?? null, disabled: false}],
        primerApellido: [{value: this.beneficiario1?.primerApellido ?? null, disabled: false}],
        segundoApellido: [{value: this.beneficiario1?.segundoApellido ?? null, disabled: false}],
        sexo: [{value: null, disabled: false}],
        fechaNacimiento: [{value: null, disabled: false}],
        nacionalidad: [{value: null, disabled: false}],
        paisNacimiento: [{value: null, disabled: false}],
        lugarNacimiento: [{value: null, disabled: false}],
        telefono: [{value: null, disabled: false}],
        correoElectronico: [{value: this.beneficiario1?.correo ?? null, disabled: false}],
        calle: [{value: this.beneficiario1?.calle ?? null, disabled: false}],
        numeroExterior: [{value: this.beneficiario1?.numExt ?? null, disabled: false}],
        numeroInterior: [{value: this.beneficiario1?.numInt ?? null, disabled: false}],
        cp: [{value: this.beneficiario1?.cp ?? null, disabled: false}],
        colonia: [{value: this.beneficiario1?.colonia ?? null, disabled: false}],
        municipio: [{value: null, disabled: false}],
        estado: [{value: null, disabled: false}],
      }),
      beneficiario2: this.formBuilder.group({
        curp: [{value: this.beneficiario2?.curp ?? null, disabled: false}],
        rfc: [{value: this.beneficiario2?.rfc ?? null, disabled: false}],
        matricula: [{value: this.beneficiario2?.matricula ?? null, disabled: false}],
        nss: [{value: this.beneficiario2?.nss ?? null, disabled: false}],
        nombre: [{value: this.beneficiario2?.nombre ?? null, disabled: false}],
        primerApellido: [{value: this.beneficiario2?.primerApellido ?? null, disabled: false}],
        segundoApellido: [{value: this.beneficiario2?.segundoApellido ?? null, disabled: false}],
        sexo: [{value: null, disabled: false}],
        fechaNacimiento: [{value: null, disabled: false}],
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
    });
  }

  cargarBeneficiarios(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    const beneficiarios: BeneficiarioResponse[] = [];
    for (let beneficiario of beneficiarios) {
      this.agregarBeneficiario(beneficiario)
    }
  }

  agregarBeneficiario(beneficiario: BeneficiarioResponse): void {
    const nombreBeneficiario: string = `${beneficiario.nombre} ${beneficiario.primerApellido} ${beneficiario.segundoApellido}`;
    this.nombresBeneficiario.push(nombreBeneficiario);
    const beneficiarioForm: FormGroup = this.formBuilder.group({
      nombre: [{value: nombreBeneficiario, disabled: false}],
      curp: [{value: beneficiario.curp, disabled: false}],
      rfc: [{value: beneficiario.rfc, disabled: false}],
      correo: [{value: beneficiario.correo, disabled: false}],
      telefono: [{value: beneficiario.telCelular, disabled: false}],
    });
    this.beneficiarios.push(beneficiarioForm)
  }

  abrir(event: MouseEvent) {
    this.infoPersona = true;
    this.overlayPanel.toggle(event);
  }

  contratacionNuevoConvenioForm!: FormGroup;

  abrirPanel(event: MouseEvent): void {
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

  get beneficiarios() {
    return this.contratacionNuevoConvenioForm.controls["beneficiarios"] as FormArray;
  }

  getFormGroup(control: AbstractControl) {
    return control as FormGroup;
  }

}
