export interface VelacionDomicilioInterface {
  velatorio?: number;
  folioODS?: string;
  nombreContratante?: string;
  fechaSalida?: string;
  fechaEntrada?: string;
  responsableInstalacion?: string;
  totalArticulos?: number;
}

export interface EquipoVelacionInterface{
  nombreBienesArticulos?: string;
  cantidad?: number;
  observaciones?: string;
}
