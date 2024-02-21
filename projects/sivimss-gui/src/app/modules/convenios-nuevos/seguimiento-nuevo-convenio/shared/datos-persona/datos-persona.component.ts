import {ChangeDetectorRef, Component, ElementRef, inject, Input, OnInit, Renderer2} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {CATALOGO_NACIONALIDAD} from "../../../../contratantes/constants/catalogos-complementarios";
import {CATALOGO_ENFERMEDAD_PREEXISTENTE} from "../../../../convenios-prevision-funeraria/constants/catalogos-funcion";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {PATRON_CURP, PATRON_RFC} from "../../../../../utils/constantes";
import {AccordionModule} from "primeng/accordion";
import {ActivatedRoute} from "@angular/router";
import {SolicitudPersona} from "../../models/solicitudActualizarPersona.interface";
import {SolicitudDocumento} from "../../models/solicitudDocumento.interface";

@Component({
  selector: 'app-datos-persona',
  templateUrl: './datos-persona.component.html',
  styleUrls: ['./datos-persona.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule, AccordionModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosPersonaComponent implements OnInit {

  paises: TipoDropdown[] = [];
  estados: TipoDropdown[] = [];
  enfermedades: TipoDropdown[] = CATALOGO_ENFERMEDAD_PREEXISTENTE;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  colonias: TipoDropdown[] = [];
  paquetes: TipoDropdown[] = [];
  readonly POSICION_PAQUETES: number = 1;
  archivoModificado: boolean = false;

  tipoDoc: TipoDropdown[] = [
    {value: 1, label: 'INE del afiliado'},
    {value: 2, label: 'CURP del afiliado'},
    {value: 3, label: 'RFC del afiliado'}
  ];

  parentContainer: ControlContainer = inject(ControlContainer);

  @Input() enfermedad: boolean = true;
  @Input() ID: string = '';

  nombreCURP: string = '';
  nombreINE: string = '';
  nombreRFC: string = '';
  inputSeleccionado: string = '';

  constructor(private autenticacionService: AutenticacionService,
              private cargadorService: LoaderService,
              private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
              private mensajesSistemaService: MensajesSistemaService,
              private alertaService: AlertaService,
              private activatedRoute: ActivatedRoute,
              private el: ElementRef,
              private renderer: Renderer2,
              private cdr: ChangeDetectorRef) {
    this.cargarCatalogosLocalStorage();
  }

  ngOnInit(): void {
    this.cargarValidacionesIniciales();
    this.cargarCatalogosAdicionales();
    this.cambiarValorInputDescarga();
    this.cargarCP(true);
  }

  cambiarValorInputDescarga(): void {
    const verDocINE = this.el.nativeElement.querySelector('#verDocINE') as HTMLInputElement;
    const verDocCURP = this.el.nativeElement.querySelector('#verDocCURP') as HTMLInputElement;
    const verDocRFC = this.el.nativeElement.querySelector('#verDocRFC') as HTMLInputElement;
    const nombreCURP = this.parentContainer.control?.get('nombreDocumentoCURP')?.value;
    const nombreINE = this.parentContainer.control?.get('nombreDocumentoINE')?.value;
    const nombreRFC = this.parentContainer.control?.get('nombreDocumentoRFC')?.value;
    if (verDocINE) {
      verDocINE.value = nombreINE;
    }
    if (verDocCURP) {
      verDocCURP.value = nombreCURP;
    }
    if (verDocRFC) {
      verDocRFC.value = nombreRFC;
    }
    this.cdr.detectChanges();
  }

  cargarCatalogosAdicionales(): void {
    const registro = this.activatedRoute.snapshot.data["respuesta"];
    const paquetes = registro[this.POSICION_PAQUETES].datos;
    this.paquetes = mapearArregloTipoDropdown(paquetes, 'nombrePaquete', 'idPaquete');
    this.nombreCURP = this.parentContainer.control?.get('nombreDocumentoCURP')?.value
    this.nombreINE = this.parentContainer.control?.get('nombreDocumentoINE')?.value
    this.nombreRFC = this.parentContainer.control?.get('nombreDocumentoRFC')?.value
  }

  cargarValidacionesIniciales(): void {
    const nacionalidad = this.parentContainer.control?.get('nacionalidad')?.value;
    if (nacionalidad === 1) {
      this.parentContainer.control?.get('lugarNacimiento')?.setValidators([Validators.required]);
    } else {
      this.parentContainer.control?.get('paisNacimiento')?.setValidators([Validators.required]);
    }
  }

  cargarCatalogosLocalStorage(): void {
    const catalogoPais = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_pais');
    this.paises = mapearArregloTipoDropdown(catalogoPais, 'desc', 'id');
    const catalogoEstado = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_estados');
    this.estados = mapearArregloTipoDropdown(catalogoEstado, 'desc', 'id');
  }

  cargarCP(cargaInicial: boolean = false): void {
    const cp = this.parentContainer.control?.get('codigoPostal')?.value;
    if (!cp) return;
    if (cp.length < 5) return;
    if (!cargaInicial) {
      this.cargadorService.activar();
      this.parentContainer.control?.get('colonia')?.setValue(null);
    }
    this.seguimientoNuevoConvenioService.consutaCP(cp).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (response: HttpRespuesta<any>): void => this.procesarRespuestaCPPersona(response),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error),
    })
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  procesarRespuestaCPPersona(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) {
      this.respuestaSinDatosCPPersona();
      return;
    }
    this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre');
    const [colonia] = respuesta.datos;
    this.parentContainer.control?.get('municipio')?.setValue(colonia.municipio.nombre);
    this.parentContainer.control?.get('estado')?.setValue(colonia.municipio.entidadFederativa.nombre);
  }

  respuestaSinDatosCPPersona(): void {
    this.colonias = [];
    this.parentContainer.control?.get('municipio')?.setValue(null);
    this.parentContainer.control?.get('estado')?.setValue(null);
    this.parentContainer.control?.get('colonia')?.setValue(null);
  }

  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

  cambioNacionalidad(): void {
    const nacionalidadPersona = this.parentContainer.control?.get('nacionalidad')?.value;
    this.parentContainer.control?.get('paisNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValue(null);
    if (nacionalidadPersona === 1) {
      this.parentContainer.control?.get('lugarNacimiento')?.setValidators([Validators.required]);
    } else {
      this.parentContainer.control?.get('lugarNacimiento')?.clearValidators();
    }
  }

  validarMatricula(): void {
    const matricula = this.parentContainer.control?.get('matricula')?.value;
    if (matricula === '' || !matricula) return;
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.consultarMatriculaSiap(matricula).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (response: HttpRespuesta<any>): void => this.procesarRespuestaMatricula(response),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error),
    });
  }

  procesarRespuestaMatricula(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) {
      this.parentContainer.control?.get('matricula')?.setValue(null);
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'La matrícula es incorrecta.');
    }
  }


  validarCurp(): void {
    const curp = this.parentContainer.control?.get('curp')?.value;
    if (!curp) return;
    if (!curp.match(PATRON_CURP)) {
      this.alertaService.mostrar(TipoAlerta.Error, 'CURP no valido.');
      return;
    }
    this.cargadorService.activar();
    const parametros = {curp, rfc: null};
    this.seguimientoNuevoConvenioService.buscarCurpRFC(parametros)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.procesarRespuestaCURP(respuesta),
        error: (error: HttpErrorResponse) => this.manejarMensajeError(error),
      });
  }

  procesarRespuestaCURP(respuesta: HttpRespuesta<any>): void {
    if (respuesta.error && respuesta.mensaje !== 'Exito') {
      this.mostrarMensaje(+respuesta.mensaje);
      return;
    }
    if (respuesta.mensaje == 'Exito') {
      let [valores] = respuesta.datos;
      this.parentContainer.control?.get('nombres')?.setValue(valores.nomPersona);
      this.parentContainer.control?.get('primerApellido')?.setValue(valores.primerApellido);
      this.parentContainer.control?.get('segundoApellido')?.setValue(valores.segundoApellido);
      this.parentContainer.control?.get('telefono')?.setValue(valores.telefono);
      this.parentContainer.control?.get('correoElectronico')?.setValue(valores.correo);
    }
  }

  validarRfc(): void {
    const rfc = this.parentContainer.control?.get('rfc')?.value;
    if (!rfc) return;
    if (!rfc.match(PATRON_RFC)) {
      this.alertaService.mostrar(TipoAlerta.Error, 'RFC no válido.');
      this.parentContainer.control?.get('rfc')?.setValidators(Validators.pattern(PATRON_RFC));
      this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
    }
  }

  mostrarMensaje(numero: number): void {
    switch (numero) {
      case 5:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al guardar la información. Intenta nuevamente.'
        );
        break;
      case 33:
        this.alertaService.mostrar(TipoAlerta.Info, 'R.F.C. no valido.');
        break;
      case 52:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al consultar la información.'
        );
        break;
      case 184:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El servicio de RENAPO  no esta disponible.'
        );
        break;
      case 185:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El código postal no existe.'
        );
        break;
      case 186:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'El servicio no responde, no permite más llamadas.'
        );
        break;
      case 187:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
        break;
      case 802:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El beneficiario ya fue registrado con anterioridad, ingrese un beneficiario diferente.'
        );
        break;
      case 900:
        this.alertaService.mostrar(TipoAlerta.Info, 'Selecciona un paquete.');
        break;
      default:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
    }
  }

  guardarSolicitante(): void {
    const solicitud: SolicitudPersona = this.crearSolicitudPersona();
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.guardarSolicitante(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.alertaService.mostrar(TipoAlerta.Exito, `Información de solicitante actualizada satisfactoriamente`);
        this.parentContainer.control?.markAsPristine();
        this.archivoModificado = false;
      },
      error: (error: HttpErrorResponse) => this.manejarMensajeError(error)
    });
  }

  crearSolicitudPersona(): SolicitudPersona {
    const idEstado = this.parentContainer.control?.get('lugarNacimiento')?.value;
    const idPais = this.parentContainer.control?.get('paisNacimiento')?.value;
    const idSexo = this.parentContainer.control?.get('idSexo')?.value;
    const nombreDocumentoRFC = this.parentContainer.control?.get('nuevoDocumentoRFC')?.value;
    const nombreDocumentoINE = this.parentContainer.control?.get('nuevoDocumentoINE')?.value;
    const nombreDocumentoCURP = this.parentContainer.control?.get('nuevoDocumentoCURP')?.value;
    return {
      archivoCurp: nombreDocumentoCURP !== null ? this.parentContainer.control?.get('documentoCURP')?.value : null,
      archivoIne: nombreDocumentoINE !== null ? this.parentContainer.control?.get('documentoINE')?.value : null,
      archivoRfc: nombreDocumentoRFC !== null ? this.parentContainer.control?.get('documentoRFC')?.value : null,
      calle: this.parentContainer.control?.get('calle')?.value,
      colonia: this.parentContainer.control?.get('colonia')?.value,
      correo: this.parentContainer.control?.get('correoElectronico')?.value,
      cp: this.parentContainer.control?.get('codigoPostal')?.value,
      curp: this.parentContainer.control?.get('curp')?.value,
      estado: this.parentContainer.control?.get('estado')?.value,
      fechaNaciemiento: this.parentContainer.control?.get('fechaNaciemiento')?.value,
      idContraPaqPF: this.parentContainer.control?.get('idContraPaqPF')?.value,
      idContrantante: this.parentContainer.control?.get('idContrantante')?.value,
      idConvenioPF: this.parentContainer.control?.get('idConvenioPF')?.value,
      idDomicilio: this.parentContainer.control?.get('idDomicilio')?.value,
      idEnfermedad: this.parentContainer.control?.get('enfermedadPreExistente')?.value,
      idEstado: idEstado === 0 ? null : idEstado,
      idPais: idPais === 0 ? null : idPais,
      idPaquete: this.parentContainer.control?.get('tipoPaquete')?.value,
      idPersona: this.parentContainer.control?.get('idPersona')?.value,
      idPromotor: this.parentContainer.control?.get('idPromotor')?.value,
      idSexo: idSexo === 0 ? null : idSexo,
      idValidaDocumento: this.parentContainer.control?.get('idValidaDocumento')?.value,
      matricula: this.parentContainer.control?.get('matricula')?.value,
      municipio: this.parentContainer.control?.get('municipio')?.value,
      nombre: this.parentContainer.control?.get('nombres')?.value,
      nombreCurp: nombreDocumentoCURP !== null ? nombreDocumentoCURP : null,
      nombreIne: nombreDocumentoINE !== null ? nombreDocumentoINE : null,
      nombreRfc: nombreDocumentoRFC !== null ? nombreDocumentoRFC : null,
      numExt: this.parentContainer.control?.get('numeroExterior')?.value,
      numInt: this.parentContainer.control?.get('numeroInterior')?.value,
      otraEnfermedad: null,
      otroSexo: this.parentContainer.control?.get('otroSexo')?.value,
      primerApe: this.parentContainer.control?.get('primerApellido')?.value,
      rfc: this.parentContainer.control?.get('rfc')?.value,
      segunApe: this.parentContainer.control?.get('segundoApellido')?.value,
      telefono: this.parentContainer.control?.get('telefono')?.value,
      validaCurp: nombreDocumentoCURP !== null,
      validaIne: nombreDocumentoINE !== null,
      validaRfc: nombreDocumentoRFC !== null
    }
  }

  descargarArchivo(tipoDocumento: number) {
    const solicitud: SolicitudDocumento = this.generarSolicitudDescarga(tipoDocumento);
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.descargarDocumento(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(TipoAlerta.Error, 'Error en la descarga del documento.Intenta nuevamente.');
          return;
        }
        let link = this.renderer.createElement('a');
        const nombreDocumentoRFC = this.parentContainer.control?.get('nombreDocumentoRFC')?.value;
        const nombreDocumentoINE = this.parentContainer.control?.get('nombreDocumentoINE')?.value;
        const nombreDocumentoCURP = this.parentContainer.control?.get('nombreDocumentoCURP')?.value;
        let nombreDocumento: string = 'documento';
        if (tipoDocumento === 1) {
          nombreDocumento = nombreDocumentoCURP.split('.');
        }
        if (tipoDocumento === 2) {
          nombreDocumento = nombreDocumentoINE.split('.');
        }
        if (tipoDocumento === 3) {
          nombreDocumento = nombreDocumentoRFC.split('.');
        }
        link.setAttribute('download', nombreDocumento);
        link.setAttribute('href', respuesta.datos);
        link.click();
        link.remove();
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    });
  }

  generarSolicitudDescarga(tipoDocumento: number): SolicitudDocumento {
    return {
      idContratante: this.parentContainer.control?.get('idContrantante')?.value,
      idPaqueteConvenio: this.parentContainer.control?.get('idContraPaqPF')?.value,
      idPersona: this.parentContainer.control?.get('idPersona')?.value,
      tipoDocumento,
      tipoPersona: 1
    }
  }

  handleClick(controlName: string): void {
    const elements = document.getElementById(controlName);
    this.inputSeleccionado = controlName;
    elements?.click();
  }

  addAttachment(fileInput: any): void {
    const extensionesPermitidas: string[] = ['pdf', 'gif', 'jpeg', 'jpg'];
    const maxSize: number = 5000000;
    const fileReaded = fileInput.target.files[0];
    const tipoArchivo = fileReaded.type.split('/');
    if (!extensionesPermitidas.includes(tipoArchivo[1])) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(97));
      return
    }
    if (fileReaded.size > maxSize) {
      const tamanioEnMb: number = maxSize / 1000000;
      const alerta: string = `El tamaño máximo permititido es de ${tamanioEnMb} MB`
      this.alertaService.mostrar(TipoAlerta.Info, alerta);
      return;
    }
    const curp = this.parentContainer.control?.get('curp')?.value;
    const nombreRFC: string | null = this.inputSeleccionado === 'uploadFileRFC' ? 'RFC-' + curp + '.' + tipoArchivo[1] : null;
    const nombreCURP: string | null = this.inputSeleccionado === 'uploadFileCURP' ? 'CURP-' + curp + '.' + tipoArchivo[1] : null;
    const nombreINE: string | null = this.inputSeleccionado === 'uploadFileINE' ? 'INE-' + curp + '.' + tipoArchivo[1] : null;
    if (nombreINE) {
      this.parentContainer.control?.get('nuevoDocumentoINE')?.setValue(nombreINE);
    }
    if (nombreCURP) {
      this.parentContainer.control?.get('nuevoDocumentoCURP')?.setValue(nombreCURP);
    }
    if (nombreRFC) {
      this.parentContainer.control?.get('nuevoDocumentoRFC')?.setValue(nombreRFC);
    }
    this.archivoModificado = true;
    this.getBase64(fileReaded).then((data: any): void => {
      this.inputSeleccionado = data;
      if (nombreINE) {
        this.parentContainer.control?.get('documentoINE')?.setValue(data);
      }
      if (nombreCURP) {
        this.parentContainer.control?.get('documentoCURP')?.setValue(data);
      }
      if (nombreRFC) {
        this.parentContainer.control?.get('documentoRFC')?.setValue(data);
      }
    });
  }

  getBase64(file: any) {
    return new Promise((resolve, reject): void => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
}
