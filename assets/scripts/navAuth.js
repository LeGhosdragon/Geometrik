document.addEventListener('DOMContentLoaded', function(){
  /** 
   * Cette fonction permet de modifier la barre de navigation
   */
  function modifierBarreNav(){
    // Récupère le jeton
    const jeton = localStorage.getItem('jeton');
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
    // Si le jeton existe

    if(jeton){
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
                  <a href="#" class="submenu-link" id="btn-deconnexion"> Déconnexion </a>
                </div>
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
  }
  /**
   * Cette fonction permet de modifier la barre de navigation
   */
  modifierBarreNav();
});