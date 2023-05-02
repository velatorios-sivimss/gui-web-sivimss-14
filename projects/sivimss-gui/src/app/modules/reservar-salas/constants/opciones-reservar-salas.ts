export interface SelectButtonOptions {
    icon: string
    justify: string,
    route: string
}

export const OpcionesReservarSalas: SelectButtonOptions[] = [
    {
        icon: 'fs fs-barras-horizontales',
        justify: 'Center',
        route: 'salas',
    },
    {
        icon: 'fs fs-calendario',
        justify: 'Center',
        route: 'calendario'
    },
]
