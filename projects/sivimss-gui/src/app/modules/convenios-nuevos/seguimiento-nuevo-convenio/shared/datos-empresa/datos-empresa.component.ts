import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {SolicitudEmpresa} from "../../models/solicitudActualizarPersona.interface";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {PATRON_RFC} from "../../../../../utils/constantes";

@Component({
  selector: 'app-datos-empresa',
  templateUrl: './datos-empresa.component.html',
  styleUrls: ['./datos-empresa.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosEmpresaComponent implements OnInit {

  paises: TipoDropdown[] = [];
  colonias: TipoDropdown[] = [];

  parentContainer: ControlContainer = inject(ControlContainer)

  constructor(private autenticacionService: AutenticacionService,
              private cargadorService: LoaderService,
              private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
              private mensajesSistemaService: MensajesSistemaService,
              private alertaService: AlertaService,) {
    this.cargarCatalogosCookies();
  }

  ngOnInit(): void {
    this.cargarCP(true);
  }

  cargarCatalogosCookies(): void {
    const catalogoPais = this.autenticacionService.obtenerCatalogoDeCookies('catalogo_pais');
    this.paises = mapearArregloTipoDropdown(catalogoPais, 'desc', 'id');
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

  cargarCP(cargaInicial: boolean = false): void {
    const cp = this.parentContainer.control?.get('cp')?.value;
    if (cp.length < 5) return;
    if (!cargaInicial) {
      this.cargadorService.activar();
      this.parentContainer.control?.get('colonia')?.setValue(null);
    }
    this.seguimientoNuevoConvenioService.consutaCP(cp).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (response: HttpRespuesta<any>): void => this.procesarRespuestaCPEmpresa(response),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error),
    })
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  procesarRespuestaCPEmpresa(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) {
      this.respuestaSinDatosCPEmpresa();
      return;
    }
    this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre');
    const [colonia] = respuesta.datos;
    this.parentContainer.control?.get('municipio')?.setValue(colonia.municipio.nombre);
    this.parentContainer.control?.get('estado')?.setValue(colonia.municipio.entidadFederativa.nombre);
  }

  respuestaSinDatosCPEmpresa(): void {
    this.colonias = [];
    this.parentContainer.control?.get('municipio')?.setValue(null);
    this.parentContainer.control?.get('estado')?.setValue(null);
    this.parentContainer.control?.get('colonia')?.setValue(null);
  }


  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

  guardarEmpresa(): void {
    const solicitud: SolicitudEmpresa = this.crearSolicitudEmpresa();
    this.seguimientoNuevoConvenioService.guardarEmpresa(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.alertaService.mostrar(TipoAlerta.Exito, `Información de empresa actualizada satisfactoriamente`);
        this.parentContainer.control?.markAsPristine();
      },
      error: (error: HttpErrorResponse) => this.manejarMensajeError(error)
    });
  }

  crearSolicitudEmpresa(): SolicitudEmpresa {
    return {
      calle: this.parentContainer.control?.get('calle')?.value,
      colonia: this.parentContainer.control?.get('colonia')?.value,
      correo: this.parentContainer.control?.get('correo')?.value,
      cp: this.parentContainer.control?.get('cp')?.value,
      estado: this.parentContainer.control?.get('estado')?.value,
      idConvenioPF: this.parentContainer.control?.get('idConvenioPF')?.value,
      idDomicilio: this.parentContainer.control?.get('idDomicilio')?.value,
      idEmpresa: this.parentContainer.control?.get('idEmpresa')?.value,
      idPais: this.parentContainer.control?.get('pais')?.value,
      municipio: this.parentContainer.control?.get('municipio')?.value,
      nombre: this.parentContainer.control?.get('nombre')?.value,
      numExt: this.parentContainer.control?.get('numeroExterior')?.value,
      numInt: this.parentContainer.control?.get('numeroInterior')?.value,
      razonSocial: this.parentContainer.control?.get('razonSocial')?.value,
      rfc: this.parentContainer.control?.get('rfc')?.value,
      telefono: this.parentContainer.control?.get('telefono')?.value
    }
  }
}
