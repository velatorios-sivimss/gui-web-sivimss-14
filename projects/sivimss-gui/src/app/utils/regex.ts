export const CURP: string = '^[A-Z]{4}[0-9]{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9][0-9]$';
export const EMAIL: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
export const PATRON_CONTRASENIA = /^(?!.*(\d)\1)(?!.*([a-zA-Z])\2)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;
