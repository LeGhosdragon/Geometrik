$(document).ready(function () {
  const FORM = $("#pageAccueil");
  const MSG_CONTAINER = $("#messageContainer"); //TODO assurer que msg apparait when logging in wrong
  const BOUTON_INSCRIPTION = $("#inscription");

  FORM.on("submit", async (event) => {
    event.preventDefault();

    const IDENTIFIANT = $("#identifiant").val();
    const MOT_DE_PASSE = $("#mot_de_passe").val();

    sessionStorage.setItem("identifiant", IDENTIFIANT);
    sessionStorage.setItem("mot_de_passe", MOT_DE_PASSE);
    //console.log("something");
    let response = await fetch(
        "http://localhost/tch056_labo4/api/index.php/login",
        {
          method: "POST",
          body: JSON.stringify({ identifiant: IDENTIFIANT, mot_de_passe: MOT_DE_PASSE }),
          headers: { "Content-Type": "application/json" },
        }
      );
      
    //console.log(responseText["reponse"]);

    try {
      let answer = await response.json();

      if (answer.reponse) {
        window.location.href = "../pages/forum.html";
      } else {
        console.log("Identifiant:", IDENTIFIANT);
        console.log("Mot de passe:", MOT_DE_PASSE);
        MSG_CONTAINER.html("<br>Nom d'Utilisateur ou Mot de passe invalide !</br>");
      }
    } catch (e) {
      console.error("Erreur de parsing JSON:", e);
      alert("Une erreur est survenue lors de la connexion.");
    }
  });

  BOUTON_INSCRIPTION.on("click", () => {
    window.location.href = "../pages/inscription.html";
  });
});
