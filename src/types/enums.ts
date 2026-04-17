export type TipoPension = "SIN_CABALLO" | "RESERVA_ESCUELA" | "CABALLO_PROPIO";
export type CuotaPension = "ENTERA" | "MEDIA" | "TERCIO";
export type EspecialidadClase =
  | "ADIESTRAMIENTO"
  | "EQUINOTERAPIA"
  | "EQUITACION"
  | "MONTA";
export type EstadoClase =
  | "PROGRAMADA"
  | "INICIADA"
  | "COMPLETADA"
  | "CANCELADA"
  | "ACA"
  | "ASA"
  | "RESERVADA";
export type TipoCaballo = "ESCUELA" | "PRIVADO";

export type FormaPago = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTRO";

export type EstadoAbono = "ACTIVO" | "VENCIDO" | "PAUSADO" | "CANCELADO";

export type EstadoFactura = "PENDIENTE" | "PAGADA" | "PARCIAL" | "ANULADA";

export type ModalidadClase = 
  | "SESION" 
  | "SESIONES_30" 
  | "SESIONES_SABADOS_30" 
  | "SEMANA" 
  | "SABADOS" 
  | "SEMANA_SABADOS";

export type TipoClase = 
  | "EQUINOTERAPIA" 
  | "ESCUELA_MENOR_6" 
  | "ESCUELA_MAYOR_6" 
  | "PENSIONADOS_PRIVADOS" 
  | "OTROS";
