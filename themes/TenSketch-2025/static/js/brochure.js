document.addEventListener("DOMContentLoaded", function () {
  const modalElement = document.getElementById("brochureModal");
  const form = document.getElementById("brochureForm");
  const triggers = document.querySelectorAll(".js-brochure-trigger");

  if (!modalElement || !form || !triggers.length || !window.bootstrap) {
    return;
  }

  const modal = new bootstrap.Modal(modalElement);
  const submitButton = form.querySelector(".brochure-submit");
  const submitLabel = form.querySelector(".brochure-submit-label");
  const nameInput = form.querySelector("#brochureName");
  const mobileInput = form.querySelector("#brochureMobile");
  const whatsappNumber = modalElement.dataset.whatsappNumber || "919176091740";
  const brochureUrl = modalElement.dataset.brochureUrl || "/pdf/VELAR-Urban_Square-brochure-new.pdf";
  const fallbackLink = brochureUrl;

  triggers.forEach((trigger) => {
    trigger.setAttribute("href", fallbackLink);
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      modal.show();
    });
  });

  modalElement.addEventListener("shown.bs.modal", function () {
    if (nameInput) {
      nameInput.focus();
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = (nameInput?.value || "").trim();
    const mobile = (mobileInput?.value || "").replace(/\D/g, "");
    const isMobileValid = /^\d{10}$/.test(mobile);

    if (mobileInput) {
      mobileInput.value = mobile;
      mobileInput.setCustomValidity(isMobileValid ? "" : "Please enter a valid 10-digit mobile number.");
    }

    if (!name || !isMobileValid) {
      form.classList.add("was-validated");
      return;
    }

    form.classList.remove("was-validated");
    setBrochureSubmittingState(submitButton, submitLabel, true);

    const formData = new FormData(form);
    formData.set("form-name", "brochure");

    try {
      await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(formData).toString()
      });
    } catch (error) {
      console.warn("Netlify form submission failed.", error);
    } finally {
      triggerBrochureDownload(brochureUrl);

      const message = [
        "Hi, I just downloaded the Velar brochure.",
        "",
        `Name: ${name}`,
        `Mobile: ${mobile}`,
        "",
        "I would like to know more details about pricing and availability."
      ].join("\n");

      window.setTimeout(function () {
        try {
          window.open(
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
            "_blank",
            "noopener"
          );
        } catch (error) {
          console.warn("WhatsApp popup was blocked.", error);
        }
      }, 700);

      modal.hide();
      form.reset();
      setBrochureSubmittingState(submitButton, submitLabel, false);
    }
  });
});

function setBrochureSubmittingState(button, label, isSubmitting) {
  if (!button || !label) {
    return;
  }

  button.disabled = isSubmitting;
  label.textContent = isSubmitting ? "Preparing Download..." : "Download Brochure";
}

function triggerBrochureDownload(url) {
  if (!url) {
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
