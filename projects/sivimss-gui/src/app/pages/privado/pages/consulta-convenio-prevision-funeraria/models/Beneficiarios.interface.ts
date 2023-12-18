export interface Beneficiarios {
  idContratanteBeneficiarios: number;
  idParentesco: number;
  idPersona: number;
  nombreAfiliado: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string;
  velatorio: string;
  edad: number;
  rfc: string;
  curp: string;
  parentesco: string;
  correo: string;
  telefono: string;
  documento: string;
  actaNacimiento: string | null;
  ine: string | null;
}
