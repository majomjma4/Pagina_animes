import { animeMock } from "../data/animeMock";

export const getAnimeCatalog = ({ shouldFail = false, delay = 600 } = {}) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("No se pudo cargar el catálogo"));
        return;
      }
      resolve({ data: animeMock, total: animeMock.length });
    }, delay);
  });
