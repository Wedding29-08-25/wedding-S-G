// Funzione per aggiungere l'immagine alla galleria con commenti
function addPhotoToGallery(imgUrl, photoId) {
    const photoContainer = document.createElement('div');
    photoContainer.classList.add('photo-container');

    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = 'Foto Matrimonio';
    img.addEventListener('click', () => openLightbox(imgUrl)); // Aggiungi l'evento per aprire la lightbox

    const commentSection = document.createElement('div');
    commentSection.classList.add('comment-section');

    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Lascia un commento...';
    commentInput.classList.add('comment-input');

    const submitCommentBtn = document.createElement('button');
    submitCommentBtn.textContent = 'Invia';
    submitCommentBtn.classList.add('comment-button');

    // Listener per salvare i commenti su Firestore
    submitCommentBtn.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        if (commentText) {
            saveCommentToFirestore(photoId, commentText);
            commentInput.value = ''; // Pulisce il campo dopo l'invio
        }
    });

    const commentList = document.createElement('ul');
    commentList.classList.add('comment-list');
    
    // Recupera e mostra i commenti per la foto corrente
    loadComments(photoId, commentList);

    commentSection.appendChild(commentInput);
    commentSection.appendChild(submitCommentBtn);
    commentSection.appendChild(commentList);

    photoContainer.appendChild(img);
    photoContainer.appendChild(commentSection);
    photoGrid.appendChild(photoContainer);
}

// Funzione per salvare il commento su Firestore
async function saveCommentToFirestore(photoId, commentText) {
    try {
        await addDoc(collection(db, "comments"), {
            photoId: photoId,
            comment: commentText,
            timestamp: serverTimestamp()
        });
        console.log("Commento salvato nel database");
    } catch (error) {
        console.error("Errore nel salvare il commento:", error);
    }
}

// Funzione per caricare i commenti dal database
async function loadComments(photoId, commentList) {
    try {
        const q = query(collection(db, "comments"), where("photoId", "==", photoId), orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);
        commentList.innerHTML = ''; // Svuota i commenti precedenti
        querySnapshot.forEach((doc) => {
            const comment = doc.data().comment;
            const li = document.createElement('li');
            li.textContent = comment;
            commentList.appendChild(li);
        });
    } catch (error) {
        console.error("Errore nel recuperare i commenti:", error);
    }
}

// Funzione per caricare le immagini da Firestore all'avvio della pagina
async function loadImagesFromFirestore() {
    try {
        const q = query(collection(db, "photos"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const imgUrl = doc.data().url;
            const photoId = doc.id; // ID della foto usato per i commenti
            addPhotoToGallery(imgUrl, photoId); // Mostra ogni immagine nella galleria
        });
    } catch (error) {
        console.error("Errore nel recuperare le immagini:", error);
    }
}

