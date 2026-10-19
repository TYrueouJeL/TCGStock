/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * French error messages, shown as-is by the web app.
 */
vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Ce champ est obligatoire.',
  'string': 'Ce champ doit être un texte.',
  'number': 'Ce champ doit être un nombre.',
  'minLength': 'Ce champ est trop court.',
  'maxLength': 'Ce champ est trop long.',
  'min': 'La valeur est trop petite.',
  'max': 'La valeur est trop grande.',
  'enum': 'Choisis une valeur de la liste.',
  'email': 'Adresse e-mail invalide.',
  'regex': 'Format invalide.',
  'withoutDecimals': 'Ce champ doit être un nombre entier.',
  'decimal': 'Deux décimales maximum.',
  'positive': 'La valeur doit être positive.',
  'sameAs': 'Les deux mots de passe ne correspondent pas.',
  'database.unique': 'Cette valeur est déjà utilisée.',
  'array.minLength': 'La liste est vide.',
  'password.minLength': 'Le mot de passe doit faire au moins 8 caractères.',
})
