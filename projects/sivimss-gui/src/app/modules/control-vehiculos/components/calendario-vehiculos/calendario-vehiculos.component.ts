import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { MENU_SALAS } from "../../constants/menu-salas";
import interactionPlugin from "@fullcalendar/interaction";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FiltroFormData } from "../../models/calendario-vehiculos.interface";
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

  constructor(
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
    private route: ActivatedRoute,
    private controlVehiculosService: ControlVehiculosService,
    private descargaArchivosService: DescargaArchivosService
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
      // dateClick: ((evt: any) => this.mostrarEvento(evt)),
      eventsSet: this.handleEvents.bind(this),
      dayMaxEventRows: 3,
      titleFormat: { year: 'numeric', month: 'long' },
      events: [],
      datesSet: event => {
        let mesInicio = +moment(event.start).format("MM");
        let mesFinal = +moment(event.end).format("MM");
        if (mesFinal - mesInicio == 2) {
          this.fechaCalendario = moment(event.start).add(1, 'month');
        } else {
          this.fechaCalendario = moment(event.start);
        }
        if (this.filtroFormData.velatorio) { this.obtenerVehiculos() }
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

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }
    if (!this.filtroFormData.velatorio) { return }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);

    this.descargaArchivosService.descargarArchivo(this.controlVehiculosService.generarReporte(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta)
      },
      (error) => {
        console.log(error)
      },
    )
  }

  filtrosArchivos(tipoReporte: string) {
    return {
      // idVelatorio: this.filtroFormData.velatorio,
      fecIniRepo: moment(this.fechaCalendario).startOf('month').format('YYYY-MM-DD'),
      fecFinRepo: moment(this.fechaCalendario).endOf('month').format('YYYY-MM-DD'),
      tipoReporte,
    }
  }

  obtenerVehiculos() {
    if (this.filtroFormData.velatorio) {
      this.calendarioVehiculos.getApi().removeAllEvents();
      let buscar: BuscarVehiculosDisponibles = {
        idVelatorio: this.filtroFormData.velatorio,
        fecIniRepo: moment(this.fechaCalendario).startOf('month').format('YYYY-MM-DD'),
        fecFinRepo: moment(this.fechaCalendario).endOf('month').format('YYYY-MM-DD'),
      };
      this.controlVehiculosService.obtenerVehiculosDisponibles(buscar).pipe().subscribe(
        (respuesta: HttpRespuesta<any>) => {
          respuesta.datos.forEach((vehiculo: any) => {
            this.calendarioVehiculos.getApi().addEvent(
              { id: vehiculo.idVehiculo, title: 'BLX6YUI - NISSAN  2010', start: vehiculo.fecha, textColor: '#376ED9', borderColor: '#484848', backgroundColor: 'white' },
            );
          })
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.actividadRef) {
      this.actividadRef.destroy();
    }
  }
}
