<?php
    session_start();
    require_once 'Router.php';
    include_once '../includes/conection.php';
    

    // Instancier le routeur
    $router = new Router();

    // Route GET statique vers la racine
    // $router->get('/index.php/', function() {
    //     echo "Bienvenue à la page d'acceuil!";
    // });

    $router->post('/index.php/login', function() {
        //echo 'gayer barely know her';
        // Récupérer les données de la requête et valider
        $data = file_get_contents('php://input');
        $userData = json_decode($data, true);

    
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(["reponse" => false, "message" => "Erreur: Données JSON invalides."]);
            return;
        }
    
        if ($userData === null) {
            echo json_encode(["reponse" => false, "message" => "Erreur: Les données de l'usager sont invalides."]);
            return;
        }
    
        $identifiant = trim($userData['identifiant']); 
        $motDePasse = $userData['mot_de_passe']; 
    
        $config = [
            'host' => '127.0.0.1',
            'dbname' => 'labo5',
            'username' => 'root',
            'password' => '',
        ];
    
    
        // Options de connexion
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,     
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC             
        ];


    
        // Instancier la connexion
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
            $config['username'],
            $config['password'],
            $options
        );

      
    
        $stmt = $pdo->prepare("SELECT id, identifiant, mot_de_passe FROM usagers WHERE identifiant = :identifiant"); 
        $stmt->execute([':identifiant' => $identifiant]); 
        $user = $stmt->fetch(PDO::FETCH_ASSOC);    
    
        if ($user) {
            if (password_verify($motDePasse, $user['mot_de_passe'])) { 
                $_SESSION['identifiant'] = $user['identifiant']; 
                $_SESSION['user_id'] = $user['id']; 
                echo json_encode(["reponse" => true]);
                //exit();
            } else {
                $_SESSION['erreur'] = "Identifiant ou mot de passe incorrect."; 
                echo json_encode(["reponse" => false, "message" => "Identifiant ou mot de passe incorrect."]);
                //exit();
            }
        } else {
            $_SESSION['erreur'] = "Identifiant ou mot de passe incorrect."; 
            echo json_encode(["reponse" => false, "message" => "Identifiant ou mot de passe incorrect."]);
            //exit();
        }
        
    });
    
    // Acheminer la requête
    $router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
?>
