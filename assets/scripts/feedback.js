document.addEventListener("DOMContentLoaded", function() {
    const feedbackForm = document.getElementById("feedback-form");
    const feedbackInput = document.getElementById("feedback");
    const ratingInputs = document.querySelectorAll('input[name="rating"]');

    console.log(ratingInputs);
    ratingInputs.forEach(function(input) {
        console.log(input.value);
    });
    
    feedbackForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const feedback = feedbackInput.value;
        let rating = 0;
        
        // Trouver le bouton radio sélectionné
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        if (selectedRating) {
            rating = parseInt(selectedRating.value);
        }
        
        if (feedback.trim() === "") {
            Swal.fire({
                icon: "error",
                title: "Veuillez entrer un feedback!",
            });
        }
        else if (rating === 0) {
            Swal.fire({
                icon: "error",
                title: "Veuillez sélectionner une note!",
            });
        }
        else {
            Swal.fire({
                icon: "success",
                title: "Feedback envoyé!",
                text: `Votre note: ${rating} étoiles`,
            });
        }
        console.log(feedback);
        console.log(rating);
    });
});

