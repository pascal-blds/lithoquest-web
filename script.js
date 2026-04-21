// Keep your scroll reveal animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
        if (el.isIntersecting) {
            el.target.classList.add('visible');
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// New Background Submission Logic
const form = document.getElementById('earlyAccessForm');

form.addEventListener('submit', function (event) {
    event.preventDefault(); // Stops the page from refreshing/redirecting

    const input = document.getElementById('emailInput');
    const btn = form.querySelector('button');
    const val = input.value.trim();

    if (!val || !val.includes('@')) {
        input.style.borderColor = 'rgba(200,80,50,0.5)';
        setTimeout(() => input.style.borderColor = '', 1500);
        return;
    }

    // Change UI to loading state
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Replace THIS URL with your actual Formspree endpoint
    const formspreeURL = 'https://formspree.io/f/mqewykdv';

    fetch(formspreeURL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: val })
    })
        .then(response => {
            if (response.ok) {
                // Success! Trigger your green animation
                btn.textContent = 'Registered ✓';
                btn.style.background = '#1ab3bc';
                input.value = '';
            } else {
                // Handle errors silently
                btn.textContent = 'Error';
                btn.disabled = false;
                setTimeout(() => btn.textContent = originalText, 2000);
            }
        })
        .catch(error => {
            btn.textContent = 'Error';
            btn.disabled = false;
            setTimeout(() => btn.textContent = originalText, 2000);
        });
});