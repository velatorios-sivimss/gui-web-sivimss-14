export interface Vehiculos {
  id?: number;
  velatorio?: string;
  fecha?: string;
  tamanio?: string;
  hora?: string;
  vehiculo?: string;
  placas?: string;
  nivelAceiteBajo?: boolean;
  nivelAgua?: boolean;
  calibracionNeumaticosTraseros?: number;
  calibracionNeumaticosDelanteros?: number;
  nivelCombustible?: number;
  nivelBateria?: number;
  limpiezaExterior?: number;
  limpiezaInterior?: number;
  codigoFalla?: number;
  estatusText?: string;
  estatus?: boolean;
  estatusNumber?: number;
  kilometraje?: string;
  tipoMantenimiento?: string;
  modalidad?: string;
  fechaMantenimiento?: string;
  nivelAceite?: number;
  marca?: string;
  anio?: string;
  modalidadNumber?: number;
  fechaRegistro?: string;
  tipoMantenimientoNumber?: number;


  }

  export interface ConfirmacionServicio {
    estatus?: boolean;
    origen?: string;
  }
