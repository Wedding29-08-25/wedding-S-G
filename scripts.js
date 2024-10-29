// Importa le funzioni necessarie da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, orderBy, query, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Configurazione di Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAP2VpQb0xCyOivdpfjP5YAkb8IEV-ebIM",
  authDomain: "wedding-seg.firebaseapp.com",
  projectId: "wedding-seg",
  storageBucket: "wedding-seg.appspot.com",
  messagingSenderId: "668516668494",
  appId: "1:668516668494:web:81f361bea8923b3d869f1f",
  measurementId: "G-8CER5L9FRS"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funzione per salvare l'URL dell'immagine su Firestore
async function saveImageUrlToFirestore(imgUrl) {
    try {
        await addDoc(collection(db, "photos"), {
            url: imgUrl,
            timestamp: serverTimestamp()
        });
        console.log("Immagine salvata nel database");
    } catch (error) {
        console.error("Errore nel salvare l'immagine:", error);
    }
}

// Funzione per caricare l'immagine su Cloudinary
function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'public_upload'); // Sostituisci con il tuo upload_preset

    fetch('https://api.cloudinary.com/v1_1/dp74wkxko/image/upload', { // Sostituisci con il tuo cloud name
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('File caricato su Cloudinary:', data.secure_url);
        saveImageUrlToFirestore(data.secure_url); // Salva l'URL nel database Firestore
        addPhotoToGallery(data.secure_url); // Mostra l'immagine nella galleria
    })
    .catch(error => {
        console.error('Errore nel caricamento:', error);
    });
}

// Funzione per caricare le immagini da Firestore all'avvio della pagina
async function loadImagesFromFirestore() {
    try {
        const q = query(collection(db, "photos"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const imgUrl = doc.data().url;
            addPhotoToGallery(imgUrl); // Mostra ogni immagine nella galleria
        });
    } catch (error) {
        console.error("Errore nel recuperare le immagini:", error);
    }
}

// Carica le immagini quando la pagina viene caricata
window.onload = loadImagesFromFirestore;

// Seleziona gli elementi
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const photoGrid = document.getElementById('photoGrid');

// Gestisci l'evento del clic sul pulsante di caricamento
uploadBtn.addEventListener('click', () => {
    fileInput.click(); // Simula il clic sul campo file input
});

// Seleziona gli elementi della lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.querySelector('.lightbox .close');
const lightboxDownloadLink = document.getElementById('lightboxDownloadLink');

// Funzione per aprire la lightbox
function openLightbox(imgSrc) {
    lightboxImg.src = imgSrc;
    lightbox.style.display = 'flex';
   


// Funzione per chiudere la lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
   

// Aggiungi listener per chiudere la lightbox
closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
});

// Gestisci il caricamento di file
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadToCloudinary(file); // Carica l'immagine su Cloudinary
    }
});

// Funzione per aggiungere l'immagine alla galleria
function addPhotoToGallery(imgUrl) {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = 'Foto Matrimonio';
    img.addEventListener('click', () => openLightbox(imgUrl)); // Aggiungi l'evento per aprire la lightbox
    photoGrid.appendChild(img);
}


