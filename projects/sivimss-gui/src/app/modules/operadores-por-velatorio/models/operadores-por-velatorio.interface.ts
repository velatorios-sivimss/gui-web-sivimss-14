export interface OperadoresPorVelatorio {
  id?: number;
  curp?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  numeroEmpleado?: string;
  matricula?: number;
  fechaNaciemiento?: string;
  entidadFederativa?: number;
  fechaIngreso?: string;
  fechaBaja?: string;
  sueldoBase?: number;
  velatorio?: number;
  descVelatorio?: string;
  diasDescanso?:number[];
  descDiasDescanso?: string;
  antiguedad?: number;
  descAntiguedad?: string;
  correoElectronico?: string;
  puesto?: string;
  estatus?: boolean;
  categoria?: string;
}
