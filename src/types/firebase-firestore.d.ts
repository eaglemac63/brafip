// Declaração de tipos para subpath do Firebase SDK que não expõe .d.ts
// automaticamente em todos os setups de bundler.
declare module "firebase/firestore" {
  export function getFirestore(app?: any): any;
  export const collection: any;
  export const doc: any;
  export const query: any;
  export const where: any;
  export const orderBy: any;
  export const getDocs: any;
  export const onSnapshot: any;
}
