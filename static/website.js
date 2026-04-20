document.addEventListener("DOMContentLoaded", function () {
    const optionBtns = document.querySelectorAll(".option-btn");

    optionBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const correctAnswer = this.getAttribute("data-answer");
            const selected = this.textContent.trim();

            optionBtns.forEach(b => {
                b.disabled = true;
                if (b.textContent.trim() === correctAnswer) {
                    b.classList.remove("btn-outline-primary");
                    b.classList.add("btn-success");
                }
            });

            if (selected !== correctAnswer) {
                this.classList.remove("btn-outline-primary");
                this.classList.add("btn-danger");
            }
        });
    });
});