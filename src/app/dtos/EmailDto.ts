/**
 * Modello dell'email
 */
export interface EmailDto {
    id: number,
    from: string,
    to: string,
    createdAt: string,
    subject: string,
    message: string,
    readed: boolean
}