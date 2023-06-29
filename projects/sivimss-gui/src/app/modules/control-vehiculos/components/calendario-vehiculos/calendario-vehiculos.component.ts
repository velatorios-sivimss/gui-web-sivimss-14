import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { MENU_SALAS } from "../../constants/menu-salas";
import interactionPlugin from "@fullcalendar/interaction";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FiltroFormData, GenerarReporteCalendar } from "../../models/calendario-vehiculos.interface";
import { VerActividadVehiculosComponent } from "../ver-actividad-vehiculos/ver-actividad-vehiculos.component";
import { ActivatedRoute } from "@angular/router";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { ControlVehiculosService } from "../../services/control-vehiculos.service";
import * as moment from 'moment';
import { Moment } from 'moment';
import { FullCalendarComponent } from "@fullcalendar/angular";
import { finalize } from "rxjs/operators";
import { DescargaArchivosService } from "../../../../services/descarga-archivos.service";
import { OpcionesArchivos } from "../../../../models/opciones-archivos.interface";
import { BuscarVehiculosDisponibles, ControlVehiculoListado } from '../../models/control-vehiculos.interface';
import { PrevisualizacionArchivoComponent } from "./previsualizacion-archivo/previsualizacion-archivo.component";
import { of } from 'rxjs';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';

@Component({
  selector: 'app-calendario-vehiculos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendario-vehiculos.component.html',
  styleUrls: ['./calendario-vehiculos.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class CalendarioVehiculosComponent implements OnInit, OnDestroy {
  @ViewChild('calendarioVehiculos') calendarioVehiculos!: FullCalendarComponent;

  readonly POSICION_CATALOGO_VELATORIOS = 0;
  readonly POSICION_CATALOGO_DELEGACION = 1;

  private _filtroFormData!: FiltroFormData;

  @Input() controlVehiculos: ControlVehiculoListado[] = [];
  mensajeArchivoConfirmacion: string | undefined;

  @Input()
  set filtroFormData(filtroFormData: FiltroFormData) {
    this._filtroFormData = filtroFormData;
    if (this.calendarioVehiculos) {
      this.obtenerVehiculos();
    }
  }

  get filtroFormData(): FiltroFormData {
    return this._filtroFormData;
  }

  fechaCalendario!: Moment;
  calendarApi: any;
  calendarOptions!: CalendarOptions;
  delegaciones: TipoDropdown[] = [];
  menu: string[] = MENU_SALAS;
  base64: any;
  actividadRef!: DynamicDialogRef;
  currentEvents: EventApi[] = [];
  defaultColor: string[] = [
    '#376ED9',
    '#45855d',
    '#8d0789',
    '#d0bb25',
    '#dd0505',
  ];
  archivoRef!: DynamicDialogRef;

  constructor(
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
    private route: ActivatedRoute,
    private controlVehiculosService: ControlVehiculosService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  ngOnInit(): void {
    this.inicializarCalendario();
  }

  inicializarCalendario(): void {
    this.calendarOptions = {
      headerToolbar: { end: "next", center: "title", start: "prev" },
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      initialEvents: "",
      defaultAllDay: true,
      editable: false,
      locale: 'es-MX',
      selectable: true,
      dayHeaders: false,
      eventClick: this.mostrarEvento.bind(this),
      eventsSet: this.handleEvents.bind(this),
      dayMaxEventRows: 3,
      titleFormat: { year: 'numeric', month: 'long' },
      events: [],
      validRange: event => {
        return {
          start: moment().subtract(2, 'months').format('YYYY-MM-DD'),
          end: moment().add(1, 'months').format('YYYY-MM-DD')
        };
      },
      datesSet: event => {
        let mesInicio = +moment(event.start).format("MM");
        let mesFinal = +moment(event.end).format("MM");
        if (mesFinal - mesInicio == 2) {
          this.fechaCalendario = moment(event.start).add(1, 'month');
        } else {
          this.fechaCalendario = moment(event.start);
        }
        this.obtenerVehiculos();
      },
    };
  }

  mostrarEvento(clickInfo: EventClickArg): void {
    const idVehiculo: number = +clickInfo.event._def.publicId;
    const fechaSeleccionada: string = moment(clickInfo.event._instance?.range.end).format('yyyy-MM-DD');
    this.actividadRef = this.dialogService.open(VerActividadVehiculosComponent, {
      header: 'Ver actividad del día',
      width: "920px",
      data: { fechaSeleccionada, idVehiculo }
    })
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  generarReporteCalendar(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = { nombreArchivo: 'Disponibilidad de vehículos' };
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);

    this.controlVehiculosService.generarReporteCalendar(busqueda).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200) {
          const file = new Blob(
            [this.descargaArchivosService.base64_2Blob(
              respuesta.datos,
              this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
            { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
          const url = window.URL.createObjectURL(file);
          if (tipoReporte !== "xls") {
            this.archivoRef = this.dialogService.open(PrevisualizacionArchivoComponent, {
              data: url,
              header: "",
              width: "920px",
            });
          } else {
            this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
              finalize(() => this.loaderService.desactivar())
            ).subscribe({
              next: (respuesta: any) => {
                this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
                this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeArchivoConfirmacion);
              },
              error: (error: HttpErrorResponse) => {
                this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
              }
            });
          }
        } else {
          console.error(respuesta.mensaje);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  filtrosArchivos(tipoReporte: string): GenerarReporteCalendar {
    return {
      fecIniRepo: moment(this.fechaCalendario).startOf('month').format('YYYY-MM-DD'),
      fecFinRepo: moment(this.fechaCalendario).endOf('month').format('YYYY-MM-DD'),
      tipoReporte,
    }
  }

  obtenerVehiculos() {
    this.calendarioVehiculos.getApi().removeAllEvents();
    let buscar: BuscarVehiculosDisponibles = {
      idDelegacion: this.filtroFormData.delegacion,
      idVelatorio: this.filtroFormData.velatorio,
      fecIniRepo: moment(this.fechaCalendario).startOf('month').format('YYYY-MM-DD'),
      fecFinRepo: moment(this.fechaCalendario).endOf('month').format('YYYY-MM-DD'),
    };
    this.controlVehiculosService.obtenerVehiculosCalendario(buscar).pipe().subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        respuesta.datos.forEach((vehiculo: any, index: number) => {
          const title: string = `${vehiculo.placas} - ${vehiculo.marca} ${vehiculo.modelo}`;
          this.calendarioVehiculos.getApi().addEvent(
            { id: vehiculo.idVehiculo, title, start: vehiculo.fecha, textColor: '#FFFFFF', borderColor: '#484848', backgroundColor: this.defaultColor[this.getRandomInt(4)] },
          );
        })
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  ngOnDestroy(): void {
    if (this.actividadRef) {
      this.actividadRef.destroy();
    }
  }
}
