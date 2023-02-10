import {enablePromise, openDatabase, SQLiteDatabase} from 'react-native-sqlite-storage'
enablePromise(true);

const DATABASE_NAME = 'moneytracker.db';

export const getDbConnection = async () => {
  const db: SQLiteDatabase = await openDatabase({name: DATABASE_NAME, location: 'default'});
  
  return db;
}

const copyDB = `CREATE TABLE IF NOT EXISTS icons(
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  icon VARCHAR(512)
);
CREATE TABLE IF NOT EXISTS types(
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  type VARCHAR(512)
);
CREATE TABLE IF NOT EXISTS categories(
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  category VARCHAR(512),
  iconName VARCHAR(512),
);
CREATE TABLE IF NOT EXISTS finances(
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  finance SMALLMONEY,
  dateCreated SMALLDATETIME,
  idCategory INTEGER,
  idType INTEGER,
  FOREIGN KEY (idCategory) REFERENCES categories(id),
  FOREIGN KEY (idType) REFERENCES types(id),
);`

export const createTables = async (db: SQLiteDatabase) => {
  const query = 'CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR(512), icon VARCHAR(512))'
  try {
    return db.executeSql(query);
  } catch (error:any) {
    console.log(error.message)
  }
  
}

export const initDatabase = async () => {
  const db = await getDbConnection();
  await createTables(db);
  db.close();
}

// export const insertIcon = async (db:SQLiteDatabase, icon:string) => {
//   const insertQuery = 
//   `INSERT INTO icons (icon) values ('${icon}')`;
//   return  db.executeSql(insertQuery);
// }

// export const getIcons = async (db:SQLiteDatabase) => {
//   const icons: any = [];
//   const results = await db.executeSql('SELECT id, icon FROM icons');
//   results.forEach((resultSet)=> {
//     for(let index = 0; index < resultSet.rows.length; index++) {
//       icons.push(resultSet.rows.item(index));
//     }
//   });
//   return icons;
// }

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

export const insertCategory = async (db:SQLiteDatabase, category:string, icon:string) => {
  const insertQuery = 
  `INSERT INTO categories (category, icon) values ('${category}', '${icon}')`;
  return  db.executeSql(insertQuery);
}

export const getCategories = async (db:SQLiteDatabase) => {
  const categories: any = [];
  const results = await db.executeSql('SELECT * FROM categories');
  results.forEach((resultSet)=> {
    for(let index = 0; index < resultSet.rows.length; index++) {
      categories.push(resultSet.rows.item(index));
    }
  });
  return categories;
}

//TODO: IMPLEMENT FINANCES TABLE