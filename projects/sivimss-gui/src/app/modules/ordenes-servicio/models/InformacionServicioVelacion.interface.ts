import { CodigoPostalIterface } from './CodigoPostal.interface';

export interface InformacionServicioVelacionInterface {
  fechaInstalacion: string | null;
  horaInstalacion: string | null;
  fechaVelacion: string | null;
  horaVelacion: string | null;
  idCapilla: number | null;
  cp: CodigoPostalIterface | null;
}
