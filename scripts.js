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

async function saveFileUrlToFirestore(fileUrl, fileType) {
    try {
        await addDoc(collection(db, "media"), {
            url: fileUrl,
            type: fileType.startsWith('image') ? 'image' : 'video',
            timestamp: serverTimestamp()
        });
        console.log("File salvato nel database");
    } catch (error) {
        console.error("Errore nel salvare il file:", error);
    }
}

function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'public_upload'); // Sostituisci con il tuo upload_preset

    fetch('https://api.cloudinary.com/v1_1/dp74wkxko/upload', { // Sostituisci con il tuo cloud name
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('File caricato su Cloudinary:', data.secure_url);
        saveFileUrlToFirestore(data.secure_url, file.type); // Salva l'URL nel database Firestore
        addMediaToGallery(data.secure_url, file.type); // Mostra il file nella galleria
    })
    .catch(error => {
        console.error('Errore nel caricamento:', error);
    });
}


// Funzione per caricare le immagini da Firestore all'avvio della pagina
async function loadMediaFromFirestore() {
    try {
        const q = query(collection(db, "media"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const mediaUrl = doc.data().url;
            const mediaType = doc.data().type;
            addMediaToGallery(mediaUrl, mediaType); // Mostra ogni media nella galleria
        });
    } catch (error) {
        console.error("Errore nel recuperare i media:", error);
    }
}

// Carica i media quando la pagina viene caricata
window.onload = loadMediaFromFirestore;


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
    lightboxDownloadLink.href = imgSrc;
    lightboxDownloadLink.style.display = 'block';
}

// Funzione per chiudere la lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxDownloadLink.style.display = 'none';
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
        if (file.type.startsWith('image') || file.type.startsWith('video')) {
            uploadToCloudinary(file); // Carica il file su Cloudinary
        } else {
            alert("Formato non supportato. Carica immagini o video.");
        }
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
