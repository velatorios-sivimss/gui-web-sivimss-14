export interface VehiculoMantenimiento {
  DESCRIPCION: string,
  DES_MARCA: string,
  DES_MODALIDAD: string,
  DES_MODELO: string,
  DES_MTTOESTADO: string,
  DES_MTTO_TIPO: string,
  DES_NIVELOFICINA: string,
  DES_NUMMOTOR: string,
  DES_NUMSERIE: string,
  DES_PLACAS: string,
  DES_SUBMARCA: string,
  DES_USO: string,
  ID_OFICINA: number,
  ID_USOVEHICULO: number,
  ID_VEHICULO: number,
  ID_VELATORIO: number,
  IMPORTE_PRIMA: number,
  IND_ESTATUS: boolean,
  DES_VELATORIO: string,
  TOTAL: number,
  ID_MTTO_SOLICITUD: number,
  ID_MTTOVERIFINICIO: number,
  ID_MTTO_REGISTRO: number,
  ID_MTTOVEHICULAR: number,
  verificacionDia: string,
  DES_DELEGACION: string
  // Campos faltantes
  KILOMETRAJE?: string,
  FECHA_MANTENIMIENTO?: string,
}
