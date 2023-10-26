export const NOMBRE_REPORTES: string[] = [
  "Reporte de órdenes de servicio",
  "Concentrado de Facturas",
  "Reporte resumen pago proveedor",
  "Reporte detalle pago",
  "Reporte detalle importe-servicios",
  "Reporte de Comisiones de Promotores",
  "Reporte de servicios velatorio",
  "Concentrado de Siniestros de Previsión Funeraria",
  "Concentrado de Servicios Pago Anticipado"
]

export const NOMBRE_ENDPOINT:Map<number, any> = new Map(
  [
    [1,	"/genera-reporte-ods"],
    [2,	"/generar_reporte_facturas"],
    [3,	"/reporte-pago-prov"],
    [4,	"/reporte-det-pago"],
    [5,	"/reporte-detalle-is"],
    [6,	"/generar-reporte-comsiones"],
    [7,	"/reporte-serv-vel"],
    [8,	"/reporte-siniestros-pf"],
    [9,	"/pago-anticipado-descargar-reporte-pa"]
  ]
)

