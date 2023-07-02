import { CodigoPostalIterface } from "./CodigoPostal.interface";

export interface ContratanteInterface {
    idPersona: number | null;
    idContratante: number | null;
    matricula: string | null;
    rfc: string | null;
    curp: string | null;
    nomPersona: string | null;
    primerApellido: string | null;
    segundoApellido: string | null;
    sexo: string | null;
    otroSexo: string | null;
    fechaNac: string | null;
    idPais: string | null;
    idEstado: string | null;
    telefono: string | null;
    correo: string | null;
    cp: CodigoPostalIterface;

}