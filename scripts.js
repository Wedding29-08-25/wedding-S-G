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

// Funzione per salvare l'URL del file su Firestore, specificando il tipo (immagine o video)
async function saveFileUrlToFirestore(fileUrl, fileType) {
    try {
        await addDoc(collection(db, "media"), {
            url: fileUrl,
            type: fileType, // 'image' o 'video'
            timestamp: serverTimestamp()
        });
        console.log("File salvato nel database");
    } catch (error) {
        console.error("Errore nel salvare il file:", error);
    }
}

// Funzione per caricare il file su Cloudinary
function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'public_upload'); // Sostituisci con il tuo upload_preset

    fetch('https://api.cloudinary.com/v1_1/dp74wkxko/upload', { // Cambia l'endpoint per supportare immagini e video
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('File caricato su Cloudinary:', data.secure_url);
        const fileType = file.type.startsWith('video') ? 'video' : 'image';
        saveFileUrlToFirestore(data.secure_url, fileType);
        addMediaToGallery(data.secure_url, fileType); // Aggiunge media alla galleria
    })
    .catch(error => {
        console.error('Errore nel caricamento:', error);
    });
}

// Funzione per caricare i media (immagini e video) da Firestore all'avvio della pagina
async function loadMediaFromFirestore() {
    try {
        const q = query(collection(db, "media"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const mediaUrl = doc.data().url;
            const mediaType = doc.data().type;
            addMediaToGallery(mediaUrl, mediaType);
        });
    } catch (error) {
        console.error("Errore nel recuperare i media:", error);
    }
}

// Carica i media quando la pagina viene caricata
window.onload = loadMediaFromFirestore;

// Seleziona gli elementi
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const photoGrid = document.getElementById('photoGrid');

// Gestisci l'evento del clic sul pulsante di caricamento
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// Seleziona gli elementi della lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.querySelector('.lightbox .close');
const lightboxDownloadLink = document.getElementById('lightboxDownloadLink');

// Funzione per aprire la lightbox
function openLightbox(mediaUrl, mediaType) {
    lightboxImg.style.display = mediaType === 'image' ? 'block' : 'none';
    lightboxImg.src = mediaUrl;

    if (mediaType === 'video') {
        const video = document.createElement('video');
        video.src = mediaUrl;
        video.controls = true;
        video.className = 'lightbox-content';
        lightbox.appendChild(video);
    }
    
    lightbox.style.display = 'flex';
    lightboxDownloadLink.href = mediaUrl;
    lightboxDownloadLink.style.display = 'block';
}

// Funzione per chiudere la lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxDownloadLink.style.display = 'none';
    const video = document.querySelector('.lightbox-content');
    if (video) video.remove();
}

// Aggiungi listener per chiudere la lightbox
closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
});

// Gestisci il caricamento di file
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadToCloudinary(file);
    }
});

// Funzione per aggiungere immagini e video alla galleria
function addMediaToGallery(mediaUrl, mediaType) {
    const mediaElement = document.createElement(mediaType === 'video' ? 'video' : 'img');
    mediaElement.src = mediaUrl;
    mediaElement.alt = 'Media Matrimonio';
    mediaElement.className = 'gallery-item';
    mediaElement.controls = mediaType === 'video';
    mediaElement.addEventListener('click', () => openLightbox(mediaUrl, mediaType));
    photoGrid.appendChild(mediaElement);
}
