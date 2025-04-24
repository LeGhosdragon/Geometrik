
import auth from './auth.js';

document.addEventListener('DOMContentLoaded', setupNav);
window.addEventListener('resize', setupNav);

/** Cette fonction initialise la barre de navigation et le menu mobile
* 
*/
function setupNav() {
  modifierBarreNav();
  initMobileNav();     
}

/** Cette fonction modifie la barre de navigation en fonction de l'état de connexion de l'utilisateur et si le menu mobile est ouvert ou non
 * 
 * @returns 
 */
function modifierBarreNav(){
  const isAuthenticated = auth.isAuthenticated();
  const username = auth.getUsername();
  const menuDiv = document.querySelector('.menu');
  const navBar = document.querySelector('nav');
  if (!navBar || !menuDiv) return;

  const isMobile = window.innerWidth <= 768;
  menuDiv.innerHTML = '';           // on vide
  document.querySelectorAll('#btn-deconnexion, #mobile-btn-deconnexion')
          .forEach(el => el.removeEventListener('click', handleLogout));

  if (isAuthenticated) {
    menuDiv.innerHTML = `
      <div class="item">
        <a href="#" class="link">
          <span id="nav-username">${username}</span>
          <svg viewBox="0 0 360 360" xml:space="preserve">
            <g id="SVGRepo_iconCarrier">
              <path
                id="XMLID_225_"
                d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
              ></path>
            </g>
          </svg>
        </a>
        <div class="submenu">
          <div class="submenu-item"><a href="account.html" class="submenu-link">Mon Compte</a></div>
          <div class="submenu-item"><a href="#" class="submenu-link" id="btn-deconnexion">Déconnexion</a></div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btn-deconnexion')
            .addEventListener('click', handleLogout);
  } else {
    menuDiv.innerHTML = `
      <div class="item">
                  <a href="#" class="link">
                    <span> Connexion </span>
                    <svg viewBox="0 0 360 360" xml:space="preserve">
                      <g id="SVGRepo_iconCarrier">
                        <path
                          id="XMLID_225_"
                          d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
                        ></path>
                      </g>
                    </svg>
                  </a>
                  <div class="submenu">
                    <div class="submenu-item">
                      <a href="login.html" class="submenu-link"> Se Connecter </a>
                    </div>
                    <div class="submenu-item">
                      <a href="signup.html" class="submenu-link"> S'inscrire </a>
                    </div>
                  </div>
                </div>
    `;
  }

  const navLeft = document.querySelector('.nav-left');
  if (!navLeft) return;

  // on retire les anciens items avant d'ajouter
  navLeft.querySelectorAll('.auth-mobile-item')
         .forEach(el => el.remove());

  if (isMobile) {
    if (isAuthenticated) {
      const accountItem = document.createElement('li');
      accountItem.className = 'auth-mobile-item';
      accountItem.innerHTML = `<a href="account.html">Mon Compte</a>`;
      navLeft.appendChild(accountItem);

      const logoutItem = document.createElement('li');
      logoutItem.className = 'auth-mobile-item';
      logoutItem.innerHTML = `<a href="#" id="mobile-btn-deconnexion">Déconnexion</a>`;
      navLeft.appendChild(logoutItem);

      document.getElementById('mobile-btn-deconnexion')
              .addEventListener('click', function(e){
        e.preventDefault();
        handleLogout();
      });
    } else {
      const loginItem = document.createElement('li');
      loginItem.className = 'auth-mobile-item';
      loginItem.innerHTML = `<a href="login.html">Se Connecter</a>`;
      navLeft.appendChild(loginItem);

      const signupItem = document.createElement('li');
      signupItem.className = 'auth-mobile-item';
      signupItem.innerHTML = `<a href="signup.html">S'inscrire</a>`;
      navLeft.appendChild(signupItem);
    }
  }
}

/** Cette fonction initialise le menu mobile et gère les événements de clic
 * 
 */
function initMobileNav(){
  const nav = document.querySelector('nav');
  if (!nav) return;

  // Vérifier si le hamburger existe déjà
  let hamburger = nav.querySelector('.hamburger');
  let overlay = document.querySelector('.overlay');
  
  // Créer le hamburger s'il n'existe pas
  if (!hamburger) {
    hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    nav.insertBefore(hamburger, nav.firstChild);
  }
  
  // Créer l'overlay s'il n'existe pas
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
  }

  // Toujours attacher les écouteurs d'événements
  hamburger.addEventListener('click', function() {
    document.querySelector('.nav-left').classList.toggle('active');
    overlay.classList.toggle('active');
    this.classList.toggle('active');
  });
  
  overlay.addEventListener('click', function() {
    document.querySelector('.nav-left').classList.remove('active');
    hamburger.classList.remove('active');
    this.classList.remove('active');
  });
  
  document.querySelectorAll('.nav-left a').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelector('.nav-left').classList.remove('active');
      hamburger.classList.remove('active');
      overlay.classList.remove('active');
    });
  });
}

/** Cette fonction gère la déconnexion de l'utilisateur et affiche une alerte de succès
 * 
 */
function handleLogout(){
  Swal.fire({
    title: 'Déconnexion',
    text: 'Vous êtes maintenant déconnecté',
    icon: 'success',
    confirmButtonText: 'OK'
  }).then(res => {
    if (res.isConfirmed) {
      auth.logout();
      window.location.href = '../pages/index.html';
    }
  });
}



