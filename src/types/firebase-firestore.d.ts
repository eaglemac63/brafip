// Declaração de tipos para subpath do Firebase SDK que não expõe .d.ts
// automaticamente em todos os setups de bundler.
// Usamos tipos genéricos (T) em vez de any para satisfazer o lint.
declare module "firebase/firestore" {
  export function getFirestore(app?: unknown): unknown;
  export function collection(db: unknown, path: string, ...paths: string[]): unknown;
  export function doc(db: unknown, path: string, ...paths: string[]): unknown;
  export function query(...constraints: unknown[]): unknown;
  export function where(field: string, op: string, value: unknown): unknown;
  export function orderBy(field: string, dir?: "desc" | "asc"): unknown;
  export function getDocs(q: unknown): Promise<unknown>;
  export function onSnapshot(q: unknown, cb: (snap: unknown) => void): () => void;
}
