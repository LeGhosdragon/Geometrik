//Changer la variable ENV = 'dev' si on travaille en local host et 'serveur' pour le serveur d'Antoine

const ENV = 'dev';

const baseUrl = (ENV === 'dev')
    ? 'http://localhost/H2025_TCH099_02_S1/api/api.php'
    : 'https://nexbit.ca/geometrik/api.php';

export default baseUrl;

