<?php

    /**
     * Classe Router
     * 
     * Une classe de routeur simple pour gérer les requêtes HTTP et les acheminer vers les fonctions de rappel appropriées.
     * 
     * Une limitation connue est que les requêtes dynamiques ne gèrent qu'un seul paramètre ce qui signifie que les routes 
     * comme /user/{id}/post/{postId} ne sont pas prises en charge.
     * 
     */
    class Router {

        /**
         * @var array $routes Tableau pour stocker les routes.
         */
        private $routes = [];

        /**
         * Ajouter une route au routeur.
         * 
         * @param string $methode Méthode HTTP (GET, POST, PUT, DELETE).
         * @param string $route Modèle de route avec des paramètres optionnels entre accolades (par exemple, /user/{id}).
         * @param callable $callback Fonction de rappel pour gérer la route.
         */
        public function addRoute($methode, $route, $callback) {
            $this->routes[] = [
                'methode' => strtoupper($methode),
                'route' => $route,
                'callback' => $callback
            ];
        }

        /**
         * Distribuer la requête à la fonction de rappel de route appropriée.
         * 
         * @param string $requestUri L'URI de la requête.
         * @param string $methode La méthode de la requête (GET, POST, PUT, DELETE).
         * @return mixed Le résultat de la fonction de rappel ou une réponse 404.
         */
        public function dispatch($requestUri, $methode) {
            //echo `<h1>8888888888888888888888888888888888888888888888888888888888888888888888888888888888</h1>`;

            // Obtenir le chemin du script (p. ex., /nom_dossier/index.php)
            $scriptName = dirname($_SERVER['SCRIPT_NAME']);
            //echo `<h1>1888888888888888888888888888888888888888888888888888888888888888888888888888888888</h1>`;

            // Retirer le chemin du script du chemin de l'URI
            $requestUri = str_replace($scriptName, '', $requestUri);

            // Retirer les paramètres de la requête (p. ex., ?id=1)
            $requestUri = parse_url($requestUri, PHP_URL_PATH);

            // Parcourir les routes et vérifier si l'une correspond à l'URI
            foreach ($this->routes as $route) {

                // Quitter rapidement si la méthode HTTP ne correspond pas
                if ($route['methode'] !== strtoupper($methode)) {
                    continue;
                }

                // Convertir la route en expression régulière
                $pattern = $this->route2Regex($route['route']);

                // Vérifier si la route correspond à l'URI
                if (preg_match($pattern, $requestUri, $matches)) {

                    // Retirer le premier élément qui correspond à l'URI complète
                    $params = array_slice($matches, 1);
                    
                    // Appeler la fonction de rappel et passer les paramètres    
                    return call_user_func_array($route['callback'], $params);
                
                }

            }
        
            // Si aucune route n'est trouvée, retourner une réponse 404
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Route non trouvée']);        
        }
        
        /**
         * Convertir une route en expression régulière.
         * 
         * @param string $route La route à convertir.
         * @return string L'expression régulière correspondante.
         */
        private function route2Regex($route) {
            return '/^' . preg_replace('/\{[^\}]+\}/', '([^\/]+)', str_replace('/', '\/', $route)) . '$/';
        }

        /**
         * Méthode utilitaire pour l'ajout d'une route GET.
         * 
         * @param string $route Modèle de route.
         * @param callable $callback Fonction de rappel pour gérer la route.
         */
        public function get($route, $callback) {
            $this->addRoute('GET', $route, $callback);
        }

        /**
         * Méthode utilitaire pour l'ajout d'une route POST.
         * 
         * @param string $route Modèle de route.
         * @param callable $callback Fonction de rappel pour gérer la route.
         */
        public function post($route, $callback) {
            $this->addRoute('POST', $route, $callback);
        }

        /**
         * Méthode utilitaire pour l'ajout d'une route PUT.
         * 
         * @param string $route Modèle de route.
         * @param callable $callback Fonction de rappel pour gérer la route.
         */
        public function put($route, $callback) {
            $this->addRoute('PUT', $route, $callback);
        }

        /**
         * Méthode utilitaire pour l'ajout d'une route DELETE.
         * 
         * @param string $route Modèle de route.
         * @param callable $callback Fonction de rappel pour gérer la route.
         */
        public function delete($route, $callback) {
            $this->addRoute('DELETE', $route, $callback);
        }
    }




/*

    <?php

    require_once 'Router.php';

    // Instancier le routeur
    $router = new Router();

    // Route GET statique vers la racine
    $router->get('/', function() {
        echo "Bienvenue à la page d'acceuil!";
    });

    // Route GET dynamique avec l'identifiant de l'utilisateur
    $router->get('/user/{id}/', function($id) {
        echo "Identifiant : " . htmlspecialchars($id);
    });

    // Route POST pour créer un utilisateur
    $router->post('/user', function() {

        // Récupérer les données de la requête et valider
        $data = file_get_contents('php://input');
        $userData = json_decode($data, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "Erreur: Données JSON invalides.";
            return;
        }
        
        if ($userData === null) {
            echo "Erreur: Les données de l'usager sont invalides.";
            return;
        }

        // Traiter de la requête
        if (isset($userData['nom'])) {
            echo "Usager créé avec le nom : " . htmlspecialchars($userData['nom']);
        } else {
            echo "Erreur: Il manque le nom.";
        }

    });

    // Mise à jour de l'utilisateur par identifiant
    $router->put('/user/{id}', function($id) {

        // Récupérer les données de la requête et valider
        $data = file_get_contents('php://input');
        $userData = json_decode($data, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "Erreur: Données JSON invalides.";
            return;
        }
        
        if ($userData === null) {
            echo "Erreur: Les données de l'usager sont invalides.";
            return;
        }

        // Traiter de la requête
        if (isset($userData['nom'])) {
            echo "Usager " . htmlspecialchars($id) . " mis à jour avec le nom: " . htmlspecialchars($userData['nom']);
        } else {
            echo "Erreur: Il manque le nom.";
        }
    });

    // Supprimer un utilisateur par identifiant
    $router->delete('/user/{id}', function($id) {
        echo "L'usager " . htmlspecialchars($id) . " fut supprimé.";
    });

    // Afficher tous les utilisateurs
    $router->get('/users', function() {
        
        // Données de test simulant une base de données
        $users = [
            ['id' => 1, 'nom' => 'Frédéric Gendron'],
            ['id' => 2, 'nom' => 'Amina Bouhoum']
        ];
        
        // Répondre avec les données en format JSON
        header('Content-Type: application/json');

        echo json_encode($users);
    
    });

    // Acheminer la requête
    $router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);

?>
*/

?>