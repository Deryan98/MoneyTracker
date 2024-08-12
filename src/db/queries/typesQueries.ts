import { SQLiteDatabase } from 'react-native-sqlite-storage';

export const insertType = async (db:SQLiteDatabase, type:string) => {
    const insertQuery = 
    `INSERT INTO types (type) values ('${type}')`;
    return  db.executeSql(insertQuery);
  }
  
export const getTypes = async (db:SQLiteDatabase) => {
    const types: any = [];
    const results = await db.executeSql('SELECT id, type FROM types');
    results.forEach((resultSet)=> {
        for(let index = 0; index < resultSet.rows.length; index++) {
        types.push(resultSet.rows.item(index));
        }
    });
    return types;
}