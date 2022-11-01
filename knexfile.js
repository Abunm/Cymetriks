module.exports = {
  development: {
    client: 'pg',
    connection: { //à remplir avec les informations de votre copie locale de la base de donnée 
	  host : 'localhost',
      user: 'winwin_user',
      database: 'winwin_dev',
	  password: '',
	  port: 5432,
    },
	migrations: {
		directory: __dirname + '/migrations',
	}
  },
  test: {
    client: 'pg',
    connection: {
      user: 'winwin_user',
      database: 'winwin_test'
    }
  },
  production: {
    client: 'pg',
    connection: {
	//a remplir avec les identifiants de la bdd heroku
	  host : 'ec2-63-33-239-176.eu-west-1.compute.amazonaws.com',
      user: 'vdnpihgdvwncih',
      database: 'd566c8814bkgji',
	  password: 'ccd7e7db02ffea404754a5bb0175c95d48eb421470672dde7f8100c09f616abf',
	  
	  port: 5432,
	  ssl: {rejectUnauthorized: false},
	},
  },
  
}

