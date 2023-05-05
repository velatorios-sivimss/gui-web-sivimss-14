import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { MENU_SALAS } from "../../constants/menu-salas";
import interactionPlugin from "@fullcalendar/interaction";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { CalendarioVehiculos } from "../../models/calendario-vehiculos.interface";
import { VerActividadSalasComponent } from "../ver-actividad-salas/ver-actividad-salas.component";
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
import { ControlVehiculoListado } from '../../models/control-vehiculos.interface';

@Component({
  selector: 'app-calendario-vehiculos',
  templateUrl: './calendario-vehiculos.component.html',
  styleUrls: ['./calendario-vehiculos.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class CalendarioVehiculosComponent implements OnInit, OnDestroy {
  readonly POSICION_CATALOGO_VELATORIOS = 0;
  readonly POSICION_CATALOGO_DELEGACION = 1;

  @Input() controlVehiculos: ControlVehiculoListado[] = [];

  @ViewChild('calendarioCremacion') calendarioCremacion!: FullCalendarComponent;

  fechaCalendario!: Moment;
  calendarApi: any;

  calendarOptions!: CalendarOptions;
  velatorios: TipoDropdown[] = [];
  delegaciones: TipoDropdown[] = [];
  menu: string[] = MENU_SALAS;

  posicionPestania: number = 0;
  velatorio!: number;
  delegacion!: number;

  base64: any;

  fechaSeleccionada: string = "";
  actividadRef!: DynamicDialogRef;

  tituloSalas: CalendarioVehiculos[] = [];
  salasDetalle: CalendarioVehiculos[] = [];
  currentEvents: EventApi[] = [];

  constructor(
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
    private route: ActivatedRoute,
    private controlVehiculosService: ControlVehiculosService,
    private descargaArchivosService: DescargaArchivosService
  ) {
  }

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
      events: [
        { title: 'BLX6YUI - NISSAN  2010', date: '2023-05-03' }
      ],
      datesSet: event => {
        let mesInicio = +moment(event.start).format("MM");
        let mesFinal = +moment(event.end).format("MM");
        if (mesFinal - mesInicio == 2) {
          this.fechaCalendario = moment(event.start).add(1, 'month');
        } else {
          this.fechaCalendario = moment(event.start);
        }
        // this.calendarioCremacion.getApi().removeAllEvents();
        if (this.velatorio) { this.cambiarMes() }
      },
    };
  }

  cambiarMes(): void {
    debugger
    this.salasDetalle = [];
    this.tituloSalas = [];
    let anio = moment(this.fechaCalendario).format('YYYY').toString();
    let mes = moment(this.fechaCalendario).format('MM').toString();
    this.calendarApi = this.calendarioCremacion.getApi()
    this.calendarApi.removeAllEvents();
    if (this.velatorio) {
      this.controlVehiculosService.consultaMes(+mes, +anio, this.posicionPestania, this.velatorio).pipe(
      ).subscribe(
        (respuesta: HttpRespuesta<any>) => {
          respuesta.datos.forEach((sala: any) => {
            let bandera: boolean = false;
            this.calendarioCremacion.getApi().addEvent(
              { id: sala.idSala, title: sala.nombreSala, start: sala.fechaEntrada, color: sala.colorSala },
            );
            this.tituloSalas.forEach((tituloSala: any) => {
              if (tituloSala.id == sala.idSala) {
                bandera = true;
                return;
              }
            });
            if (!bandera) {
              this.tituloSalas.push(
                {
                  borderColor: sala.colorSala,
                  textColor: sala.colorSala,
                  title: sala.nombreSala,
                  id: sala.idSala
                }
              )
            }
          })
          this.tituloSalas = [...this.tituloSalas]
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      )
    }
  }

  mostrarEvento(clickInfo: EventClickArg): void {
    let obj = {
      ...clickInfo,
      dateStr: '',
    }
    // const idSala: number = +clickInfo.event._def.publicId;
    // this.fechaSeleccionada = moment(clickInfo.event._instance?.range.end).format('yyyy-MM-DD');
    this.fechaSeleccionada = obj.dateStr;
    this.actividadRef = this.dialogService.open(VerActividadSalasComponent, {
      header: 'Ver actividad del día',
      width: "920px",
      data: { fecha: this.fechaSeleccionada, idSala: 1 }
    })
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  cambiarPestania(pestania?: any): void {
    setTimeout(() => {
      this.posicionPestania = pestania?.index;
      this.velatorio = 0;
      this.delegacion = 0;
      this.tituloSalas = [];
      this.calendarioCremacion?.getApi().removeAllEvents();
      this.calendarioCremacion?.getApi().gotoDate(new Date());
      if (this.velatorio) { this.cambiarMes() }
    }, 300)
  }

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }
    if (!this.velatorio) { return }
    if (!this.tituloSalas.length) { return }

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
      idVelatorio: this.velatorio,
      indTipoSala: this.posicionPestania,
      mes: moment(this.fechaCalendario).format('MM').toString(),
      anio: moment(this.fechaCalendario).format('YYYY').toString(),
      rutaNombreReporte: "reportes/generales/ReporteVerificarDisponibilidadSalas.jrxml",
      tipoReporte: tipoReporte
    }
  }

  ngOnDestroy(): void {
    if (this.actividadRef) {
      this.actividadRef.destroy();
    }
  }
}
