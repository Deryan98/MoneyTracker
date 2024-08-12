import { createCategoriesTable } from './createCategoriesTable';
import { createFinancesTable } from './createFinancesTable';
import { createIconsTable } from './createIconsTable';
import { createTypesTable } from './createTypesTable';

// joins all database tables with an enter separator
export const DbTables = [
    createCategoriesTable, 
    createFinancesTable, 
    createIconsTable, 
    createTypesTable
].join('\n');