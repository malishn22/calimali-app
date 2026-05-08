export function mockDelay(min = 200, max = 400): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MockStore<T> {
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  add: (item: T) => void;
  remove: (id: string) => void;
  update: (id: string, partial: Partial<T>) => void;
  reset: () => void;
}

export function createMockStore<T>(
  initial: T[],
  idField: keyof T = "id" as keyof T,
): MockStore<T> {
  let items = [...initial];

  return {
    getAll: () => [...items],
    getById: (id: string) => items.find((item) => String(item[idField]) === id),
    add: (item: T) => {
      items.push(item);
    },
    remove: (id: string) => {
      items = items.filter((item) => String(item[idField]) !== id);
    },
    update: (id: string, partial: Partial<T>) => {
      items = items.map((item) =>
        String(item[idField]) === id ? { ...item, ...partial } : item,
      );
    },
    reset: () => {
      items = [...initial];
    },
  };
}
