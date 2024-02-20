import {Component, inject, Input, OnInit, Renderer2} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {finalize} from "rxjs/operators";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {PATRON_CURP, PATRON_RFC} from "../../../../../utils/constantes";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import * as moment from 'moment';
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {SolicitudBeneficiario} from "../../models/solicitudActualizarPersona.interface";
import {AccordionModule} from "primeng/accordion";
import {SolicitudDocumento} from "../../models/solicitudDocumento.interface";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../../models/opciones-archivos.interface";

@Component({
  selector: 'app-datos-beneficiario',
  templateUrl: './datos-beneficiario.component.html',
  styleUrls: ['./datos-beneficiario.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule, RouterLink, AccordionModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosBeneficiarioComponent implements OnInit {

  parentContainer: ControlContainer = inject(ControlContainer);

  @Input() ID: string = '';
  @Input() tipo: 'persona' | 'empresa' = 'empresa';

  parentesco: TipoDropdown[] = [];

  tipoDoc: TipoDropdown[] = [{
    value: 1, label: 'INE del afiliado',
  }, {
    value: 2, label: 'Acta de nacimiento del afiliado'
  }];

  inputSeleccionado: string = '';

  constructor(private cargadorService: LoaderService,
              private activatedRoute: ActivatedRoute,
              private mensajesSistemaService: MensajesSistemaService,
              private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
              private alertaService: AlertaService,
              private renderer: Renderer2,
              private descargaArchivosService: DescargaArchivosService,
  ) {
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    const POSICION_PARENTESCO: number = 2;
    const parentesco = respuesta[POSICION_PARENTESCO].datos;
    this.parentesco = mapearArregloTipoDropdown(parentesco, 'nombreParentesco', 'idParentesco');
  }

  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

  validarCurp(): void {
    const curp = this.parentContainer.control?.get('curp')?.value;
    if (!curp) return;
    if (!curp.match(PATRON_CURP)) {
      this.alertaService.mostrar(TipoAlerta.Error, 'CURP no valido.');
      return;
    }
    if (curp.includes('XEXX010101HNEXXXA4')) return;
    if (curp.includes('XEXX010101MNEXXXA8')) return;
    this.cargadorService.activar();
    const parametros = {curp, rfc: null};
    this.seguimientoNuevoConvenioService.buscarCurpRFC(parametros)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.procesarRespuestaCURP(respuesta),
        error: (error: HttpErrorResponse) => this.manejarMensajeError(error),
      });
  }

  validarRfc(): void {
    const rfc = this.parentContainer.control?.get('rfc')?.value;
    if (!rfc) return;
    this.parentContainer.control?.get('rfc')?.clearValidators();
    this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
    if (rfc.includes('XAXX010101000')) return;
    if (!rfc.match(PATRON_RFC)) {
      this.parentContainer.control?.get('rfc')?.setValidators(Validators.pattern(PATRON_RFC));
      this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
    }
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  procesarRespuestaCURP(respuesta: HttpRespuesta<any>): void {
    if (respuesta.error && respuesta.mensaje !== 'Exito') {
      this.mostrarMensaje(+respuesta.mensaje);
      return;
    }
    if (respuesta.mensaje == 'Exito') {
      let [valores] = respuesta.datos;
      let [anioD, mesD, diaD] = valores.fechaNacimiento.split('-');
      let fechaNacimiento = new Date(anioD + '/' + mesD + '/' + diaD);
      this.parentContainer.control?.get('nombres')?.setValue(`${valores.nomPersona} ${valores.primerApellido} ${valores.segundoApellido}`);
      this.parentContainer.control?.get('telefono')?.setValue(valores.telefono);
      this.parentContainer.control?.get('correoElectronico')?.setValue(valores.correo);
      this.parentContainer.control?.get('edad')?.setValue(moment().diff(moment(fechaNacimiento), 'years'));
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

  guardarBeneficiario(): void {
    const solicitud = this.crearSolicitudBeneficiario();
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.guardarBeneficiario(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.alertaService.mostrar(TipoAlerta.Exito, `Información de beneficiario actualizada satisfactoriamente`);
        this.parentContainer.control?.markAsPristine();
      },
      error: (error: HttpErrorResponse) => this.manejarMensajeError(error)
    });
  }

  crearSolicitudBeneficiario(): SolicitudBeneficiario {
    const idEstado = this.parentContainer.control?.get('idEstado')?.value;
    const idPais = this.parentContainer.control?.get('idPais')?.value;
    const idSexo = this.parentContainer.control?.get('idSexo')?.value;
    return {
      correo: this.parentContainer.control?.get('correo')?.value,
      curp: this.parentContainer.control?.get('curp')?.value,
      documento: null,
      fechaNaciemiento: this.parentContainer.control?.get('fechaNacimiento')?.value,
      idContratanteBeneficiario: this.parentContainer.control?.get('idContratante')?.value,
      idEstado: idEstado === 0 ? null : idEstado,
      idPais: idPais === 0 ? null : idPais,
      idPersona: this.parentContainer.control?.get('idPersona')?.value,
      idSexo: idSexo === 0 ? null : idSexo,
      nombre: this.parentContainer.control?.get('nombre')?.value,
      nombreActa: null,
      nombreIne: null,
      otroSexo: this.parentContainer.control?.get('otroSexo')?.value,
      primerApe: this.parentContainer.control?.get('primerApellido')?.value,
      rfc: this.parentContainer.control?.get('rfc')?.value,
      segunApe: this.parentContainer.control?.get('segundoApellido')?.value,
      telefono: this.parentContainer.control?.get('telefono')?.value,
      validaActa: false,
      validaIne: false
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
    const edad = this.parentContainer.control?.get('edad')?.value;
    const curp = this.parentContainer.control?.get('curp')?.value;

    const nombreINE: string | null = edad >= 18 ? 'INE-' + curp + '.' + tipoArchivo[1] : null;
    const nombreActa: string | null = edad < 18 ? 'ACTA-' + curp + '.' + tipoArchivo[1] : null;
    if (nombreINE) {
      this.parentContainer.control?.get('nuevoDocumento')?.setValue(nombreINE);
    }
    if (nombreActa) {
      this.parentContainer.control?.get('nuevoDocumento')?.setValue(nombreActa);
    }

    this.getBase64(fileReaded).then((data: any): void => {
      this.inputSeleccionado = data;
      this.parentContainer.control?.get('documento')?.setValue(data);
    });
  }

  getBase64(file: any) {
    return new Promise((resolve, reject): void => {
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error: ProgressEvent<FileReader>) => reject(error);
    });
  }

  descargarArchivo(): void {
    const solicitud: SolicitudDocumento = this.generarSolicitudDescarga();
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.descargarDocumento(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        let link = this.renderer.createElement('a');
        const nombre = this.parentContainer.control?.get('nombreDocumento')?.value;
        const [nombreDocumento] = nombre.split('.');
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

  generarSolicitudDescarga(): SolicitudDocumento {
    const tipoDocumento = this.parentContainer.control?.get('tipoDocumento')?.value;
    return {
      idContratante: this.parentContainer.control?.get('idContratante')?.value,
      idPaqueteConvenio: this.parentContainer.control?.get('idContraPaqPF')?.value,
      idPersona: this.parentContainer.control?.get('idPersona')?.value,
      tipoDocumento,
      tipoPersona: 2
    }
  }
}
