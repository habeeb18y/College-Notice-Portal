document.addEventListener("DOMContentLoaded", () => {
  // Check if already logged in
  if (Auth.isAuthenticated()) {
    Auth.redirectToDashboard();
  }
});

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const icon = document.querySelector(".password-toggle");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Handle login form submission
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      Utils.showButtonLoading(submitBtn);
      Utils.hideFormError("loginForm");

      const response = await API.login({ email, password });

      // Save auth data (cookie-based)
      Auth.saveAuth("cookie-auth", response.user);

      Utils.showToast("Login successful!", "success");

      setTimeout(() => {
        Auth.redirectToDashboard();
      }, 1000);
    } catch (error) {
      Utils.hideButtonLoading(submitBtn);
      Utils.showFormError(
        "loginForm",
        error.message || "Login failed. Please try again."
      );
    }
  });
});
