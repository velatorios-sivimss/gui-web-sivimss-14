import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CalendarOptions, EventApi, EventClickArg} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {MENU_SALAS} from "../../constants/menu-salas";
import interactionPlugin from "@fullcalendar/interaction";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {CalendarioSalas} from "../../models/calendario-salas.interface";
import {VerActividadSalasComponent} from "../ver-actividad-salas/ver-actividad-salas.component";
import {ActivatedRoute} from "@angular/router";
import {VelatorioInterface} from "../../models/velatorio.interface";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {ReservarSalasService} from "../../services/reservar-salas.service";
import * as moment from 'moment';
import {Moment} from 'moment';
import {FullCalendarComponent} from "@fullcalendar/angular";
import {finalize} from "rxjs/operators";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";

@Component({
  selector: 'app-calendario-salas',
  templateUrl: './calendario-salas.component.html',
  styleUrls: ['./calendario-salas.component.scss'],
  providers: [DialogService,DescargaArchivosService]
})
export class CalendarioSalasComponent implements OnInit, OnDestroy{

  @ViewChild('calendarioCremacion') calendarioCremacion!: FullCalendarComponent;
  @ViewChild('calendarioEmbalsamamiento') calendarioEmbalsamamiento!: FullCalendarComponent;

  readonly POSICION_CATALOGO_DELEGACION = 0;

  fechaCalendario!: Moment;
  calendarApi:any;
  calendarEmbalsamamientoApi!: any;

  calendarOptions!: CalendarOptions;
  calendarEmbalsamamientoOptions!: CalendarOptions;
  velatorios: TipoDropdown[] = [];
  delegaciones: TipoDropdown[] = [];
  menu: string[] = MENU_SALAS;

  posicionPestania: number = 0;
  velatorio!: number ;
  delegacion!: number;

  base64:any;

  fechaSeleccionada: string = "";
  actividadRef!: DynamicDialogRef;

  tituloSalas: CalendarioSalas[] = [];
  salasDetalle: CalendarioSalas[] = [];
  currentEvents: EventApi[] = [];

  constructor(
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
    private route: ActivatedRoute,
    private reservarSalasService:ReservarSalasService,
    private descargaArchivosService: DescargaArchivosService
  ) {
  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    // this.velatorios = respuesta[this.POSICION_CATALOGO_VELATORIOS]!.datos.map((velatorio: VelatorioInterface) => (
    //   {label: velatorio.nomVelatorio, value: velatorio.idVelatorio} )) || [];

    this.delegaciones = respuesta[this.POSICION_CATALOGO_DELEGACION]!.map((delegacion: any) => (
      {label: delegacion.label, value: delegacion.value} )) || [];

    this.inicializarCalendario();
    this.inicializarCalendarioEmbalsamamiento();
  }

  inicializarCalendario(): void {
      this.calendarOptions = {
        headerToolbar: { end: "next", center: "title", start: "prev" },
        initialView: 'dayGridMonth',
        plugins: [dayGridPlugin,interactionPlugin],
        initialEvents: "",
        defaultAllDay: true,
        editable:false,
        locale: 'es-MX',
        selectable: false,
        dayHeaders:false,
        eventClick: this.mostrarEvento.bind(this),
        eventsSet: this.handleEvents.bind(this),
        dayMaxEventRows:3,
        titleFormat: { year: 'numeric', month: 'long' },
        datesSet: event => {
          let mesInicio = +moment(event.start).format("MM");
          let mesFinal =  +moment(event.end).format("MM");
          if(mesFinal - mesInicio == 2){
            this.fechaCalendario = moment(event.start).add(1,'month');
          }else{
            this.fechaCalendario = moment(event.start);
          }
          this.calendarioCremacion.getApi().removeAllEvents();
          if(this.velatorio) {this.cambiarMes()}
        },
      };
    }

  inicializarCalendarioEmbalsamamiento(): void {
    this.calendarEmbalsamamientoOptions = {
      headerToolbar: { end: "next", center: "title", start: "prev" },
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin,interactionPlugin],
      initialEvents: "",
      defaultAllDay: true,
      editable:false,
      locale: 'es-MX',
      selectable: false,
      dayHeaders:false,
      eventClick: this.mostrarEvento.bind(this),
      eventsSet: this.handleEvents.bind(this),
      dayMaxEventRows:3,
      titleFormat: { year: 'numeric', month: 'long' },
      datesSet: event => {
        let mesInicio = +moment(event.start).format("MM");
        let mesFinal =  +moment(event.end).format("MM");
        if(mesFinal - mesInicio == 2){
          this.fechaCalendario = moment(event.start).add(1,'month');
        }else{
          this.fechaCalendario = moment(event.start);
        }
        this.calendarioEmbalsamamiento?.getApi().removeAllEvents();
        if(this.velatorio) {this.cambiarMes()}
      },
    };
  }

  cambiarMes(): void {
    this.salasDetalle = [];
    this.tituloSalas = [];
    let anio = moment(this.fechaCalendario).format('YYYY').toString();
    let mes = moment(this.fechaCalendario).format('MM').toString();
    if(!this.posicionPestania){
      this.calendarApi = this.calendarioCremacion.getApi()
      this.calendarApi.removeAllEvents();
    }
    if(this.posicionPestania){
      this.calendarEmbalsamamientoApi = this.calendarioEmbalsamamiento.getApi();
      this.calendarEmbalsamamientoApi.removeAllEvents();
    }
    if(this.velatorio) {
      this.reservarSalasService.consultaMes(+mes,+anio,this.posicionPestania,this.velatorio).pipe(
      ).subscribe(
        (respuesta: HttpRespuesta<any>) => {
          respuesta.datos.forEach((sala: any) => {
            let bandera: boolean = false;
            if(!this.posicionPestania){
                this.calendarioCremacion.getApi().addEvent(
                  {id: sala.idSala,title: sala.nombreSala,start: sala.fechaEntrada,color:sala.colorSala},
                );
            }else{
              this.calendarioEmbalsamamiento.getApi().addEvent(
                {id: sala.idSala,title: sala.nombreSala,start: sala.fechaEntrada,color:sala.colorSala},
              );
            }
            this.tituloSalas.forEach((tituloSala : any) => {
              if(tituloSala.id == sala.idSala){
                bandera = true;
                return;
              }
            });
            if(!bandera){
              this.tituloSalas.push(
                {
                  borderColor: sala.colorSala,
                  textColor: sala.colorSala,
                  title: sala.nombreSala,
                  id:sala.idSala
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
    const idSala: number = +clickInfo.event._def.publicId;
    this.fechaSeleccionada =  moment(clickInfo.event._instance?.range.end).format('yyyy-MM-DD');
    this.actividadRef = this.dialogService.open(VerActividadSalasComponent,{
      header: 'Ver actividad del día',
      width: "920px",
      data: {fecha:this.fechaSeleccionada, idSala: idSala}
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
      this.calendarioEmbalsamamiento?.getApi().removeAllEvents();
      this.calendarioEmbalsamamiento?.getApi().gotoDate(new Date())
      if(this.velatorio){this.cambiarMes()}
    },300)
  }

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if(tipoReporte == "xls"){
      configuracionArchivo.ext = "xlsx"
    }
    if(!this.velatorio){return}
    if(!this.tituloSalas.length) {return}

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);

    this.descargaArchivosService.descargarArchivo(this.reservarSalasService.generarReporte(busqueda), configuracionArchivo).pipe(
        finalize( () => this.loaderService.desactivar())
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
      indTipoSala:this.posicionPestania,
      mes: moment(this.fechaCalendario).format('MM').toString(),
      anio: moment(this.fechaCalendario).format('YYYY').toString(),
      rutaNombreReporte: "reportes/generales/ReporteVerificarDisponibilidadSalas.jrxml",
      tipoReporte: tipoReporte
    }
  }

  cambiarDelegacion(): void {
    this.loaderService.activar();
    this.reservarSalasService.obtenerCatalogoVelatoriosPorDelegacion(this.delegacion).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>)=> {

        this.velatorios = respuesta.datos.map((velatorio: VelatorioInterface) => (
          {label: velatorio.nomVelatorio, value: velatorio.idVelatorio} )) || [];
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )

  }

  ngOnDestroy(): void {
    if(this.actividadRef){
      this.actividadRef.destroy();
    }
  }
}
