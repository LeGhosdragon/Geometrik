//Changer la variable ENV = 'dev' si on travaille en local host et 'serveur' pour le serveur d'Antoine

const ENV = 'dev';

const baseUrl = (ENV === 'dev')
    ? 'http://localhost/api'
    : 'https://nexbit.ca';

export default baseUrl;

