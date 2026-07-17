// version 1.1
 const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
 const mobileMenu = document.getElementById('mobile-menu');
 mobileMenuToggle.addEventListener('click', () => {
   mobileMenu.classList.toggle('hidden');
   mobileMenuToggle.setAttribute('aria-expanded', mobileMenu.classList.contains('hidden')
     ? 'false' : 'true');
 });
 document.addEventListener('DOMContentLoaded', () => {
   const currentPath = window.location.pathname.split('/')
     .pop() || 'index.html';
   const navLinks = document.querySelectorAll('.nav-link');
   navLinks.forEach(link => {
     if (link.getAttribute('href') === currentPath) {
       link.classList.remove('text-white/70');
       link.classList.add('text-accent');
     }
   });
   const header = document.querySelector('header');
   window.addEventListener('scroll', () => {
     if (window.scrollY > 50) {
       header.classList.add('bg-black/80');
       header.classList.remove('bg-black/20');
     } else {
       header.classList.add('bg-black/20');
       header.classList.remove('bg-black/80');
     }
   });
 });
 document.addEventListener('DOMContentLoaded', () => {
   const currentPath = window.location.pathname.split('/')
     .pop() || 'index.html';
   const navLinks = document.querySelectorAll('.nav-link');
   navLinks.forEach(link => {
     if (link.getAttribute('href') === currentPath) {
       link.classList.remove('text-white/70');
       link.classList.add('text-accent');
     }
   });
   const header = document.querySelector('header');
   window.addEventListener('scroll', () => {
     if (window.scrollY > 50) {
       header.classList.add('bg-black/80');
       header.classList.remove('bg-black/20');
     } else {
       header.classList.add('bg-black/20');
       header.classList.remove('bg-black/80');
     }
   });
 });
