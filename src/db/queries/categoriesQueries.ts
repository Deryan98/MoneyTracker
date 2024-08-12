import {SQLiteDatabase} from 'react-native-sqlite-storage';

export const insertCategory = async (
  db: SQLiteDatabase,
  category: string,
  icon: string,
) => {
  const insertQuery = `INSERT INTO categories (category, icon) values ('${category}', '${icon}')`;
  return db.executeSql(insertQuery);
};

export const getCategories = async (db: SQLiteDatabase) => {
  const categories: any = [];
  const results = await db.executeSql('SELECT * FROM categories');
  
  results.forEach(resultSet => {
    for (let index = 0; index < resultSet.rows.length; index++) {
      categories.push(resultSet.rows.item(index));
    }
  });
  return categories;
};
