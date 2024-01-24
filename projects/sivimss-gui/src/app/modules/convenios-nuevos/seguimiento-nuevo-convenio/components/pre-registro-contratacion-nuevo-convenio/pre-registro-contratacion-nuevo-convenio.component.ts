import {Component, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {DialogService} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {Documentos} from '../../models/documentos.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {ConvenioPersona} from "../../models/ConvenioPersona.interface";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";

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
  paquetes: TipoDropdown[] = [];

  documentos: Documentos[] = [];
  documentoSeleccionado: Documentos = {};

  preRegistroSiguiente: boolean = false;
  folio: string = '';
  nombresBeneficiario: string[] = [];
  tipoConvenio: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.tipoConvenio = activatedRoute.snapshot.params.tipoConvenio ?? '';
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
      this.folio = this.convenioPersona.folioConvenio.toString();
    }
    const paquetes = respuesta[this.POSICION_PAQUETES].datos;
    this.paquetes = mapearArregloTipoDropdown(paquetes, 'nombrePaquete', 'idPaquete');
  }

  inicializarTipoFormulario(): void {
    if (this.tipoConvenio === '3') {
      this.inicializarFormulario();
    }
    this.inicializarFormularioGenerico();
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
        paisNacimiento: [{value: this.convenioPersona.pais, disabled: false}],
        lugarNacimiento: [{value: this.convenioPersona.lugarNac, disabled: false}],
        correoElectronico: [{value: this.convenioPersona.correo, disabled: false}],
        telefono: [{value: this.convenioPersona.telFijo, disabled: false}],
        enfermedadPreExistente: [{value: null, disabled: false}],
      }),
      tipoPaquete: [{value: this.convenioPersona.idPaquete, disabled: false}],
      beneficiarios: this.formBuilder.array([])
    });
  }

  inicializarFormularioGenerico(): void {
    this.contratacionNuevoConvenioForm = this.formBuilder.group({});
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
