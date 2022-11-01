// eslint-disable-next-line no-useless-escape
const phoneNumberRegex = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i

// eslint-disable-next-line no-useless-escape
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

export default {
  type: "object",
  properties: {
    gender: {type: "string", enum: ["Male", "Female"]},
    firstName: {type: "string", format: "alpha"},
    lastName: {type: "string", format: "alpha"},
    password: {type: "string", minLength: 6},
    passwordConfirm: {type: "string"},
    phone: {type: "string", pattern: phoneNumberRegex},
    email: {type: "string", pattern: emailRegex},
    companyName: {type: "string", maxLength: 40},
    address: {type: "string"},
    city: {type: "string"},
    zipcode: {type: "string"},
    country: {type: "string", enum: ["France"]},
    category: {
      type: "string",
      enum: [
        "Bar & Restaurants",
        "Beauté/Relaxation/Santé",
        "Billeterie",
        "Services",
        "Shopping",
        "Sports & Loisirs",
        "Voyages",
        "Autre...",
      ],
    },
  },
  required: [
    "gender",
    "firstName",
    "lastName",
    "phone",
    "email",
    "password",
    "passwordConfirm",
    "companyName",
    "address",
    "city",
    "zipcode",
    "country",
    "category",
  ],
}
