// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  api: {
<<<<<<< HEAD
    //  mssivimss: 'mssivimss-ctrol-permisos/v1/sivimss/service/',
    //login: 'mssivimss-oauth/v1',
=======
    mssivimss: 'mssivimss-ctrol-permisos/v1/sivimss/service/',
    login: 'mssivimss-oauth/v1',
    loginContratante: 'mssivimss-oauth-online/v1',
>>>>>>> 6d4bc21827f2e25546fd5a608b5775f5cd0acc3d
    servicios_externos: 'mssivimss-ser-externos/v1/catalogos/externos/',
    servicios_externos_reportes: 'mssivimss-ser-externos/v1/reportes/',
    //notificaciones: 'mssivimss-notificaciones/v1/notificaciones/avisos',

<<<<<<< HEAD
    mssivimss:
      'http://localhost:8081/mssivimss-ctrol-permisos/v1/sivimss/service/',
    login: 'https://sivimss-ds.apps.ocp.imss.gob.mx/mssivimss-oauth/v1',
=======
    // mssivimss: 'https://sivimss-ds.apps.ocp.imss.gob.mx/mssivimss-ctrol-permisos/v1/sivimss/service/',
    // login: 'https://sivimss-ds.apps.ocp.imss.gob.mx/mssivimss-oauth/v1',
    // loginContratante: 'http://localhost:8085/mssivimss-oauth/v1',
>>>>>>> 6d4bc21827f2e25546fd5a608b5775f5cd0acc3d
    // servicios_externos: 'http://sivimss-ds.apps.ocp.imss.gob.mx/mssivimss-ser-externos/v1/catalogos/externos/',
    // servicios_externos_reportes: 'http://sivimss-ds.apps.ocp.imss.gob.mx/mssivimss-ser-externos/v1/reportes/',
    notificaciones:
      'https://sivimss-ds.apps.ocp.imss.gob.mx/mssivimss-notificaciones/v1/notificaciones/avisos',

    conveniosPF: 'http://localhost:8001/mssivimss-ods-prefune-on/v1/',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
