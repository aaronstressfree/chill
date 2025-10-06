// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll-based animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Observe download cards
document.querySelectorAll('.download-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Handle download link clicks with basic analytics logging
document.querySelectorAll('.btn-download, .download-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const fileName = link.getAttribute('href').split('/').pop();
        console.log(`Download initiated: ${fileName}`);

        // You can add analytics tracking here later, e.g.:
        // gtag('event', 'download', { 'file_name': fileName });
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Detect Mac processor type and highlight appropriate download
function detectProcessor() {
    const userAgent = navigator.userAgent.toLowerCase();
    const downloadCards = document.querySelectorAll('.download-card');

    // Try to detect if user is on Apple Silicon
    if (userAgent.includes('mac') && userAgent.includes('arm')) {
        downloadCards[0]?.classList.add('recommended');
    }
}

// Fetch download count from GitHub API
async function fetchDownloadCount() {
    try {
        const response = await fetch('https://api.github.com/repos/aaronstressfree/chill/releases');
        const releases = await response.json();

        let totalDownloads = 0;
        releases.forEach(release => {
            release.assets.forEach(asset => {
                totalDownloads += asset.download_count;
            });
        });

        const downloadElement = document.getElementById('download-number');
        if (downloadElement) {
            downloadElement.textContent = totalDownloads.toLocaleString();
        }
    } catch (error) {
        console.log('Could not fetch download count:', error);
        const downloadElement = document.getElementById('download-number');
        if (downloadElement) {
            downloadElement.textContent = '—';
        }
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    detectProcessor();
    fetchDownloadCount();
    console.log('Chill website loaded successfully');
});

