export interface Vehiculos {
  anio?: string;
  calibracionNeumaticosDelanteros?: number;
  calibracionNeumaticosTraseros?: number;
  codigoFalla?: number;
  estatus?: boolean;
  estatusNumber?: number;
  estatusText?: string;
  fecha?: string;
  fechaMantenimiento?: string;
  fechaRegistro?: string;
  hora?: string;
  id?: number;
  kilometraje?: string;
  limpiezaExterior?: number;
  limpiezaInterior?: number;
  marca?: string;
  modalidad?: string;
  modalidadNumber?: number;
  nivelAceite?: number;
  nivelAceiteBajo?: boolean;
  nivelAgua?: boolean;
  nivelBateria?: number;
  nivelCombustible?: number;
  placas?: string;
  tamanio?: string;
  tipoMantenimiento?: string;
  tipoMantenimientoNumber?: number;
  vehiculo?: string;
  velatorio?: string;
}

export interface ConfirmacionServicio {
  estatus?: boolean;
  origen?: string;
}
