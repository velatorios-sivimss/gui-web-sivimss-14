import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {TipoDropdown} from '../../../../models/tipo-dropdown'
import {DynamicDialogConfig, DynamicDialogRef,} from "primeng/dynamicdialog";
import {
  AlertaService,
  TipoAlerta,
} from '../../../../shared/alerta/services/alerta.service'
import {registrarEntrada} from '../../models/capilla-reservacion.interface'
import {OverlayPanel} from "primeng/overlaypanel";
import {CapillaReservacionService} from '../../services/capilla-reservacion.service'
import {HttpErrorResponse} from '@angular/common/http'
import {ActivatedRoute} from '@angular/router'
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import * as moment from 'moment'
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type NuevaEntrada = Omit<registrarEntrada, 'idRol'>

@Component({
  selector: 'app-registrar-entrada',
  templateUrl: './registrar-entrada.component.html',
  styleUrls: ['./registrar-entrada.component.scss'],
  providers: [DescargaArchivosService]
})
export class RegistrarEntradaComponent implements OnInit {
  @Input() entradaRegistrada!: registrarEntrada
  @Input() origen!: string
  @Output() confirmacionAceptar = new EventEmitter<registrarEntrada>()


  alertas = JSON.parse(localStorage.getItem('mensajes') as string);
  acordionAbierto: boolean = false

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined
  horaEntrada: any

  identificadorCapilla!: any;
  idOds!: number;
  folioOdsEstatus: boolean = false;

  registrarEntradaForm!: FormGroup

  confirmacion: boolean = false

  registros: any[] = [
    {value: 1, label: 'Registro 1'},
    {value: 2, label: 'Registro 2'},
    {value: 3, label: 'Registro 3'},
    {value: 4, label: 'Registro 4'},
    {value: 5, label: 'Registro 5'},
  ];

  registros2: any[] = [];

  velatorios: TipoDropdown[] = []
  capilla: TipoDropdown[] = []
  fechaDetalle!: string;
  nombreCapilla!: any;

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private readonly refModal: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public capillaReservacionService: CapillaReservacionService,
    private route: ActivatedRoute,
    private readonly loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
  ) {
    this.entradaRegistrada = this.config.data
    this.inicializarRegistrarEntradaForm(this.entradaRegistrada)
  }

  ngOnInit(): void {
    this.inicializarRegistrarEntradaForm(this.entradaRegistrada);
    this.obtenerCapillaPorIdVelatorio();
  }

  inicializarRegistrarEntradaForm(datosEntrada: registrarEntrada): void {
    this.fechaDetalle = moment(datosEntrada.fechaEntrada).format('DD/MM/yyyy');
    this.registrarEntradaForm = this.formBuilder.group({
      capilla: [{value: null, disabled: false}, [Validators.required]],
      folioODS: [{value: null, disabled: false}, [Validators.required]],
      nombreContratante: [{value: null, disabled: true}],
      nombreFinado: [{value: null, disabled: true}],
      fechaEntrada: [{value: datosEntrada.fechaEntrada, disabled: false}, [Validators.required]],
      horaEntrada: [{value: datosEntrada.horaEntrada, disabled: false}, [Validators.required]],
    })
  }

  obtenerCapillaPorIdVelatorio() {
    this.capillaReservacionService.buscarPorIdVelatorio(+this.entradaRegistrada.idVelatorio!).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos.length > 0) {
          this.registros2 = respuesta!.datos.map((capilla: any) => {
            return {label: capilla.nomCapilla, value: capilla.idCapilla};
          });
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  crearEntradaModificado(): registrarEntrada {
    return {
      idCapilla: this.registrarEntradaForm.get('capilla')?.value,
      fechaEntrada: moment(this.registrarEntradaForm.get('fechaEntrada')?.value).format('DD-MM-yyyy'),
      horaEntrada: moment(this.registrarEntradaForm.get('horaEntrada')?.value).format('HH:mm'),
      idOrdenServicio: this.idOds,
    }
  }

  confirmarEntrada(valor?: boolean): void {
    this.confirmacion = true
  }

  guardar(): void {
    const registrarEntradaBo: NuevaEntrada = this.crearEntradaModificado()
    const solicitudEntrada: string = JSON.stringify(registrarEntradaBo)
    this.capillaReservacionService.guardar(solicitudEntrada).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Exito, msg);
        this.refModal.close(true)
        this.generarPlantillaEntregaCapilla();

      },
      error: (error: HttpErrorResponse): void => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
      },
    })
  }

  consultaODS(): void {
    this.loaderService.activar();
    if (!this.ref.folioODS.value) {
      this.loaderService.desactivar();
      return;
    }
    this.capillaReservacionService.consultarODS(this.ref.folioODS.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.ref.nombreContratante.patchValue(null);
        this.ref.nombreFinado.patchValue(null);
        if (respuesta.datos.length > 0) {
          this.folioOdsEstatus = false;
          this.idOds = respuesta.datos[0]?.idOds;
          this.ref.nombreContratante.setValue(respuesta.datos[0]?.nombreContratante);
          this.ref.nombreFinado.setValue(respuesta.datos[0]?.finado);
        } else {
          this.folioOdsEstatus = true;
          this.alertaService.mostrar(TipoAlerta.Precaucion, "El número de folio no existe.\n" +
            "Verifica tu información.\n")
        }
      },
      error: (error: HttpErrorResponse): void => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
      }
    });
  }

  generarPlantillaEntregaCapilla(): void {
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: "Entrega de capilla"};
    this.loaderService.activar();
    const busqueda = this.filtrosArchivos();
    this.descargaArchivosService.descargarArchivo(this.capillaReservacionService.generarFormatEntregaCapilla(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta): void => {
        console.log(respuesta)
      },
      error: (error): void => {
        console.log(error)
      },
    } )
  }

  filtrosArchivos() {
    return {
      idCapilla: this.ref.capilla.value,
      folioOds: this.ref.folioODS.value,
      rutaNombreReporte: "reportes/plantilla/EntregaCapilla2.jrxml",
      tipoReporte: "pdf"
    }
  }

  tomarNombreCapilla(): void {
    this.nombreCapilla = this.registros2.filter((valor: any) => {
      return valor.value == this.registrarEntradaForm.get('capilla')?.value;
    })

    this.nombreCapilla = this.nombreCapilla[0].label
  }

  cancelar(): void {
    this.refModal.close(false)
  }

  get ref() {
    return this.registrarEntradaForm.controls
  }
}
