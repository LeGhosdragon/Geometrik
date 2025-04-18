document.addEventListener('DOMContentLoaded', function(){
  /** 
   * Cette fonction permet de modifier la barre de navigation
   */
  function modifierBarreNav(){
    // Récupère le jeton
    const jeton = localStorage.getItem('jeton');
    const username = localStorage.getItem('username');
    // Récupère le menu
    const menuDiv = document.querySelector('.menu');
    // Récupère la barre de navigation
    const navBar = document.querySelector('nav');
    // Affiche la barre de navigation
    console.log(navBar)
    console.log(jeton)
    // Si la barre de navigation n'existe pas
    if (!navBar) {
      // Affiche un message
      console.log("No Barro Navigationo");
      return;
    }

    const isMobile = window.innerWidth <= 768;
    // Si le jeton existe

    if (jeton) {
      menuDiv.innerHTML = `
          <div class="item">
            <a href="#" class="link" id="user-menu-link">
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
                <div class="submenu-item">
                    <a href="account.html" class="submenu-link"> Mon Compte </a>
                </div>
                <div class="submenu-item">
                    <a href="#" class="submenu-link" id="btn-deconnexion"> Déconnexion </a>
                </div>
            </div>
        </div>
      `;


        document.getElementById('btn-deconnexion').addEventListener('click', function(e){
            e.preventDefault();
              // Ajout de SweetAlert2 pour confirmer la déconnexion
              Swal.fire({
              title: 'Déconnexion',
              text: 'Vous êtes maintenant déconnecté',
              icon: 'success',
              confirmButtonText: 'OK'
              }).then((result) => {
              if (result.isConfirmed) {
                localStorage.removeItem('jeton');
                  window.location.href = '../pages/index.html';
              }
              });
        });
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
    if (isMobile) {
      const navLeft = document.querySelector('.nav-left');
      
      // Si l'utilisateur est connecté
      if (jeton) {
          const accountItem = document.createElement('li');
          accountItem.innerHTML = `<a href="account.html">Mon Compte</a>`;
          navLeft.appendChild(accountItem);
          
          const logoutItem = document.createElement('li');
          logoutItem.innerHTML = `<a href="#" id="mobile-btn-deconnexion">Déconnexion</a>`;
          navLeft.appendChild(logoutItem);
          
          document.getElementById('mobile-btn-deconnexion').addEventListener('click', function(e) {
              e.preventDefault();
              Swal.fire({
                  title: 'Déconnexion',
                  text: 'Vous êtes maintenant déconnecté',
                  icon: 'success',
                  confirmButtonText: 'OK'
              }).then((result) => {
                  if (result.isConfirmed) {
                    localStorage.removeItem('jeton');
                      window.location.href = '../pages/index.html';
                  }
              });
          });
      } else {
          // Ajouter liens de connexion et inscription au menu mobile
          const loginItem = document.createElement('li');
          loginItem.innerHTML = `<a href="login.html">Se Connecter</a>`;
          navLeft.appendChild(loginItem);
          
          const signupItem = document.createElement('li');
          signupItem.innerHTML = `<a href="signup.html">S'inscrire</a>`;
          navLeft.appendChild(signupItem);
      }
    }
    const navUsername = document.getElementById('nav-username');
    console.log(navUsername);
  }

   /**
   * Initialisation de la navigation mobile
   */
   function initMobileNav() {
    // Ajouter le bouton hamburger et l'overlay à la navigation
    const nav = document.querySelector('nav');
    
    if (!nav) return;
    
    // Créer et ajouter le bouton hamburger
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    // Ajouter les éléments au DOM
    nav.insertBefore(hamburger, nav.firstChild);
    document.body.appendChild(overlay);
    
    // Événement pour le menu hamburger
    hamburger.addEventListener('click', function() {
      const navLeft = document.querySelector('.nav-left');
      navLeft.classList.toggle('active');
      overlay.classList.toggle('active');
      
      // Animation du hamburger
      this.classList.toggle('active');
    });
    
    // Fermer le menu quand on clique sur l'overlay
    overlay.addEventListener('click', function() {
      document.querySelector('.nav-left').classList.remove('active');
      hamburger.classList.remove('active');
      this.classList.remove('active');
    });
    
    // Fermer le menu quand on clique sur un lien
    const navLinks = document.querySelectorAll('.nav-left a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        document.querySelector('.nav-left').classList.remove('active');
        hamburger.classList.remove('active');
        overlay.classList.remove('active');
      });
    });
  }

  /**
   * Cette fonction permet de modifier la barre de navigation
   */
  modifierBarreNav();
  initMobileNav();

  // Gérer le redimensionnement de la fenêtre
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      // Réinitialiser l'affichage sur desktop
      document.querySelector('.nav-left')?.classList.remove('active');
      document.querySelector('.hamburger')?.classList.remove('active');
      document.querySelector('.overlay')?.classList.remove('active');
    }
  });
});