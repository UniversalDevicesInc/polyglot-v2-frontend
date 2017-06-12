// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  MQTT_HOST: '10.0.0.17',
  MQTT_PORT: '8083',
  PG_HOST: '10.0.0.75',
  PG_PORT: '3000',
  PG_URI: 'http://10.0.0.75:3000'
}
