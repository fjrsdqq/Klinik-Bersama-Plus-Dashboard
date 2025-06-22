window.addEventListener('load', () => {
    // Hilangkan overlay setelah 1 detik
    setTimeout(() => {
        document.getElementById('overlay').style.display = 'none';
        document.querySelector('.login-container').classList.add('show');
    }, 1000); // bisa diubah ke 500 kalau mau lebih cepat
});
