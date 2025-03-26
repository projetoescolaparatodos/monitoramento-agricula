
import multer from 'multer';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './storage';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function uploadToFirebase(file: Express.Multer.File, path: string) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file.buffer);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export { upload };
