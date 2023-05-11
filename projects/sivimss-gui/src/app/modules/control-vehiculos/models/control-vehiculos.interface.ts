export interface BuscarVehiculosDisponibles {
  idVelatorio?: number,
  fecIniRepo?: string | null,
  fecFinRepo?: string | null,
  paginado?: number,
}

export interface ControlVehiculoListado {
  idVehiculo: number,
  disponible: number,
  descripcion: string,
  fecha?: string,
}

export interface ControlVehiculoConsulta {
  marca: string,
  nombreDestino: string,
  idVehiculo: string,
  nombreFinado: string,
  nombreContratante: string,
  folioODS: string,
  idODS: number,
  tarjetaCirculacion: string,
  modelo: string,
  placas: string,
  disponibilidad: number,
}