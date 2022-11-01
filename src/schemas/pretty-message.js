export default function prettyMessage(label, error) {
  switch (error.message) {
    case "is required":
      return `Le champs '${label}' est requis`
    case "pattern mismatch":
      return `'${label}' invalide`
    case "does not conform to: alpha":
      return `Le champs '${label}' doit-être seulement composé de lettres alphabétiques`
    case "has less length than allowed":
      return "Le mot de passe n'est pas assez long"
    case "has longer length than allowed":
      return `Pas plus de ${error.schema.maxLength} caractères`
    default:
      return error.message
  }
}
