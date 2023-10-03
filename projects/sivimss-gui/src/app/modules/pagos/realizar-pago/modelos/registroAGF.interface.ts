export interface RegistroAGF {
  idFinado: number,
  cveNSS: number,
  cveCURP: string,
  fecDefuncion: string,
  idVelatorio: number,
  idRamo: number,
  idTipoId: number,
  numIdentificacion: number,
  casillaCurp: boolean,
  casillaActDef: boolean,
  casillaCogf: boolean,
  casillaNssi: boolean,
  cveCURPBeneficiario: string,
  nombreBeneficiario: string,
  idPagoDetalle : number | null
}
