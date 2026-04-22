document.addEventListener("DOMContentLoaded", function () {
    setupQuizPage();
    setupColorPickerPage();
});

function setupQuizPage() {
    const optionBtns = document.querySelectorAll(".option-btn");
    const heading = document.querySelector("h2");

    if (!heading || !heading.textContent.includes("#")) {
        return;
    }

    const quizId = heading.textContent.split("#")[1].trim();
    const savedResponses = JSON.parse(localStorage.getItem("quiz_responses")) || {};

    if (savedResponses[quizId]) {
        applyQuizUI(savedResponses[quizId]);
    }

    // MULTIPLE CHOICE 
    optionBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const selected = this.textContent.trim();
            const correctAnswer = this.getAttribute("data-answer");

            savedResponses[quizId] = {
                type: "mcq",
                answer: selected
            };
            localStorage.setItem("quiz_responses", JSON.stringify(savedResponses));

            fetch("/record_answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quiz_id: quizId,
                    selected_answer: selected,
                    is_correct: selected === correctAnswer
                })
            });

            applyQuizUI(savedResponses[quizId]);
        });
    });

    // FILL IN THE BLANK 
    const fillBtn = document.querySelector(".submit-fill");

    function normalize(str) {
        return str
            .toLowerCase()
            .replace(/-/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    if (fillBtn) {
        fillBtn.addEventListener("click", () => {
            const inputs = document.querySelectorAll(".fill-input");
            const answers = JSON.parse(fillBtn.dataset.answers);

            const userAnswers = Array.from(inputs).map(input => input.value.trim());

            let correct = true;

            inputs.forEach((input, i) => {

                const user = normalize(userAnswers[i]);
                const correctAns = normalize(answers[i]);

                const wrapper = input.parentElement;

                input.disabled = true;

                if (user === correctAns) {
                    wrapper.classList.add("border", "border-success", "p-1");
                    input.classList.add("is-valid");
                } else {
                    correct = false;

                    wrapper.classList.add("border", "border-danger", "p-1");

                    input.value = answers[i];
                    input.classList.add("is-invalid");
                }
            });

            savedResponses[quizId] = {
                type: "fill",
                answers: userAnswers
            };
            localStorage.setItem("quiz_responses", JSON.stringify(savedResponses));

            fetch("/record_answer", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    quiz_id: quizId,
                    selected_answer: userAnswers,
                    is_correct: correct
                })
            });
        });
    }
    
    // DROPDOWN 
    const dropdownBtn = document.querySelector(".submit-dropdown");

    if (dropdownBtn) {
        dropdownBtn.addEventListener("click", () => {
            const selects = document.querySelectorAll(".dropdown-input");

            const userAnswers = Array.from(selects).map(sel => sel.value);

            savedResponses[quizId] = {
                type: "dropdown",
                answers: userAnswers
            };

            localStorage.setItem("quiz_responses", JSON.stringify(savedResponses));

            fetch("/record_answer", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    quiz_id: quizId,
                    selected_answer: userAnswers,
                    is_correct: true 
                })
            });

            applyQuizUI(savedResponses[quizId]);
        });
    }

    function applyQuizUI(saved) {
        if (saved.type === "mcq") {
            optionBtns.forEach(b => {
                const correctAnswer = b.getAttribute("data-answer");
                b.disabled = true;

                if (b.textContent.trim() === correctAnswer) {
                    b.classList.remove("btn-outline-primary");
                    b.classList.add("btn-success");
                }

                if (b.textContent.trim() === saved.answer && saved.answer !== correctAnswer) {
                    b.classList.remove("btn-outline-primary");
                    b.classList.add("btn-danger");
                }
            });
        }

        if (saved.type === "fill") {
            const inputs = document.querySelectorAll(".fill-input");
            const correctAnswers = JSON.parse(
                document.querySelector(".submit-fill").dataset.answers
            );

            inputs.forEach((input, i) => {
                const user = normalize(saved.answers[i]);
                const correct = normalize(correctAnswers[i]);

                input.value = saved.answers[i] || "";
                input.disabled = true;

                if (user === correct) {
                    input.classList.add("is-valid");
                    input.classList.remove("is-invalid");
                } else {
                    input.classList.add("is-invalid");
                    input.classList.remove("is-valid");

                    input.value = correctAnswers[i];
                }
            });
        }

        if (saved.type === "dropdown") {
            const selects = document.querySelectorAll(".dropdown-input");
            const correctAnswers = JSON.parse(
                document.querySelector(".submit-dropdown").dataset.answers
            );

            selects.forEach((sel, i) => {
                const user = normalize(saved.answers[i]);
                const correct = normalize(correctAnswers[i]);

                sel.value = saved.answers[i];
                sel.disabled = true;

                if (user === correct) {
                    sel.classList.add("is-valid");
                    sel.classList.remove("is-invalid");
                } else {
                    sel.classList.add("is-invalid");
                    sel.classList.remove("is-valid");

                    sel.value = correctAnswers[i];
                }
            });
        }
    }
}

function setupColorPickerPage() {
    const preview = document.getElementById("color-preview");
    const hue = document.getElementById("hue");
    const saturation = document.getElementById("saturation");
    const lightness = document.getElementById("lightness");

    if (!preview || !hue || !saturation || !lightness) {
        return;
    }

    const hueValue = document.getElementById("hue-value");
    const saturationValue = document.getElementById("saturation-value");
    const lightnessValue = document.getElementById("lightness-value");
    const hslOutput = document.getElementById("hsl-output");
    const presetCircles = document.querySelectorAll(".preset-circle");

    function updateColor() {
        const h = hue.value;
        const s = saturation.value;
        const l = lightness.value;

        const hsl = `hsl(${h}, ${s}%, ${l}%)`;

        preview.style.background = hsl;
        hueValue.textContent = `${h}°`;
        saturationValue.textContent = `${s}%`;
        lightnessValue.textContent = `${l}%`;
        hslOutput.textContent = hsl;
    }

    [hue, saturation, lightness].forEach(input => {
        input.addEventListener("input", updateColor);
    });

    presetCircles.forEach(circle => {
        circle.addEventListener("click", function () {
            hue.value = this.dataset.h;
            saturation.value = this.dataset.s;
            lightness.value = this.dataset.l;
            updateColor();
        });
    });

    updateColor();

    const goToQuizBtn = document.getElementById("go-to-quiz");

    if (goToQuizBtn) {
        goToQuizBtn.addEventListener("click", function () {
            const h = hue.value;
            const s = saturation.value;
            const l = lightness.value;

            fetch("/log_color_picker", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    hue: h,
                    saturation: s,
                    lightness: l
                })
            }).then(() => {
                window.location.href = "/quiz";
            });
        });
    }
}

