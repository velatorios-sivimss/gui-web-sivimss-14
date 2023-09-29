import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {ElementoBreadcrumb} from "../models/elemento-breadcrumb.interface";



@Injectable()
export class BreadcrumbService {
  private breadcrumbSubject = new BehaviorSubject<ElementoBreadcrumb[]>([]);

  obtenerObservable(): Observable<ElementoBreadcrumb[]> {
    return this.breadcrumbSubject.asObservable();
  }

  actualizar(elementoBreadcrumb: ElementoBreadcrumb[]) {
    this.breadcrumbSubject.next(elementoBreadcrumb);
  }

  limpiar(){
    this.breadcrumbSubject.next([]);
  }

  insertarElementoAlFinal(elementoBreadcrumb: ElementoBreadcrumb) {
    let nuevoBreadcrumb: ElementoBreadcrumb[] = [...this.breadcrumbSubject.getValue()];
    nuevoBreadcrumb.push(elementoBreadcrumb);
    this.breadcrumbSubject.next(nuevoBreadcrumb);
  }

  eliminarUltimoElemento() {
    let nuevoBreadcrumb: ElementoBreadcrumb[] = [...this.breadcrumbSubject.getValue()];
    nuevoBreadcrumb.pop();
    this.breadcrumbSubject.next(nuevoBreadcrumb);
  }
}
