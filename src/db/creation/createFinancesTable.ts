export const createFinancesTable = 
`CREATE TABLE IF NOT EXISTS finances(
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  finance SMALLMONEY,
  dateCreated SMALLDATETIME,
  idCategory INTEGER,
  idType INTEGER,
  FOREIGN KEY (idCategory) REFERENCES categories(id),
  FOREIGN KEY (idType) REFERENCES types(id),
);`