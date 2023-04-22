export interface Kid {
	Nom: string,
	Prénom: string
}
export interface Pointage {
	Enfant: string,
	Arrivée: number
	Départ?: number
	Jour: { seconds: number }
	Commentaire?: string
}