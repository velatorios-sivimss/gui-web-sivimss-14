import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';
import { AltaODSInterface } from '../../models/AltaODS.interface';
import { ContratanteInterface } from '../../models/Contratante.interface';
import { CodigoPostalIterface } from '../../models/CodigoPostal.interface';
import { FinadoInterface } from '../../models/Finado.interface';
import { CaracteristicasPresupuestoInterface } from '../../models/CaracteristicasPresupuesto,interface';
import { CaracteristicasPaqueteInterface } from '../../models/CaracteristicasPaquete.interface';
import { DetallePaqueteInterface } from '../../models/DetallePaquete.interface';
import { ServicioDetalleTrasladotoInterface } from '../../models/ServicioDetalleTraslado.interface';
import { CaracteristicasDelPresupuestoInterface } from '../../models/CaracteristicasDelPresupuesto.interface';
import { DetallePresupuestoInterface } from '../../models/DetallePresupuesto.interface';
import { InformacionServicioInterface } from '../../models/InformacionServicio.interface';
import { InformacionServicioVelacionInterface } from '../../models/InformacionServicioVelacion.interface';
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { finalize } from 'rxjs';

import * as moment from 'moment';
import { UsuarioEnSesion } from '../../../../models/usuario-en-sesion.interface';
import { ActivatedRoute } from '@angular/router';
import { ActualizarOrdenServicioService } from '../../services/actualizar-orden-servicio.service';

@Component({
  selector: 'app-modificar-datos-contratante',
  templateUrl: './modificar-datos-contratante.component.html',
  styleUrls: ['./modificar-datos-contratante.component.scss'],
})
export class ModificarDatosContratanteComponent implements OnInit {
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  altaODS: AltaODSInterface = {} as AltaODSInterface;
  contratante: ContratanteInterface = {} as ContratanteInterface;
  cp: CodigoPostalIterface = {} as CodigoPostalIterface;
  finado: FinadoInterface = {} as FinadoInterface;
  caracteristicasPresupuesto: CaracteristicasPresupuestoInterface =
    {} as CaracteristicasPresupuestoInterface;
  caracteristicasPaquete: CaracteristicasPaqueteInterface =
    {} as CaracteristicasPaqueteInterface;
  detallePaquete: Array<DetallePaqueteInterface> =
    [] as Array<DetallePaqueteInterface>;
  servicioDetalleTraslado: ServicioDetalleTrasladotoInterface =
    {} as ServicioDetalleTrasladotoInterface;
  paquete: DetallePaqueteInterface = {} as DetallePaqueteInterface;
  cpFinado: CodigoPostalIterface = {} as CodigoPostalIterface;
  caracteristicasDelPresupuesto: CaracteristicasDelPresupuestoInterface =
    {} as CaracteristicasDelPresupuestoInterface;
  detallePresupuesto: Array<DetallePresupuestoInterface> =
    [] as Array<DetallePresupuestoInterface>;
  presupuesto: DetallePresupuestoInterface = {} as DetallePresupuestoInterface;
  servicioDetalleTrasladoPresupuesto: ServicioDetalleTrasladotoInterface =
    {} as ServicioDetalleTrasladotoInterface;
  informacionServicio: InformacionServicioInterface =
    {} as InformacionServicioInterface;
  informacionServicioVelacion: InformacionServicioVelacionInterface =
    {} as InformacionServicioVelacionInterface;
  cpVelacion: CodigoPostalIterface = {} as CodigoPostalIterface;

  ocultarFolioEstatus: boolean = true;
  form!: FormGroup;
  datosDetalle: any = [];
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private loaderService: LoaderService,
    private rutaActiva: ActivatedRoute,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
    private gestionarEtapasService: GestionarEtapasService
  ) {
    this.altaODS.contratante = this.contratante;
    this.contratante.cp = this.cp;
    this.altaODS.finado = this.finado;
    this.finado.cp = this.cpFinado;
    this.altaODS.caracteristicasPresupuesto = this.caracteristicasPresupuesto;
    this.caracteristicasPresupuesto.caracteristicasPaquete =
      this.caracteristicasPaquete;
    this.caracteristicasPaquete.detallePaquete = this.detallePaquete;
    this.paquete.servicioDetalleTraslado = this.servicioDetalleTraslado;
    this.caracteristicasPresupuesto.caracteristicasDelPresupuesto =
      this.caracteristicasDelPresupuesto;
    this.caracteristicasDelPresupuesto.detallePresupuesto =
      this.detallePresupuesto;
    this.presupuesto.servicioDetalleTraslado =
      this.servicioDetalleTrasladoPresupuesto;
    this.altaODS.informacionServicio = this.informacionServicio;
    this.informacionServicio.informacionServicioVelacion =
      this.informacionServicioVelacion;
    this.informacionServicioVelacion.cp = this.cpVelacion;
  }
  ngOnInit(): void {
    let estatus = this.rutaActiva.snapshot.paramMap.get('idEstatus');
    if (Number(estatus) == 1) this.ocultarFolioEstatus = true;
    else this.ocultarFolioEstatus = false;

    this.buscarDetalle(
      Number(this.rutaActiva.snapshot.paramMap.get('idODS')),
      Number(this.rutaActiva.snapshot.paramMap.get('idEstatus'))
    );
    this.gestionarEtapasService.detalleODS$
      .asObservable()
      .subscribe((detalleODS) =>
        this.inicializarForm(
          detalleODS,
          Number(this.rutaActiva.snapshot.paramMap.get('idEstatus')),
          Number(this.rutaActiva.snapshot.paramMap.get('idODS'))
        )
      );
  }

  buscarDetalle(idODS: number, estatus: number) {
    this.loaderService.activar();

    const parametros = { idOrdenServicio: idODS };
    console.log('entro', parametros);
    this.gestionarOrdenServicioService
      .consultarDetalleODS(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log('que trajo', respuesta);
          this.gestionarEtapasService.detalleODS$.next(respuesta.datos);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          try {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          } catch (error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          }
        }
      );
  }

  inicializarForm(datos: any, idODS: number, tipoODS: number) {
    console.log('llego despues', datos);
    this.form = this.formBuilder.group({
      datosContratante: this.formBuilder.group({
        matricula: [
          {
            value: datos.contratante.matricula,
            disabled: false,
          },
          [Validators.required],
        ],
        rfc: [
          {
            value: datos.contratante.rfc,
            disabled: false,
          },
          [Validators.required],
        ],
        curp: [
          {
            value: datos.contratante.curp,
            disabled: false,
          },
          [Validators.required],
        ],
        nombre: [
          {
            value: datos.contratante.nombre,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: datos.contratante.primerApellido,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: datos.contratante.segundoApellido,
            disabled: false,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: datos.contratante.fechaNac,
            disabled: false,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefono: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        parentesco: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      direccion: this.formBuilder.group({
        direccion: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        noExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        noInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        colonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
    });
  }

  get datosContratante() {
    return (this.form.controls['datosContratante'] as FormGroup).controls;
  }
  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }
}
