/**
 * JUWELIER GLAMOUR - Main JavaScript
 * Form validation, mobile menu, smooth scroll
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initContactForm();
    initGalleryLightbox();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    const navLinks = document.querySelectorAll('.nav-mobile .nav-link');
    
    if (!menuToggle || !navMobile) return;
    
    menuToggle.addEventListener('click', function() {
        navMobile.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Animate hamburger
        const spans = menuToggle.querySelectorAll('span');
        if (navMobile.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMobile.classList.remove('active');
            document.body.classList.remove('menu-open');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

/**
 * Header scroll effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Contact Form Validation & Submission
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset previous errors
        clearErrors();
        
        // Validate fields
        let isValid = true;
        
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const subject = document.getElementById('subject');
        const message = document.getElementById('message');
        
        // Name validation
        if (!name.value.trim() || name.value.trim().length < 2) {
            showError(name, 'Bitte geben Sie Ihren Namen ein');
            isValid = false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            showError(email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
            isValid = false;
        }
        
        // Phone validation (optional but must be valid if provided)
        if (phone.value.trim()) {
            const phoneRegex = /^[\d\s\-\+\(\)]{6,}$/;
            if (!phoneRegex.test(phone.value)) {
                showError(phone, 'Bitte geben Sie eine gültige Telefonnummer ein');
                isValid = false;
            }
        }
        
        // Subject validation
        if (!subject.value) {
            showError(subject, 'Bitte wählen Sie einen Betreff');
            isValid = false;
        }
        
        // Message validation
        if (!message.value.trim() || message.value.trim().length < 10) {
            showError(message, 'Bitte geben Sie eine Nachricht ein (mindestens 10 Zeichen)');
            isValid = false;
        }
        
        if (isValid) {
            // Show success message
            const successMessage = document.getElementById('formSuccess');
            if (successMessage) {
                successMessage.classList.add('show');
            }
            
            // Reset form
            form.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                if (successMessage) {
                    successMessage.classList.remove('show');
                }
            }, 5000);
            
            // In production, you would send the form data to a server here
            console.log('Form submitted:', {
                name: name.value,
                email: email.value,
                phone: phone.value,
                subject: subject.value,
                message: message.value
            });
        }
    });
    
    // Real-time validation on blur
    const inputs = form.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            const formGroup = this.closest('.form-group');
            if (formGroup && formGroup.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    let isValid = true;
    let errorMessage = '';
    
    const value = field.value.trim();
    
    switch(field.id) {
        case 'name':
            if (!value || value.length < 2) {
                isValid = false;
                errorMessage = 'Bitte geben Sie Ihren Namen ein';
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value || !emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
            }
            break;
        case 'phone':
            if (value) {
                const phoneRegex = /^[\d\s\-\+\(\)]{6,}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein';
                }
            }
            break;
        case 'subject':
            if (!value) {
                isValid = false;
                errorMessage = 'Bitte wählen Sie einen Betreff';
            }
            break;
        case 'message':
            if (!value || value.length < 10) {
                isValid = false;
                errorMessage = 'Bitte geben Sie eine Nachricht ein (mindestens 10 Zeichen)';
            }
            break;
    }
    
    if (!isValid) {
        showError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');
    const errorElement = formGroup.querySelector('.form-error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error');
}

function clearErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
    });
}

/**
 * Simple Gallery Lightbox
 */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;
    
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <img src="" alt="Gallery Image">
            <div class="lightbox-caption"></div>
        </div>
    `;
    
    // Add lightbox styles
    const styles = document.createElement('style');
    styles.textContent = `
        .lightbox {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .lightbox.active {
            display: flex;
        }
        .lightbox-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            cursor: pointer;
        }
        .lightbox-content {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            z-index: 1;
        }
        .lightbox-content img {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 4px;
        }
        .lightbox-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .lightbox-caption {
            color: white;
            text-align: center;
            margin-top: 16px;
            font-family: 'Playfair Display', serif;
            font-size: 1.1rem;
        }
    `;
    
    document.head.appendChild(styles);
    document.body.appendChild(lightbox);
    
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxOverlay = lightbox.querySelector('.lightbox-overlay');
    
    // Open lightbox
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const title = this.querySelector('.gallery-item-title');
            
            if (img) {
                lightboxImg.src = img.src;
                lightboxCaption.textContent = title ? title.textContent : '';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

/**
 * Intersection Observer for scroll animations
 */
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with data-animate attribute
document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
});
