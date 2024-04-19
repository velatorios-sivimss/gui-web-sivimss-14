import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import {
  CalendarOptions,
  DateSelectArg,
  EventApi,
  EventClickArg,
} from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { DetalleActividadDiaComponent } from '../detalle-actividad-dia/detalle-actividad-dia.component'
import { FullCalendarComponent } from '@fullcalendar/angular'
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service'
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service'
import { ActivatedRoute } from '@angular/router'
import { CapillaReservacionService } from '../../services/capilla-reservacion.service'
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface'
import { finalize } from 'rxjs/operators'
import { HttpErrorResponse } from '@angular/common/http'
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown'
import { CalendarioCapillas } from '../../models/capilla-reservacion.interface'
import { FormBuilder, FormGroup } from '@angular/forms'
import * as moment from 'moment'

import { Moment } from 'moment'
import { OpcionesArchivos } from "../../../../models/opciones-archivos.interface";
import { DescargaArchivosService } from "../../../../services/descarga-archivos.service";
import { VelatorioInterface } from "../../../reservar-salas/models/velatorio.interface";
import { PrevisualizacionArchivoComponent } from "./previsualizacion-archivo/previsualizacion-archivo.component";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {CookieService} from "ngx-cookie-service";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  providers: [DialogService, DescargaArchivosService, AutenticacionService, CookieService],
})
export class CalendarioComponent implements OnInit, OnDestroy {
  @ViewChild('calendarioCapillas') calendarioCapillas!: FullCalendarComponent

  calendarOptions!: CalendarOptions;

  fechaSeleccionada: string = '';
  calendarApi: any;
  delegacion!: number;
  delegaciones: TipoDropdown[] = [];

  actividadRef!: DynamicDialogRef;

  velatorios: TipoDropdown[] = [];

  posicionPestania: number = 0;
  velatorioPosicion!: number;
  velatorio!: number;
  filtroCalendarForm!: FormGroup;
  registroCalendario: any[] = [];
  tituloCapillas: CalendarioCapillas[] = [];
  capillasDetalle: CalendarioCapillas[] = [];
  currentEvents: EventApi[] = [];
  archivoRef!: DynamicDialogRef

  fechaCalendario!: Moment;
  alertas = JSON.parse(this.cookieService.get('mensajes') as string);
  rolUsuarioEnSesion: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();

  constructor(
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private capillaReservacionService: CapillaReservacionService,
    private formBuilder: FormBuilder,
    private descargaArchivosService: DescargaArchivosService,
    private authService: AutenticacionService,
    private cookieService: CookieService
  ) { }



  ngOnInit(): void {
    this.velatorio = +this.rolUsuarioEnSesion.idVelatorio ?? 0;
    this.delegacion = +this.rolUsuarioEnSesion.idDelegacion ?? 0;
    this.cambiarDelegacion();
    this.inicializarCalendario();
    this.inicializarCalendarioForm();

    const respuesta = this.route.snapshot.data['respuesta'];

    this.delegaciones = respuesta[1]!.map((delegacion: any) => (
      { label: delegacion.label, value: delegacion.value })) || [];
  }

  inicializarCalendarioForm(): void {
    this.filtroCalendarForm = this.formBuilder.group({
      velatorio: [{ value: null, disabled: false }],
    })
  }

  inicializarCalendario(): void {
    this.calendarOptions = {
      headerToolbar: { end: 'next', center: 'title', start: 'prev' },

      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      initialEvents: '',
      defaultAllDay: true,
      editable: false,

      locale: 'es-MX',
      selectable: false,
      dayHeaders: false,
      eventClick: this.mostrarEvento.bind(this),
      eventsSet: this.handleEvents.bind(this),
      dayMaxEventRows: 3,
      titleFormat: { year: 'numeric', month: 'long' },
      datesSet: (event) => {
        this.tituloCapillas = [];
        let mesInicio = +moment(event.start).format('MM');
        let mesFinal = +moment(event.end).format('MM');
        if (mesFinal - mesInicio == 2) {
          this.fechaCalendario = moment(event.start).add(1, 'month');
        } else if (mesFinal === 1 && mesInicio === 11) {
          this.fechaCalendario = moment(event.start).add(1, 'month');
        } else if (mesFinal === 1 && mesInicio === 12) {
          this.fechaCalendario = moment(event.end);
        } else if (mesFinal === 2 && mesInicio === 12) {
          this.fechaCalendario = moment(event.start).add(1, 'month');
        } else {
          this.fechaCalendario = moment(event.start);
        }
        this.calendarioCapillas.getApi().removeAllEvents();
        if (this.velatorio) {
          this.consultarCapillas();
        }
      },
    }
  }

  cambiarMes(origen: string): void {
    this.capillasDetalle = [];
    this.tituloCapillas = [];
    let anio = moment(this.fechaCalendario).format('YYYY').toString();
    let mes = moment(this.fechaCalendario).format('MM').toString();
    this.calendarApi = this.calendarioCapillas.getApi();
    this.calendarApi.removeAllEvents();
    if (this.velatorio) {
      this.capillaReservacionService
        .consultaMes(mes, anio, this.velatorio)
        .pipe()
        .subscribe({
          next: (respuesta: HttpRespuesta<any>) => {
            this.loaderService.desactivar();
            this.calendarApi = this.calendarioCapillas.getApi();
            respuesta.datos.forEach((capilla: any) => {
              let bandera: boolean = false
              this.calendarApi.getApi().addEvent({
                id: capilla.idCapilla,
                title: capilla.nomCapilla,
                start: capilla.fechaEntrada,
                color: capilla.color,
              })
              this.tituloCapillas.forEach((tituloCapillas: any) => {
                if (tituloCapillas.id == capilla.idCapilla) {
                  bandera = true
                }
              })
              if (!bandera) {
                this.tituloCapillas.push({
                  borderColor: capilla.color,
                  textColor: capilla.color,
                  title: capilla.nomCapilla,
                  id: capilla.idCapilla,
                });
              }
            })
            this.tituloCapillas = [...this.tituloCapillas];
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
            this.alertaService.mostrar(TipoAlerta.Error, error.message);
          },
        })
    }
  }

  mostrarModal(selectInfo: DateSelectArg) {
    this.fechaSeleccionada = selectInfo.startStr
    this.actividadRef = this.dialogService.open(DetalleActividadDiaComponent, {
      header: 'Ver actividad del día',
      width: '920px',
      data: this.fechaSeleccionada,
    })
  }

  // mostrarEvento(clickInfo: EventClickArg) {
  //   this.fechaSeleccionada = clickInfo.event._def.publicId
  // }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  cambiarPestania(pestania: any): void {
    this.posicionPestania = pestania.index;
    this.consultarCapillas();
  }

  consultarCapillas(): void {
    let parametros = {
      anio: this.fechaCalendario.format('YYYY'),
      mes: this.fechaCalendario.format('MM'),
      idVelatorio: this.velatorio,
    }

    this.loaderService.activar();
    this.capillaReservacionService.consultarCapillas(parametros).pipe(finalize(() => this.loaderService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        respuesta.datos.forEach((capilla: any) => {
          let bandera: boolean = false
          this.calendarioCapillas.getApi().addEvent({
            id: capilla.idCapilla,
            title: capilla.nomCapilla,
            start: moment(capilla.fechaEntrada, "DD-MM-YYYY").format("YYYY-MM-DD"),
            color: capilla.color,
          });

          this.tituloCapillas.forEach((tituloCapillas: any) => {
            if (tituloCapillas.id == capilla.idCapilla) {
              bandera = true;
            }
          });
          if (!bandera) {
            this.tituloCapillas.push({
              borderColor: capilla.color,
              textColor: capilla.color,
              title: capilla.nomCapilla,
              id: capilla.idCapilla,
            });
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      },
    });
  }


  mostrarEvento(clickInfo: EventClickArg): void {
    const idCapilla: number = +clickInfo.event._def.publicId;
    this.fechaSeleccionada = moment(clickInfo.event._instance?.range.end).format('DD-MM-yyyy');
    this.actividadRef = this.dialogService.open(DetalleActividadDiaComponent, {
      header: 'Ver actividad del día',
      width: "920px",
      data: { fecha: this.fechaSeleccionada, idCapilla: idCapilla }
    })
  }

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = { nombreArchivo: "Disponibilidad de capillas" };
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }
    if (!this.velatorio) { return }
    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);
    this.descargaArchivosService.descargarArchivo(this.capillaReservacionService.generarReporte(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        console.log(respuesta)
      },
      error: (error) => {
        console.log(error)
      },
    })
  }

  descargarPDF(): void {
    const busqueda = this.filtrosArchivos("pdf");
    this.capillaReservacionService.generarReporte(busqueda).subscribe({
      next: (respuesta: any) => {
        const file = new Blob([respuesta], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(file);
        this.archivoRef = this.dialogService.open(PrevisualizacionArchivoComponent, {
          data: url,
          header: "",
          width: "920px",
        })
      }
    });
  }

  descargarExcel(): void {
    const busqueda = this.filtrosArchivos("xls");
    this.capillaReservacionService.generarReporte(busqueda).subscribe({
      next: (respuesta: any) => {
        const file = new Blob([respuesta], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' });
        const url = window.URL.createObjectURL(file);
        this.archivoRef = this.dialogService.open(PrevisualizacionArchivoComponent, {
          data: url,
          header: "",
          width: "920px",
        })
      }
    });
  }

  filtrosArchivos(tipoReporte: string) {
    return {
      idVelatorio: this.velatorio,
      mes: moment(this.fechaCalendario).format('MM').toString(),
      anio: moment(this.fechaCalendario).format('YYYY').toString(),
      rutaNombreReporte: "reportes/generales/ReporteVerificarDisponibilidadCapillas.jrxml",
      tipoReporte: tipoReporte
    }
  }

  cambiarDelegacion(): void {
    this.loaderService.activar();
    this.capillaReservacionService.obtenerCatalogoVelatoriosPorDelegacion(this.delegacion).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.velatorios = respuesta.datos.map((velatorio: VelatorioInterface) => (
          { label: velatorio.nomVelatorio, value: velatorio.idVelatorio })) || [];
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.actividadRef) {
      this.actividadRef.destroy();
    }
  }

}
