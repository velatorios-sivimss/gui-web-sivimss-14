import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
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

  beneficiarios: any[] = [];
  convenioPersona!: ConvenioPersona;
  paquetes: TipoDropdown[] = [];

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
    this.inicializarFormulario();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"]
    this.convenioPersona = respuesta[this.POSICION_CONVENIO].datos[0];
    this.folio = this.convenioPersona.folioConvenio.toString();
    this.beneficiarios = respuesta[this.POSICION_BENEFICIARIO].datos;
    const paquetes = respuesta[this.POSICION_PAQUETES].datos;
    this.paquetes = mapearArregloTipoDropdown(paquetes, 'nombrePaquete', 'idPaquete');
    console.log(this.paquetes);
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
      tipoPaquete: [{value: this.convenioPersona.idPaquete, disabled: false}]
    });
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
