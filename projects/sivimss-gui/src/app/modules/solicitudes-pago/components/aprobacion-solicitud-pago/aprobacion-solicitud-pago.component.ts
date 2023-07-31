import {Component, OnInit} from '@angular/core';
import { DetalleSolicitudPago, PartidaPresupuestal } from '../../models/solicitud-pagos.interface';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import { SolicitudesPagoService } from '../../services/solicitudes-pago.service';
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type DetalleSolicPago = Required<DetalleSolicitudPago> & { id: string }

@Component({
  selector: 'app-aprobacion-solicitud-pago',
  templateUrl: './aprobacion-solicitud-pago.component.html',
  styleUrls: ['./aprobacion-solicitud-pago.component.scss']
})
export class AprobacionSolicitudPagoComponent implements OnInit {

  solicitarSolicitudPago: DetalleSolicitudPago[] = [];
  solicitudPagoSeleccionado!: any;
  id!: number;
  partidaPresupuestal: PartidaPresupuestal [] = [];

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.id = this.config.data;
    this.obtenerSolicPago(this.id);
    this.partidaPresupuestal = [
      {
        idPartida: 1,
        partidaPresupuestal: 'Solicitud de comprobación de bienes y servicios',
        cuentasContables: '000001',
        importeTotal: '000001',
      },
      {
        idPartida: 2,
        partidaPresupuestal: 'Solicitud de comprobación de bienes y servicios',
        cuentasContables: '000001',
        importeTotal: '000001',
      }
    ];
  }

  aceptar(): void {
    this.ref.close();
  }

  abrirModalAceptar(): void {
    this.ref.close();
  }

  obtenerSolicPago(id: number): void {
    this.solicitudPagoSeleccionado =
      {
        folio2: '000001',
        tipoSolicitud: 'Solicitud de comprobación de bienes y servicios',
        folioFiscal2: '000001',
        estatus2: 'Pendiente',
        ejerciFiscal2: '2021',
        fechaElaboracion2: '01/07/2023',
        unidadOpe: 'Referencia unidad operativa/administrativa',
        solicitadoPor: 'Jorge Sanchez Prado',
        referenciaTD2: '12133576',
        beneficiario2: 'Soluciones industriales',
        nombreDestinatario2: 'Edwin Ruiz Cardenas',
        nomRemitente2: 'Ricardo Quintero',
        concepto2: 'Gasto primario',
        cantidadLetra2: 'Venticinco mil quinientos pesos',
        observ2: 'No se presentan problemas de ningun tipo'
      }
    ;

  }
}
