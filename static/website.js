document.addEventListener("DOMContentLoaded", function () {
    const optionBtns = document.querySelectorAll(".option-btn");
    const quizId = document.querySelector("h2").textContent.split("#")[1].trim();
    const savedResponses = JSON.parse(localStorage.getItem('quiz_responses')) || {};
    if (savedResponses[quizId]) {
        const selectedText = savedResponses[quizId];
        applyUI(selectedText);
    }

    optionBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const selected = this.textContent.trim();
            
            savedResponses[quizId] = selected;
            localStorage.setItem('quiz_responses', JSON.stringify(savedResponses));

            const correctAnswer = this.getAttribute("data-answer");
            fetch('/record_answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quiz_id: quizId, is_correct: (selected === correctAnswer) })
            });

            applyUI(selected);
        });
    });

    function applyUI(selectedText) {
        optionBtns.forEach(b => {
            const correctAnswer = b.getAttribute("data-answer");
            b.disabled = true;
            
            if (b.textContent.trim() === correctAnswer) {
                b.classList.replace("btn-outline-primary", "btn-success");
            }
            if (b.textContent.trim() === selectedText && selectedText !== correctAnswer) {
                b.classList.replace("btn-outline-primary", "btn-danger");
            }
        });
    }
});