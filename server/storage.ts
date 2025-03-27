import { users, type User, type InsertUser } from "@shared/schema";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, query, where } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCAHOYOjHyvoRXkVhuQc_Ld3VrJtmqO1XM",
  authDomain: "transparencia-agricola.firebaseapp.com",
  projectId: "transparencia-agricola",
  storageBucket: "transparencia-agricola.firebasestorage.app",
  messagingSenderId: "667594200798",
  appId: "1:667594200798:web:77966c861af0943825944f",
  measurementId: "G-335VMCKSLN",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Interface para operações de storage
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// Implementação que funciona na memória para desenvolvimento local
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

// Classe para ambiente de produção usando Firebase
export class FirebaseStorage implements IStorage {
  private usersCollection;

  constructor() {
    try {
      this.usersCollection = collection(db, "users");
      console.log("Firebase inicializado com sucesso");
    } catch (error) {
      console.error("Erro ao inicializar Firebase:", error);
      throw new Error(`Falha ao inicializar Firebase: ${error.message}`);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const q = query(this.usersCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return undefined;

      const docData = querySnapshot.docs[0].data();
      return { id: docData.id, username: docData.username, password: docData.password };
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const q = query(this.usersCollection, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return undefined;

      const docData = querySnapshot.docs[0].data();
      return { id: docData.id, username: docData.username, password: docData.password };
    } catch (error) {
      console.error("Erro ao buscar usuário por nome:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Obter o maior ID atual para gerar um novo ID
      const querySnapshot = await getDocs(this.usersCollection);
      let maxId = 0;

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.id && userData.id > maxId) {
          maxId = userData.id;
        }
      });

      const newId = maxId + 1;
      const newUser = { ...insertUser, id: newId };

      await addDoc(this.usersCollection, newUser);
      return newUser;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  }
}

// Escolhe o storage apropriado dependendo do ambiente
export const storage = process.env.NODE_ENV === "production"
  ? new FirebaseStorage()
  : process.env.NODE_ENV === "development"
    ? new FirebaseStorage() // Você pode usar Firebase em desenvolvimento também
    : new MemStorage();