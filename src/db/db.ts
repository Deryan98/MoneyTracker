import {enablePromise, openDatabase, SQLiteDatabase} from 'react-native-sqlite-storage'
import { DbTables } from './creation';

enablePromise(true);

const DATABASE_NAME = 'moneytracker.db';

export const getDbConnection = async () => {
  const db: SQLiteDatabase = await openDatabase({name: DATABASE_NAME, location: 'default'});
  
  return db;
}

export const createTables = async (db: SQLiteDatabase) => {
  try {
    return db.executeSql(DbTables);
  } catch (error:any) {
    console.log(error.message)
  }
  
}

export const initDatabase = async () => {
  const db = await getDbConnection();
  await createTables(db);
  db.close();
}

//TODO: IMPLEMENT FINANCES TABLE