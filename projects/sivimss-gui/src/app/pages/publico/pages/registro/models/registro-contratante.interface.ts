import { Contratante } from "./contratante.interface";
import { Domicilio } from "./domicilio.interface";

export interface RegistrarContratante {
    nombre?: string;
    paterno?: string;
    materno?: string;
    rfc?: string | null;
    nss?: string | null;
    curp?: string;
    numSexo?: number;
    otroSexo?: string | null,
    fecNacimiento?: string| null,
    idPais?: number | null;
    idLugarNac?: number | null;
    tel?: string;
    telFijo?: string | null;
    correo?: string;
    domicilio?: Domicilio;
    contratante?: Contratante;
}