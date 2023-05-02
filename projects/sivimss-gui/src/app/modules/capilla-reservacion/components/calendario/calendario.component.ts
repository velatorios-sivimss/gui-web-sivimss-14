import {Component, OnInit, ViewChild} from '@angular/core';
// import dayGridPlugin from "@fullcalendar/daygrid";
import {CalendarOptions, DateSelectArg, EventApi, EventClickArg} from "@fullcalendar/core";
// import interactionPlugin from '@fullcalendar/interaction';
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {DetalleActividadDiaComponent} from "../detalle-actividad-dia/detalle-actividad-dia.component";
// import {FullCalendarComponent} from "@fullcalendar/angular";

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  providers: [DialogService]
})

export class CalendarioComponent implements OnInit {

  @ViewChild('calendar')
  // calendarComponent!: FullCalendarComponent;

  calendarOptions!: CalendarOptions;

  fechaSeleccionada: string = "";

  actividadRef!: DynamicDialogRef;

  registros: Array<any> = [
    { title: '1- Ignacio Allende', date: '2023-04-04',textColor:"#217A6B", color:"#fff", borderColor: '#217A6B' },
    { title: '2- Ignacio Allende', date: '2023-04-04',textColor:"#217A6B", color:"#fff", borderColor: '#217A6B' },
    { title: '3- Ignacio Allende', date: '2023-04-04',textColor:"#217A6B", color:"#fff", borderColor: '#217A6B' },
    { title: '4- Miguel Hidalo', date: '2023-04-04',textColor:"#5E217A", color:"#fff", borderColor: '#5E217A' },
    { title: '5- Ignacio Allende', date: '2023-04-04',textColor:"#217A6B", color:"#fff", borderColor: '#217A6B' },
    { title: '6- Sor Juana Inés', date: '2023-04-04',textColor:"#E18F2D", color:"#fff", borderColor: '#E18F2D' },
    { title: '7- Ignacio Allende', date: '2023-04-04',textColor:"#217A6B", color:"#fff", borderColor: '#217A6B' },
    { title: '1- Miguel Hidalo', date: '2023-04-05',textColor:"#5E217A", color:"#fff", borderColor: '#5E217A' },
    { title: '1- Sor Juana Inés', date: '2023-04-06',textColor:"#E18F2D", color:"#fff", borderColor: '#E18F2D' }
  ];

  constructor(
    public dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.inicializarCalendario();
  }

  inicializarCalendario(): void {
    this.calendarOptions = {
      headerToolbar: { end: "", start: "prev,next" },
      initialView: 'dayGridMonth',
      // plugins: [interactionPlugin, dayGridPlugin],
      initialEvents: this.registros,
      defaultAllDay: true,
      select: this.mostrarModal.bind(this),
      locale: 'es-MX',
      selectable: true,
      editable: false,
      dayHeaders:false,
      eventClick: this.mostrarEvento.bind(this),
      dayMaxEventRows:3,
    }
  }

  mostrarModal(selectInfo: DateSelectArg) {
    this.fechaSeleccionada = selectInfo.startStr;
    this.actividadRef = this.dialogService.open(DetalleActividadDiaComponent,{
      header: 'Ver actividad del día',
      width: "920px",
      data: this.fechaSeleccionada
    })
  }

  mostrarEvento(clickInfo: EventClickArg) {
    this.fechaSeleccionada = clickInfo.event._def.publicId;
  }
}



