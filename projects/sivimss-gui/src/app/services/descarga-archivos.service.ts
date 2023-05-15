import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { OpcionesArchivos } from "../models/opciones-archivos.interface";

@Injectable()
export class DescargaArchivosService {

  readonly pdf_ext = { 'application/pdf': ['.pdf'] };
  readonly pdf_nom = "PDF";
  readonly excel_ext = { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] };
  readonly excel_nom = "Excel workbook";

  constructor() {
  }

  base64_2Blob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    return blob;
  }

  obtenerContentType(options: OpcionesArchivos = {}): string {
    const ext: "pdf" | "xlsx" = options.ext || "pdf";
    return ext === "pdf" ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  descargarArchivo(archivo$: Observable<Blob>, options: OpcionesArchivos = {}) {
    const nombreArchivo: string = options.nombreArchivo || "documento";
    const ext: "pdf" | "xlsx" = options.ext || "pdf";
    const configuracion: SaveFilePickerOptions = {
      suggestedName: `${nombreArchivo}.${ext}`,
      types: [
        {
          description: ext === "pdf" ? this.pdf_nom : this.excel_nom,
          accept: ext === "pdf" ? this.pdf_ext : this.excel_ext
        },
      ],
    };
    return archivo$.pipe(
      switchMap((archivoBlob: Blob) => {
        return window.showSaveFilePicker(configuracion).then((fileHandle: FileSystemFileHandle) => {
          return fileHandle.createWritable().then((writable: FileSystemWritableFileStream) => {
            writable.write(archivoBlob);
            writable.close();
            console.log('Archivo guardado correctamente.');
            return true;
          });
        });
      }),
      catchError((error) => {
        throw 'Error al guardar el archivo:';
      })
    );
  }
}
