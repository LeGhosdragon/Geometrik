document.addEventListener('DOMContentLoaded', function(){
    const toggleSwitch = document.querySelector('.checkbox');
    const body = document.body;

    const themes = {
      dark: {
        '--primary': '#0099FF',
        '--secondary': '#4A0099', 
        '--accent': '#99005E',
        '--text': '#FFFFFF', 
        '--background': '#1A1A1A',
        '--dark-background': '#222222',
        '--purple': '#8A2BE2'
      },
      light: {
        '--primary': '#1E90FF', 
        '--secondary': '#6A0DAD', 
        '--accent': '#FF1493',
        '--text': '#000000', 
        '--background': '#F0F0F0',
        '--dark-background': '#E0E0E0',
        '--purple': '#9932CC'
      }
    }

    function changerTheme(theme){
      const customProperties = themes[theme];
      Object.keys(customProperties).forEach(property => {
        body.style.setProperty(property, customProperties[property]);
      });
      localStorage.setItem('mode-theme', theme);
      
      // Ajouter ou retirer la classe light-mode
      if (theme === 'light') {
        body.classList.add('light-mode');
      } else {
        body.classList.remove('light-mode');
      }
    }
    

    function verifierModeSauvegarde(){
      const modeSauvegarde = localStorage.getItem('mode-theme');
      if(modeSauvegarde === 'light'){
        toggleSwitch.checked = true;
        changerTheme('light');
      } else{
        toggleSwitch.checked = false;
        changerTheme('dark');
      }
    }

    toggleSwitch.addEventListener('change', function(){
      if(this.checked){
        changerTheme('light');
      }
      else{
        changerTheme('dark');
      }
    });

    verifierModeSauvegarde();

    function modifierBarreNav(){
        const jeton = localStorage.getItem('jeton');
        console.log(jeton);
        const menuDiv = document.querySelector('.menu');

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
                localStorage.removeItem('jeton');
                window.location.href = '../pages/index.html';
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
    modifierBarreNav();
});