import { HttpRespuesta } from "projects/sivimss-gui/src/app/models/http-respuesta.interface";
import { Modulo } from "projects/sivimss-gui/src/app/services/autenticacion.service";

export const dummyMenuResponse:HttpRespuesta<Modulo[]> = {
  "error": false,
  "codigo": 200,
  "mensaje": "Exito",
  "datos": [
    {
      "idModuloPadre": null,
      "idModulo": "1",
      "idFuncionalidad": null,
      "titulo": "Administración de catálogos",
      "modulos": [
        {
          "idModuloPadre": "1",
          "idModulo": "2",
          "idFuncionalidad": "2",
          "titulo": "Administración de usuarios del sistema",
          "modulos": null
        },
        {
          "idModuloPadre": "1",
          "idModulo": "3",
          "idFuncionalidad": "3",
          "titulo": "Administrar roles con permisos",
          "modulos": null
        },
        {
          "idModuloPadre": "1",
          "idModulo": "4",
          "idFuncionalidad": "4",
          "titulo": "Administrar roles",
          "modulos": null
        },
        {
          "idModuloPadre": "1",
          "idModulo": "5",
          "idFuncionalidad": "5",
          "titulo": "Administrar capillas",
          "modulos": null
        },
        {
          "idModuloPadre": "1",
          "idModulo": "6",
          "idFuncionalidad": "6",
          "titulo": "Administración de artículos",
          "modulos": null
        },
        {
          "idModuloPadre": "1",
          "idModulo": "7",
          "idFuncionalidad": "7",
          "titulo": "Administración de servicios",
          "modulos": null
        },
        {
          "idModuloPadre": "1",
          "idModulo": "8",
          "idFuncionalidad": "8",
          "titulo": "Administración de velatorios",
          "modulos": null
        },
        {
          "idModuloPadre": "1",
          "idModulo": "10",
          "idFuncionalidad": "10",
          "titulo": "Administración de proveedores",
          "modulos": null
        },
        {
          "idModuloPadre": "1",
          "idModulo": "11",
          "idFuncionalidad": "11",
          "titulo": "Administrar usuarios contratantes",
          "modulos": null
        }
      ]
    },
    {
      "idModuloPadre": null,
      "idModulo": "9",
      "idFuncionalidad": "9",
      "titulo": "Reservar salas",
      "modulos": null
    }
  ]
}
