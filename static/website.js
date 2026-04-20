document.addEventListener("DOMContentLoaded", function () {
    setupQuizPage();
    setupColorPickerPage();
});

function setupQuizPage() {
    const optionBtns = document.querySelectorAll(".option-btn");
    const heading = document.querySelector("h2");

    if (!optionBtns.length || !heading || !heading.textContent.includes("#")) {
        return;
    }

    const quizId = heading.textContent.split("#")[1].trim();
    const savedResponses = JSON.parse(localStorage.getItem("quiz_responses")) || {};

    if (savedResponses[quizId]) {
        applyQuizUI(savedResponses[quizId]);
    }

    optionBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const selected = this.textContent.trim();
            const correctAnswer = this.getAttribute("data-answer");

            savedResponses[quizId] = selected;
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

            applyQuizUI(selected);
        });
    });

    function applyQuizUI(selectedText) {
        optionBtns.forEach(b => {
            const correctAnswer = b.getAttribute("data-answer");
            b.disabled = true;

            if (b.textContent.trim() === correctAnswer) {
                b.classList.remove("btn-outline-primary");
                b.classList.add("btn-success");
            }

            if (b.textContent.trim() === selectedText && selectedText !== correctAnswer) {
                b.classList.remove("btn-outline-primary");
                b.classList.add("btn-danger");
            }
        });
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