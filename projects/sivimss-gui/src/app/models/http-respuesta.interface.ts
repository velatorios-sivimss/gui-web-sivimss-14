export interface HttpRespuesta<T> {
    error: boolean;
    codigo: number;
    mensaje: string;
    datos: T;
    [x: string]: any;
}