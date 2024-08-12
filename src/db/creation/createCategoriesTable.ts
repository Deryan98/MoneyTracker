export const createCategoriesTable = 
`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  category VARCHAR(512), 
  icon VARCHAR(512)
);`;
