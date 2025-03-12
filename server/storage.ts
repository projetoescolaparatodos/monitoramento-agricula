
import { users, type User, type InsertUser } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

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

// Classe para ambiente de produção (como Vercel)
export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    // Use a variável de ambiente do DATABASE_URL ou POSTGRES_URL que o Vercel fornece
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      console.warn("Nenhuma URL de banco de dados configurada, usando storage em memória");
      return;
    }

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    this.db = drizzle(pool);
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where({ id }).limit(1);
      return result[0];
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where({ username }).limit(1);
      return result[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por nome:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  }
}

// Escolhe o storage apropriado dependendo do ambiente
export const storage = process.env.NODE_ENV === "production" 
  ? new DbStorage() 
  : new MemStorage();
