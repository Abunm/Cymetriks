const dbConfigs = require('../knexfile')

const dbConfig = () => {
  if (process.env.NODE_ENV === "production") {
    return dbConfigs.production
  } else {
    return dbConfigs.development
  }
}
const knex = require('knex')(dbConfig())

knex('config').insert([{
  name: 'Envoyer un commentaire',
  value: 'contact@winwin-app.com',
  metric: 'email',
}, {
  name: 'Confidentialité',
  value: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sollicitudin urna mauris, non pellentesque justo accumsan vel.
Aenean eleifend, mi vel finibus dapibus, magna risus ullamcorper dui, non tempor ipsum orci non dui. Duis magna purus, volutpat imperdiet risus vel, malesuada volutpat felis.

Maecenas dapibus facilisis dolor, lobortis placerat ante imperdiet ac. Duis pretium purus ex, in efficitur ante bibendum sed. Etiam porta, neque ut pharetra varius, enim eros scelerisque ligula, ut maximus sapien neque nec turpis.
  `,
  metric: 'text',
}, {
  name: 'Termes générales',
  value: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sollicitudin urna mauris, non pellentesque justo accumsan vel.
Aenean eleifend, mi vel finibus dapibus, magna risus ullamcorper dui, non tempor ipsum orci non dui. Duis magna purus, volutpat imperdiet risus vel, malesuada volutpat felis.

Maecenas dapibus facilisis dolor, lobortis placerat ante imperdiet ac. Duis pretium purus ex, in efficitur ante bibendum sed. Etiam porta, neque ut pharetra varius, enim eros scelerisque ligula, ut maximus sapien neque nec turpis.
  `,
  metric: 'text',
}, {
  name: 'Aide',
  value: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sollicitudin urna mauris, non pellentesque justo accumsan vel.
Aenean eleifend, mi vel finibus dapibus, magna risus ullamcorper dui, non tempor ipsum orci non dui. Duis magna purus, volutpat imperdiet risus vel, malesuada volutpat felis.

Maecenas dapibus facilisis dolor, lobortis placerat ante imperdiet ac. Duis pretium purus ex, in efficitur ante bibendum sed. Etiam porta, neque ut pharetra varius, enim eros scelerisque ligula, ut maximus sapien neque nec turpis.
  `,
  metric: 'text',
}, {
  name: 'Licenses',
  value: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sollicitudin urna mauris, non pellentesque justo accumsan vel.
Aenean eleifend, mi vel finibus dapibus, magna risus ullamcorper dui, non tempor ipsum orci non dui. Duis magna purus, volutpat imperdiet risus vel, malesuada volutpat felis.

Maecenas dapibus facilisis dolor, lobortis placerat ante imperdiet ac. Duis pretium purus ex, in efficitur ante bibendum sed. Etiam porta, neque ut pharetra varius, enim eros scelerisque ligula, ut maximus sapien neque nec turpis.
  `,
  metric: 'text',
}]).then(res => console.log(res)).catch(err => console.error(err))
