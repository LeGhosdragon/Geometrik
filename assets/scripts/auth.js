import baseUrl from "./config.js";

 
//Classe d'authentification pour gérer la connexion, l'inscription et la gestion des jetons
class Auth {

    /** Constructeur pour l'authentification
    * 
    */
    constructor() {
        this.baseUrl = baseUrl;
        this.username = localStorage.getItem('username');
    }

    /** Permet à un utilisateur de se connecter
   * 
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   */
    async login(username, password) {
        try {
            const formData = new FormData();
            formData.append('identifiant', username);
            formData.append('passe', password);

            const response = await fetch(`${this.baseUrl}/connexion`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
        
            if (data.reussite) {
                localStorage.setItem('jeton', data.jeton);
                localStorage.setItem('username', username);
                if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
                }
                return data;
            } else {
                throw new Error(data.erreurs);
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    }

    /** Permet à un utilisateur de créer un compte
   * 
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   */
    async signup(username, password) {
        try {
            const formData = new FormData();
            formData.append('identifiant', username);
            formData.append('passe', password);

            const response = await fetch(`${this.baseUrl}/inscription`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
        
            if (data.reussite) {
                localStorage.setItem('jeton', data.jeton);
                localStorage.setItem('username', username);
                if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
                }
                return data;
            } else {
                throw new Error(Array.isArray(data.erreurs) ? data.erreurs[0] : data.erreurs);
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            throw error;
        }
    }

    /** Rafraîchit le jeton d'accès avec le refresh token
   * 
   */
    async refreshToken() {
        try {
            const refresh = this.getRefreshToken();
            if (!refresh) throw new Error('Refresh token manquant');

            const formData = new FormData();
            formData.append('refresh_token', refresh);

            const response = await fetch(`${this.baseUrl}/refresh-token`, {
                method: 'POST',
                body: formData
            });
        
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
        
            if (!data.reussite) {
                throw new Error(data.erreurs);
            }

            localStorage.setItem('jeton', data.jeton);
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
        
            return data.jeton;
        } catch (error) {
            console.error('Erreur de rafraîchissement du jeton:', error);
            this.logout();
            throw error;
        }
    }

    /** Récupère le jeton d'accès du localStorage
   * 
   * @returns {string|null} - Jeton d'accès
   */
    getAccessToken() { return localStorage.getItem('jeton'); }

    /** Récupère le refresh token du localStorage
     * 
     * @returns {string|null} - Refresh token
     */
    getRefreshToken() { return localStorage.getItem('refresh_token'); }

    /** Récupère le nom d'utilisateur du localStorage
     * @returns {string} - Nom d'utilisateur
     */
    getUsername() { return localStorage.getItem('username'); }

    /** Vérifie si l'utilisateur est authentifié
     * 
     * @returns {boolean} - True si l'utilisateur est authentifié
     */
    isAuthenticated() { return !!this.getAccessToken(); }

    /** Déconnecte l'utilisateur en supprimant les jetons
   * 
   */
    logout() {
        localStorage.removeItem('jeton');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
    }

    /** Effectue une requête authentifiée avec le jeton d'accès
   * 
   * @param {string} endpoint - Point de fin de l'API
   * @param {Object} options - Options de la requête fetch
   */
    async authenticatedRequest(endpoint, options = {}) {
        try {
            const token = this.getAccessToken();
            if (!token) {
                throw new Error('Utilisateur non authentifié');
            }
    
            // Si l'URL contient déjà des paramètres, ajoutez le jeton avec &, sinon avec ?
            const separator = endpoint.includes('?') ? '&' : '?';
            const urlWithToken = `${this.baseUrl}${endpoint}${separator}jeton=${token}`;
    
            // Si un formData est fourni, ajouter le jeton au formData
            if (options.body instanceof FormData) {
                options.body.append('jeton', token);
            }
    
            const response = await fetch(urlWithToken, options);
    
            if (response.status === 401) {
                // Token expiré, essayons de le rafraîchir
                const newToken = await this.refreshToken();
                
                // Mettre à jour l'URL avec le nouveau token
                const updatedUrl = `${this.baseUrl}${endpoint}${separator}jeton=${newToken}`;
                
                // Mettre à jour formData si présent
                if (options.body instanceof FormData) {
                    options.body.set('jeton', newToken);
                }
                
                // Réessayer la requête avec le nouveau token
                return fetch(updatedUrl, options);
            }
    
            return response;
        } catch (error) {
            console.error('Erreur de requête authentifiée:', error);
            throw error;
        }
    }
}

// Exporter une instance de la classe
export default new Auth();