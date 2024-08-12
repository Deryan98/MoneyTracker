import {SQLiteDatabase} from 'react-native-sqlite-storage';

export const insertIcon = async (db: SQLiteDatabase, icon: string) => {
  const insertQuery = `INSERT INTO icons (icon) values ('${icon}')`;
  return db.executeSql(insertQuery);
};

export const getIcons = async (db: SQLiteDatabase) => {
  const icons: any = [];
  const results = await db.executeSql('SELECT id, icon FROM icons');
  results.forEach(resultSet => {
    for (let index = 0; index < resultSet.rows.length; index++) {
      icons.push(resultSet.rows.item(index));
    }
  });
  return icons;
};
