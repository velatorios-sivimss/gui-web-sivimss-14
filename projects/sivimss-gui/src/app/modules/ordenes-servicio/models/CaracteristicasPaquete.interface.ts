import { DetallePaqueteInterface } from './DetallePaquete.interface';

export interface CaracteristicasPaqueteInterface {
  idPaquete: number | null;
  otorgamiento: number | null;
  detallePaquete: Array<DetallePaqueteInterface> | null;
}
